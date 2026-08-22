import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { routerKey } from 'vue-router'
import AdminDashboard from '../src/components/AdminDashboard.vue'
import { useAdminStore } from '../src/stores/admin'

vi.mock('vue-chartjs', () => ({
  Bar: { template: '<div data-test="chart-stub"></div>' }
}))

describe('AdminDashboard profile embedding', () => {
  let pinia

  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(key => key === 'token'
        ? 'admin-token'
        : key === 'user'
          ? JSON.stringify({ id: 1, name: 'Admin', role: 'admin' })
          : null),
      setItem: vi.fn(),
      removeItem: vi.fn()
    })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ name: 'Admin', email: 'admin@example.com', role: 'admin' })
    }))
    pinia = createPinia()
    setActivePinia(pinia)
    useAdminStore().fetchUsers = vi.fn().mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  test('keeps exactly one main landmark when the real Admin profile tab is open', async () => {
    const wrapper = mount(AdminDashboard, {
      props: {
        orders: [],
        categories: [],
        catalog: {},
        articles: [],
        currentUser: { id: 1, name: 'Admin', role: 'admin' }
      },
      global: {
        plugins: [pinia],
        provide: { [routerKey]: { replace: vi.fn(), push: vi.fn() } },
        mocks: { $router: { push: vi.fn() } },
        stubs: { Bar: true }
      }
    })

    await wrapper.findAll('.admin-menu li')[5].trigger('click')
    await flushPromises()

    expect(wrapper.findAll('main')).toHaveLength(1)
    expect(wrapper.get('main.admin-main section.profile-page[aria-labelledby="profile-title"]')).toBeTruthy()
  })

  const mountDashboard = (props = {}) => mount(AdminDashboard, {
    props: {
      orders: [], categories: [{ id: 'cpu', name: 'CPU' }],
      catalog: { cpu: [] }, articles: [],
      currentUser: { id: 1, name: 'Admin', role: 'admin' }, ...props
    },
    global: {
      plugins: [pinia],
      provide: { [routerKey]: { replace: vi.fn(), push: vi.fn() } },
      mocks: { $router: { push: vi.fn() } }, stubs: { Bar: true }
    }
  })

  test('keeps a new product modal and its values open after failure, then closes only after success', async () => {
    const admin = useAdminStore()
    admin.saveProduct = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce({ id: 91 })
    const wrapper = mountDashboard()
    await wrapper.findAll('.admin-menu li')[2].trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('เพิ่มสินค้า')).trigger('click')
    const modal = wrapper.get('[data-test="product-modal"]')
    await modal.get('input[data-test="product-name"]').setValue('Retry CPU')
    await modal.get('button[data-test="save-product"]').trigger('click')
    await flushPromises()

    expect(admin.saveProduct).toHaveBeenCalledWith(expect.objectContaining({
      category: 'cpu', product: expect.objectContaining({ id: null, name: 'Retry CPU' })
    }))
    expect(wrapper.find('[data-test="product-modal"]').exists()).toBe(true)
    expect(wrapper.get('input[data-test="product-name"]').element.value).toBe('Retry CPU')

    await wrapper.get('button[data-test="save-product"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('[data-test="product-modal"]').exists()).toBe(false)
  })

  test('prevents duplicate article saves while the first request is pending', async () => {
    let finish
    const admin = useAdminStore()
    const articleStore = (await import('../src/stores/article')).useArticleStore()
    articleStore.saveArticle = vi.fn(() => new Promise(resolve => { finish = resolve }))
    const wrapper = mountDashboard()
    await wrapper.findAll('.admin-menu li')[3].trigger('click')
    await wrapper.findAll('button').find(button => button.text().includes('เพิ่มบทความ')).trigger('click')
    const save = wrapper.get('button[data-test="save-article"]')
    await save.trigger('click')

    expect(save.attributes('disabled')).toBeDefined()
    await save.trigger('click')
    expect(articleStore.saveArticle).toHaveBeenCalledTimes(1)
    finish({ id: 8 })
    await flushPromises()
    expect(wrapper.find('[data-test="article-modal"]').exists()).toBe(false)
    expect(admin).toBeTruthy()
  })

  test('prefills editable specs from canonical typed product fields', async () => {
    const admin = useAdminStore()
    admin.saveProduct = vi.fn().mockResolvedValue(false)
    const wrapper = mountDashboard({
      catalog: { cpu: [{ id: 7, name: 'Typed CPU', price: 5000, socket: 'AM5', cores: 8, threads: 16, tdp: 105, specifications: {} }] }
    })
    await wrapper.findAll('.admin-menu li')[2].trigger('click')
    await wrapper.get('tbody tr button').trigger('click')
    await wrapper.get('button[data-test="save-product"]').trigger('click')
    await flushPromises()
    expect(admin.saveProduct).toHaveBeenCalledWith(expect.objectContaining({
      product: expect.objectContaining({ specifications: expect.objectContaining({ Socket: 'AM5', Cores: '8', Threads: '16', TDP: '105' }) })
    }))
  })
})

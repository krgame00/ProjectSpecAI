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

    await wrapper.findAll('.admin-menu button')[5].trigger('click')
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

  test('exposes every Admin section as an accessible tab and labelled panel', async () => {
    const wrapper = mountDashboard()
    const tabs = wrapper.findAll('[role="tab"]')

    expect(tabs).toHaveLength(6)
    expect(tabs[0].attributes('aria-selected')).toBe('true')
    expect(tabs[0].attributes('aria-controls')).toBe('admin-panel-dashboard')

    await tabs[2].trigger('click')

    expect(wrapper.get('#admin-tab-inventory').attributes('aria-selected')).toBe('true')
    expect(wrapper.get('#admin-panel-inventory').attributes('role')).toBe('tabpanel')
    expect(wrapper.get('#admin-panel-inventory').attributes('aria-labelledby')).toBe('admin-tab-inventory')
  })

  test('uses real buttons instead of clickable list items for Admin navigation', () => {
    const wrapper = mountDashboard()

    expect(wrapper.findAll('.admin-menu > li > button')).toHaveLength(6)
    expect(wrapper.findAll('.admin-menu > li[tabindex]')).toHaveLength(0)
  })

  const collectionProps = {
    orders: [{ id: 'ORD-1', customer_name: 'Buyer', assembly_type: 'standard', total_price: 9990, status: 'pending', created_at: '2026-08-20', build_items: {} }],
    categories: [{ id: 'cpu', name: 'CPU' }],
    catalog: { cpu: [{ id: 7, name: 'Typed CPU', price: 5000, socket: 'AM5', image: '/cpu.png' }] },
    articles: [{ id: 10, title: 'Fixture Article', content: 'Content', image: '/cover.png', date: '2026-08-20' }],
    currentUser: { id: 1, name: 'Admin', role: 'admin' }
  }

  test.each([
    ['orders', '[data-test="order-card-ORD-1"]', 'ORD-1'],
    ['inventory', '[data-test="product-card-7"]', 'Typed CPU'],
    ['articles', '[data-test="article-card-10"]', 'Fixture Article'],
    ['users', '[data-test="user-card-2"]', 'Member One']
  ])('renders an actionable mobile summary card for %s', async (tab, selector, expectedText) => {
    useAdminStore().users = [
      collectionProps.currentUser,
      { id: 2, name: 'Member One', email: 'member@test.local', role: 'customer', created_at: '2026-02-01' }
    ]
    const wrapper = mountDashboard(collectionProps)

    await wrapper.get(`#admin-tab-${tab}`).trigger('click')

    expect(wrapper.get(selector).text()).toContain(expectedText)
    expect(wrapper.get(selector).findAll('button').length).toBeGreaterThan(0)
  })

  test('labels the inventory table as a keyboard-scrollable region', async () => {
    const wrapper = mountDashboard(collectionProps)
    await wrapper.get('#admin-tab-inventory').trigger('click')

    const region = wrapper.get('[data-test="inventory-table-region"]')
    expect(region.attributes('tabindex')).toBe('0')
    expect(region.attributes('aria-label')).toBe('ตารางสินค้า เลื่อนแนวนอนเพื่อดูข้อมูลเพิ่มเติม')
  })

  test('opens the existing product editor from its mobile card', async () => {
    const wrapper = mountDashboard(collectionProps)
    await wrapper.get('#admin-tab-inventory').trigger('click')

    await wrapper.get('[data-test="product-card-7"] button').trigger('click')

    expect(wrapper.get('[data-test="product-modal"] input[data-test="product-name"]').element.value).toBe('Typed CPU')
  })

  test('keeps modal scrolling separate from its persistent action footer', async () => {
    const wrapper = mountDashboard()
    await wrapper.get('#admin-tab-inventory').trigger('click')
    await wrapper.get('[data-test="add-product"]').trigger('click')

    const modal = wrapper.get('[data-test="product-modal"]')
    expect(modal.get('.admin-modal__body').exists()).toBe(true)
    expect(modal.get('.admin-modal__footer [data-test="save-product"]').exists()).toBe(true)
  })

  test('uses responsive form grids instead of fixed inline columns', async () => {
    const wrapper = mountDashboard()
    await wrapper.get('#admin-tab-inventory').trigger('click')
    await wrapper.get('[data-test="add-product"]').trigger('click')

    expect(wrapper.findAll('[data-test="product-modal"] .admin-form-grid').length).toBeGreaterThan(0)
  })

  test('labels order, article, and confirmation dialogs for assistive technology', async () => {
    const wrapper = mountDashboard(collectionProps)

    await wrapper.get('#admin-tab-orders').trigger('click')
    await wrapper.get('[data-test="order-card-ORD-1"] button').trigger('click')
    expect(wrapper.get('[role="dialog"][aria-labelledby="order-modal-title"]').attributes('aria-modal')).toBe('true')
    await wrapper.get('[aria-label="ปิดรายละเอียดคำสั่งซื้อ"]').trigger('click')

    await wrapper.get('#admin-tab-articles').trigger('click')
    await wrapper.get('[data-test="add-article"]').trigger('click')
    expect(wrapper.get('[role="dialog"][aria-labelledby="article-modal-title"]').attributes('aria-modal')).toBe('true')
    await wrapper.get('[aria-label="ปิดฟอร์มบทความ"]').trigger('click')

    await wrapper.get('#admin-tab-inventory').trigger('click')
    await wrapper.get('[data-test="product-card-7"] .btn-outline-danger').trigger('click')
    expect(wrapper.get('[role="dialog"][aria-labelledby="confirm-modal-title"]').attributes('aria-modal')).toBe('true')
  })

  test('keeps a new product modal and its values open after failure, then closes only after success', async () => {
    const admin = useAdminStore()
    admin.saveProduct = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce({ id: 91 })
    const wrapper = mountDashboard()
    await wrapper.findAll('.admin-menu button')[2].trigger('click')
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
    await wrapper.findAll('.admin-menu button')[3].trigger('click')
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
    await wrapper.findAll('.admin-menu button')[2].trigger('click')
    await wrapper.get('tbody tr button').trigger('click')
    await wrapper.get('button[data-test="save-product"]').trigger('click')
    await flushPromises()
    expect(admin.saveProduct).toHaveBeenCalledWith(expect.objectContaining({
      product: expect.objectContaining({ specifications: expect.objectContaining({ Socket: 'AM5', Cores: '8', Threads: '16', TDP: '105' }) })
    }))
  })
})

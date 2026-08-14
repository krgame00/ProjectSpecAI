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
})

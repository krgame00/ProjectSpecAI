import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { routerKey } from 'vue-router'
import ProfileView from '../src/views/ProfileView.vue'
import { useAuthStore } from '../src/stores/auth'

let pinia

const mountProfile = router => mount(ProfileView, {
  global: {
    plugins: [pinia],
    provide: { [routerKey]: router }
  }
})

describe('ProfileView', () => {
  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(key => key === 'token'
        ? 'token-1'
        : key === 'user'
          ? JSON.stringify({ id: 1, name: 'Member' })
          : null),
      setItem: vi.fn(),
      removeItem: vi.fn()
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  test('uses the auth store token and renders returned profile data', async () => {
    const auth = useAuthStore()
    auth.token = 'store-token'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        name: 'Member',
        email: 'member@example.com',
        role: 'customer',
        created_at: '2026-08-13T00:00:00.000Z'
      })
    }))

    const wrapper = mountProfile({ replace: vi.fn() })
    await flushPromises()

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/auth/profile',
      { headers: { Authorization: 'Bearer store-token' } }
    )
    expect(wrapper.text()).toContain('member@example.com')
  })

  test('keeps a network failure in place and retries', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          name: 'Recovered',
          email: 'ok@example.com',
          role: 'customer',
          created_at: null
        })
      }))

    const wrapper = mountProfile({ replace: vi.fn() })
    await flushPromises()

    expect(wrapper.text()).toContain('offline')
    await wrapper.get('[data-test="profile-retry"]').trigger('click')
    await flushPromises()

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('ok@example.com')
  })

  test('logs out and replaces the route immediately on 401', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }))
    const router = {
      replace: vi.fn(),
      push: vi.fn(),
      currentRoute: { value: { path: '/profile' } }
    }
    const auth = useAuthStore()
    const logout = vi.spyOn(auth, 'logout')

    const wrapper = mountProfile(router)
    await flushPromises()

    expect(logout).toHaveBeenCalledOnce()
    expect(router.replace).toHaveBeenCalledWith('/')
    expect(wrapper.find('[data-test="profile-retry"]').exists()).toBe(false)
  })

  test('signs out through the auth store and replaces the route', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        name: 'Member',
        email: 'member@example.com',
        role: 'customer',
        created_at: null
      })
    }))
    const router = { replace: vi.fn() }
    const auth = useAuthStore()
    const logout = vi.spyOn(auth, 'logout')

    const wrapper = mountProfile(router)
    await flushPromises()
    await wrapper.get('[data-test="profile-sign-out"]').trigger('click')

    expect(logout).toHaveBeenCalledOnce()
    expect(router.replace).toHaveBeenCalledWith('/')
  })
})

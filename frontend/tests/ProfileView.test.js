import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { routerKey } from 'vue-router'
import ProfileView from '../src/views/ProfileView.vue'
import { useAuthStore } from '../src/stores/auth'

let pinia

const deferred = () => {
  let resolve
  const promise = new Promise(resolvePromise => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

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
      expect.objectContaining({
        headers: { Authorization: 'Bearer store-token' },
        signal: expect.any(AbortSignal)
      })
    )
    expect(wrapper.text()).toContain('member@example.com')
  })

  test('renders account details as a description list and separates sign out', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        name: 'Member',
        email: 'very-long-member-address@example.com',
        role: 'customer',
        created_at: '2026-08-13T00:00:00.000Z'
      })
    }))

    const wrapper = mountProfile({ replace: vi.fn() })
    await flushPromises()

    expect(wrapper.get('main[aria-labelledby="profile-title"]').exists()).toBe(true)
    expect(wrapper.get('dl.profile-details').findAll('dt')).toHaveLength(4)
    expect(wrapper.get('dl.profile-details').findAll('dd')).toHaveLength(4)
    expect(wrapper.get('[data-test="profile-signout"]').element.closest('.profile-danger-zone')).toBeTruthy()
  })

  test('exposes loading and recoverable failure to assistive technology', async () => {
    let rejectRequest
    vi.stubGlobal('fetch', vi.fn(() => new Promise((_, reject) => {
      rejectRequest = reject
    })))

    const wrapper = mountProfile({ replace: vi.fn() })

    expect(wrapper.get('[role="status"]').attributes('aria-live')).toBe('polite')
    rejectRequest(new Error('offline'))
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('offline')
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

    const router = { replace: vi.fn() }
    const auth = useAuthStore()
    const logout = vi.spyOn(auth, 'logout')
    const wrapper = mountProfile(router)
    await flushPromises()

    expect(wrapper.text()).toContain('offline')
    expect(auth.token).toBe('token-1')
    expect(logout).not.toHaveBeenCalled()
    expect(router.replace).not.toHaveBeenCalled()
    await wrapper.get('[data-test="profile-retry"]').trigger('click')
    await flushPromises()

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('ok@example.com')
    expect(auth.token).toBe('token-1')
    expect(logout).not.toHaveBeenCalled()
    expect(router.replace).not.toHaveBeenCalled()
  })

  test('keeps a non-401 server failure recoverable without ending the session', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
    const router = { replace: vi.fn() }
    const auth = useAuthStore()
    const logout = vi.spyOn(auth, 'logout')

    const wrapper = mountProfile(router)
    await flushPromises()

    expect(wrapper.get('[data-test="profile-retry"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('500')
    expect(auth.token).toBe('token-1')
    expect(auth.user).toEqual({ id: 1, name: 'Member' })
    expect(logout).not.toHaveBeenCalled()
    expect(router.replace).not.toHaveBeenCalled()
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

  test('ignores a deferred 401 from an earlier auth session', async () => {
    const request = deferred()
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(request.promise))
    const router = { replace: vi.fn() }
    const auth = useAuthStore()
    const logout = vi.spyOn(auth, 'logout')

    mountProfile(router)
    await flushPromises()
    auth.setUser({ id: 2, name: 'New member' }, 'token-2')
    request.resolve({ ok: false, status: 401 })
    await flushPromises()

    expect(auth.token).toBe('token-2')
    expect(auth.user).toEqual({ id: 2, name: 'New member' })
    expect(logout).not.toHaveBeenCalled()
    expect(router.replace).not.toHaveBeenCalled()
  })

  test('aborts the pending profile request when the view unmounts', async () => {
    let requestSignal
    vi.stubGlobal('fetch', vi.fn().mockImplementation((_, options) => {
      requestSignal = options.signal
      return new Promise((_, reject) => {
        requestSignal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'))
        })
      })
    }))

    const wrapper = mountProfile({ replace: vi.fn() })
    await flushPromises()
    wrapper.unmount()
    await flushPromises()

    expect(requestSignal?.aborted).toBe(true)
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
    await wrapper.get('[data-test="profile-signout"]').trigger('click')

    expect(logout).toHaveBeenCalledOnce()
    expect(router.replace).toHaveBeenCalledWith('/')
  })
})

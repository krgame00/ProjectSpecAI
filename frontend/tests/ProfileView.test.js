import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { nextTick } from 'vue'
import { routerKey } from 'vue-router'
import ProfileView from '../src/views/ProfileView.vue'
import { useAuthStore } from '../src/stores/auth'

let pinia

const deferred = () => {
  let resolve
  let reject
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, reject, resolve }
}

const mountProfile = (router, options = {}) => mount(ProfileView, {
  ...options,
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

  test('preserves the populated row and action footprint while loading', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))

    const wrapper = mountProfile({ replace: vi.fn() })
    const loading = wrapper.get('[data-test="profile-loading"]')

    expect(loading.attributes('role')).toBe('status')
    expect(loading.get('.profile-loading-label').text()).not.toBe('')
    expect(loading.get('.profile-loading-label').classes()).not.toContain('sr-only')
    expect(loading.findAll('[data-test="profile-skeleton-row"]')).toHaveLength(4)
    expect(loading.get('[data-test="profile-skeleton-details"]').attributes('aria-hidden')).toBe('true')
    expect(loading.get('[data-test="profile-skeleton-action"]').attributes('aria-hidden')).toBe('true')
  })

  test('settles a rejected missing-token redirect without requesting profile data', async () => {
    const auth = useAuthStore()
    auth.token = null
    const navigationError = new Error('cancelled navigation')
    const router = { replace: vi.fn().mockRejectedValue(navigationError) }
    vi.stubGlobal('fetch', vi.fn())

    const wrapper = mountProfile(router)
    await flushPromises()

    expect(router.replace).toHaveBeenCalledWith('/')
    expect(fetch).not.toHaveBeenCalled()
    expect(wrapper.find('[data-test="profile-loading"]').exists()).toBe(false)
  })

  test('uses a labelled section instead of a main landmark when embedded', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ name: 'Admin', email: 'admin@example.com', role: 'admin' })
    }))

    const wrapper = mountProfile({ replace: vi.fn() }, { props: { embedded: true } })
    await flushPromises()

    expect(wrapper.findAll('main')).toHaveLength(0)
    expect(wrapper.get('section.profile-page').attributes('aria-labelledby')).toBe('profile-title')
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

  test('restores Retry focus after another recoverable failure', async () => {
    const retryRequest = deferred()
    vi.stubGlobal('fetch', vi.fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockReturnValueOnce(retryRequest.promise))

    const wrapper = mountProfile({ replace: vi.fn() }, { attachTo: document.body })
    await flushPromises()

    const retry = wrapper.get('[data-test="profile-retry"]')
    retry.element.focus()
    await retry.trigger('click')
    await nextTick()

    expect(wrapper.get('[data-test="profile-loading"]').exists()).toBe(true)
    retryRequest.reject(new Error('still offline'))
    await flushPromises()

    const restoredRetry = wrapper.get('[data-test="profile-retry"]')
    expect(document.activeElement).toBe(restoredRetry.element)
    wrapper.unmount()
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

  test.each([401, 404])('logs out and replaces the route immediately on %i', async status => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status }))
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

  test('clears rendered profile data and redirects when the store logs out externally', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        name: 'Old member',
        email: 'old@example.com',
        role: 'customer',
        created_at: null
      })
    }))
    const router = { replace: vi.fn().mockResolvedValue() }
    const auth = useAuthStore()
    const wrapper = mountProfile(router)
    await flushPromises()

    expect(wrapper.text()).toContain('old@example.com')

    auth.logout()
    await flushPromises()

    expect(router.replace).toHaveBeenCalledOnce()
    expect(router.replace).toHaveBeenCalledWith('/')
    expect(wrapper.text()).not.toContain('old@example.com')
    expect(wrapper.find('.profile-details').exists()).toBe(false)
  })

  test('clears old data, aborts superseded work, and loads a replacement session', async () => {
    const supersededRequest = deferred()
    let supersededSignal
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          name: 'Old member',
          email: 'old@example.com',
          role: 'customer',
          created_at: null
        })
      })
      .mockImplementationOnce((_, options) => {
        supersededSignal = options.signal
        return supersededRequest.promise
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          name: 'Newest member',
          email: 'newest@example.com',
          role: 'customer',
          created_at: null
        })
      }))
    const router = { replace: vi.fn() }
    const auth = useAuthStore()
    const logout = vi.spyOn(auth, 'logout')
    const wrapper = mountProfile(router)
    await flushPromises()

    expect(wrapper.text()).toContain('old@example.com')

    auth.setUser({ id: 2, name: 'New member' }, 'token-2')
    await nextTick()

    expect(wrapper.text()).not.toContain('old@example.com')
    expect(wrapper.get('[data-test="profile-loading"]').exists()).toBe(true)

    auth.setUser({ id: 3, name: 'Newest member' }, 'token-3')
    await flushPromises()

    expect(supersededSignal?.aborted).toBe(true)
    expect(fetch).toHaveBeenCalledTimes(3)
    expect(fetch).toHaveBeenNthCalledWith(
      3,
      'http://localhost:3001/api/v1/auth/profile',
      expect.objectContaining({ headers: { Authorization: 'Bearer token-3' } })
    )
    expect(wrapper.text()).toContain('newest@example.com')
    expect(wrapper.text()).not.toContain('old@example.com')

    supersededRequest.resolve({ ok: false, status: 401 })
    await flushPromises()

    expect(auth.token).toBe('token-3')
    expect(auth.user).toEqual({ id: 3, name: 'Newest member' })
    expect(wrapper.text()).toContain('newest@example.com')
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

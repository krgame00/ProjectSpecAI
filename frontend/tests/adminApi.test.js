import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }))
vi.mock('../src/router', () => ({ default: { replace } }))

import { adminRequest, AdminApiError } from '../src/services/adminApi'
import { useAuthStore } from '../src/stores/auth'
import { useToastStore } from '../src/stores/toast'

describe('adminRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn()
    })
    setActivePinia(createPinia())
  })

  test('uses the auth store token and serializes JSON mutations', async () => {
    useAuthStore().token = 'store-token'
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, status: 200, headers: { get: () => 'application/json' },
      json: async () => ({ saved: true })
    })

    await expect(adminRequest('/hardware', { method: 'POST', body: { name: 'CPU' } }))
      .resolves.toEqual({ saved: true })
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/hardware$/), expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer store-token', 'Content-Type': 'application/json' }),
      body: JSON.stringify({ name: 'CPU' })
    }))
  })

  test('does not set Content-Type for FormData uploads', async () => {
    useAuthStore().token = 'store-token'
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, status: 200, headers: { get: () => 'application/json' },
      json: async () => ({ success: true })
    })
    const body = new FormData()
    body.append('image', new Blob(['image'], { type: 'image/png' }), 'cover.png')

    await adminRequest('/upload', { method: 'POST', body })

    const options = fetch.mock.calls[0][1]
    expect(options.body).toBe(body)
    expect(options.headers.Authorization).toBe('Bearer store-token')
    expect(options.headers['Content-Type']).toBeUndefined()
  })

  test.each([401, 403])('clears the admin session and redirects on %s', async status => {
    const auth = useAuthStore()
    auth.user = { id: 1, role: 'admin' }
    auth.token = 'expired-token'
    const toast = useToastStore()
    vi.spyOn(toast, 'error')
    global.fetch = vi.fn().mockResolvedValue({
      ok: false, status, headers: { get: () => 'application/json' },
      json: async () => ({ message: 'expired' })
    })

    await expect(adminRequest('/hardware', { method: 'POST', body: {} }))
      .rejects.toMatchObject({ status, sessionExpired: true })
    expect(auth.token).toBeNull()
    expect(auth.user).toBeNull()
    expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/หมดอายุ/))
    expect(replace).toHaveBeenCalledWith({ name: 'landing', query: { login: 'required' } })
  })

  test('throws a typed backend error with a readable message', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false, status: 409, headers: { get: () => 'application/json' },
      json: async () => ({ error: 'สินค้านี้อยู่ในออเดอร์' })
    })

    await expect(adminRequest('/hardware/7', { method: 'DELETE' }))
      .rejects.toEqual(expect.objectContaining({
        status: 409, message: 'สินค้านี้อยู่ในออเดอร์', sessionExpired: false
      }))
    expect(AdminApiError.prototype).toBeInstanceOf(Error)
  })
})

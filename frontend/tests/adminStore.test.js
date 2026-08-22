import { setActivePinia, createPinia } from 'pinia'
import { afterEach, expect, test, beforeEach, describe, vi } from 'vitest'
import { useAdminStore } from '../src/stores/admin'
import { useAuthStore } from '../src/stores/auth'
import { useCatalogStore } from '../src/stores/catalog'

describe('Admin Store Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    global.localStorage = {
      getItem: key => key === 'token' ? 'test-token' : null,
      setItem: () => {},
      removeItem: () => {}
    }
    useAuthStore().token = 'test-token'
  })

  afterEach(() => vi.restoreAllMocks())

  test('admin store initial state', () => {
    const admin = useAdminStore()
    expect(admin.orders).toEqual([])
    expect(admin.users).toEqual([])
  })

  test('fetchOrders handles paginated response', async () => {
    const admin = useAdminStore()
    global.fetch = () => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: [{ id: 1, customer_name: 'Test' }], total: 1, page: 1, limit: 20 })
    })
    await admin.fetchOrders()
    expect(admin.orders).toHaveLength(1)
    expect(admin.orders[0].customer_name).toBe('Test')
  })

  test('updateOrderStatus updates local state', async () => {
    const admin = useAdminStore()
    admin.orders = [{ id: 'ORD-001', status: 'pending' }]
    global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
    await expect(admin.updateOrderStatus('ORD-001', 'shipped')).resolves.toBe(true)
    expect(admin.orders[0].status).toBe('shipped')
  })

  test('saveProduct uses the canonical category/product contract for POST and PUT', async () => {
    const admin = useAdminStore()
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, status: 200, headers: { get: () => 'application/json' },
      json: async () => ({ product: { id: 41, name: 'New CPU' } })
    })

    await expect(admin.saveProduct({ category: 'cpu', product: { id: null, name: 'New CPU', price: 4990 } }))
      .resolves.toMatchObject({ id: 41 })
    expect(fetch).toHaveBeenLastCalledWith(expect.stringMatching(/\/hardware$/), expect.objectContaining({
      method: 'POST', body: JSON.stringify({ name: 'New CPU', price: 4990, category: 'cpu' })
    }))

    global.fetch.mockResolvedValueOnce({
      ok: true, status: 200, headers: { get: () => 'application/json' },
      json: async () => ({ product: { id: 41, name: 'Updated CPU' } })
    })
    await admin.saveProduct({ category: 'cpu', product: { id: 41, name: 'Updated CPU', price: 5990 } })
    expect(fetch).toHaveBeenLastCalledWith(expect.stringMatching(/\/hardware\/41$/), expect.objectContaining({
      method: 'PUT', body: JSON.stringify({ id: 41, name: 'Updated CPU', price: 5990, category: 'cpu' })
    }))
  })

  test('deleteProduct returns false and preserves catalog after a 409', async () => {
    const admin = useAdminStore()
    const catalog = useCatalogStore()
    catalog.hardwareList = { cpu: [{ id: 7, name: 'Historical CPU' }] }
    global.fetch = vi.fn().mockResolvedValue({
      ok: false, status: 409, headers: { get: () => 'application/json' },
      json: async () => ({ error: 'สินค้าอยู่ในออเดอร์' })
    })
    await expect(admin.deleteProduct({ category: 'cpu', productId: 7 })).resolves.toBe(false)
    expect(catalog.hardwareList.cpu).toEqual([{ id: 7, name: 'Historical CPU' }])
  })

  test('user and order state change only after successful requests', async () => {
    const admin = useAdminStore()
    const user = { id: 3, role: 'customer' }
    admin.users = [user]
    admin.orders = [{ id: 'ORD-1', status: 'pending' }]
    global.fetch = vi.fn().mockResolvedValue({
      ok: false, status: 500, headers: { get: () => 'application/json' },
      json: async () => ({ error: 'database unavailable' })
    })

    await expect(admin.toggleUserRole(user)).resolves.toBe(false)
    await expect(admin.deleteUser(3)).resolves.toBe(false)
    await expect(admin.updateOrderStatus('ORD-1', 'shipped')).resolves.toBe(false)
    expect(admin.users).toEqual([{ id: 3, role: 'customer' }])
    expect(admin.orders).toEqual([{ id: 'ORD-1', status: 'pending' }])
  })
})

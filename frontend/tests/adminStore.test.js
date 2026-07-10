import { setActivePinia, createPinia } from 'pinia'
import { expect, test, beforeEach, describe } from 'vitest'
import { useAdminStore } from '../src/stores/admin'

describe('Admin Store Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    global.localStorage = {
      getItem: () => 'test-token',
      setItem: () => {},
      removeItem: () => {}
    }
  })

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
    await admin.updateOrderStatus('ORD-001', 'shipped')
    expect(admin.orders[0].status).toBe('shipped')
  })
})

import { setActivePinia, createPinia } from 'pinia'
import { expect, test, beforeEach, describe } from 'vitest'
import { useAuthStore } from '../src/stores/auth'

describe('Auth Store Tests', () => {
  let mockStore = {}
  
  beforeEach(() => {
    setActivePinia(createPinia())
    // Mock localStorage
    mockStore = {}
    global.localStorage = {
      getItem: (key) => mockStore[key] || null,
      setItem: (key, value) => { mockStore[key] = value },
      removeItem: (key) => { delete mockStore[key] }
    }
  })

  test('auth store initialization without token', () => {
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.token).toBeNull()
  })

  test('auth store initialization with valid token', () => {
    mockStore['token'] = 'valid.token'
    mockStore['user'] = JSON.stringify({ id: 1, role: 'admin' })
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.isAdmin).toBe(true)
  })

  test('auth store sets token and user manually', () => {
    const auth = useAuthStore()
    auth.setUser({ id: 2 }, 'abc')
    expect(auth.isAuthenticated).toBe(true)
    expect(mockStore['token']).toBe('abc')
    
    auth.logout()
    expect(auth.isAuthenticated).toBe(false)
    expect(mockStore['token']).toBeUndefined()
  })
})

import { setActivePinia, createPinia } from 'pinia'
import { expect, test, beforeEach, describe } from 'vitest'
import { useCatalogStore } from '../src/stores/catalog'

describe('Catalog Store Tests', () => {
  beforeEach(() => { setActivePinia(createPinia()) })

  test('catalog store fetches data and handles structure', async () => {
    const catalogStore = useCatalogStore()
    // Mock global fetch returning categorized object
    global.fetch = () => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ cpu: [{ id: 1, name: 'CPU 1' }] })
    })
    
    await catalogStore.fetchCatalog()
    
    expect(catalogStore.hardwareList.cpu).toBeDefined()
    expect(catalogStore.hardwareList.cpu.length).toBe(1)
    expect(catalogStore.hardwareList.cpu[0].name).toBe('CPU 1')
    expect(catalogStore.getCategorizedHardware).toEqual({ cpu: [{ id: 1, name: 'CPU 1' }] })
  })

  test('catalog store handles fetch error', async () => {
    const catalogStore = useCatalogStore()
    global.fetch = () => Promise.reject(new Error('Network error'))
    
    // Attempt fetch
    await catalogStore.fetchCatalog()
    
    // State should remain empty object
    expect(catalogStore.hardwareList).toEqual({})
    expect(catalogStore.isLoading).toBe(false)
  })
})

import { defineStore } from 'pinia'

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    hardwareList: {},
    isLoading: false
  }),
  getters: {
    getCategorizedHardware: (state) => {
      // Backend already returns { cpu: [], mobo: [], ... }
      return state.hardwareList
    }
  },
  actions: {
    async fetchCatalog() {
      this.isLoading = true
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.PROD ? 'https://projectspecai-production.up.railway.app/api/v1' : 'http://localhost:3000/api/v1');
        const res = await fetch(`${API_BASE}/hardware/catalog`)
        if (res.ok) {
          this.hardwareList = await res.json()
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.isLoading = false
      }
    }
  }
})

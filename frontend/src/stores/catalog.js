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
        const res = await fetch('http://localhost:3000/api/hardware/catalog')
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

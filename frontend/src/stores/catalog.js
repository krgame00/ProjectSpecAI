import { defineStore } from 'pinia'
import { API_BASE } from '../services/apiBase'

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    hardwareList: {},
    isLoading: false,
    error: null
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
      this.error = null
      try {
        const res = await fetch(`${API_BASE}/hardware/catalog`)
        if (!res.ok) {
          throw new Error(`โหลดข้อมูลฮาร์ดแวร์ไม่สำเร็จ (${res.status})`)
        }
        this.hardwareList = await res.json()
        return true
      } catch (err) {
        this.error = err?.message || 'ไม่สามารถโหลดข้อมูลอุปกรณ์ได้ กรุณาตรวจสอบการเชื่อมต่อ'
        return false
      } finally {
        this.isLoading = false
      }
    }
  }
})

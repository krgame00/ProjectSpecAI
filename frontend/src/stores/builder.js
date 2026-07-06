import { defineStore } from 'pinia'
import { useCatalogStore } from './catalog'

export const useBuilderStore = defineStore('builder', {
  state: () => ({
    build: { cpu: null, mobo: null, ram: null, gpu: null, storage: null, psu: null, case: null }
  }),
  getters: {
    totalPrice: (state) => {
      const catalogStore = useCatalogStore()
      let total = 0
      Object.entries(state.build).forEach(([cat, itemId]) => {
        if (itemId && catalogStore.hardwareList[cat]) {
          const item = catalogStore.hardwareList[cat].find(i => i.id === itemId)
          if (item) total += item.price
        }
      })
      return total
    },
    hasAnyComponent: (state) => Object.values(state.build).some(val => val !== null),
    compatibilityIssues: (state) => {
      const issues = []
      const catalogStore = useCatalogStore()
      const getItem = (catId, itemId) => {
        if (!catalogStore.hardwareList[catId]) return null
        return catalogStore.hardwareList[catId].find(i => i.id === itemId)
      }
      
      const cCpu = state.build.cpu ? getItem('cpu', state.build.cpu) : null
      const cMobo = state.build.mobo ? getItem('mobo', state.build.mobo) : null
      const cRam = state.build.ram ? getItem('ram', state.build.ram) : null
      const cGpu = state.build.gpu ? getItem('gpu', state.build.gpu) : null
      const cPsu = state.build.psu ? getItem('psu', state.build.psu) : null

      if (cCpu && cMobo && cCpu.socket !== cMobo.socket) issues.push(`ซ็อกเก็ตไม่ตรง: CPU เป็น ${cCpu.socket} แต่เมนบอร์ดรองรับเฉพาะ ${cMobo.socket}`)
      if (cMobo && cRam && cMobo.ramType !== cRam.type) issues.push(`ประเภท RAM ไม่ตรง: เมนบอร์ดรองรับ ${cMobo.ramType} แต่คุณเลือก ${cRam.type}`)
      if (cPsu) {
        let totalTdp = 50
        if (cCpu) totalTdp += cCpu.tdp
        if (cGpu) totalTdp += cGpu.tdp
        const recommendedWattage = totalTdp * 1.3
        if (cPsu.wattage < recommendedWattage) issues.push(`กำลังไฟอาจไม่พอ: ระบบต้องการไฟขั้นต่ำ ${Math.ceil(recommendedWattage)}W แต่ PSU ที่เลือกจ่ายได้ ${cPsu.wattage}W`)
      }
      return issues
    }
  },
  actions: {
    selectItem(catId, itemId) {
      if (this.build[catId] === itemId) {
        this.build[catId] = null
      } else {
        this.build[catId] = itemId
      }
    },
    setItem(catId, itemId) {
      this.build[catId] = itemId
    },
    clearBuild() {
      Object.keys(this.build).forEach(k => this.build[k] = null)
    }
  }
})

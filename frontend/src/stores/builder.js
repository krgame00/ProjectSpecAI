import { defineStore } from 'pinia'
import { useCatalogStore } from './catalog'

// Helper: Exhaustive iGPU Check
export const hasIGPU = (cpu) => {
  if (!cpu || !cpu.name) return true;
  const name = cpu.name.toUpperCase();

  // Intel 'F' series has NO iGPU
  if (name.includes('INTEL') || name.includes('CORE') || name.includes('ULTRA')) {
    if (/\b\w+F\b/.test(name) || name.endsWith('F')) return false;
    return true;
  }

  // AMD CPUs
  if (name.includes('AMD') || name.includes('RYZEN') || name.includes('THREADRIPPER')) {
    if (/\b\d{4}F\b/.test(name) || name.endsWith('F') || name.includes('THREADRIPPER')) return false;
    if (/\b(7\d{3}|9\d{3})\b/.test(name)) return true;
    if (/\b8\d{3}G\b/.test(name) || name.endsWith('G') || name.endsWith('GT')) return true;
    if (/\b(1\d{3}|2\d{3}|3\d{3}|4\d{3}|5\d{3})\b/.test(name)) {
      return name.includes('G') || name.includes('GT');
    }
    return true;
  }
  return true;
};

// Helper: Standard System TDP Calculation
export const calcTotalTdp = (cCpu, cGpu, cMobo, cRam, cStorage) => {
  let totalTdp = 0;
  if (cCpu) totalTdp += (Number(cCpu.tdp) || 65);
  if (cGpu) totalTdp += (Number(cGpu.tdp) || 150);
  if (cMobo) totalTdp += 35;
  if (cRam) totalTdp += 10;
  if (cStorage) totalTdp += 5;
  if (!cMobo && !cRam && !cStorage && (cCpu || cGpu)) totalTdp += 50;
  return totalTdp;
};

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
      const cStorage = state.build.storage ? getItem('storage', state.build.storage) : null
      const cCase = state.build.case ? getItem('case', state.build.case) : null

      // 1. Basic Compatibility
      if (cCpu && cMobo && cCpu.socket && cMobo.socket && cCpu.socket !== cMobo.socket) {
        issues.push(`ซ็อกเก็ตไม่ตรง: CPU เป็น ${cCpu.socket} แต่เมนบอร์ดรองรับเฉพาะ ${cMobo.socket}`)
      }
      if (cMobo && cRam && cMobo.ramType && cRam.type && cMobo.ramType !== cRam.type) {
        issues.push(`ประเภท RAM ไม่ตรง: เมนบอร์ดรองรับ ${cMobo.ramType} แต่คุณเลือก ${cRam.type}`)
      }

      // 2. PSU Wattage Check
      if (cPsu) {
        const totalTdp = calcTotalTdp(cCpu, cGpu, cMobo, cRam, cStorage)
        const recommendedWattage = Math.ceil(totalTdp * 1.3)
        if (cPsu.wattage < recommendedWattage) {
          issues.push(`กำลังไฟอาจไม่พอ: ระบบต้องการไฟขั้นต่ำ ${recommendedWattage}W แต่ PSU ที่เลือกจ่ายได้ ${cPsu.wattage || 0}W`)
        }
      }

      // 3. iGPU vs Discrete GPU Check
      if (cCpu && !hasIGPU(cCpu) && !cGpu) {
        issues.push(`CPU ไม่มีชิปกราฟิกในตัว: ${cCpu.name} จำเป็นต้องใช้ร่วมกับการ์ดจอ (GPU) เพื่อให้เครื่องเปิดติดและแสดงผลภาพได้`);
      }

      // 4. Bottleneck Check (Price-based heuristic)
      if (cCpu && cGpu) {
        if (cGpu.price > (cCpu.price * 3.5)) {
          issues.push(`ระวังคอขวด (Bottleneck): การ์ดจอคุณอยู่ในระดับไฮเอนด์ แต่ CPU สเปคต่ำเกินไป อาจประมวลผลรีดประสิทธิภาพการ์ดจอได้ไม่เต็มที่ แนะนำให้อัปเกรด CPU เพิ่มครับ`);
        } else if (cCpu.price > (cGpu.price * 3.5)) {
          issues.push(`ระวังคอขวด (Bottleneck): CPU คุณแรงมาก แต่การ์ดจออาจจะเป็นจุดอ่อนในการเล่นเกม แนะนำให้อัปเกรดการ์ดจอเพื่อให้สเปคสมดุลขึ้นครับ`);
        }
      }

      // 5. Form Factor Check
      if (cMobo && cCase) {
        const mForm = (cMobo.specifications?.['Form Factor'] || cMobo.name || '').toUpperCase();
        const cSupport = (cCase.specifications?.['Form Factor Support'] || cCase.specifications?.['Form Factor'] || cCase.name || '').toUpperCase();
        
        const isMoboATX = mForm.includes('ATX') && !mForm.includes('MICRO') && !mForm.includes('MATX') && !mForm.includes('ITX');
        const isCaseSmall = cSupport.includes('ITX') || cSupport.includes('MATX') || cSupport.includes('MICRO');
        const isCaseATXSupport = cSupport.match(/(?<!MINI[\s-]*(?:ITX)?)(?<!MICRO[\s-]*(?:ATX)?)(?<!M)(ATX)/);
        
        if (isMoboATX && isCaseSmall && !isCaseATXSupport) {
          issues.push(`ขนาดไม่รองรับ: เมนบอร์ดไซส์ ATX จะมีขนาดใหญ่เกินไป และไม่สามารถใส่ในเคสขนาดเล็กที่คุณเลือกได้`);
        }
      }

      // 6. GPU Length Check
      if (cGpu && cCase) {
        const gLen = cGpu.lengthMm || (cGpu.specifications?.['Length'] ? parseInt(String(cGpu.specifications['Length']).replace(/\D/g, '')) : null);
        const cLen = cCase.maxGpuLength || (cCase.specifications?.['Max GPU Length'] ? parseInt(String(cCase.specifications['Max GPU Length']).replace(/\D/g, '')) : null);
        if (gLen && cLen && gLen > cLen) {
          issues.push(`การ์ดจอขนาดใหญ่เกินไป: การ์ดจอยาว ${gLen}mm แต่เคสรองรับได้สูงสุดเพียง ${cLen}mm`);
        }
      }

      // 7. Missing Critical Parts Warnings
      const pickedCount = Object.values(state.build).filter(v => v !== null).length;
      if (pickedCount >= 4) {
        if (!cStorage) issues.push(`ยังไม่มีที่เก็บข้อมูล: เครื่องของคุณจำเป็นต้องมี Storage (SSD/HDD) สำหรับติดตั้ง Windows และใช้เก็บข้อมูลครับ`);
        if (!cCase) issues.push(`อย่าลืมเลือกเคส: คุณยังไม่ได้เลือกเคส (Case) สำหรับประกอบชิ้นส่วนทั้งหมดเข้าด้วยกัน`);
      }

      return issues;
    },
    compatibilityPasses: (state) => {
      const passes = []
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
      const cStorage = state.build.storage ? getItem('storage', state.build.storage) : null
      const cCase = state.build.case ? getItem('case', state.build.case) : null

      // 1. Socket Match
      if (cCpu && cMobo && cCpu.socket === cMobo.socket) {
        passes.push(`Socket ${cCpu.socket || ''} ตรงกัน`);
      }
      // 2. RAM Match
      if (cMobo && cRam && cMobo.ramType === cRam.type) {
        passes.push(`รองรับแรม ${cMobo.ramType || ''} ตรงกัน`);
      }
      // 3. GPU / iGPU Pass
      if (cCpu && (hasIGPU(cCpu) || cGpu)) {
        if (cGpu) {
          passes.push(`มี GPU แยก (${cGpu.name}) แสดงผลภาพได้อย่างสมบูรณ์`);
        } else {
          passes.push(`CPU (${cCpu.name}) มีชิปกราฟิกในตัว แสดงผลภาพได้โดยไม่ต้องใช้การ์ดจอแยก`);
        }
      }
      // 4. Form Factor Match
      if (cMobo && cCase) {
        const mForm = (cMobo.formFactor || cMobo.specifications?.['Form Factor'] || cMobo.name || '').toUpperCase();
        const cSupport = (cCase.formFactorSupport || cCase.specifications?.['Form Factor Support'] || cCase.specifications?.['Form Factor'] || cCase.name || '').toUpperCase();
        
        const isMoboATX = mForm.includes('ATX') && !mForm.includes('MICRO') && !mForm.includes('MATX') && !mForm.includes('ITX');
        const isMoboMATX = mForm.includes('MICRO') || mForm.includes('MATX');
        const isMoboITX = mForm.includes('ITX');
        
        const isCaseSmall = cSupport.includes('ITX') || cSupport.includes('MATX') || cSupport.includes('MICRO');
        const isCaseATXSupport = cSupport.match(/(?<!MINI[\s-]*(?:ITX)?)(?<!MICRO[\s-]*(?:ATX)?)(?<!M)(ATX)/);
        
        if (!(isMoboATX && isCaseSmall && !isCaseATXSupport)) {
          let mName = isMoboATX ? 'ATX' : (isMoboMATX ? 'mATX' : (isMoboITX ? 'Mini-ITX' : 'เมนบอร์ด'));
          passes.push(`${mName} สามารถใส่ในเคสได้`);
        }
      }
      // 5. PSU Wattage Sufficient
      if (cPsu) {
        const totalTdp = calcTotalTdp(cCpu, cGpu, cMobo, cRam, cStorage);
        const recommendedWattage = Math.ceil(totalTdp * 1.3);
        if (cPsu.wattage >= recommendedWattage) {
          passes.push(`PSU ${cPsu.wattage}W เพียงพอ (โหลดรวมประมาณ ${Math.ceil(totalTdp)}W)`);
        }
      }
      // 6. GPU Length vs Case
      if (cGpu && cCase) {
        const gLen = cGpu.lengthMm || (cGpu.specifications?.['Length'] ? parseInt(String(cGpu.specifications['Length']).replace(/\D/g, '')) : null);
        const cLen = cCase.maxGpuLength || (cCase.specifications?.['Max GPU Length'] ? parseInt(String(cCase.specifications['Max GPU Length']).replace(/\D/g, '')) : null);
        if (gLen && cLen && gLen <= cLen) {
          passes.push(`GPU ยาว ${gLen}mm ใส่เคสได้ (เคสรองรับสูงสุด ${cLen}mm)`);
        }
      }
      // 7. Storage & Case Selected Passes
      if (cStorage) {
        if (cStorage.readSpeedMbs && cStorage.writeSpeedMbs) {
          passes.push(`Storage (${cStorage.type || 'SSD'}) ความเร็ว Read ${cStorage.readSpeedMbs} MB/s | Write ${cStorage.writeSpeedMbs} MB/s ช่วยให้โหลดเกมและเปิดเครื่องไวสูงสุด`);
        } else {
          passes.push(`มี Storage (SSD/HDD) สำหรับติดตั้ง OS และเก็บข้อมูล`);
        }
      }
      if (cCase) {
        passes.push(`มีเคสคอมพิวเตอร์สำหรับประกอบชิ้นส่วนครบถ้วน`);
      }

      return passes
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

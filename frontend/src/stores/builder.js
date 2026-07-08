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
      const cStorage = state.build.storage ? getItem('storage', state.build.storage) : null
      const cCase = state.build.case ? getItem('case', state.build.case) : null

      // 1. Basic Compatibility
      if (cCpu && cMobo && cCpu.socket !== cMobo.socket) {
        issues.push(`ซ็อกเก็ตไม่ตรง: CPU เป็น ${cCpu.socket || 'ไม่ระบุ'} แต่เมนบอร์ดรองรับเฉพาะ ${cMobo.socket || 'ไม่ระบุ'}`)
      }
      if (cMobo && cRam && cMobo.ramType !== cRam.type) {
        issues.push(`ประเภท RAM ไม่ตรง: เมนบอร์ดรองรับ ${cMobo.ramType || 'ไม่ระบุ'} แต่คุณเลือก ${cRam.type || 'ไม่ระบุ'}`)
      }

      // 2. PSU Wattage Check
      if (cPsu) {
        let totalTdp = 50
        if (cCpu) totalTdp += (cCpu.tdp || 65)
        if (cGpu) totalTdp += (cGpu.tdp || 150)
        const recommendedWattage = totalTdp * 1.3
        if (cPsu.wattage < recommendedWattage) {
          issues.push(`กำลังไฟอาจไม่พอ: ระบบต้องการไฟขั้นต่ำ ${Math.ceil(recommendedWattage)}W แต่ PSU ที่เลือกจ่ายได้ ${cPsu.wattage || 0}W`)
        }
      }

      // 3. No iGPU Warning (Intel 'F' series or specific AMDs without graphics)
      if (cCpu && !cGpu) {
        const cpuName = cCpu.name.toUpperCase();
        if (cpuName.includes('INTEL') && cpuName.endsWith('F')) {
          issues.push(`CPU ไม่มีชิปกราฟิกในตัว: ${cCpu.name} จำเป็นต้องใช้ร่วมกับการ์ดจอ (GPU) เพื่อให้เครื่องเปิดติดและแสดงผลภาพได้`);
        } else if (cpuName.includes('AMD') && !cpuName.endsWith('G') && cpuName.includes('RYZEN')) {
          // AMD Ryzen desktop CPUs mostly don't have iGPU unless they end with G (or Ryzen 7000 series). Let's do a generic warning for non-G series older than 7000.
          if (!cpuName.includes('7000') && !cpuName.includes('8000') && !cpuName.includes('9000')) {
             issues.push(`CPU อาจไม่มีชิปกราฟิกในตัว: ${cCpu.name} มักจำเป็นต้องใช้ร่วมกับการ์ดจอ (GPU) กรุณาตรวจสอบอีกครั้ง หรือเพิ่มการ์ดจอลงในสเปค`);
          }
        }
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
        const isCaseATXSupport = cSupport.match(/(?<!MINI[\s-]*(?:ITX)?)(?<!MICRO[\s-]*(?:ATX)?)(?<!M)(ATX)/); // Strict ATX check
        
        if (isMoboATX && isCaseSmall && !isCaseATXSupport) {
          issues.push(`ขนาดไม่รองรับ: เมนบอร์ดไซส์ ATX จะมีขนาดใหญ่เกินไป และไม่สามารถใส่ในเคสขนาดเล็กที่คุณเลือกได้`);
        }
      }

      // 6. GPU Length Check
      if (cGpu && cCase) {
        const gLenRaw = cGpu.specifications?.['Length'] || cGpu.specifications?.['Length (mm)'];
        const cLenRaw = cCase.specifications?.['Max GPU Length'] || cCase.specifications?.['Max GPU Length (mm)'];
        if (gLenRaw && cLenRaw) {
          const gLen = parseInt(String(gLenRaw).replace(/\D/g, ''));
          const cLen = parseInt(String(cLenRaw).replace(/\D/g, ''));
          if (gLen && cLen && gLen > cLen) {
            issues.push(`การ์ดจอขนาดใหญ่เกินไป: การ์ดจอยาว ${gLen}mm แต่เคสรองรับได้สูงสุดเพียง ${cLen}mm`);
          }
        }
      }

      // 7. Missing Critical Parts (Warn only when user has started picking a few things to avoid annoying them immediately)
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
      // 3. Form Factor Match
      if (cMobo && cCase) {
        const mForm = (cMobo.specifications?.['Form Factor'] || cMobo.name || '').toUpperCase();
        const cSupport = (cCase.specifications?.['Form Factor Support'] || cCase.specifications?.['Form Factor'] || cCase.name || '').toUpperCase();
        
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
      // 4. PSU Wattage Sufficient
      if (cPsu) {
        let totalTdp = 50;
        if (cCpu) totalTdp += (cCpu.tdp || 65);
        if (cGpu) totalTdp += (cGpu.tdp || 150);
        const recommendedWattage = totalTdp * 1.3;
        if (cPsu.wattage >= recommendedWattage) {
          passes.push(`PSU ${cPsu.wattage}W เพียงพอ (โหลดรวมประมาณ ${Math.ceil(totalTdp)}W)`);
        }
      }
      // 5. GPU Length vs Case
      if (cGpu && cCase) {
        const gLenRaw = cGpu.specifications?.['Length'] || cGpu.specifications?.['Length (mm)'];
        const cLenRaw = cCase.specifications?.['Max GPU Length'] || cCase.specifications?.['Max GPU Length (mm)'];
        if (gLenRaw && cLenRaw) {
          const gLen = parseInt(String(gLenRaw).replace(/\D/g, ''));
          const cLen = parseInt(String(cLenRaw).replace(/\D/g, ''));
          if (gLen && cLen && gLen <= cLen) {
            passes.push(`GPU ยาว ${gLen}mm ใส่เคสได้ (เคสรองรับสูงสุด ${cLen}mm)`);
          }
        }
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

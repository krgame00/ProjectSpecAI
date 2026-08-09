// ============================================================
// PCSpec — Compatibility Engine (Phase 4.2)
// Pure, unit-testable compatibility checkers.
// Every function takes plain item objects and returns
// arrays of { type: 'issue'|'pass', text } — ZERO Vue/Pinia deps.
// ============================================================

const asNumber = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

// ---------- Socket helpers ----------
export const extractSocket = (item) => {
  if (!item) return null
  if (typeof item === 'string') return item.trim() || null
  return item.socket || null
}

// AMD: "AM5", "AM4", "sTRX5", "sTR5", "TRX50" (Threadripper)
// Intel: "LGA1700", "LGA1851", "LGA1200", "LGA1151", "LGA2066"
export const normalizeSocket = (socket) => {
  if (!socket) return null
  const s = String(socket).trim().toUpperCase()
  return s
}

export const socketIsAM5 = (socket) => {
  const s = extractSocket(socket) ? String(extractSocket(socket)).toUpperCase() : ''
  return s.includes('AM5')
}

export const socketIsAM4 = (socket) => {
  const s = extractSocket(socket) ? String(extractSocket(socket)).toUpperCase() : ''
  return s.includes('AM4')
}

export const socketMatches = (cpuSocket, moboSocket) => {
  const a = extractSocket(cpuSocket)
  const b = extractSocket(moboSocket)
  if (!a || !b) return true // unknown -> cannot judge
  const na = String(a).trim().toUpperCase()
  const nb = String(b).trim().toUpperCase()
  // Treat "AM5"/"AM4" family prefixes as compatible ONLY when exact family
  if (/^AM\d/.test(na) && /^AM\d/.test(nb)) {
    if (na.startsWith('AM5') && nb.startsWith('AM5')) return true
    if (na.startsWith('AM4') && nb.startsWith('AM4')) return true
    return false // AM5 vs AM4 mismatch
  }
  return na === nb
}

export const chipsetSupportsSocket = (chipset, socket) => {
  if (!chipset || !socket) return true
  const c = String(chipset).toUpperCase()
  const s = String(socket).toUpperCase()

  // AMD: B650/X670 support AM5; B550/X570/A520 support AM4
  if (s.includes('AM5')) return /B650|X670|X870|B850|A620|X670E/.test(c)
  if (s.includes('AM4')) return /B550|X570|A520|B450|X470|A320|B350|X370/.test(c)

  // Intel: chipset containing socket number (e.g. Z790 includes "790" -> LGA1700?)
  // Simple heuristic: if chipset has a 4-digit number, compare to socket's number group
  const chipNum = (c.match(/\d{3,4}/) || [null])[0]
  const sockNum = (s.match(/\d{3,4}/) || [null])[0]
  if (chipNum && sockNum) return chipNum === sockNum
  return true
}

// ---- RAM helpers ----
export const extractRamType = (ram) => ram?.type || null

export const extractRamCapacityGb = (ram) => {
  if (!ram) return null
  if (ram.capacityGb != null) return asNumber(ram.capacityGb)
  const raw = ram.specifications?.['Capacity'] || ram.name || ''
  const m = String(raw).match(/(\d+)\s*GB/i)
  return m ? asNumber(m[1]) : null
}

export const extractRamSpeedMhz = (ram) => {
  if (!ram) return null
  if (ram.busSpeed != null) return asNumber(ram.busSpeed)
  const raw = String(ram.specifications?.['Speed'] || ram.specifications?.['Bus Speed'] || ram.name || '')
  const m = raw.match(/(\d{3,5})\s*MHz/i)
  return m ? asNumber(m[1]) : null
}

// ---- PSU helpers ----
export const extractPsuWattage = (psu) => {
  if (!psu) return null
  if (psu.wattage != null) return asNumber(psu.wattage)
  const raw = String(psu.specifications?.['Wattage'] || psu.name || '')
  const m = raw.match(/(\d{3,4})\s*W/i)
  return m ? asNumber(m[1]) : null
}

export const calcRecommendedWattage = (totalTdp) =>
  Math.ceil((totalTdp || 0) * 1.3)

// ---- Case ----
export const extractCaseMaxGpuLengthMm = (caseItem) => {
  if (!caseItem) return null
  if (caseItem.maxGpuLength != null) return asNumber(caseItem.maxGpuLength)
  const raw = String(
    caseItem.specifications?.['Max GPU Length (mm)'] ||
    caseItem.specifications?.['Max GPU Length'] || ''
  )
  const m = raw.match(/(\d{3,4})/)
  return m ? asNumber(m[1]) : null
}

// ---- Motherboard form factor vs Case ----
export const extractMoboFormFactor = (mobo) =>
  (mobo?.formFactor || mobo?.specifications?.['Form Factor'] || mobo?.name || '').toString().toUpperCase()

export const extractCaseFormFactorSupport = (caseItem) =>
  (caseItem?.formFactorSupport || caseItem?.specifications?.['Form Factor Support'] || caseItem?.specifications?.['Form Factor'] || caseItem?.name || '').toString().toUpperCase()

export const isMoboATX = (mf) => mf.includes('ATX') && !mf.includes('MICRO') && !mf.includes('MATX') && !mf.includes('ITX')
export const isMoboMicroATX = (mf) => mf.includes('MICRO') || mf.includes('MATX')
export const isMoboMiniITX = (mf) => mf.includes('ITX')
export const isCaseSmall = (cs) => cs.includes('ITX') || cs.includes('MATX') || cs.includes('MICRO')

// Negative lookbehind doesn't work in all runtimes; use a safe approach.
export const caseSupportsATX = (cs) => {
  // "ATX" but not "Micro-ATX"/"Mini-ITX"/"Mini-ATX"
  if (!/\bATX\b/.test(cs)) return false
  // Exclude Micro/Mini prefixes before ATX
  return !/(MICRO|MINI)[\s-]*ATX/.test(cs)
}

// ---- CPU iGPU (from builder store, extracted) ----
export const hasIGPU = (cpu) => {
  if (!cpu || !cpu.name) return true
  const name = cpu.name.toUpperCase()

  // Intel 'F' series has NO iGPU
  if (name.includes('INTEL') || name.includes('CORE') || name.includes('ULTRA')) {
    if (/\b\w+F\b/.test(name) || name.endsWith('F')) return false
    return true
  }

  // AMD CPUs
  if (name.includes('AMD') || name.includes('RYZEN') || name.includes('THREADRIPPER')) {
    if (/\b\d{4}F\b/.test(name) || name.endsWith('F') || name.includes('THREADRIPPER')) return false
    // APUs with G/GE/GT suffix ALWAYS have iGPU (Vega/RDNA)
    if (/\b\d{4}(?:G|GE|GT)\b/.test(name) || name.endsWith('G') || name.endsWith('GT') || name.endsWith('GE')) return true
    // Zen 4/5 (7000/9000 series): desktop chips have RDNA2 iGPU (no \b after digits so "7800X3D" also matches family)
    if (/\b(?:7|9)\d{3}/.test(name)) return true
    // Zen 3 (5000) & older: X/X3D/XT → NO iGPU (e.g. 5600X, 5800X3D)
    if (/\b\d{4}X\b/.test(name) || /\b\d{4}X3D\b/.test(name) || /\b\d{4}XT\b/.test(name)) return false
    // Other 1000–5000 series desktop: G-series only have iGPU (handled above)
    if (/\b(1\d{3}|2\d{3}|3\d{3}|4\d{3}|5\d{3})\b/.test(name)) return false
    return true
  }
  return true
}

// Standard System TDP Calculation (unchanged)
export const calcTotalTdp = (cCpu, cGpu, cMobo, cRam, cStorage) => {
  let totalTdp = 0
  if (cCpu) totalTdp += (Number(cCpu.tdp) || 65)
  if (cGpu) totalTdp += (Number(cGpu.tdp) || 150)
  if (cMobo) totalTdp += 35
  if (cRam) totalTdp += 10
  if (cStorage) totalTdp += 5
  if (!cMobo && !cRam && !cStorage && (cCpu || cGpu)) totalTdp += 50
  return totalTdp
}

export const computePsuWattage = (totalTdp) => Math.ceil((totalTdp || 0) * 1.3)

// ---- Main checkers ----
export const checkSocket = (cpu, mobo) => {
  const out = []
  if (!cpu || !mobo) return out
  const cs = extractSocket(cpu)
  const ms = extractSocket(mobo)
  if (!cs || !ms) return out
  if (!socketMatches(cs, ms)) {
    out.push({ type: 'issue', message: `ซ็อกเก็ตไม่ตรง: CPU เป็น ${cs} แต่เมนบอร์ดรองรับเฉพาะ ${ms}` })
  } else {
    out.push({ type: 'pass', message: `Socket ${cs} ตรงกัน` })
  }
  return out
}

export const checkRamCompatibility = (mobo, ram) => {
  const out = []
  if (!mobo || !ram) return out
  const mt = mobo.ramType
  const rt = extractRamType(ram)
  if (mt && rt && mt !== rt) {
    out.push({ type: 'issue', message: `ประเภท RAM ไม่ตรง: เมนบอร์ดรองรับ ${mt} แต่คุณเลือก ${rt}` })
  } else if (mt && rt && mt === rt) {
    out.push({ type: 'pass', message: `รองรับแรม ${mt} ตรงกัน` })
  }
  return out
}

export const checkPsu = (cpu, gpu, mobo, ram, storage, psu) => {
  const out = []
  if (!psu) return out
  const totalTdp = calcTotalTdp(cpu, gpu, mobo, ram, storage)
  const rec = computePsuWattage(totalTdp)
  const psuW = extractPsuWattage(psu)
  if (psuW != null && psuW < rec) {
    out.push({ type: 'issue', message: `กำลังไฟอาจไม่พอ: ระบบต้องการไฟขั้นต่ำ ${rec}W แต่ PSU ที่เลือกจ่ายได้ ${psuW}W` })
  } else if (psuW != null && psuW >= rec) {
    out.push({ type: 'pass', message: `PSU ${psuW}W เพียงพอ (โหลดรวมประมาณ ${Math.ceil(totalTdp)}W)` })
  }
  return out
}
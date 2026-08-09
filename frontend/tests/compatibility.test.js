import { describe, expect, test } from 'vitest'
import {
  calcTotalTdp,
  checkSocket,
  checkRamCompatibility,
  extractPsuWattage,
  extractRamSpeedMhz,
  extractRamCapacityGb,
  hasIGPU,
  socketMatches
} from '../src/utils/compatibility'

describe('compatibility utils', () => {
  const cpu = { id: 1, name: 'AMD Ryzen 5 7600', socket: 'AM5', tdp: 65 }
  const mobo = { id: 2, name: 'B650', socket: 'AM5', ramType: 'DDR5' }
  const ram = { id: 3, name: 'DDR5 32GB', type: 'DDR5', capacityGb: 32, busSpeed: 5600 }
  const gpu = { id: 4, name: 'RTX 4070', tdp: 200 }
  const psu = { id: 5, name: '850W Gold', wattage: 850 }
  const storage = { id: 6, name: '1TB SSD', type: 'SSD' }

  test('calcTotalTdp sums base', () => {
    expect(calcTotalTdp(cpu, gpu, mobo, ram, storage)).toBe(65 + 200 + 35 + 10 + 5)
  })

  test('checkSocket returns pass when same', () => {
    const out = checkSocket(cpu, mobo)
    expect(out).toHaveLength(1)
    expect(out[0].type).toBe('pass')
  })

  test('checkSocket returns issue on mismatch', () => {
    const bad = { ...mobo, socket: 'AM4' }
    const out = checkSocket(cpu, bad)
    expect(out[0].type).toBe('issue')
  })

  test('checkRamCompatibility returns issue on DDR4 vs DDR5', () => {
    const out = checkRamCompatibility(mobo, { ...ram, type: 'DDR4' })
    expect(out[0].type).toBe('issue')
  })

  test('extractPsuWattage from name', () => {
    expect(extractPsuWattage({ name: 'Corsair RM750x 750W' })).toBe(750)
  })

  test('extractRamSpeedMhz from name', () => {
    expect(extractRamSpeedMhz({ name: 'DDR4 3600MHz' })).toBe(3600)
  })

  test('hasIGPU: Intel F false, Intel non-F true, AMD G true', () => {
    expect(hasIGPU({ name: 'Intel i5-12400F' })).toBe(false)
    expect(hasIGPU({ name: 'Intel i5-12400' })).toBe(true)
    expect(hasIGPU({ name: 'AMD Ryzen 5 5600G' })).toBe(true)
    expect(hasIGPU({ name: 'AMD Ryzen 5 5600X' })).toBe(false)
  })

  test('hasIGPU: Zen4/5 (7000/9000) have iGPU even with X/X3D', () => {
    expect(hasIGPU({ name: 'AMD Ryzen 7 7700X' })).toBe(true)
    expect(hasIGPU({ name: 'AMD Ryzen 7 7800X3D' })).toBe(true)
    expect(hasIGPU({ name: 'AMD Ryzen 9 9800X3D' })).toBe(true)
  })

  test('hasIGPU: Zen4 F-series has no iGPU, APU G series yes', () => {
    expect(hasIGPU({ name: 'AMD Ryzen 5 7500F' })).toBe(false)
    expect(hasIGPU({ name: 'AMD Ryzen 3 8300G' })).toBe(true)
    expect(hasIGPU({ name: 'AMD Ryzen 5 5600GT' })).toBe(true)
  })

  test('extractRamCapacityGb from name', () => {
    expect(extractRamCapacityGb({ name: '16GB DDR4' })).toBe(16)
  })
})
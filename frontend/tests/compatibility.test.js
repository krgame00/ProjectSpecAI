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

  test('socketMatches handles whitespace and aliases gracefully', () => {
    expect(socketMatches('LGA1700', 'LGA 1700')).toBe(true)
    expect(socketMatches('LGA 1851', 'LGA1851')).toBe(true)
    expect(socketMatches('1155', 'LGA1155')).toBe(true)
    expect(socketMatches('AM5', 'AM5')).toBe(true)
    expect(socketMatches('AM5', 'AM4')).toBe(false)
    expect(socketMatches('LGA1700', 'LGA1851')).toBe(false)
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

describe('shareable build and budget breakdown utils', () => {
  test('encodeBuildToQuery and decodeBuildFromQuery serialize and deserialize correctly', () => {
    const { encodeBuildToQuery, decodeBuildFromQuery } = require('../src/utils/compatibility')
    const build = { cpu: 1, mobo: 10, ram: 20, gpu: 30, storage: null, psu: 40, case: null }
    const encoded = encodeBuildToQuery(build)
    expect(encoded).toBe('cpu:1,mobo:10,ram:20,gpu:30,psu:40')

    const decoded = decodeBuildFromQuery(encoded)
    expect(decoded).toEqual({
      cpu: 1,
      mobo: 10,
      ram: 20,
      gpu: 30,
      psu: 40
    })
  })

  test('decodeBuildFromQuery handles router query object format', () => {
    const { decodeBuildFromQuery } = require('../src/utils/compatibility')
    const decodedFromParam = decodeBuildFromQuery({ b: 'cpu:2,gpu:35' })
    expect(decodedFromParam).toEqual({ cpu: 2, gpu: 35 })

    const decodedFromSeparateParams = decodeBuildFromQuery({ cpu: '5', gpu: '12' })
    expect(decodedFromSeparateParams).toEqual({ cpu: 5, gpu: 12 })
  })

  test('calcBudgetBreakdown calculates percentages correctly', () => {
    const { calcBudgetBreakdown } = require('../src/utils/compatibility')
    const build = { cpu: 1, gpu: 2 }
    const hardwareList = {
      cpu: [{ id: 1, price: 10000 }],
      gpu: [{ id: 2, price: 30000 }]
    }
    const breakdown = calcBudgetBreakdown(build, hardwareList)
    expect(breakdown.total).toBe(40000)
    expect(breakdown.segments).toHaveLength(2)
    // GPU should be 75%, CPU 25%
    const gpuSeg = breakdown.segments.find(s => s.id === 'gpu')
    const cpuSeg = breakdown.segments.find(s => s.id === 'cpu')
    expect(gpuSeg.percentage).toBe(75)
    expect(cpuSeg.percentage).toBe(25)
  })

  test('calcBudgetBreakdown handles empty build gracefully without NaN', () => {
    const { calcBudgetBreakdown } = require('../src/utils/compatibility')
    const breakdown = calcBudgetBreakdown({}, {})
    expect(breakdown.total).toBe(0)
    expect(breakdown.segments).toEqual([])
  })
})

describe('deep compatibility: cooler clearance and connectors', () => {
  test('checkCoolerClearance detects height exceeding case limit', () => {
    const { checkCoolerClearance } = require('../src/utils/compatibility')
    const cooler = { id: 50, name: 'Tall Cooler', heightMm: 168 }
    const caseItem = { id: 60, name: 'Slim Case', maxCoolerHeight: 155 }
    const out = checkCoolerClearance(cooler, caseItem)
    expect(out[0].type).toBe('issue')
    expect(out[0].message).toMatch(/พัดลมซีพียูสูงเกินเคส/)
  })

  test('checkCoolerClearance passes when cooler fits inside case', () => {
    const { checkCoolerClearance } = require('../src/utils/compatibility')
    const cooler = { id: 50, name: 'Standard Cooler', heightMm: 155 }
    const caseItem = { id: 60, name: 'Mid Tower', maxCoolerHeight: 165 }
    const out = checkCoolerClearance(cooler, caseItem)
    expect(out[0].type).toBe('pass')
    expect(out[0].message).toMatch(/ติดตั้งในเคสได้/)
  })
})
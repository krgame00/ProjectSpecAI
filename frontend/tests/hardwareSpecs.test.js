import { describe, expect, test } from 'vitest'
import { cleanSpecs, getItemSpecsList } from '../src/utils/hardwareSpecs'

describe('hardwareSpecs utility', () => {
  describe('cleanSpecs', () => {
    test('handles null, undefined, or missing specifications', () => {
      expect(cleanSpecs(null)).toEqual({})
      expect(cleanSpecs({})).toEqual({})
      expect(cleanSpecs({ specifications: null })).toEqual({})
    })

    test('filters out junk tags, web analytics, and HTML markup', () => {
      const item = {
        specifications: {
          'Cores': '8 Cores',
          '<script>alert(1)</script>': 'bad',
          'Valid Key': 'https://ad_storage.com',
          'TDP': '65W',
          'Empty': ''
        }
      }
      const cleaned = cleanSpecs(item)
      expect(cleaned).toEqual({
        'Cores': '8 Cores',
        'TDP': '65W'
      })
    })
  })

  describe('getItemSpecsList', () => {
    test('returns empty array when item is missing', () => {
      expect(getItemSpecsList('cpu', null)).toEqual([])
    })

    test('formats CPU specs correctly including hybrid core mapping', () => {
      const cpu = {
        name: 'Intel Core i5-14400',
        cores: '10',
        threads: 16,
        tdp: 65,
        socket: 'LGA1700'
      }
      const specs = getItemSpecsList('cpu', cpu)
      expect(specs).toEqual([
        { label: 'Socket', value: 'LGA1700' },
        { label: 'Cores', value: '10 (6P+4E)' },
        { label: 'Threads', value: '16' },
        { label: 'TDP', value: '65W' }
      ])
    })

    test('formats Motherboard specs correctly', () => {
      const mobo = {
        socket: 'AM5',
        ramType: 'DDR5',
        formFactor: 'ATX',
        specifications: { 'Max Memory': '192GB' }
      }
      const specs = getItemSpecsList('mobo', mobo)
      expect(specs).toEqual([
        { label: 'Socket', value: 'AM5' },
        { label: 'RAM', value: 'DDR5' },
        { label: 'Form', value: 'ATX' },
        { label: 'Max RAM', value: '192GB' }
      ])
    })

    test('formats GPU specs correctly', () => {
      const gpu = {
        chipset: 'RTX 4070 SUPER',
        vramGb: 12,
        lengthMm: 242,
        tdp: 650
      }
      const specs = getItemSpecsList('gpu', gpu)
      expect(specs).toEqual([
        { label: 'Chipset', value: 'RTX 4070 SUPER' },
        { label: 'VRAM', value: '12 GB' },
        { label: 'Length', value: '242 mm' },
        { label: 'Rec. PSU', value: '650W' }
      ])
    })

    test('formats Storage and PSU specs correctly', () => {
      const storage = {
        type: 'M.2 NVMe',
        capacityGb: 2000,
        readSpeedMbs: 7000,
        writeSpeedMbs: 6000
      }
      const storageSpecs = getItemSpecsList('storage', storage)
      expect(storageSpecs).toEqual([
        { label: 'Type', value: 'M.2 NVMe' },
        { label: 'Capacity', value: '2 TB' },
        { label: 'Read', value: '7000 MB/s' },
        { label: 'Write', value: '6000 MB/s' }
      ])

      const psu = {
        wattage: 750,
        efficiencyRating: '80 Plus Gold',
        name: 'Corsair RM750e GOLD'
      }
      const psuSpecs = getItemSpecsList('psu', psu)
      expect(psuSpecs).toEqual([
        { label: 'Power', value: '750W' },
        { label: 'Efficiency', value: '80 Plus Gold' },
        { label: 'Modular', value: 'Full Modular' },
        { label: 'Fan Size', value: '120 mm' }
      ])
    })
  })
})

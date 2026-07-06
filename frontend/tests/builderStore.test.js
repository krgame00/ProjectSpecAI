import { setActivePinia, createPinia } from 'pinia'
import { expect, test, beforeEach, describe } from 'vitest'
import { useBuilderStore } from '../src/stores/builder'
import { useCatalogStore } from '../src/stores/catalog'

describe('Builder Store Tests', () => {
  beforeEach(() => { 
    setActivePinia(createPinia())
    const catalog = useCatalogStore()
    // Mock data for catalog
    catalog.hardwareList = {
      cpu: [
        { id: 1, name: 'Intel i5-12400F', price: 5000, socket: 'LGA1700', tdp: 65 },
        { id: 2, name: 'AMD Ryzen 5 5600X', price: 6000, socket: 'AM4', tdp: 65 }
      ],
      mobo: [
        { id: 10, name: 'Asus B660', price: 4000, socket: 'LGA1700', ramType: 'DDR4' },
        { id: 11, name: 'MSI B550', price: 3500, socket: 'AM4', ramType: 'DDR4' },
        { id: 12, name: 'Gigabyte Z790', price: 8000, socket: 'LGA1700', ramType: 'DDR5' }
      ],
      ram: [
        { id: 20, name: '16GB DDR4 3200MHz', price: 2000, type: 'DDR4' },
        { id: 21, name: '32GB DDR5 5200MHz', price: 4500, type: 'DDR5' }
      ],
      gpu: [
        { id: 30, name: 'RTX 3060', price: 10000, tdp: 170 }
      ],
      psu: [
        { id: 40, name: '500W Bronze', price: 1500, wattage: 500 },
        { id: 41, name: '400W White', price: 1000, wattage: 400 }
      ]
    }
  })

  test('selectItem toggles selection', () => {
    const builder = useBuilderStore()
    builder.selectItem('cpu', 1)
    expect(builder.build.cpu).toBe(1)
    
    // Toggle off
    builder.selectItem('cpu', 1) 
    expect(builder.build.cpu).toBeNull()

    // Change item
    builder.selectItem('cpu', 1)
    builder.selectItem('cpu', 2)
    expect(builder.build.cpu).toBe(2)
  })

  test('totalPrice calculates correctly', () => {
    const builder = useBuilderStore()
    expect(builder.totalPrice).toBe(0)
    
    builder.selectItem('cpu', 1) // 5000
    builder.selectItem('mobo', 10) // 4000
    expect(builder.totalPrice).toBe(9000)

    builder.selectItem('cpu', 1) // toggle off cpu
    expect(builder.totalPrice).toBe(4000)
  })

  test('compatibilityIssues: socket mismatch', () => {
    const builder = useBuilderStore()
    builder.selectItem('cpu', 1) // LGA1700
    builder.selectItem('mobo', 11) // AM4
    expect(builder.compatibilityIssues).toContain('ซ็อกเก็ตไม่ตรง: CPU เป็น LGA1700 แต่เมนบอร์ดรองรับเฉพาะ AM4')
    
    builder.selectItem('mobo', 10) // LGA1700
    expect(builder.compatibilityIssues).not.toContain('ซ็อกเก็ตไม่ตรง: CPU เป็น LGA1700 แต่เมนบอร์ดรองรับเฉพาะ AM4')
  })

  test('compatibilityIssues: RAM mismatch', () => {
    const builder = useBuilderStore()
    builder.selectItem('mobo', 10) // DDR4
    builder.selectItem('ram', 21) // DDR5
    expect(builder.compatibilityIssues).toContain('ประเภท RAM ไม่ตรง: เมนบอร์ดรองรับ DDR4 แต่คุณเลือก DDR5')
  })

  test('compatibilityIssues: PSU wattage insufficient', () => {
    const builder = useBuilderStore()
    builder.selectItem('cpu', 1) // 65W
    builder.selectItem('gpu', 30) // 170W
    builder.selectItem('psu', 41) // 400W
    // Total TDP = 50 + 65 + 170 = 285W. Recommended = 285 * 1.3 = 370.5W.
    // Wait, 400W is >= 370.5W. So it should not complain.
    expect(builder.compatibilityIssues.length).toBe(0)

    // Let's add a massive GPU requirement hypothetically, wait the mock GPU is 170W. Let's select PSU 41, what if TDP is higher?
    const catalog = useCatalogStore()
    catalog.hardwareList.gpu[0].tdp = 350 // Now Total = 50 + 65 + 350 = 465W. Recommended = 604W.
    
    expect(builder.compatibilityIssues[0]).toMatch(/กำลังไฟอาจไม่พอ: ระบบต้องการไฟขั้นต่ำ 605W แต่ PSU ที่เลือกจ่ายได้ 400W/)
  })
})

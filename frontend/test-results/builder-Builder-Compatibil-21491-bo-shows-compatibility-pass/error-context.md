# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: builder.spec.js >> Builder Compatibility >> selecting matching CPU and Mobo shows compatibility pass
- Location: e2e\builder.spec.js:18:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.alert-box.alert-success')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.alert-box.alert-success')

```

```yaml
- navigation:
  - img "ForgeLabs Logo"
  - text: Forge Labs
  - button "💻 จัดสเปค"
  - button "📰 บทความ"
  - button "เข้าสู่ระบบ"
- complementary:
  - text: 💰 ยอดรวมทั้งสิ้น ฿34,990 อัปเดตตามเวลาจริง (Real-time)
  - button "🛒 ดำเนินการสั่งซื้อ"
  - img
  - strong: "สถานะ: พบข้อขัดแย้งบางส่วน"
  - list:
    - listitem: "❌ ซ็อกเก็ตไม่ตรง: CPU เป็น sTRX5 แต่เมนบอร์ดรองรับเฉพาะ AM5"
    - listitem: "❌ CPU อาจไม่มีชิปกราฟิกในตัว: AMD RYZEN THREADRIPPER PRO 7995WX มักจำเป็นต้องใช้ร่วมกับการ์ดจอ (GPU) กรุณาตรวจสอบอีกครั้ง หรือเพิ่มการ์ดจอลงในสเปค"
  - text: เลือกหมวดหมู่ฮาร์ดแวร์ 2/7
  - list:
    - listitem:
      - text: CPU
      - img
      - text: "AMD RYZEN THREADRIPPER PRO 7995WX ฿34,990 Socket: sTRX5 Cores: 96 Threads: 192 TDP: 65W"
      - button "นำออก":
        - img
        - text: นำออก
    - listitem:
      - text: Motherboard
      - img
      - text: "ASUS PRIME A620M-K-CSM ติดต่อสอบถาม Socket: AM5 DDR: DDR5"
      - button "นำออก":
        - img
        - text: นำออก
    - listitem: RAM —
    - listitem: GPU (VGA) —
    - listitem: Storage (SSD) —
    - listitem: Power Supply —
    - listitem: Case —
- main:
  - text: 🔧
  - heading "Motherboard" [level=2]
  - paragraph: 10 รายการ
  - text: "?"
  - img
  - button "ดูรายละเอียดสเปค":
    - img
  - img "ASUS PRIME A620M-K-CSM"
  - text: "ASUS PRIME A620M-K-CSM Socket: AM5 DDR: DDR5 เช็คราคาหน้าร้าน"
  - button:
    - img
  - button "ดูรายละเอียดสเปค":
    - img
  - img "ASUS PRIME A520M-K"
  - text: "ASUS PRIME A520M-K Socket: AM4 DDR: DDR4 เช็คราคาหน้าร้าน"
  - button:
    - img
  - button "ดูรายละเอียดสเปค":
    - img
  - img "ASROCK H610M-H2/M.2-D5"
  - text: "ASROCK H610M-H2/M.2-D5 Socket: 1700 DDR: DDR5 เช็คราคาหน้าร้าน"
  - button:
    - img
  - button "ดูรายละเอียดสเปค":
    - img
  - img "GIGABYTE H810M K (REV 1.0)"
  - text: "GIGABYTE H810M K (REV 1.0) Socket: 1851 DDR: DDR5 เช็คราคาหน้าร้าน"
  - button:
    - img
  - button "ดูรายละเอียดสเปค":
    - img
  - img "ASROCK A620AM-HVS"
  - text: "ASROCK A620AM-HVS Socket: AM5 DDR: DDR5 เช็คราคาหน้าร้าน"
  - button:
    - img
  - button "ดูรายละเอียดสเปค":
    - img
  - img "GIGABYTE A520M K V2 (REV.1.1)"
  - text: "GIGABYTE A520M K V2 (REV.1.1) Socket: AM4 DDR: DDR4 เช็คราคาหน้าร้าน"
  - button:
    - img
  - button "ดูรายละเอียดสเปค":
    - img
  - img "ASUS PRIME H610M-K"
  - text: "ASUS PRIME H610M-K Socket: 1700 DDR: DDR5 เช็คราคาหน้าร้าน"
  - button:
    - img
  - button "ดูรายละเอียดสเปค":
    - img
  - img "GIGABYTE A520M K V2 (REV.1.2)"
  - text: "GIGABYTE A520M K V2 (REV.1.2) Socket: AM4 DDR: DDR4 เช็คราคาหน้าร้าน"
  - button:
    - img
  - button "ดูรายละเอียดสเปค":
    - img
  - img "GIGABYTE H610M K (REV.2.0)"
  - text: "GIGABYTE H610M K (REV.2.0) Socket: 1700 DDR: DDR4 เช็คราคาหน้าร้าน"
  - button:
    - img
  - button "ดูรายละเอียดสเปค":
    - img
  - img "MSI A520M-A-PRO"
  - text: "MSI A520M-A-PRO Socket: AM4 DDR: DDR4 เช็คราคาหน้าร้าน"
  - button:
    - img
- button "เปิดแชตบอต SpecAI":
  - img
- text: 🤖 SpecAI ออนไลน์ · พร้อมช่วยเหลือ
- button:
  - img
- text: 🤖 สวัสดีครับ! ยินดีต้อนรับสู่เว็บไซต์ ForgeLabs! ผมคือ SpecAI ผู้ช่วยส่วนตัวของคุณ ต้องการให้ผมจัดสเปคคอมพิวเตอร์แบบไหนครับ?
- button "📎"
- textbox "พิมพ์เป้าหมาย เช่น เน้นเล่นเกม..."
- button:
  - img
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Builder Compatibility', () => {
  4   | 
  5   |   test.beforeEach(async ({ page }) => {
  6   |     await page.goto('/build');
  7   |     await expect(page.locator('.category-list-wrap')).toBeVisible({ timeout: 15000 });
  8   |   });
  9   | 
  10  |   test('displays product grid when clicking a category', async ({ page }) => {
  11  |     const cpuCategory = page.locator('.category-item', { hasText: 'CPU' });
  12  |     await cpuCategory.click();
  13  | 
  14  |     await expect(page.locator('.product-grid')).toBeVisible({ timeout: 10000 });
  15  |     await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
  16  |   });
  17  | 
  18  |   test('selecting matching CPU and Mobo shows compatibility pass', async ({ page }) => {
  19  |     // Select CPU category and choose first AMD CPU (AM5 socket)
  20  |     await page.locator('.category-item', { hasText: 'CPU' }).click();
  21  |     await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
  22  | 
  23  |     // Pick first CPU (should be AMD Ryzen with AM5 socket)
  24  |     await page.locator('.product-card .add-btn').first().click();
  25  |     await expect(page.locator('.product-card.selected')).toBeVisible();
  26  | 
  27  |     // Select Mobo category
  28  |     await page.locator('.category-item', { hasText: 'Motherboard' }).click();
  29  |     await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
  30  | 
  31  |     // The first mobo (ASROCK B550M Pro4) also has AM5 socket => should show pass
  32  |     await page.locator('.product-card .add-btn').first().click();
  33  | 
  34  |     // Check for compatibility success alert
> 35  |     await expect(page.locator('.alert-box.alert-success')).toBeVisible({ timeout: 5000 });
      |                                                            ^ Error: expect(locator).toBeVisible() failed
  36  |     await expect(page.locator('.alert-text strong')).toHaveText('เข้ากันได้ 100%');
  37  |   });
  38  | 
  39  |   test('selecting mismatched CPU and Mobo shows compatibility warning', async ({ page }) => {
  40  |     // Select CPU, pick Intel LGA1700 CPU
  41  |     await page.locator('.category-item', { hasText: 'CPU' }).click();
  42  |     await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
  43  | 
  44  |     const cpuCards = page.locator('.product-card');
  45  |     const cpuCount = await cpuCards.count();
  46  | 
  47  |     let selectedIntel = false;
  48  |     for (let i = 0; i < cpuCount; i++) {
  49  |       const name = await cpuCards.nth(i).locator('.product-name').textContent();
  50  |       if (name && name.includes('Intel')) {
  51  |         await cpuCards.nth(i).locator('.add-btn').click();
  52  |         selectedIntel = true;
  53  |         break;
  54  |       }
  55  |     }
  56  |     expect(selectedIntel).toBe(true);
  57  | 
  58  |     // Select Mobo and pick one with AM5 (first one is AM5)
  59  |     await page.locator('.category-item', { hasText: 'Motherboard' }).click();
  60  |     await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
  61  |     await page.locator('.product-card .add-btn').first().click();
  62  | 
  63  |     // Socket mismatch warning should appear
  64  |     await expect(page.locator('.alert-box.alert-danger')).toBeVisible({ timeout: 5000 });
  65  |     await expect(page.locator('.mixed-report-list li.issue')).toBeVisible();
  66  |     await expect(page.locator('.mixed-report-list li.issue').first()).toContainText('ซ็อกเก็ตไม่ตรง');
  67  |   });
  68  | 
  69  |   test('selecting RAM with mismatched type shows warning', async ({ page }) => {
  70  |     // Pick an AMD CPU
  71  |     await page.locator('.category-item', { hasText: 'CPU' }).click();
  72  |     await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
  73  |     await page.locator('.product-card .add-btn').first().click();
  74  | 
  75  |     // Pick an AM5 mobo (first one, which is DDR5)
  76  |     await page.locator('.category-item', { hasText: 'Motherboard' }).click();
  77  |     await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
  78  |     await page.locator('.product-card .add-btn').first().click();
  79  | 
  80  |     // Pick a DDR4 RAM (first RAM is DDR4)
  81  |     await page.locator('.category-item', { hasText: 'RAM' }).click();
  82  |     await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
  83  |     await page.locator('.product-card .add-btn').first().click();
  84  | 
  85  |     // Mobo is DDR5 but RAM is DDR4 => warning
  86  |     await expect(page.locator('.alert-box.alert-danger')).toBeVisible({ timeout: 5000 });
  87  |     await expect(page.locator('.mixed-report-list li.issue')).toContainText('ประเภท RAM ไม่ตรง');
  88  |   });
  89  | 
  90  |   test('total price updates as components are selected', async ({ page }) => {
  91  |     await expect(page.locator('.total-price-box')).toBeVisible();
  92  | 
  93  |     await page.locator('.category-item', { hasText: 'CPU' }).click();
  94  |     await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
  95  |     await page.locator('.product-card .add-btn').first().click();
  96  | 
  97  |     const priceText = await page.locator('.total-value').textContent();
  98  |     const priceNum = parseInt(priceText.replace(/[^0-9]/g, ''));
  99  |     expect(priceNum).toBeGreaterThan(0);
  100 |   });
  101 | 
  102 | });
  103 | 
```
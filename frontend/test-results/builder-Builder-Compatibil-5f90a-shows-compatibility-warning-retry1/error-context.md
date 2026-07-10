# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: builder.spec.js >> Builder Compatibility >> selecting mismatched CPU and Mobo shows compatibility warning
- Location: e2e\builder.spec.js:39:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6] [cursor=pointer]:
        - img "ForgeLabs Logo" [ref=e7]
        - generic [ref=e8]:
          - text: Forge
          - generic [ref=e9]: Labs
      - generic [ref=e10]:
        - button "💻 จัดสเปค" [ref=e11] [cursor=pointer]
        - button "📰 บทความ" [ref=e12] [cursor=pointer]
        - button "เข้าสู่ระบบ" [ref=e14] [cursor=pointer]
  - generic [ref=e15]:
    - generic [ref=e16]:
      - complementary [ref=e17]:
        - generic [ref=e18]:
          - generic [ref=e19]:
            - generic [ref=e20]: 💰
            - generic [ref=e21]: ยอดรวมทั้งสิ้น
          - generic [ref=e22]: ฿0
          - generic [ref=e23]: อัปเดตตามเวลาจริง (Real-time)
          - button "🛒 ดำเนินการสั่งซื้อ" [disabled] [ref=e24]:
            - generic [ref=e25]: 🛒
            - generic [ref=e26]: ดำเนินการสั่งซื้อ
        - generic [ref=e27]:
          - generic [ref=e28]:
            - generic [ref=e29]: เลือกหมวดหมู่ฮาร์ดแวร์
            - generic [ref=e30]: 0/7
          - list [ref=e31]:
            - listitem [ref=e32] [cursor=pointer]:
              - generic [ref=e35]:
                - generic [ref=e36]: CPU
                - generic [ref=e37]: —
            - listitem [ref=e38] [cursor=pointer]:
              - generic [ref=e41]:
                - generic [ref=e42]: Motherboard
                - generic [ref=e43]: —
            - listitem [ref=e44] [cursor=pointer]:
              - generic [ref=e47]:
                - generic [ref=e48]: RAM
                - generic [ref=e49]: —
            - listitem [ref=e50] [cursor=pointer]:
              - generic [ref=e53]:
                - generic [ref=e54]: GPU (VGA)
                - generic [ref=e55]: —
            - listitem [ref=e56] [cursor=pointer]:
              - generic [ref=e59]:
                - generic [ref=e60]: Storage (SSD)
                - generic [ref=e61]: —
            - listitem [ref=e62] [cursor=pointer]:
              - generic [ref=e65]:
                - generic [ref=e66]: Power Supply
                - generic [ref=e67]: —
            - listitem [ref=e68] [cursor=pointer]:
              - generic [ref=e71]:
                - generic [ref=e72]: Case
                - generic [ref=e73]: —
      - main [ref=e74]:
        - generic [ref=e75]:
          - generic [ref=e76]:
            - generic [ref=e77]:
              - generic [ref=e79]: 🧠
              - generic [ref=e80]:
                - heading "CPU" [level=2] [ref=e81]
                - paragraph [ref=e82]: 11 รายการ
            - generic [ref=e84]: "?"
          - generic [ref=e85]:
            - generic [ref=e86] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e87]:
                - img [ref=e88]
              - img "AMD RYZEN THREADRIPPER PRO 7995WX" [ref=e93]
              - generic [ref=e94]:
                - generic [ref=e95]: AMD RYZEN THREADRIPPER PRO 7995WX
                - generic [ref=e96]:
                  - generic [ref=e97]: "Socket: sTRX5"
                  - generic [ref=e98]: "Cores: 96"
                  - generic [ref=e99]: "Threads: 192"
                  - generic [ref=e100]: "TDP: 65W"
              - generic [ref=e101]:
                - generic [ref=e102]: ฿34,990
                - button [ref=e103]:
                  - img [ref=e104]
            - generic [ref=e106] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e107]:
                - img [ref=e108]
              - img "AMD RYZEN 5 5600 3.5GHz 6C 12T" [ref=e113]
              - generic [ref=e114]:
                - generic [ref=e115]: AMD RYZEN 5 5600 3.5GHz 6C 12T
                - generic [ref=e116]:
                  - generic [ref=e117]: "Socket: AM4"
                  - generic [ref=e118]: "TDP: 65W"
              - generic [ref=e119]:
                - generic [ref=e120]: เช็คราคาหน้าร้าน
                - button [ref=e121]:
                  - img [ref=e122]
            - generic [ref=e124] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e125]:
                - img [ref=e126]
              - img "AMD RYZEN 7 5800XT 3.8GHz 8C 16T" [ref=e131]
              - generic [ref=e132]:
                - generic [ref=e133]: AMD RYZEN 7 5800XT 3.8GHz 8C 16T
                - generic [ref=e134]:
                  - generic [ref=e135]: "Socket: AM4"
                  - generic [ref=e136]: "TDP: 65W"
              - generic [ref=e137]:
                - generic [ref=e138]: เช็คราคาหน้าร้าน
                - button [ref=e139]:
                  - img [ref=e140]
            - generic [ref=e142] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e143]:
                - img [ref=e144]
              - img "AMD RYZEN 7 9800X3D 4.7GHz 8C 16T" [ref=e149]
              - generic [ref=e150]:
                - generic [ref=e151]: AMD RYZEN 7 9800X3D 4.7GHz 8C 16T
                - generic [ref=e152]:
                  - generic [ref=e153]: "Socket: AM5"
                  - generic [ref=e154]: "TDP: 65W"
              - generic [ref=e155]:
                - generic [ref=e156]: เช็คราคาหน้าร้าน
                - button [ref=e157]:
                  - img [ref=e158]
            - generic [ref=e160] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e161]:
                - img [ref=e162]
              - img "AMD RYZEN 7 7800X3D 4.2 GHz 8C 16T" [ref=e167]
              - generic [ref=e168]:
                - generic [ref=e169]: AMD RYZEN 7 7800X3D 4.2 GHz 8C 16T
                - generic [ref=e170]:
                  - generic [ref=e171]: "Socket: AM5"
                  - generic [ref=e172]: "TDP: 65W"
              - generic [ref=e173]:
                - generic [ref=e174]: เช็คราคาหน้าร้าน
                - button [ref=e175]:
                  - img [ref=e176]
            - generic [ref=e178] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e179]:
                - img [ref=e180]
              - img "AMD RYZEN 5 5500" [ref=e185]
              - generic [ref=e186]:
                - generic [ref=e187]: AMD RYZEN 5 5500
                - generic [ref=e188]:
                  - generic [ref=e189]: "Socket: AM4"
                  - generic [ref=e190]: "TDP: 65W"
              - generic [ref=e191]:
                - generic [ref=e192]: เช็คราคาหน้าร้าน
                - button [ref=e193]:
                  - img [ref=e194]
            - generic [ref=e196] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e197]:
                - img [ref=e198]
              - img "AMD RYZEN 7 9850X3D" [ref=e203]
              - generic [ref=e204]:
                - generic [ref=e205]: AMD RYZEN 7 9850X3D
                - generic [ref=e206]:
                  - generic [ref=e207]: "Socket: AM5"
                  - generic [ref=e208]: "TDP: 120W"
              - generic [ref=e209]:
                - generic [ref=e210]: เช็คราคาหน้าร้าน
                - button [ref=e211]:
                  - img [ref=e212]
            - generic [ref=e214] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e215]:
                - img [ref=e216]
              - img "INTEL CORE ULTRA 5 225F" [ref=e221]
              - generic [ref=e222]:
                - generic [ref=e223]: INTEL CORE ULTRA 5 225F
                - generic [ref=e224]:
                  - generic [ref=e225]: "Socket: LGA 1851"
                  - generic [ref=e226]: "TDP: 65W"
              - generic [ref=e227]:
                - generic [ref=e228]: เช็คราคาหน้าร้าน
                - button [ref=e229]:
                  - img [ref=e230]
            - generic [ref=e232] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e233]:
                - img [ref=e234]
              - img "AMD RYZEN 5 7500F" [ref=e239]
              - generic [ref=e240]:
                - generic [ref=e241]: AMD RYZEN 5 7500F
                - generic [ref=e242]:
                  - generic [ref=e243]: "Socket: AM5"
                  - generic [ref=e244]: "TDP: 65W"
              - generic [ref=e245]:
                - generic [ref=e246]: เช็คราคาหน้าร้าน
                - button [ref=e247]:
                  - img [ref=e248]
            - generic [ref=e250] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e251]:
                - img [ref=e252]
              - img "INTEL CORE ULTRA 5 225" [ref=e257]
              - generic [ref=e258]:
                - generic [ref=e259]: INTEL CORE ULTRA 5 225
                - generic [ref=e260]:
                  - generic [ref=e261]: "Socket: LGA 1851"
                  - generic [ref=e262]: "TDP: 65W"
              - generic [ref=e263]:
                - generic [ref=e264]: เช็คราคาหน้าร้าน
                - button [ref=e265]:
                  - img [ref=e266]
            - generic [ref=e268] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e269]:
                - img [ref=e270]
              - img "AMD Ryzen 5 5500" [ref=e275]
              - generic [ref=e276]:
                - generic [ref=e277]: AMD Ryzen 5 5500
                - generic [ref=e278]:
                  - generic [ref=e279]: "Cores: 6"
                  - generic [ref=e280]: "Threads: 12"
                  - generic [ref=e281]: "TDP: 65W"
              - generic [ref=e282]:
                - generic [ref=e283]: ฿3,190
                - button [ref=e284]:
                  - img [ref=e285]
    - generic:
      - button "เปิดแชตบอต SpecAI" [ref=e287] [cursor=pointer]:
        - img [ref=e290]
      - generic:
        - generic:
          - generic:
            - generic:
              - generic: 🤖
            - generic:
              - generic: SpecAI
              - generic: ออนไลน์ · พร้อมช่วยเหลือ
          - button:
            - img
        - generic:
          - generic:
            - generic: 🤖
            - generic:
              - generic: สวัสดีครับ! ยินดีต้อนรับสู่เว็บไซต์ ForgeLabs! ผมคือ SpecAI ผู้ช่วยส่วนตัวของคุณ ต้องการให้ผมจัดสเปคคอมพิวเตอร์แบบไหนครับ?
        - generic:
          - generic:
            - generic:
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
  35  |     await expect(page.locator('.alert-box.alert-success')).toBeVisible({ timeout: 5000 });
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
> 56  |     expect(selectedIntel).toBe(true);
      |                           ^ Error: expect(received).toBe(expected) // Object.is equality
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
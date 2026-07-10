# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: builder.spec.js >> Builder Compatibility >> selecting RAM with mismatched type shows warning
- Location: e2e\builder.spec.js:69:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.mixed-report-list li.issue')
Expected substring: "ประเภท RAM ไม่ตรง"
Error: strict mode violation: locator('.mixed-report-list li.issue') resolved to 3 elements:
    1) <li class="issue" data-v-3580c684="">…</li> aka getByText('❌ซ็อกเก็ตไม่ตรง: CPU เป็น')
    2) <li class="issue" data-v-3580c684="">…</li> aka getByText('❌ประเภท RAM')
    3) <li class="issue" data-v-3580c684="">…</li> aka getByText('❌CPU อาจไม่มีชิปกราฟิกในตัว:')

Call log:
  - Expect "toContainText" with timeout 10000ms
  - waiting for locator('.mixed-report-list li.issue')

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
          - generic [ref=e22]: ฿34,990
          - generic [ref=e23]: อัปเดตตามเวลาจริง (Real-time)
          - button "🛒 ดำเนินการสั่งซื้อ" [ref=e24] [cursor=pointer]:
            - generic [ref=e25]: 🛒
            - generic [ref=e26]: ดำเนินการสั่งซื้อ
        - generic [ref=e27]:
          - img [ref=e29]
          - generic [ref=e31]:
            - strong [ref=e32]: "สถานะ: พบข้อขัดแย้งบางส่วน"
            - list [ref=e33]:
              - listitem [ref=e34]:
                - generic [ref=e35]: ❌
                - generic [ref=e36]: "ซ็อกเก็ตไม่ตรง: CPU เป็น sTRX5 แต่เมนบอร์ดรองรับเฉพาะ AM5"
              - listitem [ref=e37]:
                - generic [ref=e38]: ❌
                - generic [ref=e39]: "ประเภท RAM ไม่ตรง: เมนบอร์ดรองรับ DDR5 แต่คุณเลือก DDR4"
              - listitem [ref=e40]:
                - generic [ref=e41]: ❌
                - generic [ref=e42]: "CPU อาจไม่มีชิปกราฟิกในตัว: AMD RYZEN THREADRIPPER PRO 7995WX มักจำเป็นต้องใช้ร่วมกับการ์ดจอ (GPU) กรุณาตรวจสอบอีกครั้ง หรือเพิ่มการ์ดจอลงในสเปค"
        - generic [ref=e43]:
          - generic [ref=e44]:
            - generic [ref=e45]: เลือกหมวดหมู่ฮาร์ดแวร์
            - generic [ref=e46]: 3/7
          - list [ref=e47]:
            - listitem [ref=e48] [cursor=pointer]:
              - generic [ref=e50]:
                - generic [ref=e51]:
                  - generic [ref=e52]: CPU
                  - img [ref=e54]
                - generic [ref=e56]:
                  - generic [ref=e57]: AMD RYZEN THREADRIPPER PRO 7995WX
                  - generic [ref=e58]: ฿34,990
                  - generic [ref=e59]:
                    - generic [ref=e60]:
                      - generic [ref=e61]: "Socket:"
                      - generic [ref=e62]: sTRX5
                    - generic [ref=e63]:
                      - generic [ref=e64]: "Cores:"
                      - generic [ref=e65]: "96"
                    - generic [ref=e66]:
                      - generic [ref=e67]: "Threads:"
                      - generic [ref=e68]: "192"
                    - generic [ref=e69]:
                      - generic [ref=e70]: "TDP:"
                      - generic [ref=e71]: 65W
                  - button "นำออก" [ref=e72]:
                    - img [ref=e73]
                    - text: นำออก
            - listitem [ref=e75] [cursor=pointer]:
              - generic [ref=e77]:
                - generic [ref=e78]:
                  - generic [ref=e79]: Motherboard
                  - img [ref=e81]
                - generic [ref=e83]:
                  - generic [ref=e84]: ASUS PRIME A620M-K-CSM
                  - generic [ref=e85]: ติดต่อสอบถาม
                  - generic [ref=e86]:
                    - generic [ref=e87]:
                      - generic [ref=e88]: "Socket:"
                      - generic [ref=e89]: AM5
                    - generic [ref=e90]:
                      - generic [ref=e91]: "DDR:"
                      - generic [ref=e92]: DDR5
                  - button "นำออก" [ref=e93]:
                    - img [ref=e94]
                    - text: นำออก
            - listitem [ref=e96] [cursor=pointer]:
              - generic [ref=e98]:
                - generic [ref=e99]:
                  - generic [ref=e100]: RAM
                  - img [ref=e102]
                - generic [ref=e104]:
                  - generic [ref=e105]: HIKSEMI ARMOR BLACK
                  - generic [ref=e106]: ติดต่อสอบถาม
                  - generic [ref=e108]:
                    - generic [ref=e109]: "ประเภท:"
                    - generic [ref=e110]: DDR4
                  - button "นำออก" [ref=e111]:
                    - img [ref=e112]
                    - text: นำออก
            - listitem [ref=e114] [cursor=pointer]:
              - generic [ref=e117]:
                - generic [ref=e118]: GPU (VGA)
                - generic [ref=e119]: —
            - listitem [ref=e120] [cursor=pointer]:
              - generic [ref=e123]:
                - generic [ref=e124]: Storage (SSD)
                - generic [ref=e125]: —
            - listitem [ref=e126] [cursor=pointer]:
              - generic [ref=e129]:
                - generic [ref=e130]: Power Supply
                - generic [ref=e131]: —
            - listitem [ref=e132] [cursor=pointer]:
              - generic [ref=e135]:
                - generic [ref=e136]: Case
                - generic [ref=e137]: —
      - main [ref=e138]:
        - generic [ref=e139]:
          - generic [ref=e140]:
            - generic [ref=e141]:
              - generic [ref=e143]: 💾
              - generic [ref=e144]:
                - heading "RAM" [level=2] [ref=e145]
                - paragraph [ref=e146]: 10 รายการ
            - generic [ref=e148]: "?"
          - generic [ref=e149]:
            - generic [ref=e150] [cursor=pointer]:
              - generic "คลิกเพื่อยกเลิกการเลือก" [ref=e151]:
                - img [ref=e152]
              - button "ดูรายละเอียดสเปค" [ref=e154]:
                - img [ref=e155]
              - img "HIKSEMI ARMOR BLACK" [ref=e160]
              - generic [ref=e161]:
                - generic [ref=e162]: HIKSEMI ARMOR BLACK
                - generic [ref=e164]: "ประเภท: DDR4"
              - generic [ref=e165]:
                - generic [ref=e166]: เช็คราคาหน้าร้าน
                - button [active] [ref=e167]:
                  - img [ref=e168]
            - generic [ref=e170] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e171]:
                - img [ref=e172]
              - img "HIKSEMI ARMOR BLACK" [ref=e177]
              - generic [ref=e178]:
                - generic [ref=e179]: HIKSEMI ARMOR BLACK
                - generic [ref=e181]: "ประเภท: DDR4"
              - generic [ref=e182]:
                - generic [ref=e183]: เช็คราคาหน้าร้าน
                - button [ref=e184]:
                  - img [ref=e185]
            - generic [ref=e187] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e188]:
                - img [ref=e189]
              - img "ADATA XPG LANCER BLADE RGB" [ref=e194]
              - generic [ref=e195]:
                - generic [ref=e196]: ADATA XPG LANCER BLADE RGB
                - generic [ref=e198]: "ประเภท: DDR5"
              - generic [ref=e199]:
                - generic [ref=e200]: เช็คราคาหน้าร้าน
                - button [ref=e201]:
                  - img [ref=e202]
            - generic [ref=e204] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e205]:
                - img [ref=e206]
              - img "HIKSEMI ARMOR WHITE" [ref=e211]
              - generic [ref=e212]:
                - generic [ref=e213]: HIKSEMI ARMOR WHITE
                - generic [ref=e215]: "ประเภท: DDR4"
              - generic [ref=e216]:
                - generic [ref=e217]: เช็คราคาหน้าร้าน
                - button [ref=e218]:
                  - img [ref=e219]
            - generic [ref=e221] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e222]:
                - img [ref=e223]
              - img "KINGBANK KJXS SILVER" [ref=e228]
              - generic [ref=e229]:
                - generic [ref=e230]: KINGBANK KJXS SILVER
                - generic [ref=e232]: "ประเภท: DDR4"
              - generic [ref=e233]:
                - generic [ref=e234]: เช็คราคาหน้าร้าน
                - button [ref=e235]:
                  - img [ref=e236]
            - generic [ref=e238] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e239]:
                - img [ref=e240]
              - img "KINGSTON FURY BEAST RGB BLACK KF432C16BB2AK2/16WP" [ref=e245]
              - generic [ref=e246]:
                - generic [ref=e247]: KINGSTON FURY BEAST RGB BLACK KF432C16BB2AK2/16WP
                - generic [ref=e249]: "ประเภท: DDR4"
              - generic [ref=e250]:
                - generic [ref=e251]: เช็คราคาหน้าร้าน
                - button [ref=e252]:
                  - img [ref=e253]
            - generic [ref=e255] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e256]:
                - img [ref=e257]
              - img "HIKSEMI ARMOR BLACK HSC416U32D3" [ref=e262]
              - generic [ref=e263]:
                - generic [ref=e264]: HIKSEMI ARMOR BLACK HSC416U32D3
                - generic [ref=e266]: "ประเภท: DDR4"
              - generic [ref=e267]:
                - generic [ref=e268]: เช็คราคาหน้าร้าน
                - button [ref=e269]:
                  - img [ref=e270]
            - generic [ref=e272] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e273]:
                - img [ref=e274]
              - img "CORSAIR VENGEANCE RGB PRO SL WHITE CMH16GX4M2E3200C16W" [ref=e279]
              - generic [ref=e280]:
                - generic [ref=e281]: CORSAIR VENGEANCE RGB PRO SL WHITE CMH16GX4M2E3200C16W
                - generic [ref=e283]: "ประเภท: DDR4"
              - generic [ref=e284]:
                - generic [ref=e285]: เช็คราคาหน้าร้าน
                - button [ref=e286]:
                  - img [ref=e287]
            - generic [ref=e289] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e290]:
                - img [ref=e291]
              - img "ADATA AD5S48008G-S" [ref=e296]
              - generic [ref=e297]:
                - generic [ref=e298]: ADATA AD5S48008G-S
                - generic [ref=e300]: "ประเภท: DDR5"
              - generic [ref=e301]:
                - generic [ref=e302]: เช็คราคาหน้าร้าน
                - button [ref=e303]:
                  - img [ref=e304]
            - generic [ref=e306] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e307]:
                - img [ref=e308]
              - img "LEXAR THOR DUAL LD4BU008G-R3200GDXG" [ref=e313]
              - generic [ref=e314]:
                - generic [ref=e315]: LEXAR THOR DUAL LD4BU008G-R3200GDXG
                - generic [ref=e317]: "ประเภท: DDR4"
              - generic [ref=e318]:
                - generic [ref=e319]: เช็คราคาหน้าร้าน
                - button [ref=e320]:
                  - img [ref=e321]
    - generic:
      - button "เปิดแชตบอต SpecAI" [ref=e323] [cursor=pointer]:
        - img [ref=e326]
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
> 87  |     await expect(page.locator('.mixed-report-list li.issue')).toContainText('ประเภท RAM ไม่ตรง');
      |                                                               ^ Error: expect(locator).toContainText(expected) failed
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
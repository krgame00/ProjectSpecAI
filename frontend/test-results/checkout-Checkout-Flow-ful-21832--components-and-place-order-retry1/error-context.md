# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checkout.spec.js >> Checkout Flow >> full order flow: select components and place order
- Location: e2e\checkout.spec.js:42:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.product-card').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('.product-card').first()

```

```yaml
- navigation:
  - img "ForgeLabs Logo"
  - text: Forge Labs
  - button "💻 จัดสเปค"
  - button "📰 บทความ"
  - text: 👤 Checkout User
  - button "ข้อมูลส่วนตัว"
  - button "ออกจากระบบ"
- complementary:
  - text: 💰 ยอดรวมทั้งสิ้น ฿34,990 อัปเดตตามเวลาจริง (Real-time)
  - button "🛒 ดำเนินการสั่งซื้อ"
  - img
  - strong: "สถานะ: พบข้อขัดแย้งบางส่วน"
  - list:
    - listitem: "❌ ซ็อกเก็ตไม่ตรง: CPU เป็น sTRX5 แต่เมนบอร์ดรองรับเฉพาะ AM5"
    - listitem: "❌ ประเภท RAM ไม่ตรง: เมนบอร์ดรองรับ DDR5 แต่คุณเลือก DDR4"
    - listitem: "❌ CPU อาจไม่มีชิปกราฟิกในตัว: AMD RYZEN THREADRIPPER PRO 7995WX มักจำเป็นต้องใช้ร่วมกับการ์ดจอ (GPU) กรุณาตรวจสอบอีกครั้ง หรือเพิ่มการ์ดจอลงในสเปค"
  - text: เลือกหมวดหมู่ฮาร์ดแวร์ 3/7
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
    - listitem:
      - text: RAM
      - img
      - text: "HIKSEMI ARMOR BLACK ติดต่อสอบถาม ประเภท: DDR4"
      - button "นำออก":
        - img
        - text: นำออก
    - listitem: GPU (VGA) —
    - listitem: Storage (SSD) —
    - listitem: Power Supply —
    - listitem: Case —
- main:
  - text: 💿
  - heading "Storage (SSD)" [level=2]
  - paragraph: 0 รายการ
  - text: "?"
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
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const TEST_EMAIL = `co_${Date.now()}@test.com`;
  4  | const TEST_PASS = 'checkout123';
  5  | const TEST_NAME = 'Checkout User';
  6  | 
  7  | test.describe('Checkout Flow', () => {
  8  | 
  9  |   test.beforeEach(async ({ page }) => {
  10 |     // Register user
  11 |     await page.goto('/');
  12 |     await page.getByText('เข้าสู่ระบบ').click();
  13 |     await expect(page.locator('.modal-overlay')).toBeVisible();
  14 | 
  15 |     await page.getByText('สมัครสมาชิก').click();
  16 |     await page.locator('input[placeholder="ชื่อที่จะแสดงในระบบ"]').fill(TEST_NAME);
  17 |     await page.locator('input[placeholder="ตั้งอีเมลของคุณ"]').fill(TEST_EMAIL);
  18 |     await page.locator('input[placeholder="ตั้งรหัสผ่าน"]').fill(TEST_PASS);
  19 | 
  20 |     page.once('dialog', async (dialog) => {
  21 |       await dialog.accept();
  22 |     });
  23 | 
  24 |     await page.getByText('สร้างบัญชี').click();
  25 |     await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 10000 });
  26 |   });
  27 | 
  28 |   test('guest sees login modal when clicking checkout', async ({ page }) => {
  29 |     // Logout first
  30 |     await page.getByText('ออกจากระบบ').click();
  31 | 
  32 |     // Go to build and try to checkout without login
  33 |     await page.goto('/build');
  34 |     await expect(page.locator('.category-list-wrap')).toBeVisible({ timeout: 15000 });
  35 | 
  36 |     // Guest clicking checkout should show login modal
  37 |     await page.goto('/checkout');
  38 |     await expect(page.locator('.empty-state')).toBeVisible();
  39 |     expect(page.url()).toContain('/checkout');
  40 |   });
  41 | 
  42 |   test('full order flow: select components and place order', async ({ page }) => {
  43 |     // Go to builder
  44 |     await page.goto('/build');
  45 |     await expect(page.locator('.category-list-wrap')).toBeVisible({ timeout: 15000 });
  46 | 
  47 |     // Select CPU
  48 |     await page.locator('.category-item', { hasText: 'CPU' }).click();
  49 |     await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
  50 |     await page.locator('.product-card .add-btn').first().click();
  51 | 
  52 |     // Select Mobo
  53 |     await page.locator('.category-item', { hasText: 'Motherboard' }).click();
  54 |     await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
  55 |     await page.locator('.product-card .add-btn').first().click();
  56 | 
  57 |     // Select RAM
  58 |     await page.locator('.category-item', { hasText: 'RAM' }).click();
  59 |     await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
  60 |     await page.locator('.product-card .add-btn').first().click();
  61 | 
  62 |     // Select Storage
  63 |     await page.locator('.category-item', { hasText: 'Storage' }).click();
> 64 |     await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
     |                                                         ^ Error: expect(locator).toBeVisible() failed
  65 |     await page.locator('.product-card .add-btn').first().click();
  66 | 
  67 |     // Navigate to checkout
  68 |     await page.goto('/checkout');
  69 |     await expect(page.getByText('สรุปรายการสั่งซื้อ')).toBeVisible({ timeout: 10000 });
  70 | 
  71 |     // Name should be auto-filled from user profile
  72 |     const nameInput = page.locator('input[placeholder="ระบุชื่อ-นามสกุล"]');
  73 |     await expect(nameInput).toHaveValue(TEST_NAME);
  74 | 
  75 |     // Fill address and phone
  76 |     await page.locator('textarea[placeholder="ระบุที่อยู่จัดส่งแบบครบถ้วน"]').fill('123 Test Street, Bangkok');
  77 |     await page.locator('input[placeholder="08X-XXX-XXXX"]').fill('081-234-5678');
  78 | 
  79 |     // Select standard assembly
  80 |     await page.locator('input[type="radio"][value="standard"]').click();
  81 | 
  82 |     // Submit the order
  83 |     page.once('dialog', async (dialog) => {
  84 |       expect(dialog.message()).toContain('🎉');
  85 |       expect(dialog.message()).toContain('รหัสคำสั่งซื้อ');
  86 |       await dialog.accept();
  87 |     });
  88 | 
  89 |     await page.getByText('ยืนยันคำสั่งซื้อ').click();
  90 | 
  91 |     // Should redirect back to /build after success
  92 |     await expect(page).toHaveURL(/\/build/, { timeout: 10000 });
  93 |   });
  94 | 
  95 | });
  96 | 
```
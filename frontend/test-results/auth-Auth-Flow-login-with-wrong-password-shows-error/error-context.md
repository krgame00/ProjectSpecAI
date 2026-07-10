# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.js >> Auth Flow >> login with wrong password shows error
- Location: e2e\auth.spec.js:63:3

# Error details

```
Error: locator.click: Error: strict mode violation: getByText('เข้าสู่ระบบ') resolved to 3 elements:
    1) <button data-v-7a7a37b1="" class="btn btn-outline btn-sm">เข้าสู่ระบบ</button> aka getByRole('navigation').getByRole('button', { name: 'เข้าสู่ระบบ' })
    2) <button data-v-7a7a37b1="" class="auth-tab active">เข้าสู่ระบบ</button> aka getByRole('button', { name: 'เข้าสู่ระบบ' }).nth(1)
    3) <button data-v-7a7a37b1="" class="btn btn-primary btn-block mt-4">เข้าสู่ระบบ</button> aka getByRole('button', { name: 'เข้าสู่ระบบ' }).nth(2)

Call log:
  - waiting for getByText('เข้าสู่ระบบ')

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
      - generic [ref=e17]:
        - generic [ref=e18]: "✨ New: AI-Powered Builder"
        - heading "Build Your Dream PC, Powered by AI." [level=1] [ref=e19]:
          - text: Build Your Dream PC,
          - text: Powered by AI.
        - paragraph [ref=e20]: จัดสเปคคอมพิวเตอร์แบบอัจฉริยะ ตรวจสอบความเข้ากันได้แบบ Real-time พร้อมผู้ช่วย AI ที่ช่วยคุณเลือกฮาร์ดแวร์ที่ดีที่สุดตามงบประมาณและการใช้งานของคุณ
        - generic [ref=e21]:
          - link "เริ่มจัดสเปคเลย" [ref=e22] [cursor=pointer]:
            - /url: /build
            - text: เริ่มจัดสเปคเลย
            - img [ref=e23]
          - link "ดูฟีเจอร์ทั้งหมด" [ref=e25] [cursor=pointer]:
            - /url: "#features"
      - generic [ref=e26]:
        - generic [ref=e27]:
          - img [ref=e29]
          - generic [ref=e40]:
            - generic [ref=e41]: Core i9 Processor
            - generic [ref=e42]: 24 Cores / 32 Threads
        - generic [ref=e43]:
          - img [ref=e45]
          - generic [ref=e47]:
            - generic [ref=e48]: RTX 4090 GPU
            - generic [ref=e49]: 24GB GDDR6X
        - generic [ref=e50]:
          - img [ref=e52]
          - generic [ref=e58]:
            - generic [ref=e59]: 64GB DDR5 RAM
            - generic [ref=e60]: 6000MHz CL30
    - generic [ref=e61]:
      - generic [ref=e62]:
        - heading "Why Use ForgeLabs?" [level=2] [ref=e63]
        - paragraph [ref=e64]: ฟีเจอร์ที่ออกแบบมาเพื่อให้การประกอบคอมพิวเตอร์เป็นเรื่องง่าย
      - generic [ref=e65]:
        - generic [ref=e66]:
          - generic [ref=e67]: ⚡
          - heading "Smart Compatibility" [level=3] [ref=e68]
          - paragraph [ref=e69]: ระบบตรวจสอบความเข้ากันได้แบบเรียลไทม์ ซ็อกเก็ต CPU/Mainboard, แรม DDR4/5 และคำนวณกำลังไฟ PSU อัตโนมัติ
        - generic [ref=e70]:
          - generic [ref=e71]: 🤖
          - heading "SpecAI Assistant" [level=3] [ref=e72]
          - paragraph [ref=e73]: แชตบอตผู้ช่วยส่วนตัว เพียงแค่บอกงบประมาณและสายงาน AI จะจัดเซ็ตที่คุ้มค่าที่สุดให้คุณในพริบตา
        - generic [ref=e74]:
          - generic [ref=e75]: 📦
          - heading "Live Catalog" [level=3] [ref=e76]
          - paragraph [ref=e77]: ข้อมูลสินค้า ราคา และรูปภาพกว่า 270+ รายการ อัปเดตล่าสุดจากฐานข้อมูลโดยตรง
    - contentinfo [ref=e78]:
      - generic [ref=e79]:
        - generic [ref=e80]: ForgeLabs
        - generic [ref=e81]: © 2026 ForgeLabs. All rights reserved.
  - generic [ref=e83]:
    - generic [ref=e84]:
      - generic [ref=e85]:
        - button "เข้าสู่ระบบ" [ref=e86] [cursor=pointer]
        - button "สมัครสมาชิก" [ref=e87] [cursor=pointer]
      - button "✕" [ref=e88] [cursor=pointer]
    - generic [ref=e89]:
      - generic [ref=e90]:
        - generic [ref=e91]: อีเมล
        - textbox "กรอกอีเมล" [ref=e92]: wrong@test.com
      - generic [ref=e93]:
        - generic [ref=e94]: รหัสผ่าน
        - textbox "กรอกรหัสผ่าน" [active] [ref=e95]: wrongpass
      - button "เข้าสู่ระบบ" [ref=e96] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const TEST_EMAIL = `e2e_${Date.now()}@test.com`;
  4  | const TEST_PASS = 'test123';
  5  | const TEST_NAME = 'E2E User';
  6  | 
  7  | test.describe('Auth Flow', () => {
  8  | 
  9  |   test('guest can browse builder without login', async ({ page }) => {
  10 |     await page.goto('/build');
  11 |     await expect(page.locator('.category-list-wrap')).toBeVisible({ timeout: 15000 });
  12 |     await expect(page.getByText('💻 จัดสเปค')).toBeVisible();
  13 |   });
  14 | 
  15 |   test('register a new user', async ({ page }) => {
  16 |     await page.goto('/');
  17 |     await page.getByText('เข้าสู่ระบบ').click();
  18 |     await expect(page.locator('.modal-overlay')).toBeVisible();
  19 | 
  20 |     await page.getByText('สมัครสมาชิก').click();
  21 |     await page.locator('input[placeholder="ชื่อที่จะแสดงในระบบ"]').fill(TEST_NAME);
  22 |     await page.locator('input[placeholder="ตั้งอีเมลของคุณ"]').fill(TEST_EMAIL);
  23 |     await page.locator('input[placeholder="ตั้งรหัสผ่าน"]').fill(TEST_PASS);
  24 |     await page.getByText('สร้างบัญชี').click();
  25 | 
  26 |     page.once('dialog', async (dialog) => {
  27 |       expect(dialog.message()).toContain('สมัครสมาชิกสำเร็จ');
  28 |       await dialog.accept();
  29 |     });
  30 | 
  31 |     await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 10000 });
  32 |     await expect(page.getByText(`👤 ${TEST_NAME}`)).toBeVisible({ timeout: 5000 });
  33 |   });
  34 | 
  35 |   test('login with registered user', async ({ page }) => {
  36 |     await page.goto('/');
  37 |     await page.getByText('เข้าสู่ระบบ').click();
  38 |     await expect(page.locator('.modal-overlay')).toBeVisible();
  39 | 
  40 |     await page.locator('input[placeholder="กรอกอีเมล"]').fill(TEST_EMAIL);
  41 |     await page.locator('input[placeholder="กรอกรหัสผ่าน"]').fill(TEST_PASS);
  42 |     await page.getByText('เข้าสู่ระบบ').click();
  43 | 
  44 |     await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 10000 });
  45 |     await expect(page.getByText(`👤 ${TEST_NAME}`)).toBeVisible({ timeout: 5000 });
  46 |   });
  47 | 
  48 |   test('logout', async ({ page }) => {
  49 |     await page.goto('/');
  50 | 
  51 |     await page.getByText('เข้าสู่ระบบ').click();
  52 |     await page.locator('input[placeholder="กรอกอีเมล"]').fill(TEST_EMAIL);
  53 |     await page.locator('input[placeholder="กรอกรหัสผ่าน"]').fill(TEST_PASS);
  54 |     await page.getByText('เข้าสู่ระบบ').click();
  55 |     await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 10000 });
  56 | 
  57 |     await page.getByText('ออกจากระบบ').click();
  58 | 
  59 |     await expect(page.getByText('เข้าสู่ระบบ')).toBeVisible();
  60 |     await expect(page.getByText('👤 E2E')).not.toBeVisible();
  61 |   });
  62 | 
  63 |   test('login with wrong password shows error', async ({ page }) => {
  64 |     await page.goto('/');
  65 |     await page.getByText('เข้าสู่ระบบ').click();
  66 | 
  67 |     await page.locator('input[placeholder="กรอกอีเมล"]').fill('wrong@test.com');
  68 |     await page.locator('input[placeholder="กรอกรหัสผ่าน"]').fill('wrongpass');
  69 | 
  70 |     page.once('dialog', async (dialog) => {
  71 |       expect(dialog.message()).toContain('ไม่ถูกต้อง');
  72 |       await dialog.accept();
  73 |     });
  74 | 
> 75 |     await page.getByText('เข้าสู่ระบบ').click();
     |                                         ^ Error: locator.click: Error: strict mode violation: getByText('เข้าสู่ระบบ') resolved to 3 elements:
  76 |   });
  77 | 
  78 | });
  79 | 
```
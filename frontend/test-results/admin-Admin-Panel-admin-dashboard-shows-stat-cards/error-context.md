# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.js >> Admin Panel >> admin dashboard shows stat cards
- Location: e2e\admin.spec.js:19:3

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
        - textbox "กรอกอีเมล" [ref=e92]: admin@pcspec.dev
      - generic [ref=e93]:
        - generic [ref=e94]: รหัสผ่าน
        - textbox "กรอกรหัสผ่าน" [active] [ref=e95]: admin123
      - button "เข้าสู่ระบบ" [ref=e96] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Admin Panel', () => {
  4  | 
  5  |   test('login as admin and redirect to admin panel', async ({ page }) => {
  6  |     await page.goto('/');
  7  |     await page.getByText('เข้าสู่ระบบ').click();
  8  |     await expect(page.locator('.modal-overlay')).toBeVisible();
  9  | 
  10 |     await page.locator('input[placeholder="กรอกอีเมล"]').fill('admin@pcspec.dev');
  11 |     await page.locator('input[placeholder="กรอกรหัสผ่าน"]').fill('admin123');
  12 |     await page.getByText('เข้าสู่ระบบ').click();
  13 | 
  14 |     // Admin should be redirected to /admin
  15 |     await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
  16 |     await expect(page.locator('.admin-layout')).toBeVisible({ timeout: 10000 });
  17 |   });
  18 | 
  19 |   test('admin dashboard shows stat cards', async ({ page }) => {
  20 |     await page.goto('/');
  21 | 
  22 |     // Login as admin
  23 |     await page.getByText('เข้าสู่ระบบ').click();
  24 |     await page.locator('input[placeholder="กรอกอีเมล"]').fill('admin@pcspec.dev');
  25 |     await page.locator('input[placeholder="กรอกรหัสผ่าน"]').fill('admin123');
> 26 |     await page.getByText('เข้าสู่ระบบ').click();
     |                                         ^ Error: locator.click: Error: strict mode violation: getByText('เข้าสู่ระบบ') resolved to 3 elements:
  27 |     await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
  28 | 
  29 |     // Check dashboard stats exist
  30 |     await expect(page.locator('.stat-grid')).toBeVisible({ timeout: 10000 });
  31 |     await expect(page.getByText('ยอดขายรวม')).toBeVisible();
  32 |     await expect(page.getByText('คำสั่งซื้อทั้งหมด')).toBeVisible();
  33 |   });
  34 | 
  35 |   test('admin can view users tab', async ({ page }) => {
  36 |     await page.goto('/');
  37 | 
  38 |     await page.getByText('เข้าสู่ระบบ').click();
  39 |     await page.locator('input[placeholder="กรอกอีเมล"]').fill('admin@pcspec.dev');
  40 |     await page.locator('input[placeholder="กรอกรหัสผ่าน"]').fill('admin123');
  41 |     await page.getByText('เข้าสู่ระบบ').click();
  42 |     await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
  43 | 
  44 |     // Navigate to Users tab
  45 |     await page.getByText('👥 จัดการสมาชิก').click();
  46 |     await expect(page.locator('.data-table')).toBeVisible({ timeout: 10000 });
  47 |     await expect(page.getByText('admin@pcspec.dev')).toBeVisible();
  48 |   });
  49 | 
  50 |   test('admin can view inventory tab', async ({ page }) => {
  51 |     await page.goto('/');
  52 | 
  53 |     await page.getByText('เข้าสู่ระบบ').click();
  54 |     await page.locator('input[placeholder="กรอกอีเมล"]').fill('admin@pcspec.dev');
  55 |     await page.locator('input[placeholder="กรอกรหัสผ่าน"]').fill('admin123');
  56 |     await page.getByText('เข้าสู่ระบบ').click();
  57 |     await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
  58 | 
  59 |     // Navigate to Inventory tab
  60 |     await page.getByText('⚙️ คลังสินค้า').click();
  61 |     await expect(page.getByText('จัดการสินค้าในระบบ')).toBeVisible({ timeout: 10000 });
  62 |   });
  63 | 
  64 |   test('admin can add a new product', async ({ page }) => {
  65 |     await page.goto('/');
  66 | 
  67 |     await page.getByText('เข้าสู่ระบบ').click();
  68 |     await page.locator('input[placeholder="กรอกอีเมล"]').fill('admin@pcspec.dev');
  69 |     await page.locator('input[placeholder="กรอกรหัสผ่าน"]').fill('admin123');
  70 |     await page.getByText('เข้าสู่ระบบ').click();
  71 |     await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
  72 | 
  73 |     await page.getByText('⚙️ คลังสินค้า').click();
  74 |     await expect(page.getByText('จัดการสินค้าในระบบ')).toBeVisible({ timeout: 10000 });
  75 | 
  76 |     // Click add product
  77 |     await page.getByText('+ เพิ่มสินค้า').click();
  78 |     await expect(page.locator('.modal-overlay')).toBeVisible();
  79 | 
  80 |     // Fill form
  81 |     await page.locator('input[placeholder="ระบุชื่อสินค้าแบบเต็ม..."]').fill('Test E2E Product');
  82 |     await page.locator('input[type="number"]').first().fill('9999');
  83 |     await page.locator('input[placeholder="ระบุ URL รูปภาพ"]').fill('/images/test.png');
  84 | 
  85 |     // Save
  86 |     await page.getByText('💾 บันทึกสินค้า').click();
  87 |     await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 5000 });
  88 |   });
  89 | 
  90 | });
  91 | 
```
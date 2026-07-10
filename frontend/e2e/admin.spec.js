import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {

  test('login as admin and redirect to admin panel', async ({ page }) => {
    await page.goto('/');
    await page.getByText('เข้าสู่ระบบ').click();
    await expect(page.locator('.modal-overlay')).toBeVisible();

    await page.locator('input[placeholder="กรอกอีเมล"]').fill('admin@pcspec.dev');
    await page.locator('input[placeholder="กรอกรหัสผ่าน"]').fill('admin123');
    await page.getByText('เข้าสู่ระบบ').click();

    // Admin should be redirected to /admin
    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
    await expect(page.locator('.admin-layout')).toBeVisible({ timeout: 10000 });
  });

  test('admin dashboard shows stat cards', async ({ page }) => {
    await page.goto('/');

    // Login as admin
    await page.getByText('เข้าสู่ระบบ').click();
    await page.locator('input[placeholder="กรอกอีเมล"]').fill('admin@pcspec.dev');
    await page.locator('input[placeholder="กรอกรหัสผ่าน"]').fill('admin123');
    await page.getByText('เข้าสู่ระบบ').click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });

    // Check dashboard stats exist
    await expect(page.locator('.stat-grid')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('ยอดขายรวม')).toBeVisible();
    await expect(page.getByText('คำสั่งซื้อทั้งหมด')).toBeVisible();
  });

  test('admin can view users tab', async ({ page }) => {
    await page.goto('/');

    await page.getByText('เข้าสู่ระบบ').click();
    await page.locator('input[placeholder="กรอกอีเมล"]').fill('admin@pcspec.dev');
    await page.locator('input[placeholder="กรอกรหัสผ่าน"]').fill('admin123');
    await page.getByText('เข้าสู่ระบบ').click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });

    // Navigate to Users tab
    await page.getByText('👥 จัดการสมาชิก').click();
    await expect(page.locator('.data-table')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('admin@pcspec.dev')).toBeVisible();
  });

  test('admin can view inventory tab', async ({ page }) => {
    await page.goto('/');

    await page.getByText('เข้าสู่ระบบ').click();
    await page.locator('input[placeholder="กรอกอีเมล"]').fill('admin@pcspec.dev');
    await page.locator('input[placeholder="กรอกรหัสผ่าน"]').fill('admin123');
    await page.getByText('เข้าสู่ระบบ').click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });

    // Navigate to Inventory tab
    await page.getByText('⚙️ คลังสินค้า').click();
    await expect(page.getByText('จัดการสินค้าในระบบ')).toBeVisible({ timeout: 10000 });
  });

  test('admin can add a new product', async ({ page }) => {
    await page.goto('/');

    await page.getByText('เข้าสู่ระบบ').click();
    await page.locator('input[placeholder="กรอกอีเมล"]').fill('admin@pcspec.dev');
    await page.locator('input[placeholder="กรอกรหัสผ่าน"]').fill('admin123');
    await page.getByText('เข้าสู่ระบบ').click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });

    await page.getByText('⚙️ คลังสินค้า').click();
    await expect(page.getByText('จัดการสินค้าในระบบ')).toBeVisible({ timeout: 10000 });

    // Click add product
    await page.getByText('+ เพิ่มสินค้า').click();
    await expect(page.locator('.modal-overlay')).toBeVisible();

    // Fill form
    await page.locator('input[placeholder="ระบุชื่อสินค้าแบบเต็ม..."]').fill('Test E2E Product');
    await page.locator('input[type="number"]').first().fill('9999');
    await page.locator('input[placeholder="ระบุ URL รูปภาพ"]').fill('/images/test.png');

    // Save
    await page.getByText('💾 บันทึกสินค้า').click();
    await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 5000 });
  });

});

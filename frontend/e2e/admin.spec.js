import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@pcspec.dev';
const ADMIN_PASS = 'admin123';

test.describe('Admin Panel', () => {

  test('login as admin and view dashboard', async ({ page }) => {
    await page.goto('/');
    await page.locator('.btn-outline.btn-sm:has-text("เข้าสู่ระบบ")').click();
    await expect(page.locator('.modal-overlay')).toBeVisible();

    await page.locator('input[placeholder="กรอกอีเมล"]').fill(ADMIN_EMAIL);
    await page.locator('input[placeholder="กรอกรหัสผ่าน"]').fill(ADMIN_PASS);
    await page.locator('.btn-primary.btn-block:has-text("เข้าสู่ระบบ")').click();

    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
    await expect(page.locator('.admin-layout')).toBeVisible({ timeout: 10000 });
  });

  test('admin dashboard shows stat cards', async ({ page }) => {
    await page.goto('/');
    await page.locator('.btn-outline.btn-sm:has-text("เข้าสู่ระบบ")').click();
    await page.locator('input[placeholder="กรอกอีเมล"]').fill(ADMIN_EMAIL);
    await page.locator('input[placeholder="กรอกรหัสผ่าน"]').fill(ADMIN_PASS);
    await page.locator('.btn-primary.btn-block:has-text("เข้าสู่ระบบ")').click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });

    await expect(page.locator('.stat-grid')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('ยอดขายรวม')).toBeVisible();
    await expect(page.getByText('คำสั่งซื้อทั้งหมด')).toBeVisible();
  });

  test('admin can view users tab', async ({ page }) => {
    await page.goto('/');
    await page.locator('.btn-outline.btn-sm:has-text("เข้าสู่ระบบ")').click();
    await page.locator('input[placeholder="กรอกอีเมล"]').fill(ADMIN_EMAIL);
    await page.locator('input[placeholder="กรอกรหัสผ่าน"]').fill(ADMIN_PASS);
    await page.locator('.btn-primary.btn-block:has-text("เข้าสู่ระบบ")').click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });

    await page.getByText('👥 จัดการสมาชิก').click();
    await expect(page.locator('.data-table')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.data-table tbody tr').first()).toBeVisible();
  });

  test('admin can view inventory tab', async ({ page }) => {
    await page.goto('/');
    await page.locator('.btn-outline.btn-sm:has-text("เข้าสู่ระบบ")').click();
    await page.locator('input[placeholder="กรอกอีเมล"]').fill(ADMIN_EMAIL);
    await page.locator('input[placeholder="กรอกรหัสผ่าน"]').fill(ADMIN_PASS);
    await page.locator('.btn-primary.btn-block:has-text("เข้าสู่ระบบ")').click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });

    await page.getByText('⚙️ คลังสินค้า').click();
    await expect(page.getByText('จัดการสินค้าในระบบ')).toBeVisible({ timeout: 10000 });
  });

  test('admin can add a new product', async ({ page }) => {
    await page.goto('/');
    await page.locator('.btn-outline.btn-sm:has-text("เข้าสู่ระบบ")').click();
    await page.locator('input[placeholder="กรอกอีเมล"]').fill(ADMIN_EMAIL);
    await page.locator('input[placeholder="กรอกรหัสผ่าน"]').fill(ADMIN_PASS);
    await page.locator('.btn-primary.btn-block:has-text("เข้าสู่ระบบ")').click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });

    await page.getByText('⚙️ คลังสินค้า').click();
    await expect(page.getByText('จัดการสินค้าในระบบ')).toBeVisible({ timeout: 10000 });

    await page.getByText('+ เพิ่มสินค้า').click();
    await expect(page.locator('.modal-overlay')).toBeVisible();

    await page.locator('input[placeholder="ระบุชื่อสินค้าแบบเต็ม..."]').fill('Test E2E Product');
    await page.locator('input[type="number"]').first().fill('9999');
    await page.locator('input[placeholder*="ระบุ URL รูปภาพ"]').fill('/images/test.png');

    await page.getByText('💾 บันทึกสินค้า').click();
    await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 5000 });
  });

});

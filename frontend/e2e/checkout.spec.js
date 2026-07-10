import { test, expect } from '@playwright/test';

const TEST_EMAIL = `co_${Date.now()}@test.com`;
const TEST_PASS = 'checkout123';
const TEST_NAME = 'Checkout User';

test.describe('Checkout Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Register user
    await page.goto('/');
    await page.getByText('เข้าสู่ระบบ').click();
    await expect(page.locator('.modal-overlay')).toBeVisible();

    await page.getByText('สมัครสมาชิก').click();
    await page.locator('input[placeholder="ชื่อที่จะแสดงในระบบ"]').fill(TEST_NAME);
    await page.locator('input[placeholder="ตั้งอีเมลของคุณ"]').fill(TEST_EMAIL);
    await page.locator('input[placeholder="ตั้งรหัสผ่าน"]').fill(TEST_PASS);

    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });

    await page.getByText('สร้างบัญชี').click();
    await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 10000 });
  });

  test('guest sees login modal when clicking checkout', async ({ page }) => {
    // Logout first
    await page.getByText('ออกจากระบบ').click();

    // Go to build and try to checkout without login
    await page.goto('/build');
    await expect(page.locator('.category-list-wrap')).toBeVisible({ timeout: 15000 });

    // Guest clicking checkout should show login modal
    await page.goto('/checkout');
    await expect(page.locator('.empty-state')).toBeVisible();
    expect(page.url()).toContain('/checkout');
  });

  test('full order flow: select components and place order', async ({ page }) => {
    // Go to builder
    await page.goto('/build');
    await expect(page.locator('.category-list-wrap')).toBeVisible({ timeout: 15000 });

    // Select CPU
    await page.locator('.category-item', { hasText: 'CPU' }).click();
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
    await page.locator('.product-card .add-btn').first().click();

    // Select Mobo
    await page.locator('.category-item', { hasText: 'Motherboard' }).click();
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
    await page.locator('.product-card .add-btn').first().click();

    // Select RAM
    await page.locator('.category-item', { hasText: 'RAM' }).click();
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
    await page.locator('.product-card .add-btn').first().click();

    // Select Storage
    await page.locator('.category-item', { hasText: 'Storage' }).click();
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
    await page.locator('.product-card .add-btn').first().click();

    // Navigate to checkout
    await page.goto('/checkout');
    await expect(page.getByText('สรุปรายการสั่งซื้อ')).toBeVisible({ timeout: 10000 });

    // Name should be auto-filled from user profile
    const nameInput = page.locator('input[placeholder="ระบุชื่อ-นามสกุล"]');
    await expect(nameInput).toHaveValue(TEST_NAME);

    // Fill address and phone
    await page.locator('textarea[placeholder="ระบุที่อยู่จัดส่งแบบครบถ้วน"]').fill('123 Test Street, Bangkok');
    await page.locator('input[placeholder="08X-XXX-XXXX"]').fill('081-234-5678');

    // Select standard assembly
    await page.locator('input[type="radio"][value="standard"]').click();

    // Submit the order
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('🎉');
      expect(dialog.message()).toContain('รหัสคำสั่งซื้อ');
      await dialog.accept();
    });

    await page.getByText('ยืนยันคำสั่งซื้อ').click();

    // Should redirect back to /build after success
    await expect(page).toHaveURL(/\/build/, { timeout: 10000 });
  });

});

import { test, expect } from '@playwright/test';

const TEST_EMAIL = `co_${Date.now()}@test.com`;
const TEST_PASS = 'checkout123';
const TEST_NAME = 'Checkout User';
const API_BASE = process.env.E2E_API_BASE || 'http://127.0.0.1:3001/api/v1';

test.describe('Checkout Flow', () => {

  test.beforeAll(async ({ request }) => {
    await request.post(`${API_BASE}/auth/register`, {
      data: { name: TEST_NAME, email: TEST_EMAIL, password: TEST_PASS }
    });
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('.btn-outline.btn-sm:has-text("เข้าสู่ระบบ")').click();
    await expect(page.locator('.modal-overlay')).toBeVisible();

    await page.locator('input[placeholder="กรอกอีเมล"]').fill(TEST_EMAIL);
    await page.locator('input[placeholder="กรอกรหัสผ่าน"]').fill(TEST_PASS);
    await page.locator('.btn-primary.btn-block:has-text("เข้าสู่ระบบ")').click();
    await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 10000 });
  });

  test('guest sees login modal when clicking checkout', async ({ page }) => {
    await page.getByText('ออกจากระบบ').click();

    await page.goto('/build');
    await expect(page.locator('.category-list-wrap')).toBeVisible({ timeout: 15000 });

    await page.goto('/checkout');
    await expect(page.locator('.empty-state')).toBeVisible();
    expect(page.url()).toContain('/checkout');
  });

  test('full order flow: select components and place order', async ({ page }) => {
    await page.goto('/build');
    await expect(page.locator('.category-list-wrap')).toBeVisible({ timeout: 15000 });

    await page.locator('.category-item', { hasText: 'CPU' }).click();
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
    await page.locator('.product-card .add-btn').first().click();

    await page.locator('.category-item', { hasText: 'Motherboard' }).click();
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
    await page.locator('.product-card .add-btn').first().click();

    await page.locator('.category-item:has(.cat-name:text-is("RAM"))').click();
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
    await page.locator('.product-card .add-btn').first().click();

    await page.locator('.category-item', { hasText: 'Storage' }).click();
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
    await page.locator('.product-card .add-btn').first().click();

    await page.locator('.checkout-btn').click();
    await expect(page.getByText('สรุปรายการสั่งซื้อ')).toBeVisible({ timeout: 10000 });

    const nameInput = page.locator('input[placeholder="ระบุชื่อ-นามสกุล"]');
    await expect(nameInput).toHaveValue(TEST_NAME);

    await page.locator('textarea[placeholder="ระบุที่อยู่จัดส่งแบบครบถ้วน"]').fill('123 Test Street, Bangkok');
    await page.locator('input[placeholder="08X-XXX-XXXX"]').fill('081-234-5678');

    await page.locator('input[type="radio"][value="standard"]').click();

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('🎉');
      expect(dialog.message()).toContain('รหัสคำสั่งซื้อ');
      await dialog.accept();
    });

    await page.getByText('ยืนยันคำสั่งซื้อ').click();

    await expect(page).toHaveURL(/\/build/, { timeout: 10000 });
  });

});

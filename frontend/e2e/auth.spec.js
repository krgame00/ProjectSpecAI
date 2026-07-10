import { test, expect } from '@playwright/test';

const TEST_EMAIL = `e2e_${Date.now()}@test.com`;
const TEST_PASS = 'test123';
const TEST_NAME = 'E2E User';

test.describe('Auth Flow', () => {

  test('guest can browse builder without login', async ({ page }) => {
    await page.goto('/build');
    await expect(page.locator('.category-list-wrap')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('💻 จัดสเปค')).toBeVisible();
  });

  test('register a new user', async ({ page }) => {
    await page.goto('/');
    await page.getByText('เข้าสู่ระบบ').click();
    await expect(page.locator('.modal-overlay')).toBeVisible();

    await page.getByText('สมัครสมาชิก').click();
    await page.locator('input[placeholder="ชื่อที่จะแสดงในระบบ"]').fill(TEST_NAME);
    await page.locator('input[placeholder="ตั้งอีเมลของคุณ"]').fill(TEST_EMAIL);
    await page.locator('input[placeholder="ตั้งรหัสผ่าน"]').fill(TEST_PASS);
    await page.getByText('สร้างบัญชี').click();

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('สมัครสมาชิกสำเร็จ');
      await dialog.accept();
    });

    await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText(`👤 ${TEST_NAME}`)).toBeVisible({ timeout: 5000 });
  });

  test('login with registered user', async ({ page }) => {
    await page.goto('/');
    await page.getByText('เข้าสู่ระบบ').click();
    await expect(page.locator('.modal-overlay')).toBeVisible();

    await page.locator('input[placeholder="กรอกอีเมล"]').fill(TEST_EMAIL);
    await page.locator('input[placeholder="กรอกรหัสผ่าน"]').fill(TEST_PASS);
    await page.getByText('เข้าสู่ระบบ').click();

    await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText(`👤 ${TEST_NAME}`)).toBeVisible({ timeout: 5000 });
  });

  test('logout', async ({ page }) => {
    await page.goto('/');

    await page.getByText('เข้าสู่ระบบ').click();
    await page.locator('input[placeholder="กรอกอีเมล"]').fill(TEST_EMAIL);
    await page.locator('input[placeholder="กรอกรหัสผ่าน"]').fill(TEST_PASS);
    await page.getByText('เข้าสู่ระบบ').click();
    await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 10000 });

    await page.getByText('ออกจากระบบ').click();

    await expect(page.getByText('เข้าสู่ระบบ')).toBeVisible();
    await expect(page.getByText('👤 E2E')).not.toBeVisible();
  });

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto('/');
    await page.getByText('เข้าสู่ระบบ').click();

    await page.locator('input[placeholder="กรอกอีเมล"]').fill('wrong@test.com');
    await page.locator('input[placeholder="กรอกรหัสผ่าน"]').fill('wrongpass');

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('ไม่ถูกต้อง');
      await dialog.accept();
    });

    await page.getByText('เข้าสู่ระบบ').click();
  });

});

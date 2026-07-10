import { test, expect } from '@playwright/test';

test.describe('Builder Compatibility', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/build');
    await expect(page.locator('.category-list-wrap')).toBeVisible({ timeout: 15000 });
  });

  test('displays product grid when clicking a category', async ({ page }) => {
    const cpuCategory = page.locator('.category-item', { hasText: 'CPU' });
    await cpuCategory.click();

    await expect(page.locator('.product-grid')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
  });

  test('selecting matching CPU and Mobo shows compatibility pass', async ({ page }) => {
    // Select CPU category and choose first AMD CPU (AM5 socket)
    await page.locator('.category-item', { hasText: 'CPU' }).click();
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });

    // Pick first CPU (should be AMD Ryzen with AM5 socket)
    await page.locator('.product-card .add-btn').first().click();
    await expect(page.locator('.product-card.selected')).toBeVisible();

    // Select Mobo category
    await page.locator('.category-item', { hasText: 'Motherboard' }).click();
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });

    // The first mobo (ASROCK B550M Pro4) also has AM5 socket => should show pass
    await page.locator('.product-card .add-btn').first().click();

    // Check for compatibility success alert
    await expect(page.locator('.alert-box.alert-success')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.alert-text strong')).toHaveText('เข้ากันได้ 100%');
  });

  test('selecting mismatched CPU and Mobo shows compatibility warning', async ({ page }) => {
    // Select CPU, pick Intel LGA1700 CPU
    await page.locator('.category-item', { hasText: 'CPU' }).click();
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });

    const cpuCards = page.locator('.product-card');
    const cpuCount = await cpuCards.count();

    let selectedIntel = false;
    for (let i = 0; i < cpuCount; i++) {
      const name = await cpuCards.nth(i).locator('.product-name').textContent();
      if (name && name.includes('Intel')) {
        await cpuCards.nth(i).locator('.add-btn').click();
        selectedIntel = true;
        break;
      }
    }
    expect(selectedIntel).toBe(true);

    // Select Mobo and pick one with AM5 (first one is AM5)
    await page.locator('.category-item', { hasText: 'Motherboard' }).click();
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
    await page.locator('.product-card .add-btn').first().click();

    // Socket mismatch warning should appear
    await expect(page.locator('.alert-box.alert-danger')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.mixed-report-list li.issue')).toBeVisible();
    await expect(page.locator('.mixed-report-list li.issue').first()).toContainText('ซ็อกเก็ตไม่ตรง');
  });

  test('selecting RAM with mismatched type shows warning', async ({ page }) => {
    // Pick an AMD CPU
    await page.locator('.category-item', { hasText: 'CPU' }).click();
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
    await page.locator('.product-card .add-btn').first().click();

    // Pick an AM5 mobo (first one, which is DDR5)
    await page.locator('.category-item', { hasText: 'Motherboard' }).click();
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
    await page.locator('.product-card .add-btn').first().click();

    // Pick a DDR4 RAM (first RAM is DDR4)
    await page.locator('.category-item', { hasText: 'RAM' }).click();
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
    await page.locator('.product-card .add-btn').first().click();

    // Mobo is DDR5 but RAM is DDR4 => warning
    await expect(page.locator('.alert-box.alert-danger')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.mixed-report-list li.issue')).toContainText('ประเภท RAM ไม่ตรง');
  });

  test('total price updates as components are selected', async ({ page }) => {
    await expect(page.locator('.total-price-box')).toBeVisible();

    await page.locator('.category-item', { hasText: 'CPU' }).click();
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
    await page.locator('.product-card .add-btn').first().click();

    const priceText = await page.locator('.total-value').textContent();
    const priceNum = parseInt(priceText.replace(/[^0-9]/g, ''));
    expect(priceNum).toBeGreaterThan(0);
  });

});

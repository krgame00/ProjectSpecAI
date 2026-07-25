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

  test('selecting CPU and Mobo shows compatibility alert', async ({ page }) => {
    await page.locator('.category-item', { hasText: 'CPU' }).click();
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
    await page.locator('.product-card .add-btn').first().click();
    await expect(page.locator('.product-card.selected')).toBeVisible();

    await page.locator('.category-item', { hasText: 'Motherboard' }).click();
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
    await page.locator('.product-card .add-btn').first().click();

    await expect(page.locator('.alert-box')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.alert-text strong')).toContainText('สถานะ');
  });

  test('selecting Intel CPU shows brand correctly', async ({ page }) => {
    await page.locator('.category-item', { hasText: 'CPU' }).click();
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });

    const cpuCards = page.locator('.product-card');
    const cpuCount = await cpuCards.count();

    let foundIntel = false;
    for (let i = 0; i < cpuCount; i++) {
      const name = await cpuCards.nth(i).locator('.product-name').textContent();
      if (name && name.toUpperCase().includes('INTEL')) {
        await cpuCards.nth(i).locator('.add-btn').click();
        foundIntel = true;
        break;
      }
    }
    expect(foundIntel).toBe(true);

    await page.locator('.category-item', { hasText: 'Motherboard' }).click();
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
    await page.locator('.product-card .add-btn').first().click();

    await expect(page.locator('.alert-box')).toBeVisible({ timeout: 5000 });
  });

  test('selecting RAM shows compatibility status', async ({ page }) => {
    await page.locator('.category-item', { hasText: 'CPU' }).click();
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
    await page.locator('.product-card .add-btn').first().click();

    await page.locator('.category-item', { hasText: 'Motherboard' }).click();
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
    await page.locator('.product-card .add-btn').first().click();

    await page.locator('.category-item:has(.cat-name:text-is("RAM"))').click();
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
    await page.locator('.product-card .add-btn').first().click();

    await expect(page.locator('.alert-box')).toBeVisible({ timeout: 5000 });
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

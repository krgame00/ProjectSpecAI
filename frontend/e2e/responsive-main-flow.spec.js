import { expect, test } from '@playwright/test'

const catalog = {
  cpu: [{
    id: 1,
    category: 'cpu',
    name: 'INTEL Core i5 14400F Extra Long Hardware Model Name',
    price: 7290,
    image: '/images/cpu.png'
  }],
  mobo: [],
  ram: [],
  gpu: [],
  storage: [],
  psu: [],
  case: []
}

const prepareApi = async (page) => {
  await page.route('**/api/v1/hardware/catalog', route => route.fulfill({ json: catalog }))
  await page.route('**/api/v1/articles', route => route.fulfill({ json: [] }))
}

const assertNoPageOverflow = async (page) => {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth)
}

test.describe('responsive foundation', () => {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 }
  ]) {
    test(`enables safe areas at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await prepareApi(page)
      await page.goto('/')
      await expect(page.locator('.landing-page')).toBeVisible()
      await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /viewport-fit=cover/)
    })
  }
})

test.describe('primary flow matrix', () => {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 }
  ]) {
    test(`moves from landing to a selected build at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await prepareApi(page)
      await page.goto('/')
      await assertNoPageOverflow(page)
      await page.locator('.hero-actions').getByRole('link').first().click()
      await expect(page).toHaveURL(/\/build$/)
      await page.locator('.product-card .add-btn').first().click()

      if (viewport.width < 1024) {
        await page.locator('[data-test="mobile-summary-toggle"]').click()
      }

      await expect(page.locator('.total-value')).toContainText('7,290')

      if (viewport.width >= 1024) {
        const sidebar = await page.locator('.sidebar').boundingBox()
        const main = await page.locator('.main-content').boundingBox()
        expect(main.x).toBeGreaterThanOrEqual(sidebar.x + sidebar.width)
      }

      await assertNoPageOverflow(page)
    })
  }
})

test('landing actions and hardware scene fit a 320px phone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await prepareApi(page)
  await page.goto('/')

  const actions = page.locator('.hero-actions')
  const box = await actions.boundingBox()
  const primary = await actions.locator('.btn').first().boundingBox()

  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width).toBeLessThanOrEqual(320)
  expect(primary.width).toBeGreaterThanOrEqual(260)
  await expect(actions.locator('.btn')).toHaveCount(2)
  await assertNoPageOverflow(page)
})

test('builder product cards remain readable at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await prepareApi(page)
  await page.goto('/build')

  const product = page.locator('.product-card').first()
  await expect(product).toBeVisible()
  const card = await product.boundingBox()

  expect(card.x).toBeGreaterThanOrEqual(0)
  expect(card.x + card.width).toBeLessThanOrEqual(320)
  expect(card.width).toBeGreaterThanOrEqual(280)
  await assertNoPageOverflow(page)
})

test('mobile summary expands without covering the SpecAI launcher', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await prepareApi(page)
  await page.goto('/build')
  await page.locator('.product-card .add-btn').first().click()

  const toggle = page.locator('[data-test="mobile-summary-toggle"]')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')

  const summary = await page.locator('#mobile-build-summary').boundingBox()
  const chat = await page.locator('.chat-fab').boundingBox()
  const intersects = !(
    summary.x + summary.width <= chat.x ||
    chat.x + chat.width <= summary.x ||
    summary.y + summary.height <= chat.y ||
    chat.y + chat.height <= summary.y
  )

  expect(intersects).toBe(false)
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await assertNoPageOverflow(page)
})

test('checkout stacks fields and summary on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await prepareApi(page)
  await page.goto('/build')
  await page.locator('.product-card .add-btn').first().click()
  await page.evaluate(() => {
    document.body.style.minHeight = '1600px'
    window.scrollTo(0, 400)
  })
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  await page.locator('[data-test="mobile-summary-toggle"]').click()
  await page.locator('.checkout-btn').click()

  await expect(page).toHaveURL(/\/checkout$/)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  const left = await page.locator('.left-col').boundingBox()
  const right = await page.locator('.right-col').boundingBox()
  const nameInput = page.locator('#checkout-name')
  const nameBox = await nameInput.boundingBox()
  const fontSize = await nameInput.evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize))

  expect(right.y).toBeGreaterThanOrEqual(left.y + left.height)
  expect(nameBox.height).toBeGreaterThanOrEqual(44)
  expect(fontSize).toBeGreaterThanOrEqual(16)
  await assertNoPageOverflow(page)
})

test('SpecAI becomes a safe full-screen workspace on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await prepareApi(page)
  await page.goto('/build')
  await page.getByRole('button', { name: 'เปิด SpecAI' }).click()

  const dialog = page.getByRole('dialog', { name: 'SpecAI' })
  const bounds = await dialog.boundingBox()
  const close = await page.getByRole('button', { name: 'ปิด SpecAI' }).boundingBox()

  expect(bounds.x).toBe(0)
  expect(bounds.y).toBe(0)
  expect(bounds.width).toBe(390)
  expect(bounds.height).toBe(844)
  expect(close.width).toBeGreaterThanOrEqual(44)
  expect(close.height).toBeGreaterThanOrEqual(44)
  await assertNoPageOverflow(page)
})

test('toast stays in the phone viewport with a touch-sized dismiss action', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await prepareApi(page)
  await page.goto('/')
  await page.locator('[data-test="nav-toggle"]').click()
  await page.locator('#primary-navigation').getByRole('button', { name: 'เข้าสู่ระบบ' }).click()
  await page.locator('.modal-body .btn-primary').click()

  const toast = page.locator('.toast-warning')
  await expect(toast).toBeVisible()
  const bounds = await toast.boundingBox()
  const close = await toast.getByRole('button', { name: 'ปิดการแจ้งเตือน' }).boundingBox()

  expect(bounds.x).toBeGreaterThanOrEqual(0)
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390)
  expect(close.width).toBeGreaterThanOrEqual(44)
  expect(close.height).toBeGreaterThanOrEqual(44)
  await assertNoPageOverflow(page)
})

export { assertNoPageOverflow, prepareApi }

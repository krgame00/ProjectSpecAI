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

export { assertNoPageOverflow, prepareApi }

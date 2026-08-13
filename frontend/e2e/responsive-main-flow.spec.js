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
        const grid = await page.locator('.grid-layout').boundingBox()
        expect(main.x).toBeGreaterThanOrEqual(sidebar.x + sidebar.width)
        expect(grid.width).toBeLessThanOrEqual(1280)
      }

      await assertNoPageOverflow(page)
    })
  }
})

test.describe('phone overlay and focus lifecycle', () => {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 844 }
  ]) {
    test(`keeps primary overlays operable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await prepareApi(page)
      await page.goto('/build')

      const navToggle = page.locator('[data-test="nav-toggle"]')
      await navToggle.click()
      await expect(navToggle).toHaveAttribute('aria-expanded', 'true')
      await page.locator('#primary-navigation').getByRole('button', { name: 'เข้าสู่ระบบ' }).click()
      const authDialog = page.getByRole('dialog', { name: /บัญชีผู้ใช้ ForgeLabs/ })
      await expect(authDialog).toBeVisible()
      const firstAuthTab = authDialog.locator('.auth-tab').first()
      await expect(firstAuthTab).toBeFocused()
      const authTabSize = await firstAuthTab.evaluate(element => ({ width: element.offsetWidth, height: element.offsetHeight }))
      expect(authTabSize.width).toBeGreaterThanOrEqual(44)
      expect(authTabSize.height).toBeGreaterThanOrEqual(44)
      await firstAuthTab.press('Shift+Tab')
      await expect(authDialog.locator('.modal-body .btn-primary')).toBeFocused()
      const authClose = await authDialog.getByRole('button', { name: 'ปิดหน้าต่างบัญชีผู้ใช้' }).evaluate(element => ({
        width: element.offsetWidth,
        height: element.offsetHeight
      }))
      expect(authClose.width).toBeGreaterThanOrEqual(44)
      expect(authClose.height).toBeGreaterThanOrEqual(44)
      await authDialog.press('Escape')
      await expect(authDialog).toBeHidden()
      await expect(navToggle).toBeFocused()

      await page.locator('.product-card .add-btn').first().click()
      const summaryToggle = page.locator('[data-test="mobile-summary-toggle"]')
      await summaryToggle.click()
      await expect(summaryToggle).toHaveAttribute('aria-expanded', 'true')
      const remove = await page.locator('.sidebar-remove-btn').first().boundingBox()
      expect(remove.width).toBeGreaterThanOrEqual(44)
      expect(remove.height).toBeGreaterThanOrEqual(44)
      await summaryToggle.click()
      await expect(summaryToggle).toHaveAttribute('aria-expanded', 'false')

      const launcher = page.getByRole('button', { name: 'เปิด SpecAI' })
      await launcher.click()
      const specAi = page.getByRole('dialog', { name: 'SpecAI' })
      await expect(specAi).toBeVisible()
      await expect(page.locator('.grid-layout')).toHaveAttribute('inert', '')
      await specAi.getByRole('button', { name: 'เข้าสู่ระบบ' }).click()
      await expect(specAi).toBeHidden()
      const nestedAuth = page.getByRole('dialog', { name: /บัญชีผู้ใช้ ForgeLabs/ })
      await expect(nestedAuth).toBeVisible()
      await nestedAuth.press('Escape')
      await expect(nestedAuth).toBeHidden()
      await expect(launcher).toBeFocused()
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

test('reduced-motion preference disables decorative movement', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await prepareApi(page)
  await page.goto('/')

  const motion = await page.locator('.card-3d').first().evaluate(element => ({
    animationDuration: getComputedStyle(element).animationDuration,
    transitionDuration: getComputedStyle(element).transitionDuration
  }))
  expect(Number.parseFloat(motion.animationDuration)).toBeLessThanOrEqual(0.01)
  expect(Number.parseFloat(motion.transitionDuration)).toBeLessThanOrEqual(0.01)
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
  for (const control of ['.details-btn', '.add-btn']) {
    const target = await product.locator(control).boundingBox()
    expect(target.width).toBeGreaterThanOrEqual(44)
    expect(target.height).toBeGreaterThanOrEqual(44)
  }
  const guidance = await page.locator('.tooltip-icon').boundingBox()
  expect(guidance.width).toBeGreaterThanOrEqual(44)
  expect(guidance.height).toBeGreaterThanOrEqual(44)
  await product.locator('.details-btn').click()
  const modalSelect = await page.locator('.btn-select-modal').evaluate(element => ({
    width: element.offsetWidth,
    height: element.offsetHeight
  }))
  expect(modalSelect.width).toBeGreaterThanOrEqual(44)
  expect(modalSelect.height).toBeGreaterThanOrEqual(44)
  await page.getByRole('button', { name: 'ปิดรายละเอียดสินค้า' }).click()
  await assertNoPageOverflow(page)
})

test('builder categories and product dialogs work from the keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await prepareApi(page)
  await page.goto('/build')

  const motherboard = page.locator('.category-button').nth(1)
  await motherboard.press('Enter')
  await expect(page.locator('.category-title-text')).toContainText('Motherboard')

  await page.locator('.category-button').first().press('Enter')
  const details = page.locator('.details-btn').first()
  await expect(details).toHaveAttribute('aria-label', /INTEL Core i5/)
  await details.press('Enter')
  const dialog = page.getByRole('dialog', { name: /INTEL Core i5/ })
  await expect(dialog).toBeVisible()
  await dialog.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(details).toBeFocused()
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

test('short viewport summary releases scrolling back to the catalog', async ({ page }) => {
  await page.setViewportSize({ width: 883, height: 589 })
  await prepareApi(page)
  await page.goto('/build')
  await page.locator('.product-card .add-btn').first().click()
  await page.locator('[data-test="mobile-summary-toggle"]').click()

  const behavior = await page.locator('#mobile-build-summary').evaluate(element => {
    const style = getComputedStyle(element)
    return {
      maxHeight: Number.parseFloat(style.maxHeight),
      overscrollY: style.overscrollBehaviorY
    }
  })

  expect(behavior.maxHeight).toBeLessThanOrEqual(589 * 0.48 + 1)
  expect(behavior.overscrollY).toBe('auto')
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

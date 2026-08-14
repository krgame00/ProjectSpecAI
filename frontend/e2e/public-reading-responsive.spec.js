import { expect, test } from '@playwright/test'

const articles = [{
  id: 7,
  title: 'คู่มือจัดสเปคที่มีชื่อยาวมากสำหรับหน้าจอขนาดเล็ก',
  content: '<h2>เริ่มต้น</h2><p>เนื้อหา</p><table tabindex="8" role="presentation" aria-label="Spoofed"><tbody><tr><td>LONG-HARDWARE-ID-WITHOUT-SPACES</td><td>CPU-COMPATIBILITY-SOCKET-VALUE</td><td>MEMORY-CLEARANCE-MEASUREMENT</td><td>POWER-SUPPLY-HEADROOM-VALUE</td><td>FINAL-OFFSCREEN-SPECIFICATION</td></tr></tbody></table>',
  image_url: '/missing-cover.jpg',
  created_at: '2026-08-13T00:00:00.000Z'
}, {
  id: 8,
  title: 'บทความกริดหนึ่ง',
  content: '<p>เนื้อหาสำหรับทดสอบการจัดวางกริด</p>',
  image_url: '',
  created_at: '2026-08-12T00:00:00.000Z'
}, {
  id: 9,
  title: 'บทความกริดสองที่มีชื่อยาวเพื่อทดสอบการตัดบรรทัดบนหน้าจอแคบ',
  content: '<p>เนื้อหาสำหรับทดสอบการจัดวางกริด</p>',
  image_url: '',
  created_at: '2026-08-11T00:00:00.000Z'
}, {
  id: 10,
  title: 'บทความกริดสาม',
  content: '<p>เนื้อหาสำหรับทดสอบการจัดวางกริด</p>',
  image_url: '',
  created_at: '2026-08-10T00:00:00.000Z'
}, {
  id: 11,
  title: 'บทความกริดสี่',
  content: '<p>เนื้อหาสำหรับทดสอบการจัดวางกริด</p>',
  image_url: '',
  created_at: '2026-08-09T00:00:00.000Z'
}]

const prepare = async page => {
  await page.route('**/api/v1/hardware/catalog', route => route.fulfill({ json: {} }))
  await page.route('**/api/v1/articles', route => route.fulfill({ json: articles }))
}

const expectNoPageOverflow = async page => {
  const size = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth
  }))
  expect(size.scroll).toBeLessThanOrEqual(size.width)
}

const tabTo = async (page, target, maxTabs = 20) => {
  for (let index = 0; index < maxTabs; index += 1) {
    await page.keyboard.press('Tab')
    if (await target.evaluate(element => element === document.activeElement)) return
  }
  throw new Error(`Target was not reached after ${maxTabs} Tab presses`)
}

const deferred = () => {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return { promise, resolve }
}

const refreshArticles = page => page.evaluate(async () => {
  const { useArticleStore } = await import('/src/stores/article.js')
  void useArticleStore().fetchArticles()
})

for (const viewport of [
  { width: 320, height: 568, gridColumns: 1, featureDisplay: 'flex' },
  { width: 390, height: 844, gridColumns: 1, featureDisplay: 'flex' },
  { width: 768, height: 1024, gridColumns: 2, featureDisplay: 'grid' },
  { width: 1024, height: 768, gridColumns: 3, featureDisplay: 'grid' },
  { width: 1440, height: 900, gridColumns: 4, featureDisplay: 'grid' }
]) {
  test(`articles reflow at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await prepare(page)
    await page.goto('/articles')

    const articleLink = page.getByRole('link', { name: /คู่มือจัดสเปค/ })
    await expect(articleLink).toBeVisible()
    await expect(page.locator('.articles-grid')).toBeVisible()
    await expect(page.locator('.article-card')).toHaveCount(4)
    await expect(page.locator('.hero-article')).toHaveCSS('display', viewport.featureDisplay)
    const renderedColumns = await page.locator('.articles-grid').evaluate(element => (
      getComputedStyle(element).gridTemplateColumns.split(' ').length
    ))
    expect(renderedColumns).toBe(viewport.gridColumns)
    await expectNoPageOverflow(page)

    await tabTo(page, articleLink)
    await expect(articleLink).toBeFocused()
    await expect.poll(() => articleLink.evaluate(element => element.matches(':focus-visible'))).toBe(true)
    const focus = await articleLink.evaluate(element => {
      const styles = getComputedStyle(element)
      return {
        outlineStyle: styles.outlineStyle,
        outlineWidth: Number.parseFloat(styles.outlineWidth)
      }
    })
    expect(focus.outlineStyle).toBe('solid')
    expect(focus.outlineWidth).toBeGreaterThan(0)
    await page.keyboard.press('Enter')

    await expect(page).toHaveURL(/\/article\/7$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('คู่มือจัดสเปค')
    await expect(page.getByRole('heading', { level: 2, name: 'เริ่มต้น' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'LONG-HARDWARE-ID-WITHOUT-SPACES' })).toBeVisible()
    await expectNoPageOverflow(page)
  })
}

test('keeps loading ahead of the empty state until articles settle', async ({ page }) => {
  const responseGate = deferred()
  await page.route('**/api/v1/hardware/catalog', route => route.fulfill({ json: {} }))
  await page.route('**/api/v1/articles', async route => {
    await responseGate.promise
    await route.fulfill({ json: [] })
  })

  await page.goto('/articles')

  await expect(page.getByRole('status')).toBeVisible()
  await expect(page.locator('[data-test="articles-empty"]')).toBeHidden()

  responseGate.resolve()
  await expect(page.locator('[data-test="articles-empty"]')).toBeVisible()
})

test('detail loading state hides stale article content', async ({ page }) => {
  const responseGate = deferred()
  let attempts = 0
  await page.route('**/api/v1/hardware/catalog', route => route.fulfill({ json: {} }))
  await page.route('**/api/v1/articles', async route => {
    attempts += 1
    if (attempts === 2) await responseGate.promise
    await route.fulfill({ json: articles })
  })

  await page.goto('/article/7')
  await expect(page.locator('.article-detail-view')).toBeVisible()

  await refreshArticles(page)

  await expect(page.getByRole('status')).toBeVisible()
  await expect(page.locator('.article-detail-view')).toBeHidden()
  await expect(page.locator('[data-test="article-not-found"]')).toBeHidden()

  responseGate.resolve()
  await expect(page.locator('.article-detail-view')).toBeVisible()
  expect(attempts).toBe(2)
})

test('detail error state hides stale content and retries through App', async ({ page }) => {
  let attempts = 0
  await page.route('**/api/v1/hardware/catalog', route => route.fulfill({ json: {} }))
  await page.route('**/api/v1/articles', route => {
    attempts += 1
    return attempts === 2
      ? route.fulfill({ status: 503, json: {} })
      : route.fulfill({ json: articles })
  })

  await page.goto('/article/7')
  await expect(page.locator('.article-detail-view')).toBeVisible()

  await refreshArticles(page)

  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.locator('.article-detail-view')).toBeHidden()
  await expect(page.locator('[data-test="article-not-found"]')).toBeHidden()
  await page.getByRole('button', { name: 'ลองอีกครั้ง' }).click()

  await expect(page.locator('.article-detail-view')).toBeVisible()
  expect(attempts).toBe(3)
})

test('retries a failed article request through App', async ({ page }) => {
  let attempts = 0
  await page.route('**/api/v1/hardware/catalog', route => route.fulfill({ json: {} }))
  await page.route('**/api/v1/articles', route => {
    attempts += 1
    return attempts === 1
      ? route.fulfill({ status: 503, json: {} })
      : route.fulfill({ json: articles })
  })

  await page.goto('/articles')

  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.locator('[data-test="articles-empty"]')).toBeHidden()
  await page.getByRole('button', { name: 'ลองอีกครั้ง' }).click()

  await expect(page.getByRole('link', { name: /คู่มือจัดสเปค/ })).toBeVisible()
  expect(attempts).toBe(2)
})

test('recovers from an unknown article id', async ({ page }) => {
  await prepare(page)
  await page.goto('/article/404')

  await expect(page.locator('[data-test="article-not-found"]')).toBeVisible()
  await expect(page.getByRole('link', { name: /กลับ.*บทความ/ })).toHaveAttribute('href', '/articles')
})

test('honors reduced motion and shows a failed-cover fallback', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await prepare(page)
  await page.route('**/missing-cover.jpg', route => route.abort())
  await page.goto('/articles')

  await expect(page.locator('.hero-article .article-image-fallback')).toBeVisible()
  const duration = await page.locator('.hero-article').evaluate(element => (
    Number.parseFloat(getComputedStyle(element).transitionDuration)
  ))
  expect(duration).toBeLessThanOrEqual(0.01)
})

test('moves focus and announces article destinations after keyboard route navigation', async ({ page }) => {
  await prepare(page)
  await page.goto('/articles')

  const articleLink = page.getByRole('link', { name: /คู่มือจัดสเปค/ })
  await tabTo(page, articleLink)
  await page.keyboard.press('Enter')

  const detailMain = page.locator('main.article-detail-view')
  await expect(page).toHaveURL(/\/article\/7$/)
  await expect(detailMain).toBeFocused()
  await expect(page.locator('[data-test="route-announcement"]')).toContainText('คู่มือจัดสเปค')

  const backLink = page.getByRole('link', { name: /กลับไปหน้าบทความ/ }).first()
  await page.keyboard.press('Tab')
  await expect(backLink).toBeFocused()
  await page.keyboard.press('Enter')

  const articlesMain = page.locator('main.articles-view')
  await expect(page).toHaveURL(/\/articles$/)
  await expect(articlesMain).toBeFocused()
  await expect(page.locator('[data-test="route-announcement"]')).toHaveText('บทความและความรู้')
})

test('makes trusted rich tables keyboard-scrollable without trusting author attributes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await prepare(page)
  await page.goto('/article/7')

  const region = page.getByRole('region', { name: 'ตารางข้อมูลบทความ 1' })
  const table = region.locator('table')
  await expect(region).toHaveAttribute('tabindex', '0')
  await expect(table).not.toHaveAttribute('tabindex', '8')
  await expect(table).not.toHaveAttribute('role', 'presentation')
  await expect(table).not.toHaveAttribute('aria-label', 'Spoofed')
  expect(await region.evaluate(element => element.scrollWidth)).toBeGreaterThan(
    await region.evaluate(element => element.clientWidth)
  )

  const lastCell = page.getByRole('cell', { name: 'FINAL-OFFSCREEN-SPECIFICATION' })
  const lastCellHandle = await lastCell.elementHandle()
  const initiallyOffscreen = await region.evaluate((element, cell) => (
    cell.getBoundingClientRect().right > element.getBoundingClientRect().right + 1
  ), lastCellHandle)
  expect(initiallyOffscreen).toBe(true)

  await region.focus()
  await expect(region).toBeFocused()
  for (let index = 0; index < 30; index += 1) await page.keyboard.press('ArrowRight')

  await expect.poll(() => region.evaluate(element => element.scrollLeft)).toBeGreaterThan(0)
  await expect.poll(() => region.evaluate((element, cell) => (
    cell.getBoundingClientRect().right <= element.getBoundingClientRect().right + 1
  ), lastCellHandle)).toBe(true)
  await expectNoPageOverflow(page)
})

test('bounds a successfully loaded phone feature cover', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  const coveredArticles = [{ ...articles[0], image_url: '/successful-cover.svg' }, ...articles.slice(1)]
  await page.route('**/api/v1/hardware/catalog', route => route.fulfill({ json: {} }))
  await page.route('**/api/v1/articles', route => route.fulfill({ json: coveredArticles }))
  await page.route('**/successful-cover.svg', route => route.fulfill({
    contentType: 'image/svg+xml',
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="1200"><rect width="600" height="1200" fill="#3ecf8e"/></svg>'
  }))

  await page.goto('/articles')

  const imageBox = await page.locator('.hero-article .hero-image').boundingBox()
  const cover = page.locator('.hero-article .hero-image img')
  const coverBox = await cover.boundingBox()
  expect(imageBox).not.toBeNull()
  expect(coverBox).not.toBeNull()
  expect(imageBox.height).toBeLessThanOrEqual(190)
  expect(imageBox.width / imageBox.height).toBeCloseTo(16 / 10, 1)
  expect(coverBox.width).toBeCloseTo(imageBox.width, 0)
  expect(coverBox.height).toBeCloseTo(imageBox.height, 0)
  await expect(cover).toHaveCSS('object-fit', 'cover')
  await expectNoPageOverflow(page)
})

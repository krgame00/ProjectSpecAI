import { expect, test } from '@playwright/test'

const articles = [{
  id: 7,
  title: 'คู่มือจัดสเปคที่มีชื่อยาวมากสำหรับหน้าจอขนาดเล็ก',
  content: '<h2>เริ่มต้น</h2><p>เนื้อหา</p><table><tbody><tr><td>LONG-HARDWARE-ID-WITHOUT-SPACES</td></tr></tbody></table>',
  image_url: '/missing-cover.jpg',
  created_at: '2026-08-13T00:00:00.000Z'
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
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 }
]) {
  test(`articles reflow at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await prepare(page)
    await page.goto('/articles')

    const articleLink = page.getByRole('link', { name: /คู่มือจัดสเปค/ })
    await expect(articleLink).toBeVisible()
    await expectNoPageOverflow(page)

    await articleLink.focus()
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

  await expect(page.locator('.article-image-fallback')).toBeVisible()
  const duration = await page.locator('.hero-article').evaluate(element => (
    Number.parseFloat(getComputedStyle(element).transitionDuration)
  ))
  expect(duration).toBeLessThanOrEqual(0.01)
})

import { expect, test } from '@playwright/test'

test.use({ timezoneId: 'Asia/Bangkok' })

const profile = {
  name: 'สมาชิก PCSpec',
  email: 'very-long-member-address-for-overflow@example.com',
  role: 'customer',
  created_at: '2026-08-13T00:00:00.000Z'
}

const deferred = () => {
  let resolve
  const promise = new Promise(resolvePromise => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

const authenticate = async page => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'e2e-token')
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Member', role: 'customer' }))
  })
  await page.route('**/api/v1/hardware/catalog', route => route.fulfill({ json: {} }))
  await page.route('**/api/v1/articles', route => route.fulfill({ json: [] }))
}

const expectNoPageOverflow = async page => {
  const dimensions = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    width: document.documentElement.clientWidth
  }))
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width)
}

const expectRootPath = async page => {
  await expect.poll(() => page.evaluate(() => window.location.pathname)).toBe('/')
}

const contrastRatio = locator => locator.evaluate(element => {
  const parseColor = value => {
    const channels = value.match(/[\d.]+/g)?.map(Number) || []
    return [channels[0] || 0, channels[1] || 0, channels[2] || 0, channels[3] ?? 1]
  }
  const composite = (front, back) => {
    const alpha = front[3] + back[3] * (1 - front[3])
    if (alpha === 0) return [0, 0, 0, 0]
    return [
      (front[0] * front[3] + back[0] * back[3] * (1 - front[3])) / alpha,
      (front[1] * front[3] + back[1] * back[3] * (1 - front[3])) / alpha,
      (front[2] * front[3] + back[2] * back[3] * (1 - front[3])) / alpha,
      alpha
    ]
  }
  const luminance = color => color.slice(0, 3)
    .map(channel => channel / 255)
    .map(channel => channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0)

  let background = [0, 0, 0, 0]
  for (let node = element; node; node = node.parentElement) {
    background = composite(background, parseColor(getComputedStyle(node).backgroundColor))
    if (background[3] >= 0.999) break
  }
  background = composite(background, [255, 255, 255, 1])
  const foregroundLuminance = luminance(parseColor(getComputedStyle(element).color))
  const backgroundLuminance = luminance(background)
  const lighter = Math.max(foregroundLuminance, backgroundLuminance)
  const darker = Math.min(foregroundLuminance, backgroundLuminance)
  return (lighter + 0.05) / (darker + 0.05)
})

const expectVisibleFocusIndicator = async locator => {
  const focusStyle = await locator.evaluate(element => {
    const style = getComputedStyle(element)
    return {
      color: style.outlineColor,
      style: style.outlineStyle,
      width: Number.parseFloat(style.outlineWidth)
    }
  })
  expect(focusStyle.style).not.toBe('none')
  expect(focusStyle.color).not.toBe('rgba(0, 0, 0, 0)')
  expect(focusStyle.width).toBeGreaterThanOrEqual(2)
}

const tabTo = async (page, target, maxTabs = 30) => {
  for (let index = 0; index < maxTabs; index += 1) {
    await page.keyboard.press('Tab')
    if (await target.evaluate(element => element === document.activeElement)) return
  }
  throw new Error(`Target was not reached after ${maxTabs} Tab presses`)
}

for (const viewport of [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 }
]) {
  test(`profile remains readable at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await authenticate(page)
    await page.route('**/api/v1/auth/profile', route => route.fulfill({ json: profile }))

    await page.goto('/profile')

    const header = page.locator('header.profile-header')
    await expect(header.getByText('บัญชีสมาชิก', { exact: true })).toBeVisible()
    await expect(header.getByRole('heading', { level: 1, name: 'ข้อมูลโปรไฟล์' })).toBeVisible()
    await expect(page.locator('.profile-details dt')).toHaveText([
      'ชื่อผู้ใช้งาน',
      'อีเมล',
      'สถานะบัญชี',
      'วันที่สมัคร'
    ])
    await expect(page.getByText(profile.email, { exact: true })).toBeVisible()
    await expect(page.locator('.profile-details dd').last()).toHaveText('13/8/2569')
    await expectNoPageOverflow(page)

    const signout = page.locator('.profile-danger-zone').getByRole('button', { name: 'ออกจากระบบ' })
    const box = await signout.boundingBox()
    expect(box).not.toBeNull()
    expect(box.width).toBeGreaterThanOrEqual(44)
    expect(box.height).toBeGreaterThanOrEqual(44)
  })
}

test('shows explicit fallbacks for missing profile values', async ({ page }) => {
  await authenticate(page)
  await page.route('**/api/v1/auth/profile', route => route.fulfill({
    json: { name: '', email: '', role: '', created_at: 'not-a-date' }
  }))

  await page.goto('/profile')

  await expect(page.locator('.profile-details dd')).toHaveText(['-', '-', '-', '-'])
})

test('retries the profile request after a server failure', async ({ page }) => {
  await authenticate(page)
  let attempts = 0
  await page.route('**/api/v1/auth/profile', route => {
    attempts += 1
    return attempts === 1
      ? route.fulfill({ status: 503, json: {} })
      : route.fulfill({ json: { ...profile, name: 'Recovered', email: 'ok@example.com' } })
  })

  await page.goto('/profile')

  await expect(page.getByRole('alert')).toContainText('503')
  await page.getByRole('button', { name: 'ลองอีกครั้ง' }).click()
  await expect(page.getByText('ok@example.com', { exact: true })).toBeVisible()
  expect(attempts).toBe(2)
})

test('preserves the populated profile footprint while its request is loading', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await authenticate(page)
  const releaseProfile = deferred()
  await page.route('**/api/v1/auth/profile', async route => {
    await releaseProfile.promise
    await route.fulfill({ json: profile })
  })

  await page.goto('/profile')

  const loading = page.locator('[data-test="profile-loading"]')
  await expect(loading).toBeVisible()
  const loadingBox = await loading.boundingBox()
  expect(loadingBox).not.toBeNull()

  releaseProfile.resolve()
  await expect(page.locator('.profile-details:not(.profile-details-skeleton)')).toBeVisible()
  const populatedHeight = await page.evaluate(() => {
    const details = document.querySelector('.profile-details:not(.profile-details-skeleton)')
    const action = document.querySelector('.profile-danger-zone:not(.profile-danger-zone-skeleton)')
    return action.getBoundingClientRect().bottom - details.getBoundingClientRect().top
  })

  expect(loadingBox.height).toBeGreaterThanOrEqual(populatedHeight - 2)
})

for (const status of [401, 404]) {
  test(`clears a terminal ${status} profile session and leaves profile`, async ({ page }) => {
    await authenticate(page)
    await page.route('**/api/v1/auth/profile', route => route.fulfill({ status, json: {} }))

    await page.goto('/profile')

    await expectRootPath(page)
    await expect.poll(() => page.evaluate(() => localStorage.getItem('token'))).toBeNull()
    await expect.poll(() => page.evaluate(() => localStorage.getItem('user'))).toBeNull()
  })
}

test('routes a missing-token visit away before requesting the profile', async ({ page }) => {
  await page.route('**/api/v1/hardware/catalog', route => route.fulfill({ json: {} }))
  await page.route('**/api/v1/articles', route => route.fulfill({ json: [] }))
  let profileRequests = 0
  await page.route('**/api/v1/auth/profile', route => {
    profileRequests += 1
    return route.fulfill({ json: profile })
  })

  await page.goto('/profile')

  await expectRootPath(page)
  expect(profileRequests).toBe(0)
})

test('restores a visible focus indicator after a repeated recoverable failure', async ({ page }) => {
  await authenticate(page)
  const releaseRetry = deferred()
  let attempts = 0
  await page.route('**/api/v1/auth/profile', async route => {
    attempts += 1
    if (attempts === 2) await releaseRetry.promise
    await route.fulfill({ status: 503, json: {} })
  })
  await page.goto('/profile')

  const retry = page.locator('[data-test="profile-retry"]')
  await tabTo(page, retry)
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-test="profile-loading"]')).toBeVisible()
  releaseRetry.resolve()

  await expect(retry).toBeVisible()
  await expect(retry).toBeFocused()
  await expectVisibleFocusIndicator(retry)
  expect(attempts).toBe(2)
})

test('keeps profile danger text at AA contrast at rest and hover', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await authenticate(page)
  let attempts = 0
  await page.route('**/api/v1/auth/profile', route => {
    attempts += 1
    return attempts === 1
      ? route.fulfill({ status: 503, json: {} })
      : route.fulfill({ json: profile })
  })
  await page.goto('/profile')

  const errorText = page.locator('.profile-error p')
  await expect(errorText).toBeVisible()
  expect(await contrastRatio(errorText)).toBeGreaterThanOrEqual(4.5)

  await page.locator('[data-test="profile-retry"]').click()
  const signout = page.locator('[data-test="profile-signout"]')
  await expect(signout).toBeVisible()
  expect(await contrastRatio(signout)).toBeGreaterThanOrEqual(4.5)
  await signout.hover()
  expect(await contrastRatio(signout)).toBeGreaterThanOrEqual(4.5)
})

test('remains readable without clipping at 200% zoom', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await authenticate(page)
  await page.route('**/api/v1/auth/profile', route => route.fulfill({ json: profile }))
  await page.goto('/profile')

  const heading = page.locator('header.profile-header h1')
  const defaultHeadingSize = await heading.evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize))
  await page.evaluate(() => {
    const root = document.documentElement
    const styles = getComputedStyle(root)
    for (const token of [
      '--text-xs', '--text-sm', '--text-base', '--text-md', '--text-lg',
      '--text-xl', '--text-2xl', '--text-3xl', '--text-4xl'
    ]) {
      root.style.setProperty(token, `${Number.parseFloat(styles.getPropertyValue(token)) * 2}px`)
    }
  })

  expect(await heading.evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize)))
    .toBeCloseTo(defaultHeadingSize * 2)
  await expectNoPageOverflow(page)
  await expect(page.getByText(profile.email, { exact: true })).toBeVisible()
  await expect(page.locator('[data-test="profile-signout"]')).toBeVisible()
  const clipped = await page
    .locator('.profile-card, h1, dt, dd, [data-test="profile-signout"]')
    .evaluateAll(elements => elements
      .filter(element => {
        const overflowY = getComputedStyle(element).overflowY
        return element.scrollWidth > element.clientWidth + 1
          || (['hidden', 'clip'].includes(overflowY) && element.scrollHeight > element.clientHeight + 1)
      })
      .map(element => element.tagName))
  expect(clipped).toEqual([])
})

test('removes profile transitions when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await authenticate(page)
  await page.route('**/api/v1/auth/profile', route => route.fulfill({ json: profile }))
  await page.goto('/profile')

  const signout = page.locator('[data-test="profile-signout"]')
  const defaultDuration = await signout.evaluate(element => Number.parseFloat(getComputedStyle(element).transitionDuration))
  expect(defaultDuration).toBeGreaterThan(0)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  const reducedDuration = await signout.evaluate(element => Number.parseFloat(getComputedStyle(element).transitionDuration))
  expect(reducedDuration).toBeLessThanOrEqual(0.00001)
})

test('signs out with the keyboard', async ({ page }) => {
  await authenticate(page)
  await page.route('**/api/v1/auth/profile', route => route.fulfill({ json: profile }))
  await page.goto('/profile')

  const signout = page.locator('.profile-danger-zone').getByRole('button', { name: 'ออกจากระบบ' })
  await expect(signout).toBeVisible()
  await tabTo(page, signout)
  await expect(signout).toBeFocused()
  await expectVisibleFocusIndicator(signout)
  await page.keyboard.press('Enter')

  await expectRootPath(page)
  await expect.poll(() => page.evaluate(() => localStorage.getItem('token'))).toBeNull()
  await expect.poll(() => page.evaluate(() => localStorage.getItem('user'))).toBeNull()
})

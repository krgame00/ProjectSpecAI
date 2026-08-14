import { expect, test } from '@playwright/test'

test.use({ timezoneId: 'Asia/Bangkok' })

const profile = {
  name: 'สมาชิก PCSpec',
  email: 'very-long-member-address-for-overflow@example.com',
  role: 'customer',
  created_at: '2026-08-13T00:00:00.000Z'
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

    const header = page.locator('.profile-header')
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

test('clears an unauthorized session and leaves profile', async ({ page }) => {
  await authenticate(page)
  await page.route('**/api/v1/auth/profile', route => route.fulfill({ status: 401, json: {} }))

  await page.goto('/profile')

  await expect(page).toHaveURL(/\/$/)
  await expect.poll(() => page.evaluate(() => localStorage.getItem('token'))).toBeNull()
  await expect.poll(() => page.evaluate(() => localStorage.getItem('user'))).toBeNull()
})

test('routes a missing-token visit away before requesting the profile', async ({ page }) => {
  await page.route('**/api/v1/hardware/catalog', route => route.fulfill({ json: {} }))
  await page.route('**/api/v1/articles', route => route.fulfill({ json: [] }))
  let profileRequests = 0
  await page.route('**/api/v1/auth/profile', route => {
    profileRequests += 1
    return route.fulfill({ json: profile })
  })

  await page.goto('/profile')

  await expect(page).toHaveURL(/\/$/)
  expect(profileRequests).toBe(0)
})

test('signs out with the keyboard', async ({ page }) => {
  await authenticate(page)
  await page.route('**/api/v1/auth/profile', route => route.fulfill({ json: profile }))
  await page.goto('/profile')

  const signout = page.locator('.profile-danger-zone').getByRole('button', { name: 'ออกจากระบบ' })
  await expect(signout).toBeVisible()
  await tabTo(page, signout)
  await expect(signout).toBeFocused()
  await page.keyboard.press('Enter')

  await expect(page).toHaveURL(/\/$/)
  await expect.poll(() => page.evaluate(() => localStorage.getItem('token'))).toBeNull()
  await expect.poll(() => page.evaluate(() => localStorage.getItem('user'))).toBeNull()
})

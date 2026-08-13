# Member Profile Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a responsive, view-only member profile that uses the shared authentication lifecycle and provides recoverable request states.

**Architecture:** Keep profile data local to `ProfileView.vue`, but use the Pinia auth store as the sole source of token and logout state. Separate fetch/session behavior from the template through a small `loadProfile()` action, then render semantic loading, error, identity, account-information, and sign-out regions.

**Tech Stack:** Vue 3 Composition API, Pinia 3, Vue Router 4, Vitest, Vue Test Utils, Playwright, CSS custom properties

## Global Constraints

- Preserve the system font, restrained Emerald accent, dark surfaces, hairline borders, and compact radii used by the Builder.
- Support 320 px, 390 px, 768 px, 1024 px, and desktop viewports without page-level horizontal scrolling.
- Use the existing `/api/v1/auth/profile` contract and the shared auth store.
- Keep loading, recoverable failure, unauthorized session, and populated states distinct.
- Keep Profile view-only; do not add editing, avatar upload, password change, or account deletion.
- Do not modify Admin or backend schemas.

---

### Task 1: Shared profile session and retry behavior

**Files:**
- Modify: `frontend/src/views/ProfileView.vue`
- Create: `frontend/tests/ProfileView.test.js`

**Interfaces:**
- Consumes: `useAuthStore().token`, `useAuthStore().logout()`, `GET /api/v1/auth/profile`, and `router.replace('/')`.
- Produces: local `profile`, `loading`, `error`; `loadProfile(): Promise<void>`; Retry and Sign out actions.

- [ ] **Step 1: Write failing request and session tests**

```js
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { routerKey } from 'vue-router'
import ProfileView from '../src/views/ProfileView.vue'
import { useAuthStore } from '../src/stores/auth'

let pinia
const mountProfile = router => mount(ProfileView, {
  global: { plugins: [pinia], provide: { [routerKey]: router } }
})

describe('ProfileView', () => {
  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(key => key === 'token' ? 'token-1' : key === 'user' ? JSON.stringify({ id: 1, name: 'Member' }) : null),
      setItem: vi.fn(),
      removeItem: vi.fn()
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  test('uses the auth token and renders returned profile data', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ name: 'Member', email: 'member@example.com', role: 'customer' }) })
    const wrapper = mountProfile({ replace: vi.fn() })
    await flushPromises()
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/auth/profile'), expect.objectContaining({ headers: { Authorization: 'Bearer token-1' } }))
    expect(wrapper.text()).toContain('member@example.com')
  })

  test('keeps a network failure in place and retries', async () => {
    global.fetch = vi.fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ name: 'Recovered', email: 'ok@example.com', role: 'customer' }) })
    const wrapper = mountProfile({ replace: vi.fn() })
    await flushPromises()
    await wrapper.get('[data-test="profile-retry"]').trigger('click')
    await flushPromises()
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('ok@example.com')
  })

  test('logs out and replaces the route immediately on 401', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401 })
    const router = { replace: vi.fn() }
    const wrapper = mountProfile(router)
    const auth = useAuthStore()
    const logout = vi.spyOn(auth, 'logout')
    await flushPromises()
    expect(logout).toHaveBeenCalledOnce()
    expect(router.replace).toHaveBeenCalledWith('/')
    expect(wrapper.find('[data-test="profile-retry"]').exists()).toBe(false)
  })
})
```

- [ ] **Step 2: Run the profile test and verify failure**

Run: `cd frontend && npm test -- ProfileView.test.js`

Expected: FAIL because the view reads localStorage directly, delays unauthorized navigation, and has no Retry action.

- [ ] **Step 3: Implement one explicit load path using the auth store**

```js
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const profile = ref(null)
const loading = ref(true)
const error = ref(null)

async function loadProfile() {
  if (!authStore.token) {
    await router.replace('/')
    return
  }
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (response.status === 401) {
      authStore.logout()
      await router.replace('/')
      return
    }
    if (!response.ok) throw new Error(`โหลดข้อมูลโปรไฟล์ไม่สำเร็จ (${response.status})`)
    profile.value = await response.json()
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'โหลดข้อมูลโปรไฟล์ไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

function logout() {
  authStore.logout()
  router.replace('/')
}

onMounted(loadProfile)
```

Use the same development API default as `App.vue`: `http://localhost:3001/api/v1`. Remove direct localStorage mutation, `setTimeout`, and `window.location.href`/reload behavior.

- [ ] **Step 4: Run profile and auth-store tests**

Run: `cd frontend && npm test -- ProfileView.test.js authStore.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/views/ProfileView.vue frontend/tests/ProfileView.test.js
git commit -m "fix(profile): unify session handling"
```

### Task 2: Responsive semantic profile presentation

**Files:**
- Modify: `frontend/src/views/ProfileView.vue`
- Modify: `frontend/tests/ProfileView.test.js`

**Interfaces:**
- Consumes: the `profile`, `loading`, and `error` states from Task 1.
- Produces: semantic `main`, identity header, `dl` account fields, `role=status`, `role=alert`, and separated Sign out region.

- [ ] **Step 1: Add failing semantic structure tests**

```js
test('renders account details as a description list and separates sign out', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ name: 'Member', email: 'very-long-member-address@example.com', role: 'customer', created_at: '2026-08-13T00:00:00.000Z' })
  })
  const wrapper = mountProfile({ replace: vi.fn() })
  await flushPromises()
  expect(wrapper.get('main[aria-labelledby="profile-title"]').exists()).toBe(true)
  expect(wrapper.get('dl.profile-details').findAll('dt')).toHaveLength(4)
  expect(wrapper.get('dl.profile-details').findAll('dd')).toHaveLength(4)
  expect(wrapper.get('[data-test="profile-signout"]').element.closest('.profile-danger-zone')).toBeTruthy()
})

test('exposes loading and recoverable failure to assistive technology', async () => {
  let rejectRequest
  global.fetch = vi.fn(() => new Promise((_, reject) => { rejectRequest = reject }))
  const wrapper = mountProfile({ replace: vi.fn() })
  expect(wrapper.get('[role="status"]').attributes('aria-live')).toBe('polite')
  rejectRequest(new Error('offline'))
  await flushPromises()
  expect(wrapper.get('[role="alert"]').text()).toContain('offline')
})
```

- [ ] **Step 2: Run the profile test and verify failure**

Run: `cd frontend && npm test -- ProfileView.test.js`

Expected: FAIL because the current information rows use paragraphs and state containers lack the required semantics.

- [ ] **Step 3: Implement the Reading-first profile layout**

```vue
<main class="container profile-page" aria-labelledby="profile-title">
  <section class="profile-card">
    <header class="profile-header">
      <p class="profile-eyebrow">บัญชีสมาชิก</p>
      <h1 id="profile-title">ข้อมูลโปรไฟล์</h1>
    </header>
    <div v-if="loading" class="profile-state" role="status" aria-live="polite">กำลังโหลดข้อมูลโปรไฟล์</div>
    <div v-else-if="error" class="profile-state" role="alert">
      <p>{{ error }}</p>
      <button data-test="profile-retry" class="btn btn-primary" @click="loadProfile">ลองอีกครั้ง</button>
    </div>
    <template v-else-if="profile">
      <dl class="profile-details">
        <div><dt>ชื่อผู้ใช้งาน</dt><dd>{{ profile.name || '-' }}</dd></div>
        <div><dt>อีเมล</dt><dd>{{ profile.email || '-' }}</dd></div>
        <div><dt>สถานะบัญชี</dt><dd><span class="badge">{{ profile.role || '-' }}</span></dd></div>
        <div><dt>วันที่สมัคร</dt><dd>{{ formattedCreatedAt }}</dd></div>
      </dl>
      <footer class="profile-danger-zone">
        <button data-test="profile-signout" class="btn btn-outline-danger" @click="logout">ออกจากระบบ</button>
      </footer>
    </template>
  </section>
</main>
```

Use `Intl.DateTimeFormat('th-TH')` in a computed value. Remove inline layout utilities from the component. At phone widths, stack every `dt`/`dd`, set `min-width: 0`, and use `overflow-wrap: anywhere` on values. At wider widths, use a bounded two-column grid. Keep the card width near 44rem, reduce phone padding with `clamp()`, provide 44 px actions, and use `:focus-visible` plus reduced-motion-safe styling.

```js
const formattedCreatedAt = computed(() => {
  if (!profile.value?.created_at) return '-'
  const date = new Date(profile.value.created_at)
  return Number.isNaN(date.getTime()) ? '-' : new Intl.DateTimeFormat('th-TH').format(date)
})
```

- [ ] **Step 4: Run profile component tests**

Run: `cd frontend && npm test -- ProfileView.test.js authStore.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/views/ProfileView.vue frontend/tests/ProfileView.test.js
git commit -m "feat(profile): add responsive account view"
```

### Task 3: Profile responsive browser coverage

**Files:**
- Create: `frontend/e2e/profile-responsive.spec.js`

**Interfaces:**
- Consumes: authenticated `/profile`, mocked profile API, existing Vue Router auth guard, and existing Playwright servers.
- Produces: regression coverage for responsive information layout, Retry, logout, unauthorized routing, focus, and overflow.

- [ ] **Step 1: Write profile E2E coverage**

```js
import { expect, test } from '@playwright/test'

const authenticate = async page => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'e2e-token')
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Member', role: 'customer' }))
  })
  await page.route('**/api/v1/hardware/catalog', route => route.fulfill({ json: {} }))
  await page.route('**/api/v1/articles', route => route.fulfill({ json: [] }))
}

for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1440, height: 900 }]) {
  test(`profile remains readable at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await authenticate(page)
    await page.route('**/api/v1/auth/profile', route => route.fulfill({ json: {
      name: 'สมาชิก PCSpec',
      email: 'very-long-member-address-for-overflow@example.com',
      role: 'customer',
      created_at: '2026-08-13T00:00:00.000Z'
    } }))
    await page.goto('/profile')
    await expect(page.getByRole('heading', { name: 'ข้อมูลโปรไฟล์' })).toBeVisible()
    const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: document.documentElement.clientWidth }))
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width)
    const signout = page.getByRole('button', { name: 'ออกจากระบบ' })
    const box = await signout.boundingBox()
    expect(box.width).toBeGreaterThanOrEqual(44)
    expect(box.height).toBeGreaterThanOrEqual(44)
  })
}
```

Add separate recovery, unauthorized, and keyboard sign-out tests:

```js
test('retries the profile request after a server failure', async ({ page }) => {
  await authenticate(page)
  let attempts = 0
  await page.route('**/api/v1/auth/profile', route => {
    attempts += 1
    return attempts === 1
      ? route.fulfill({ status: 503, json: {} })
      : route.fulfill({ json: { name: 'Recovered', email: 'ok@example.com', role: 'customer' } })
  })
  await page.goto('/profile')
  await page.getByRole('button', { name: 'ลองอีกครั้ง' }).click()
  await expect(page.getByText('ok@example.com')).toBeVisible()
})

test('clears an unauthorized session and leaves profile', async ({ page }) => {
  await authenticate(page)
  await page.route('**/api/v1/auth/profile', route => route.fulfill({ status: 401, json: {} }))
  await page.goto('/profile')
  await expect(page).toHaveURL(/\/$/)
  await expect.poll(() => page.evaluate(() => localStorage.getItem('token'))).toBeNull()
})

test('signs out with the keyboard', async ({ page }) => {
  await authenticate(page)
  await page.route('**/api/v1/auth/profile', route => route.fulfill({ json: { name: 'Member', email: 'member@example.com', role: 'customer' } }))
  await page.goto('/profile')
  const signout = page.getByRole('button', { name: 'ออกจากระบบ' })
  await signout.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/$/)
  await expect.poll(() => page.evaluate(() => localStorage.getItem('token'))).toBeNull()
})
```

- [ ] **Step 2: Run responsive browser coverage**

Run: `cd frontend && npx playwright test --config=e2e/playwright.config.js profile-responsive.spec.js`

Expected: PASS because Tasks 1-2 already provide the required state, keyboard, session, and overflow behavior.

- [ ] **Step 3: Run focused and full verification**

Run:

```bash
cd frontend
npm test -- ProfileView.test.js authStore.test.js App.test.js
npx playwright test --config=e2e/playwright.config.js profile-responsive.spec.js
npm test
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 4: Commit**

```bash
git add frontend/e2e/profile-responsive.spec.js frontend/src/views/ProfileView.vue
git commit -m "test(profile): cover responsive account"
```

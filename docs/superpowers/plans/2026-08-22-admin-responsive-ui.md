# Admin Responsive UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all Admin sections usable from 320px mobile through large desktop widths while preserving the restored CRUD behavior.

**Architecture:** Keep Admin data, mutations, and handlers in `AdminDashboard.vue`. Add semantic tab navigation and two responsive presentations over the same collections: mobile cards up to 640px, responsive tables above 640px. Consolidate fixed inline layout into scoped classes so toolbars, forms, and dialogs reflow at explicit breakpoints without changing store or API contracts.

**Tech Stack:** Vue 3 SFC, Pinia, Vitest, Vue Test Utils, Playwright, scoped CSS

**Spec:** `docs/superpowers/specs/2026-08-22-admin-responsive-ui-design.md`

## Global Constraints

- Existing Admin routes, CRUD contracts, authorization, and production data remain unchanged.
- No dependency, API, backend, database, or schema changes.
- Mobile is 320–640px; tablet is 641–1024px; desktop is above 1024px.
- Mobile uses sticky horizontal tabs and collection cards.
- Tablet uses sticky horizontal tabs and labelled scrollable tables.
- Desktop retains a compact sidebar and full tables.
- Mobile controls have at least a 44px target; focus remains visible; reduced motion is respected.
- Do not modify or clean up production records.

---

### Task 1: Semantic responsive Admin shell

**Files:**
- Modify: `frontend/src/components/AdminDashboard.vue:1-54, 764-840`
- Test: `frontend/tests/AdminDashboard.test.js`

**Interfaces:**
- Consumes: existing `adminTab: Ref<'dashboard'|'orders'|'inventory'|'articles'|'users'|'profile'>`
- Produces: `.admin-tabs[role="tablist"]`, buttons with `role="tab"`, `aria-selected`, `aria-controls`, and matching panels with `role="tabpanel"`

- [ ] **Step 1: Write failing shell semantics tests**

Add focused tests that mount the real dashboard and assert the public DOM contract:

```js
test('exposes each Admin section as an accessible tab and panel', async () => {
  const wrapper = mountDashboard()
  const tabs = wrapper.findAll('[role="tab"]')
  expect(tabs).toHaveLength(6)
  expect(tabs[0].attributes('aria-selected')).toBe('true')
  await tabs[2].trigger('click')
  expect(tabs[2].attributes('aria-selected')).toBe('true')
  expect(wrapper.get('#admin-panel-inventory').attributes('role')).toBe('tabpanel')
})

test('uses buttons instead of clickable list items for Admin navigation', () => {
  const wrapper = mountDashboard()
  expect(wrapper.findAll('.admin-menu > li > button')).toHaveLength(6)
})
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `npm.cmd test -- AdminDashboard.test.js`

Expected: FAIL because the current navigation has clickable `li` elements and no tab semantics or panel IDs.

- [ ] **Step 3: Implement the semantic shell**

Convert each menu item to a button and apply one consistent tab contract:

```vue
<ul class="admin-menu admin-tabs" role="tablist" aria-label="ส่วนจัดการระบบ">
  <li v-for="tab in adminTabs" :key="tab.id" role="presentation">
    <button
      type="button"
      role="tab"
      :id="`admin-tab-${tab.id}`"
      :aria-controls="`admin-panel-${tab.id}`"
      :aria-selected="adminTab === tab.id"
      :class="{ active: adminTab === tab.id }"
      @click="selectAdminTab(tab.id)"
    >
      <span aria-hidden="true">{{ tab.icon }}</span>
      <span>{{ tab.label }}</span>
    </button>
  </li>
</ul>
```

Define the fixed `adminTabs` metadata and `selectAdminTab(id)` in script setup; it calls `fetchUsers()` only when `id === 'users'`. Add `role="tabpanel"`, stable IDs, and `aria-labelledby` to each existing section wrapper.

Prepare class hooks for the later breakpoint task, but keep this task semantic. Active state uses surface, border, and text instead of a left stripe.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm.cmd test -- AdminDashboard.test.js`

Expected: all AdminDashboard component tests pass.

- [ ] **Step 5: Commit the shell**

```bash
git add frontend/src/components/AdminDashboard.vue frontend/tests/AdminDashboard.test.js
git commit -m "feat(admin): add responsive navigation"
```

---

### Task 2: Hybrid collection views and responsive toolbars

**Files:**
- Modify: `frontend/src/components/AdminDashboard.vue:55-230, 782-813`
- Test: `frontend/tests/AdminDashboard.test.js`

**Interfaces:**
- Consumes: existing `users`, `orders`, `catalog[inventoryCategory]`, `articles`, pending IDs, and mutation handlers
- Produces: `.admin-table-region[tabindex="0"]`, `.admin-mobile-list`, domain card selectors, `.admin-toolbar`, and `.admin-actions`

- [ ] **Step 1: Write failing hybrid-view tests**

Add one fixture with a user, order, product, and article. Assert both presentations are backed by the same values and actions:

```js
const collectionProps = {
  orders: [{ id: 'ORD-1', customer_name: 'Buyer', total_price: 9990, status: 'pending', build_items: {} }],
  categories: [{ id: 'cpu', name: 'CPU' }],
  catalog: { cpu: [{ id: 7, name: 'Typed CPU', price: 5000, socket: 'AM5' }] },
  articles: [{ id: 10, title: 'Fixture Article', image: '/cover.png', date: '2026-08-20' }],
  currentUser: { id: 1, name: 'Admin', role: 'admin' }
}

test.each([
  ['orders', '[data-test="order-card-ORD-1"]', 'ORD-1'],
  ['inventory', '[data-test="product-card-7"]', 'Typed CPU'],
  ['articles', '[data-test="article-card-10"]', 'Fixture Article'],
  ['users', '[data-test="user-card-2"]', 'Member One']
])('renders a mobile summary card for %s', async (tab, selector, text) => {
  const wrapper = mountDashboard(collectionProps)
  await wrapper.get(`#admin-tab-${tab}`).trigger('click')
  expect(wrapper.get(selector).text()).toContain(text)
})

test('labels each desktop table as a keyboard-scrollable region', async () => {
  const wrapper = mountDashboard(collectionProps)
  await wrapper.get('#admin-tab-inventory').trigger('click')
  const region = wrapper.get('[data-test="inventory-table-region"]')
  expect(region.attributes('tabindex')).toBe('0')
  expect(region.attributes('aria-label')).toBe('ตารางสินค้า เลื่อนแนวนอนเพื่อดูข้อมูลเพิ่มเติม')
})
```

Also trigger edit/details/role/status actions from a mobile card and assert the existing modal/handler/store result, proving the card is not a read-only duplicate.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm.cmd test -- AdminDashboard.test.js`

Expected: FAIL because mobile cards and labelled table regions do not exist.

- [ ] **Step 3: Implement cards and table regions**

For Users, Orders, Inventory, and Articles:

- Wrap the existing table in `.admin-table-region`, add `tabindex="0"` and a Thai `aria-label`.
- Add an adjacent `.admin-mobile-list` using the same `v-for` source and existing action methods.
- Keep status selectors, edit, details, delete, and role buttons functional and disabled from the same pending state.
- Add explicit empty-state content to both presentations.
- Add `.admin-toolbar` and `.admin-actions` classes and remove fixed inline widths/padding that block reflow.
- Leave both presentations available in the DOM with class hooks; Task 4 owns breakpoint visibility and table scrolling so its browser tests can fail first.

Use the mobile card structure consistently:

```vue
<article class="admin-mobile-card" :data-test="`product-card-${item.id}`">
  <div class="admin-mobile-card__heading">
    <strong>{{ item.name }}</strong>
    <span class="admin-mobile-card__id">#{{ item.id }}</span>
  </div>
  <dl class="admin-mobile-card__facts">
    <div><dt>ราคา</dt><dd>฿{{ item.price.toLocaleString() }}</dd></div>
    <div><dt>สเปค</dt><dd>{{ getProductSummary(item) }}</dd></div>
  </dl>
  <div class="admin-actions">
    <button class="btn btn-outline" @click="openProductModal(item)">แก้ไข</button>
    <button class="btn btn-outline-danger" @click="deleteProduct(item.id)">ลบ</button>
  </div>
</article>
```

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm.cmd test -- AdminDashboard.test.js adminStore.test.js`

Expected: component tests pass and existing CRUD store tests remain green.

- [ ] **Step 5: Commit hybrid collections**

```bash
git add frontend/src/components/AdminDashboard.vue frontend/tests/AdminDashboard.test.js
git commit -m "feat(admin): add mobile collection cards"
```

---

### Task 3: Responsive dashboard, forms, and dialogs

**Files:**
- Modify: `frontend/src/components/AdminDashboard.vue:28-53, 231-428, 790-840`
- Test: `frontend/tests/AdminDashboard.test.js`

**Interfaces:**
- Consumes: existing modal booleans, forms, save flags, close handlers, and Chart component
- Produces: `.admin-form-grid`, `.admin-modal`, `.admin-modal__body`, `.admin-modal__footer`, `.admin-chart-card`, and mobile-safe media rules

- [ ] **Step 1: Write failing structural dialog tests**

```js
test('uses a scrollable modal body and a separate action footer', async () => {
  const wrapper = mountDashboard()
  await wrapper.get('#admin-tab-inventory').trigger('click')
  await wrapper.get('[data-test="add-product"]').trigger('click')
  const modal = wrapper.get('[data-test="product-modal"]')
  expect(modal.get('.admin-modal__body').exists()).toBe(true)
  expect(modal.get('.admin-modal__footer [data-test="save-product"]').exists()).toBe(true)
})

test('uses responsive form grids instead of fixed inline columns', async () => {
  const wrapper = mountDashboard()
  await wrapper.get('#admin-tab-inventory').trigger('click')
  await wrapper.get('[data-test="add-product"]').trigger('click')
  expect(wrapper.findAll('.admin-form-grid').length).toBeGreaterThan(0)
})
```

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm.cmd test -- AdminDashboard.test.js`

Expected: FAIL because modal body/footer and form-grid classes are not present.

- [ ] **Step 3: Implement structural dialog and dashboard CSS**

- Convert product, article, order, and confirmation dialogs to `role="dialog"`, `aria-modal="true"`, labelled headings, `.admin-modal`, `.admin-modal__body`, and `.admin-modal__footer`.
- Replace fixed two-column inline grids with `.admin-form-grid`.
- Keep this task limited to semantic structure and reusable layout classes. Task 4 owns viewport-specific dimensions, column counts, sticky behavior, target sizes, focus styling, and reduced-motion rules so those browser checks are observed RED first.

- [ ] **Step 4: Run focused and full unit tests**

Run: `npm.cmd test -- AdminDashboard.test.js adminStore.test.js adminApi.test.js`

Expected: all focused Admin tests pass.

Run: `npm.cmd test`

Expected: the entire frontend Vitest suite passes.

- [ ] **Step 5: Commit dialogs and forms**

```bash
git add frontend/src/components/AdminDashboard.vue frontend/tests/AdminDashboard.test.js
git commit -m "feat(admin): adapt dialogs for mobile"
```

---

### Task 4: Responsive Admin browser regressions

**Files:**
- Modify: `frontend/e2e/admin.spec.js`

**Interfaces:**
- Consumes: existing `useAdminFixture(page)` and `openAdmin(page)` helpers
- Produces: deterministic 320px, 768px, and 1440px responsive regression scenarios

- [ ] **Step 1: Write failing browser tests for the not-yet-implemented breakpoint behavior**

Add a dedicated responsive describe block:

```js
test('mobile uses sticky tabs, cards, and a viewport-contained dialog', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await useAdminFixture(page)
  await openAdmin(page)
  await expect(page.getByRole('tablist', { name: 'ส่วนจัดการระบบ' })).toHaveCSS('position', 'sticky')
  await page.getByRole('tab', { name: /คลังสินค้า/ }).click()
  await expect(page.locator('[data-test="product-card-1"]')).toBeVisible()
  await expect(page.locator('[data-test="inventory-table-region"]')).toBeHidden()
  await page.locator('[data-test="add-product"]').click()
  const box = await page.locator('[data-test="product-modal"] .admin-modal').boundingBox()
  expect(box.x).toBe(0)
  expect(box.width).toBe(320)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
})

test('tablet keeps tables inside a keyboard-scrollable region', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 })
  await useAdminFixture(page)
  await openAdmin(page)
  await page.getByRole('tab', { name: /คลังสินค้า/ }).click()
  const region = page.locator('[data-test="inventory-table-region"]')
  await expect(region).toBeVisible()
  await region.focus()
  await expect(region).toBeFocused()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(768)
})

test('desktop retains the sidebar and full table presentation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await useAdminFixture(page)
  await openAdmin(page)
  await expect(page.locator('.admin-layout')).toHaveCSS('grid-template-columns', /\d+px .+/)
  await page.getByRole('tab', { name: /จัดการสมาชิก/ }).click()
  await expect(page.locator('[data-test="users-table-region"]')).toBeVisible()
  await expect(page.locator('[data-test="user-card-2"]')).toBeHidden()
})
```

Extend the mobile scenario to Tab through the active section, open a CRUD dialog, reach Cancel/Save without coordinate clicks, and verify real card content after a successful fixture mutation.

- [ ] **Step 2: Run Admin E2E and verify RED for missing responsive behavior**

Run: `npx.cmd playwright test --config=e2e/playwright.config.js e2e/admin.spec.js`

Expected before the final responsive CSS: new viewport tests fail on tab semantics, card visibility, or modal bounds while the four existing CRUD tests still pass.

- [ ] **Step 3: Implement the breakpoint CSS needed for GREEN**

Restrict changes to `AdminDashboard.vue`; do not alter fixture API behavior or relax assertions. Replace the 820px-only rule with explicit 640px and 1024px breakpoints:

- Mobile/tablet navigation is sticky and horizontally scrollable; desktop remains a compact two-column grid.
- Mobile cards display through 640px; table regions display above 640px.
- Tablet table overflow stays inside `.admin-table-region`, with the identity column sticky only when needed.
- Non-confirm mobile dialogs fill `100dvw × 100dvh`; header/footer remain fixed in the dialog while only the body scrolls.
- Footer actions stack at 320px, all mobile targets are at least 44px, and forms become one column.
- Tablet/desktop dialogs are bounded by `min(700px, calc(100vw - 2rem))` and `calc(100dvh - 2rem)`.
- KPI columns are exactly 1/2/3 at mobile/tablet/desktop; chart height uses `clamp()`.
- Add visible `:focus-visible` styles and disable non-essential transitions under `prefers-reduced-motion: reduce`.
- Ensure document-level `scrollWidth` equals viewport width at all three sizes.

- [ ] **Step 4: Run Admin E2E and verify GREEN**

Run: `npx.cmd playwright test --config=e2e/playwright.config.js e2e/admin.spec.js`

Expected: all existing CRUD cases and all new responsive cases pass.

- [ ] **Step 5: Commit browser regressions**

```bash
git add frontend/e2e/admin.spec.js frontend/src/components/AdminDashboard.vue
git commit -m "test(admin): cover responsive workflows"
```

---

### Task 5: Final verification and review

**Files:**
- Verify only; modify production or tests only if a newly reproduced regression receives its own RED/GREEN cycle.

**Interfaces:**
- Consumes: all deliverables from Tasks 1–4
- Produces: verified branch ready for local merge and push when explicitly requested

- [ ] **Step 1: Run focused Admin units**

Run: `npm.cmd test -- AdminDashboard.test.js adminStore.test.js adminApi.test.js`

Expected: all tests pass with no unhandled errors.

- [ ] **Step 2: Run the full frontend suite**

Run: `npm.cmd test`

Expected: all frontend tests pass.

- [ ] **Step 3: Run Admin E2E**

Run: `npx.cmd playwright test --config=e2e/playwright.config.js e2e/admin.spec.js`

Expected: all Admin CRUD and responsive browser tests pass.

- [ ] **Step 4: Build production assets**

Run: `npm.cmd run build`

Expected: Vite production build exits 0.

- [ ] **Step 5: Check diff hygiene and branch state**

Run: `git diff main...HEAD --check`

Expected: no whitespace errors.

Run: `git status --short`

Expected: clean worktree.

- [ ] **Step 6: Review the final diff against the spec**

Confirm every collection has mobile cards and desktop/tablet tables, every breakpoint has no page-level horizontal overflow, all dialogs remain reachable, CRUD handlers are unchanged, and no backend or production-data file is modified.

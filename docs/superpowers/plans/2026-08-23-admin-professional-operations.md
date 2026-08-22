# Admin Professional Operations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the responsive Admin collections into a compact operations console with local search, domain filters, live result counts, dense tables, and mobile-card parity.

**Architecture:** Add pure collection-filter functions in one focused utility module, then consume them through Vue computed values in `AdminDashboard.vue`. Desktop tables and mobile cards render the same filtered computed arrays, while all CRUD handlers and Pinia state remain unchanged. CSS refines hierarchy, density, sticky headers, and actions without a dependency or backend change.

**Tech Stack:** Vue 3 SFC, Pinia, Vitest, Vue Test Utils, Playwright, scoped CSS

**Spec:** `docs/superpowers/specs/2026-08-22-admin-professional-operations-design.md`

## Global Constraints

- No backend search, server pagination, API, route, database, or schema changes.
- Filtering is local, reactive, case-insensitive, trimmed, and never mutates source arrays.
- Multiple controls combine with AND behavior.
- Desktop tables and mobile cards consume the same filtered computed arrays.
- Existing CRUD, pending, error, session-expired, responsive dialog, and production-data behavior remains unchanged.
- No dependency or icon-library addition.
- No production-record creation, update, deletion, or cleanup.

---

### Task 1: Pure Admin collection filters

**Files:**
- Create: `frontend/src/utils/adminCollectionFilters.js`
- Create: `frontend/tests/adminCollectionFilters.test.js`

**Interfaces:**
- Produces: `filterOrders(orders, { query, status })`
- Produces: `filterProducts(products, { query })`
- Produces: `filterArticles(articles, { query, date })`
- Produces: `filterUsers(users, { query, role })`
- All functions return a new filtered array and treat missing arrays as empty.

- [ ] **Step 1: Write failing pure-function tests**

```js
import { describe, expect, test } from 'vitest'
import { filterArticles, filterOrders, filterProducts, filterUsers } from '../src/utils/adminCollectionFilters'

describe('Admin collection filters', () => {
  test('combines trimmed order search and status with AND behavior', () => {
    const orders = [
      { id: 'ORD-1', customer_name: 'Admin Ploy', status: 'assembling' },
      { id: 'ORD-2', customer_name: 'Checkout User', status: 'pending' }
    ]
    expect(filterOrders(orders, { query: '  ploy ', status: 'assembling' })).toEqual([orders[0]])
    expect(orders).toHaveLength(2)
  })

  test('matches product ID, name, and visible summary specification', () => {
    const products = [
      { id: 11038, name: 'AMD Ryzen 5 8400F', socket: 'AM5' },
      { id: 11041, name: 'Intel Core i3 14100', socket: 'LGA1700' }
    ]
    expect(filterProducts(products, { query: '11038' })).toEqual([products[0]])
    expect(filterProducts(products, { query: 'lga1700' })).toEqual([products[1]])
  })

  test('filters articles by title and exact ISO date', () => {
    const articles = [
      { id: 7, title: 'DDR5 vs DDR4', date: '2026-06-28' },
      { id: 8, title: 'SSD PCIe Gen 5', date: '2026-06-29' }
    ]
    expect(filterArticles(articles, { query: 'ddr5', date: '2026-06-28' })).toEqual([articles[0]])
  })

  test('matches users case-insensitively and filters role', () => {
    const users = [
      { id: 1, name: 'Admin Ploy', email: 'admin@test.local', role: 'admin' },
      { id: 2, name: 'Member One', email: 'member@test.local', role: 'customer' }
    ]
    expect(filterUsers(users, { query: 'MEMBER@TEST', role: 'customer' })).toEqual([users[1]])
  })
})
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm.cmd test -- adminCollectionFilters.test.js`

Expected: FAIL because `src/utils/adminCollectionFilters.js` does not exist.

- [ ] **Step 3: Implement minimal immutable filters**

```js
const normalize = value => String(value ?? '').trim().toLocaleLowerCase('th-TH')
const includesQuery = (query, fields) => {
  const term = normalize(query)
  return !term || fields.some(field => normalize(field).includes(term))
}

export const filterOrders = (orders = [], { query = '', status = 'all' } = {}) =>
  orders.filter(order =>
    (status === 'all' || order.status === status) &&
    includesQuery(query, [order.id, order.customer_name, order.customer])
  )

export const filterProducts = (products = [], { query = '' } = {}) =>
  products.filter(product => includesQuery(query, [
    product.id, product.name, product.socket, product.type, product.wattage,
    product.form_factor, product.capacity, product.memory_type
  ]))

export const filterArticles = (articles = [], { query = '', date = '' } = {}) =>
  articles.filter(article =>
    (!date || article.date === date) && includesQuery(query, [article.id, article.title])
  )

export const filterUsers = (users = [], { query = '', role = 'all' } = {}) =>
  users.filter(user =>
    (role === 'all' || user.role === role) && includesQuery(query, [user.id, user.name, user.email])
  )
```

- [ ] **Step 4: Run tests and verify GREEN**

Run: `npm.cmd test -- adminCollectionFilters.test.js`

Expected: 4 tests pass.

- [ ] **Step 5: Commit filters**

```bash
git add frontend/src/utils/adminCollectionFilters.js frontend/tests/adminCollectionFilters.test.js
git commit -m "feat(admin): add local collection filters"
```

---

### Task 2: Operations toolbars and shared filtered collections

**Files:**
- Modify: `frontend/src/components/AdminDashboard.vue:63-319, 529-650`
- Modify: `frontend/tests/AdminDashboard.test.js`

**Interfaces:**
- Consumes: Task 1 filter functions.
- Produces refs: `orderQuery`, `orderStatus`, `productQuery`, `articleQuery`, `articleDate`, `userQuery`, `userRole`.
- Produces computed arrays: `filteredOrders`, `filteredProducts`, `filteredArticles`, `filteredUsers`.
- Produces reset functions: `resetOrderFilters`, `resetProductFilters`, `resetArticleFilters`, `resetUserFilters`.

- [ ] **Step 1: Write failing component behavior tests**

Add controlled fixtures and assert rendered outcomes rather than implementation details:

```js
test('filters orders locally, updates the count, and resets without changing props', async () => {
  const orders = [
    { id: 'ORD-1', customer_name: 'Admin Ploy', status: 'assembling', total_price: 1000, build_items: {} },
    { id: 'ORD-2', customer_name: 'Checkout User', status: 'pending', total_price: 2000, build_items: {} }
  ]
  const wrapper = mountDashboard({ orders })
  await wrapper.get('#admin-tab-orders').trigger('click')
  await wrapper.get('[data-test="orders-search"]').setValue('ploy')
  await wrapper.get('[data-test="orders-status-filter"]').setValue('assembling')

  expect(wrapper.get('[data-test="orders-result-count"]').text()).toContain('1')
  expect(wrapper.findAll('[data-test^="order-card-"]')).toHaveLength(1)
  expect(wrapper.get('[data-test="orders-table-region"]').text()).not.toContain('ORD-2')
  expect(orders).toHaveLength(2)

  await wrapper.get('[data-test="orders-reset"]').trigger('click')
  expect(wrapper.get('[data-test="orders-result-count"]').text()).toContain('2')
})

test('uses the same filtered products for the table and mobile cards', async () => {
  const wrapper = mountDashboard(collectionProps)
  await wrapper.get('#admin-tab-inventory').trigger('click')
  await wrapper.get('[data-test="products-search"]').setValue('Typed CPU')
  expect(wrapper.get('[data-test="inventory-table-region"]').text()).toContain('Typed CPU')
  expect(wrapper.get('[data-test="product-card-7"]').text()).toContain('Typed CPU')
  await wrapper.get('[data-test="products-search"]').setValue('missing')
  expect(wrapper.find('[data-test="product-card-7"]').exists()).toBe(false)
  expect(wrapper.get('[data-test="products-no-results"]').text()).toContain('ไม่พบสินค้า')
})
```

Add equivalent literal assertions for article query+date and user query+role, including a reset action and distinct true-empty/no-match states.

- [ ] **Step 2: Run component tests and verify RED**

Run: `npm.cmd test -- AdminDashboard.test.js adminCollectionFilters.test.js`

Expected: FAIL because toolbar controls and filtered computed arrays are absent.

- [ ] **Step 3: Add reactive filter state and computed collections**

Import Task 1 functions and define refs/computed values:

```js
const orderQuery = ref('')
const orderStatus = ref('all')
const productQuery = ref('')
const articleQuery = ref('')
const articleDate = ref('')
const userQuery = ref('')
const userRole = ref('all')

const filteredOrders = computed(() => filterOrders(props.orders, {
  query: orderQuery.value,
  status: orderStatus.value
}))
const filteredProducts = computed(() => filterProducts(
  props.catalog?.[inventoryCategory.value] || [],
  { query: productQuery.value }
))
const filteredArticles = computed(() => filterArticles(props.articles, {
  query: articleQuery.value,
  date: articleDate.value
}))
const filteredUsers = computed(() => filterUsers(users.value, {
  query: userQuery.value,
  role: userRole.value
}))
```

Implement each reset function by restoring query/date to `''` and select filters to `'all'`.

- [ ] **Step 4: Build shared operations headers and toolbars**

Each collection panel receives:

```vue
<header class="operations-header">
  <div>
    <p class="operations-eyebrow">OPERATIONS</p>
    <h3>รายการสั่งซื้อ</h3>
    <p class="operations-description">ค้นหา ติดตาม และอัปเดตสถานะคำสั่งซื้อ</p>
  </div>
  <output class="operations-count" data-test="orders-result-count" aria-live="polite">
    {{ filteredOrders.length }} รายการ
  </output>
</header>
<div class="operations-toolbar" role="search" aria-label="ค้นหาและกรองคำสั่งซื้อ">
  <label class="operations-search">
    <span>ค้นหา</span>
    <input data-test="orders-search" class="form-control" v-model="orderQuery" placeholder="เลขออเดอร์หรือลูกค้า">
  </label>
  <label class="operations-filter">
    <span>สถานะ</span>
    <select data-test="orders-status-filter" class="form-control" v-model="orderStatus">
      <option value="all">ทุกสถานะ</option>
      <option value="pending">รอดำเนินการ</option>
      <option value="assembling">กำลังประกอบ</option>
      <option value="shipped">จัดส่งแล้ว</option>
    </select>
  </label>
  <button v-if="orderQuery || orderStatus !== 'all'" data-test="orders-reset" class="btn btn-outline" @click="resetOrderFilters">ล้างตัวกรอง</button>
</div>
```

Build equivalent labelled controls for products, articles, and users. Replace every collection `v-for` in tables and cards with its matching filtered computed array. Empty content branches distinguish an empty source array from a non-empty source with zero filtered matches.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `npm.cmd test -- AdminDashboard.test.js adminCollectionFilters.test.js adminStore.test.js`

Expected: component, filter, and existing CRUD store tests pass.

- [ ] **Step 6: Commit toolbars**

```bash
git add frontend/src/components/AdminDashboard.vue frontend/tests/AdminDashboard.test.js
git commit -m "feat(admin): add operations toolbars"
```

---

### Task 3: Professional operations visual system

**Files:**
- Modify: `frontend/src/components/AdminDashboard.vue:853-1071`
- Modify: `frontend/e2e/admin.spec.js`

**Interfaces:**
- Consumes: Task 2 operations markup and existing responsive breakpoints.
- Produces: compact sidebar, dense tables, sticky table headers, consistent action groups, controlled title wrapping, and toolbar reflow.

- [ ] **Step 1: Write failing Playwright regressions**

```js
test('desktop filters orders without a request and keeps the header sticky', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const state = await useAdminFixture(page)
  await openAdmin(page)
  await page.getByRole('tab', { name: /รายการสั่งซื้อ/ }).click()
  const requestCount = state.requests.length

  await page.locator('[data-test="orders-search"]').fill('Fixture Customer')
  await expect(page.locator('[data-test="orders-result-count"]')).toContainText('1 รายการ')
  expect(state.requests.length).toBe(requestCount)
  await expect(page.locator('[data-test="orders-table-region"] thead')).toHaveCSS('position', 'sticky')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1440)
})

test('mobile search filters cards and keeps actions reachable', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await useAdminFixture(page)
  await openAdmin(page)
  await page.getByRole('tab', { name: /คลังสินค้า/ }).click()
  await page.locator('[data-test="products-search"]').fill('Existing CPU')
  await expect(page.locator('[data-test="product-card-1"]')).toBeVisible()
  await expect(page.locator('[data-test="product-card-1"] .admin-actions button')).toHaveCount(2)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
})
```

Add a 768px case that verifies toolbar controls wrap inside the content width and that the table scroll region receives keyboard focus without page overflow.

- [ ] **Step 2: Run Admin E2E and verify RED**

Run: `npx.cmd playwright test --config=e2e/playwright.config.js e2e/admin.spec.js --retries=0`

Expected: existing CRUD/responsive cases pass; new operations cases fail because toolbars and sticky dense headers are not implemented.

- [ ] **Step 3: Implement the operations visual system**

- Narrow the desktop sidebar from 250px to 220px and reduce navigation row height while preserving 44px minimum targets.
- Style `.operations-header`, `.operations-count`, `.operations-toolbar`, `.operations-search`, and `.operations-filter` as one coherent region.
- Set `thead { position: sticky; top: 0; z-index: 3; }` within `.admin-table-region`.
- Reduce desktop table cell padding to `0.85rem 1rem`; align IDs/prices/dates and actions deliberately.
- Use two-line clamping for long article titles and `overflow-wrap` for identifiers.
- Apply consistent row hover and `:focus-within` surface states.
- Make status badges share height, typography, and border treatment.
- Keep destructive actions distinct and action controls at least 44px on touch widths.
- At 1024px, toolbar controls wrap without escaping the panel.
- At 640px, toolbar controls stack above filtered cards and retain the existing no-overflow guarantee.

- [ ] **Step 4: Run Admin E2E and verify GREEN**

Run: `npx.cmd playwright test --config=e2e/playwright.config.js e2e/admin.spec.js --retries=0`

Expected: all CRUD, responsive, and operations cases pass at 320px, 768px, and 1440px.

- [ ] **Step 5: Commit visual system and browser regressions**

```bash
git add frontend/src/components/AdminDashboard.vue frontend/e2e/admin.spec.js
git commit -m "feat(admin): refine operations layout"
```

---

### Task 4: Final verification

**Files:**
- Verify only. Any discovered defect receives its own failing regression before a fix.

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces: a clean, verified branch ready for merge only when explicitly requested.

- [ ] **Step 1: Run focused Admin tests**

Run: `npm.cmd test -- adminCollectionFilters.test.js AdminDashboard.test.js adminStore.test.js adminApi.test.js`

Expected: all focused tests pass with no unhandled errors.

- [ ] **Step 2: Run the full frontend suite**

Run: `npm.cmd test`

Expected: all Vitest files and tests pass.

- [ ] **Step 3: Run Admin Playwright**

Run: `npx.cmd playwright test --config=e2e/playwright.config.js e2e/admin.spec.js --retries=0`

Expected: every Admin CRUD, responsive, and operations scenario passes.

- [ ] **Step 4: Build production assets**

Run: `npm.cmd run build`

Expected: Vite exits 0.

- [ ] **Step 5: Check scope and worktree hygiene**

Run: `git diff main...HEAD --check`

Expected: no whitespace errors.

Run: `git diff --name-only main...HEAD`

Expected: only the approved spec/plan, Admin component, Admin tests/E2E, and filter utility files.

Run: `git status --short`

Expected: clean worktree.

# PCSpec Main-Flow Responsive UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Landing → Builder → Price Summary → Checkout and SpecAI fully usable at 320 px through large desktop widths without changing PCSpec business logic or visual identity.

**Architecture:** Keep one Vue component tree and one Pinia data flow for every viewport. Use mobile-first CSS, content-driven reflow, pointer/hover feature queries, and JavaScript only for genuine interaction state such as the navigation drawer and expandable mobile price summary. Add deterministic component tests for state/ARIA behavior and Playwright coverage for geometry, overflow, overlays, and the primary route flow.

**Tech Stack:** Vue 3 Composition API, Pinia, Vue Router, custom CSS, Vitest, Vue Test Utils, Playwright, Vite

## Global Constraints

- Preserve Vue 3, Pinia, Vue Router, existing backend APIs, catalog requests, compatibility calculations, authentication, checkout, and chatbot business logic.
- Preserve the Emerald restrained product identity, system typography, hairline borders, and shared component vocabulary.
- Do not create separate mobile and desktop component trees or route structures.
- Support phone 320–767 px, tablet 768–1023 px, and desktop 1024 px and above, while allowing content-driven reflow before a range boundary.
- Interactive targets must be at least 44 × 44 CSS pixels on coarse-pointer devices.
- Body and form text must meet WCAG AA contrast; phone form controls must use at least 16 px text.
- No core action may depend on hover or be hidden on mobile.
- Respect safe-area insets, dynamic mobile viewport height, keyboard navigation, visible focus, and `prefers-reduced-motion`.
- Avoid page-level horizontal scrolling and required-control overlap at 320 × 568, 390 × 844, 768 × 1024, 1024 × 768, and 1440 × 900.
- Admin, Profile, and Articles page-specific redesigns are outside this plan.

## File and Responsibility Map

| File | Responsibility after this plan |
| --- | --- |
| `frontend/index.html` | Enable notch-safe viewport behavior |
| `frontend/src/style.css` | Responsive tokens, safe areas, shared layout, touch/focus/motion rules, semantic z-index scale |
| `frontend/src/App.vue` | Accessible adaptive navigation and viewport-safe authentication modal |
| `frontend/src/views/LandingView.vue` | Responsive hero, calls to action, hardware scene, and feature layout |
| `frontend/src/views/BuilderView.vue` | Coordinate responsive builder regions without changing store flow |
| `frontend/src/components/HardwareSelection.vue` | Responsive catalog navigation, filters, cards, and detail overlays |
| `frontend/src/components/PriceSummary.vue` | Desktop sticky summary plus accessible expandable mobile summary |
| `frontend/src/components/CheckoutView.vue` | Responsive form/order layout and contextual validation focus |
| `frontend/src/components/ChatbotWindow.vue` | Desktop floating and phone near-full-screen SpecAI surfaces |
| `frontend/src/components/ToastNotification.vue` | Safe-area-aware, non-overlapping accessible notifications |
| `frontend/tests/App.test.js` | Drawer and modal accessibility behavior |
| `frontend/tests/PriceSummary.test.js` | Mobile summary state and ARIA contract |
| `frontend/tests/CheckoutView.test.js` | Validation association and first-invalid focus |
| `frontend/tests/ChatbotWindow.test.js` | Dialog semantics and close/focus contract |
| `frontend/e2e/responsive-main-flow.spec.js` | Viewport geometry, overflow, overlap, and primary-flow regression coverage |

---

### Task 1: Responsive Foundation and Deterministic Geometry Harness

**Files:**
- Modify: `frontend/index.html`
- Modify: `frontend/src/style.css`
- Create: `frontend/e2e/responsive-main-flow.spec.js`

**Interfaces:**
- Consumes: Existing CSS tokens in `frontend/src/style.css` and Vite base URL from `frontend/e2e/playwright.config.js`.
- Produces: `--z-header`, `--z-sticky`, `--z-chat`, `--z-backdrop`, `--z-modal`, `--z-toast`; `.touch-target`; global overflow and reduced-motion safeguards; `assertNoPageOverflow(page)` for later E2E tasks.

- [ ] **Step 1: Write the failing geometry test**

Create `frontend/e2e/responsive-main-flow.spec.js` with the deterministic route mocks and baseline assertion:

```js
import { expect, test } from '@playwright/test'

const catalog = {
  cpu: [{ id: 1, category: 'cpu', name: 'INTEL Core i5 14400F Extra Long Hardware Model Name', price: 7290, image: '/images/cpu.png' }],
  mobo: [], ram: [], gpu: [], storage: [], psu: [], case: []
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
    test(`has no page overflow at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await prepareApi(page)
      await page.goto('/')
      await expect(page.locator('.landing-page')).toBeVisible()
      await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /viewport-fit=cover/)
    })
  }
})

export { assertNoPageOverflow, prepareApi }
```

- [ ] **Step 2: Run the geometry test and confirm the narrow viewport fails**

Run:

```bash
cd frontend
npx playwright test --config=e2e/playwright.config.js e2e/responsive-main-flow.spec.js
```

Expected: FAIL because the viewport meta tag does not yet include `viewport-fit=cover`. Record any additional overflow failure with its viewport and measured `scrollWidth`.

- [ ] **Step 3: Add safe-area and shared responsive foundations**

Change the viewport meta tag in `frontend/index.html` to:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

Add these tokens and shared rules to `frontend/src/style.css`:

```css
:root {
  --z-header: 40;
  --z-sticky: 50;
  --z-chat: 60;
  --z-backdrop: 70;
  --z-modal: 80;
  --z-toast: 90;
  --page-gutter: clamp(1rem, 3vw, 1.5rem);
  --content-max: 1280px;
}

html { overflow-x: clip; }
body { min-width: 320px; overflow-wrap: anywhere; }
button, input, select, textarea { font: inherit; }
:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.container { width: min(100%, var(--content-max)); padding-inline: var(--page-gutter); }

@media (pointer: coarse) {
  .btn, .touch-target { min-width: 44px; min-height: 44px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Replace arbitrary overlay z-index values in shared styles with the semantic tokens as each later task touches its component.

- [ ] **Step 4: Run base unit tests and the geometry spec**

Run:

```bash
cd frontend
npm test -- --run tests/App.test.js
npx playwright test --config=e2e/playwright.config.js e2e/responsive-main-flow.spec.js
```

Expected: App unit tests and the safe-area viewport checks pass at all five viewport sizes.

- [ ] **Step 5: Commit the foundation**

```bash
git add frontend/index.html frontend/src/style.css frontend/e2e/responsive-main-flow.spec.js
git commit -m "feat(ui): add responsive foundations"
```

---

### Task 2: Accessible Adaptive App Shell

**Files:**
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/style.css`
- Modify: `frontend/tests/App.test.js`

**Interfaces:**
- Consumes: `--z-header`, `--z-backdrop`, `--z-modal`, `.touch-target` from Task 1 and existing `openLoginModal()`/router behavior.
- Produces: `isNavOpen: Ref<boolean>`, `toggleNav()`, `closeNav()`, `.nav-toggle`, `#primary-navigation`, dialog semantics for the auth modal.

- [ ] **Step 1: Add failing drawer and modal tests**

Append to `frontend/tests/App.test.js`:

```js
test('toggles the mobile navigation with an explicit expanded state', async () => {
  const router = { push: vi.fn() }
  const wrapper = mount(App, {
    global: {
      plugins: [pinia],
      provide: { [routerKey]: router },
      mocks: { $route: { path: '/' }, $router: router },
      stubs: { RouterView: RouterViewStub }
    }
  })

  const toggle = wrapper.get('[data-test="nav-toggle"]')
  expect(toggle.attributes('aria-expanded')).toBe('false')
  await toggle.trigger('click')
  expect(toggle.attributes('aria-expanded')).toBe('true')
  expect(wrapper.get('#primary-navigation').classes()).toContain('is-open')
})

test('exposes the authentication surface as a labelled modal dialog', async () => {
  const router = { push: vi.fn() }
  const wrapper = mount(App, {
    global: {
      plugins: [pinia],
      provide: { [routerKey]: router },
      mocks: { $route: { path: '/' }, $router: router },
      stubs: { RouterView: RouterViewStub }
    }
  })
  await wrapper.findAll('.nav-actions .btn-outline').at(-1).trigger('click')
  const dialog = wrapper.get('[role="dialog"]')
  expect(dialog.attributes('aria-modal')).toBe('true')
  expect(dialog.attributes('aria-labelledby')).toBe('auth-dialog-title')
})
```

- [ ] **Step 2: Run App tests to verify both new tests fail**

Run:

```bash
cd frontend
npm test -- --run tests/App.test.js
```

Expected: FAIL because `[data-test="nav-toggle"]` and modal dialog attributes do not exist.

- [ ] **Step 3: Implement the navigation state and dialog contract**

Add to `App.vue` script:

```js
const isNavOpen = ref(false)
const toggleNav = () => { isNavOpen.value = !isNavOpen.value }
const closeNav = () => { isNavOpen.value = false }
```

Add the toggle before `.nav-actions` and bind the navigation container:

```vue
<button
  type="button"
  class="nav-toggle touch-target"
  data-test="nav-toggle"
  aria-controls="primary-navigation"
  :aria-expanded="String(isNavOpen)"
  aria-label="เปิดหรือปิดเมนูหลัก"
  @click="toggleNav"
>
  <span aria-hidden="true">{{ isNavOpen ? '×' : '☰' }}</span>
</button>
<div id="primary-navigation" :class="['nav-actions', { 'is-open': isNavOpen }]">
```

Every route button in the drawer calls `closeNav()` after routing. Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby="auth-dialog-title"` to `.modal-content`, and assign `id="auth-dialog-title"` to a visible modal heading or the active tab label container.

Add mobile-first behavior in `App.vue` scoped CSS and `style.css`: `.nav-toggle` is hidden at desktop widths and visible at narrow widths; `.nav-actions` becomes an anchored full-width panel below the header at narrow widths; `.user-actions` stacks; the modal uses `max-height: calc(100dvh - 2rem - env(safe-area-inset-top) - env(safe-area-inset-bottom))` and `overflow-y: auto`.

- [ ] **Step 4: Pass App tests and verify keyboard-visible shell controls**

Run:

```bash
cd frontend
npm test -- --run tests/App.test.js
npx playwright test --config=e2e/playwright.config.js e2e/auth.spec.js
```

Expected: all App tests and existing authentication browser tests pass.

- [ ] **Step 5: Commit the app shell**

```bash
git add frontend/src/App.vue frontend/src/style.css frontend/tests/App.test.js
git commit -m "feat(ui): adapt app shell for mobile"
```

---

### Task 3: Responsive Landing Page

**Files:**
- Modify: `frontend/src/views/LandingView.vue`
- Modify: `frontend/e2e/responsive-main-flow.spec.js`

**Interfaces:**
- Consumes: `assertNoPageOverflow(page)` and `prepareApi(page)` from Task 1.
- Produces: Stable `.hero-actions`, `.hero-3d-scene`, `.features-grid` geometry across the viewport matrix.

- [ ] **Step 1: Add failing landing geometry assertions**

Append to the E2E spec:

```js
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
  await expect(page.locator('.hero-actions .btn')).toHaveCount(2)
  await assertNoPageOverflow(page)
})
```

- [ ] **Step 2: Run the phone landing test and confirm it fails on current geometry**

Run:

```bash
cd frontend
npx playwright test --config=e2e/playwright.config.js e2e/responsive-main-flow.spec.js --grep "landing actions"
```

Expected: FAIL because the current phone CTA sizes to its label instead of the available action width.

- [ ] **Step 3: Implement mobile-first landing reflow**

Replace the current single `max-width: 768px` patch with base narrow styles and `min-width` enhancements:

```css
.hero { padding: clamp(3rem, 10vw, 6rem) var(--page-gutter) 3rem; }
.hero-title { font-size: clamp(2rem, 11vw, 4rem); max-width: 18ch; text-wrap: balance; }
.hero-subtitle { font-size: 1rem; max-width: 65ch; text-wrap: pretty; }
.hero-actions { width: 100%; flex-direction: column; }
.hero-actions .btn { width: 100%; min-height: 48px; }
.hero-3d-scene { height: auto; margin-top: 3rem; display: grid; gap: 0.75rem; perspective: none; }
.card-cpu, .card-gpu, .card-ram {
  position: static;
  width: min(100%, 30rem);
  transform: none;
  animation: none;
}
.features { width: 100%; padding: 4rem var(--page-gutter); }
.features-grid { grid-template-columns: 1fr; gap: 1rem; }

@media (min-width: 48rem) {
  .hero-actions { width: auto; flex-direction: row; }
  .hero-actions .btn { width: auto; }
  .features-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
```

Retain the desktop 3D scene only in a `@media (min-width: 64rem) and (hover: hover)` block. Add a local reduced-motion rule to suppress `pulse`, `float-1`, `float-2`, and `float-3` without hiding content.

- [ ] **Step 4: Run landing geometry and build**

Run:

```bash
cd frontend
npx playwright test --config=e2e/playwright.config.js e2e/responsive-main-flow.spec.js --grep "landing|overflow"
npm run build
```

Expected: landing and overflow assertions pass at all five viewports; Vite build exits 0.

- [ ] **Step 5: Commit the landing page**

```bash
git add frontend/src/views/LandingView.vue frontend/e2e/responsive-main-flow.spec.js
git commit -m "feat(ui): reflow landing across screens"
```

---

### Task 4: Responsive Hardware Catalog and Builder Regions

**Files:**
- Modify: `frontend/src/views/BuilderView.vue`
- Modify: `frontend/src/components/HardwareSelection.vue`
- Modify: `frontend/tests/HardwareSelection.test.js`
- Modify: `frontend/e2e/responsive-main-flow.spec.js`

**Interfaces:**
- Consumes: Existing `HardwareSelection` props/events unchanged and shared responsive tokens from Task 1.
- Produces: Accessible category controls, `.product-grid` that reflows 1 → 2 → auto-fit columns, viewport-fitting detail overlays.

- [ ] **Step 1: Add failing keyboard/ARIA category test**

Add a category control assertion to `frontend/tests/HardwareSelection.test.js` using the component's existing category data:

```js
test('uses real buttons for product actions with accessible selected state', async () => {
  const wrapper = mount(HardwareSelection, {
    props: {
      activeCategory: 'cpu',
      activeCategoryInfo: mockActiveCategoryInfo,
      products: mockProducts,
      selectedItemId: 1,
      compatibilityIssues: [],
      hasAnyComponent: true
    }
  })
  const selected = wrapper.get('.product-card.selected')
  expect(selected.attributes('aria-current')).toBe('true')
  expect(selected.get('.add-btn').element.tagName).toBe('BUTTON')
})

test('replaces a failed product image with the category fallback', async () => {
  const wrapper = mount(HardwareSelection, {
    props: {
      activeCategory: 'cpu',
      activeCategoryInfo: mockActiveCategoryInfo,
      products: [{ ...mockProducts[0], image: '/broken.png' }],
      selectedItemId: null,
      compatibilityIssues: [],
      hasAnyComponent: false
    }
  })
  const image = wrapper.get('.product-card img')
  await image.trigger('error')
  expect(image.attributes('src')).toBe('/images/cpu.png')
})
```

- [ ] **Step 2: Run the component test and verify selected-state semantics fail**

Run:

```bash
cd frontend
npm test -- --run tests/HardwareSelection.test.js
```

Expected: FAIL because `.product-card.selected` does not expose `aria-current="true"`.

- [ ] **Step 3: Implement catalog semantics and responsive geometry**

Bind `:aria-current="selectedItemId === item.id ? 'true' : undefined"` to each product card. Preserve existing emits and stop nested action clicks from producing duplicate events. Bind `@error="handleProductImageError"` to product images and add:

```js
const handleProductImageError = (event) => {
  const image = event.currentTarget
  if (image.dataset.fallbackApplied === 'true') return
  image.dataset.fallbackApplied = 'true'
  image.src = `/images/${props.activeCategory}.png`
}
```

Keep the existing `.empty-search` state visible when filtering produces no products. Give its reset action a real `<button type="button">` and ensure the empty message wraps at 320 px.

Implement these geometry rules in `HardwareSelection.vue` and coordinate the builder container in `BuilderView.vue`:

```css
.product-grid { grid-template-columns: 1fr; gap: 0.75rem; }
.product-card { min-width: 0; }
.product-name, .spec-value { overflow-wrap: anywhere; }
.modal-overlay { padding: max(1rem, env(safe-area-inset-top)) var(--page-gutter) max(1rem, env(safe-area-inset-bottom)); }
.modal-content { width: min(100%, 42.5rem); max-height: calc(100dvh - 2rem); overflow-y: auto; }

@media (min-width: 23rem) {
  .product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 48rem) {
  .product-grid { grid-template-columns: repeat(auto-fit, minmax(12.5rem, 1fr)); }
}
```

Apply `overflow-x: auto`, `overscroll-behavior-inline: contain`, and visible focus/selected states to category/filter rows that cannot wrap. Add `scroll-padding-inline: var(--page-gutter)` so focused items are not flush against an edge.

- [ ] **Step 4: Add and pass phone builder geometry coverage**

Append:

```js
test('builder cards and category controls remain usable at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await prepareApi(page)
  await page.goto('/build')
  await expect(page.locator('.product-card').first()).toBeVisible()
  const card = await page.locator('.product-card').first().boundingBox()
  expect(card.x).toBeGreaterThanOrEqual(0)
  expect(card.x + card.width).toBeLessThanOrEqual(320)
  await assertNoPageOverflow(page)
})
```

Run:

```bash
cd frontend
npm test -- --run tests/HardwareSelection.test.js tests/BuilderView.test.js
npx playwright test --config=e2e/playwright.config.js e2e/responsive-main-flow.spec.js --grep "builder cards"
```

Expected: all listed tests pass.

- [ ] **Step 5: Commit the builder catalog**

```bash
git add frontend/src/views/BuilderView.vue frontend/src/components/HardwareSelection.vue frontend/tests/HardwareSelection.test.js frontend/e2e/responsive-main-flow.spec.js
git commit -m "feat(ui): adapt builder catalog layout"
```

---

### Task 5: Expandable Mobile Price Summary

**Files:**
- Modify: `frontend/src/components/PriceSummary.vue`
- Create: `frontend/tests/PriceSummary.test.js`
- Modify: `frontend/e2e/responsive-main-flow.spec.js`

**Interfaces:**
- Consumes: Existing `PriceSummary` props and `checkout`, `remove-item` events unchanged.
- Produces: `isMobileSummaryOpen: Ref<boolean>`, `toggleMobileSummary()`, `.mobile-summary-toggle`, `#mobile-build-summary`, `aria-expanded`/`aria-controls` contract.

- [ ] **Step 1: Write the failing disclosure test**

Create `frontend/tests/PriceSummary.test.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'
import PriceSummary from '../src/components/PriceSummary.vue'

const props = {
  totalPrice: 7290,
  hasAnyComponent: true,
  estimatedWattage: 200,
  recommendedWattage: 500,
  compatibilityIssues: [],
  compatibilityWarnings: [],
  categories: [{ id: 'cpu', name: 'CPU' }],
  build: { cpu: 1 },
  catalog: { cpu: [{ id: 1, name: 'INTEL Core i5', price: 7290, specs: {} }] }
}

describe('PriceSummary mobile disclosure', () => {
  test('toggles details and exposes state to assistive technology', async () => {
    const wrapper = mount(PriceSummary, { props })
    const toggle = wrapper.get('[data-test="mobile-summary-toggle"]')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.get('#mobile-build-summary').attributes('hidden')).toBeDefined()
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('#mobile-build-summary').attributes('hidden')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run the disclosure test and confirm it fails**

Run:

```bash
cd frontend
npm test -- --run tests/PriceSummary.test.js
```

Expected: FAIL because the mobile toggle and controlled region do not exist.

- [ ] **Step 3: Implement one-state, two-layout summary presentation**

Add to `PriceSummary.vue`:

```js
import { ref } from 'vue'

const isMobileSummaryOpen = ref(false)
const toggleMobileSummary = () => {
  isMobileSummaryOpen.value = !isMobileSummaryOpen.value
}
```

Add a mobile toggle that reads the same `totalPrice`/`hasAnyComponent` props as the desktop summary:

```vue
<button
  type="button"
  class="mobile-summary-toggle"
  data-test="mobile-summary-toggle"
  aria-controls="mobile-build-summary"
  :aria-expanded="String(isMobileSummaryOpen)"
  @click="toggleMobileSummary"
>
  <span>ยอดรวม ฿{{ totalPrice.toLocaleString() }}</span>
  <span aria-hidden="true">{{ isMobileSummaryOpen ? '⌄' : '⌃' }}</span>
</button>
<div id="mobile-build-summary" :hidden="!isMobileSummaryOpen" class="mobile-summary-details">
  <!-- Reuse the existing compatibility and selected-category markup through one local template block; do not copy store or API state. -->
</div>
```

Keep the existing total, compatibility, and category markup inside the same `PriceSummary.vue` instance. The mobile toggle changes a class on that existing sidebar; it must not create a second Pinia store, fetch data, or render a second summary component.

Use CSS to keep `.sidebar` sticky only at `min-width: 64rem`. At phone widths, position the compact summary above `env(safe-area-inset-bottom)`, reserve equivalent bottom padding in the builder, cap expanded details to `min(60dvh, 32rem)`, and set `overflow-y: auto`. Use `--z-sticky`; leave room for the SpecAI launcher at the opposite inline edge.

- [ ] **Step 4: Add overlap and interaction E2E coverage**

Append this mobile summary test:

```js
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
```

Run:

```bash
cd frontend
npm test -- --run tests/PriceSummary.test.js tests/BuilderView.test.js
npx playwright test --config=e2e/playwright.config.js e2e/responsive-main-flow.spec.js --grep "mobile summary"
```

Expected: unit disclosure and mobile overlap tests pass.

- [ ] **Step 5: Commit the price summary**

```bash
git add frontend/src/components/PriceSummary.vue frontend/tests/PriceSummary.test.js frontend/e2e/responsive-main-flow.spec.js
git commit -m "feat(ui): add mobile build summary"
```

---

### Task 6: Responsive Checkout and Contextual Validation

**Files:**
- Modify: `frontend/src/components/CheckoutView.vue`
- Create: `frontend/tests/CheckoutView.test.js`
- Modify: `frontend/e2e/responsive-main-flow.spec.js`

**Interfaces:**
- Consumes: Existing builder/auth stores and order submission endpoint unchanged.
- Produces: Stable field IDs, `aria-describedby` error associations, `focusFirstInvalidField()`, one-column phone/tablet checkout layout.

- [ ] **Step 1: Add failing validation association test**

Create `frontend/tests/CheckoutView.test.js` with a Pinia-backed mount that triggers checkout with an empty required name:

```js
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { routerKey } from 'vue-router'
import CheckoutView from '../src/components/CheckoutView.vue'
import { useBuilderStore } from '../src/stores/builder'
import { useCatalogStore } from '../src/stores/catalog'

describe('CheckoutView validation accessibility', () => {
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    useCatalogStore().hardwareList = {
      cpu: [{ id: 1, name: 'INTEL Core i5', price: 7290, image: '/images/cpu.png' }]
    }
    useBuilderStore().setItem('cpu', 1)
  })

  test('associates the required-name error and focuses the field', async () => {
    const router = { push: vi.fn() }
    const wrapper = mount(CheckoutView, {
      props: {
        categories: [{ id: 'cpu', name: 'CPU' }],
        catalog: useCatalogStore().hardwareList,
        currentUser: null
      },
      attachTo: document.body,
      global: {
        plugins: [pinia],
        provide: { [routerKey]: router },
        mocks: { $router: router }
      }
    })
    await wrapper.get('.submit-btn').trigger('click')
    const name = wrapper.get('#checkout-name')
    expect(name.attributes('aria-invalid')).toBe('true')
    expect(name.attributes('aria-describedby')).toBe('checkout-name-error')
    expect(document.activeElement).toBe(name.element)
    wrapper.unmount()
  })
})
```

Stub `HTMLElement.prototype.focus` only if jsdom cannot move `document.activeElement`; do not replace component validation logic.

- [ ] **Step 2: Run the CheckoutView test and verify it fails**

Run:

```bash
cd frontend
npm test -- --run tests/CheckoutView.test.js
```

Expected: FAIL because required fields do not yet expose stable ID/error/focus semantics.

- [ ] **Step 3: Implement contextual validation and responsive checkout layout**

Assign stable IDs such as `checkout-name`, `checkout-phone`, and `checkout-address`. Render each error directly after its field with `<p :id="`${fieldId}-error`" class="field-error">`, bind `aria-invalid`, and bind `aria-describedby` only when the error exists.

Implement:

```js
import { nextTick } from 'vue'

const focusFirstInvalidField = async () => {
  await nextTick()
  document.querySelector('.form-control[aria-invalid="true"]')?.focus()
}
```

Call `focusFirstInvalidField()` only after client-side validation fails; do not move focus for server errors unrelated to one field.

Use mobile-first CSS:

```css
.checkout-grid { display: grid; grid-template-columns: 1fr; gap: var(--space-lg); }
.checkout-item-row { min-width: 0; flex-wrap: wrap; }
.checkout-item-info { min-width: 0; }
.checkout-item-price { margin-inline-start: auto; }
.checkout-view .form-control { min-height: 44px; font-size: 1rem; }

@media (min-width: 64rem) {
  .checkout-grid { grid-template-columns: minmax(0, 1.5fr) minmax(18rem, 1fr); }
  .checkout-summary.sticky { position: sticky; top: 5.5rem; }
}
```

- [ ] **Step 4: Verify checkout component and phone geometry**

Run:

```bash
cd frontend
npm test -- --run tests/CheckoutView.test.js
npx playwright test --config=e2e/playwright.config.js e2e/responsive-main-flow.spec.js --grep "checkout"
npm run build
```

Expected: validation semantics, phone geometry, and build pass.

- [ ] **Step 5: Commit checkout adaptation**

```bash
git add frontend/src/components/CheckoutView.vue frontend/tests/CheckoutView.test.js frontend/e2e/responsive-main-flow.spec.js
git commit -m "feat(ui): adapt checkout for touch"
```

---

### Task 7: SpecAI and Toast Overlay Coordination

**Files:**
- Modify: `frontend/src/components/ChatbotWindow.vue`
- Modify: `frontend/src/components/ToastNotification.vue`
- Modify: `frontend/tests/ChatbotWindow.test.js`
- Modify: `frontend/e2e/responsive-main-flow.spec.js`

**Interfaces:**
- Consumes: `--z-chat`, `--z-toast`, mobile summary geometry from Task 5, existing chatbot props/events unchanged.
- Produces: `role="dialog"`, `aria-modal`, labelled SpecAI surface, 44 px controls, near-full-screen phone geometry using `100dvh`, safe-area-aware toast placement.

- [ ] **Step 1: Add failing SpecAI semantic test**

Append to `frontend/tests/ChatbotWindow.test.js`:

```js
test('exposes the open assistant as a labelled dialog with named controls', () => {
  const wrapper = mount(ChatbotWindow, {
    props: { ...guestProps, isAuthenticated: true, isTyping: false }
  })
  const dialog = wrapper.get('.chatbot-wrapper')
  expect(dialog.attributes('role')).toBe('dialog')
  expect(dialog.attributes('aria-labelledby')).toBe('specai-title')
  expect(wrapper.get('.close-chat-btn').attributes('aria-label')).toBeTruthy()
  expect(wrapper.get('.attach-btn').attributes('aria-label')).toBeTruthy()
  expect(wrapper.get('.send-btn').attributes('aria-label')).toBeTruthy()
})
```

- [ ] **Step 2: Run ChatbotWindow tests and confirm the new test fails**

Run:

```bash
cd frontend
npm test -- --run tests/ChatbotWindow.test.js
```

Expected: FAIL on missing dialog/title/control labels while all existing privacy and scroll tests remain green.

- [ ] **Step 3: Implement semantic and responsive SpecAI behavior**

Add `role="dialog"`, `aria-modal="true"`, and `aria-labelledby="specai-title"` to `.chatbot-wrapper`; add `id="specai-title"` to the existing visible header name. Replace `title`-only icon controls with Thai `aria-label` values while retaining visible icons.

Use:

```css
.chat-fab {
  z-index: var(--z-chat);
  right: max(1rem, env(safe-area-inset-right));
  bottom: max(1rem, env(safe-area-inset-bottom));
}
.chatbot-wrapper { z-index: var(--z-chat); }

@media (max-width: 47.99rem) {
  .chatbot-wrapper {
    inset: env(safe-area-inset-top) 0 env(safe-area-inset-bottom);
    width: 100%;
    height: auto;
    max-height: 100dvh;
    border-radius: 0;
  }
  .chat-input input { font-size: 1rem; }
  .close-chat-btn, .attach-btn, .send-btn { min-width: 44px; min-height: 44px; }
}
```

Set `--mobile-summary-offset: 4.75rem` on the builder while its compact summary is rendered. On phone widths, use `bottom: calc(var(--mobile-summary-offset, 0px) + max(1rem, env(safe-area-inset-bottom)))` for the closed FAB. Opening SpecAI covers the builder as a dialog, so the underlying mobile summary becomes visually inert beneath it.

Refactor `ToastNotification.vue` away from arbitrary `z-index: 9999`, side-stripe borders, gradient fills, and decorative backdrop blur. Use `--z-toast`, a solid high-contrast surface, full border/status icon pairing, `role="status"` for normal messages, `role="alert"` for errors, safe-area offsets, and a 44 px close button.

- [ ] **Step 4: Verify mobile overlays and existing chatbot behavior**

Append this deterministic phone overlay test:

```js
test('SpecAI stays inside the phone viewport and returns cleanly to builder', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await prepareApi(page)
  await page.goto('/build')
  await page.locator('.chat-fab').click()
  const dialog = page.locator('.chatbot-wrapper')
  await expect(dialog).toHaveAttribute('role', 'dialog')
  const box = await dialog.boundingBox()
  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.y).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width).toBeLessThanOrEqual(390)
  expect(box.y + box.height).toBeLessThanOrEqual(844)
  await dialog.locator('.close-chat-btn').click()
  await expect(dialog).not.toHaveClass(/is-open/)
  await assertNoPageOverflow(page)
})
```

Append this toast geometry test; it triggers the existing empty login form validation rather than calling Pinia internals:

```js
test('toast stays inside the phone safe width with a touch-sized close action', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await prepareApi(page)
  await page.goto('/')
  await page.getByRole('button', { name: /เข้าสู่ระบบ/ }).first().click()
  await page.locator('.modal-content .btn-primary').click()
  const toast = page.locator('.toast-item').first()
  await expect(toast).toBeVisible()
  const toastBox = await toast.boundingBox()
  const closeBox = await toast.locator('.toast-close').boundingBox()
  expect(toastBox.x).toBeGreaterThanOrEqual(0)
  expect(toastBox.x + toastBox.width).toBeLessThanOrEqual(390)
  expect(closeBox.width).toBeGreaterThanOrEqual(44)
  expect(closeBox.height).toBeGreaterThanOrEqual(44)
})
```

Run:

```bash
cd frontend
npm test -- --run tests/ChatbotWindow.test.js tests/BuilderView.test.js
npx playwright test --config=e2e/playwright.config.js e2e/responsive-main-flow.spec.js --grep "SpecAI|overlay"
```

Expected: existing privacy/scroll behavior and new dialog/geometry coverage pass.

- [ ] **Step 5: Commit overlay coordination**

```bash
git add frontend/src/components/ChatbotWindow.vue frontend/src/components/ToastNotification.vue frontend/tests/ChatbotWindow.test.js frontend/e2e/responsive-main-flow.spec.js
git commit -m "feat(ui): adapt SpecAI mobile overlay"
```

---

### Task 8: Full Responsive Matrix and Release Verification

**Files:**
- Modify: `frontend/e2e/responsive-main-flow.spec.js`
- Modify: `plans/main_flow_responsive_ux_implementation.md`

**Interfaces:**
- Consumes: All UI contracts and E2E helpers from Tasks 1–7.
- Produces: A deterministic five-viewport acceptance suite and final execution record.

- [ ] **Step 1: Complete the primary-flow matrix**

For each target viewport, cover these steps in `responsive-main-flow.spec.js`:

```js
await page.goto('/')
await assertNoPageOverflow(page)
await page.locator('.hero-actions').getByRole('link').first().click()
await expect(page).toHaveURL(/\/build$/)
await page.locator('.product-card .add-btn').first().click()
await expect(page.locator('.total-value')).toContainText('7,290')
await assertNoPageOverflow(page)
```

Phone tests additionally open/close the navigation, mobile summary, authentication modal, and SpecAI. Tablet tests assert catalog/summary reflow in portrait and landscape. Desktop tests assert the summary remains beside the catalog and does not exceed the content max-width.

- [ ] **Step 2: Run the new suite alone and resolve only in-scope failures**

Run:

```bash
cd frontend
npx playwright test --config=e2e/playwright.config.js e2e/responsive-main-flow.spec.js
```

Expected: all responsive matrix tests pass with zero page-overflow or overlay-intersection failures.

- [ ] **Step 3: Run the full frontend verification suite**

Run:

```bash
cd frontend
npm test -- --run
npm run build
npx playwright test --config=e2e/playwright.config.js e2e/responsive-main-flow.spec.js
```

Expected: Vitest reports zero failures, Vite exits 0, and the responsive Playwright project reports zero failures.

- [ ] **Step 4: Perform browser screenshot review**

Capture full-page screenshots of Landing, Builder with selected CPU, expanded mobile summary, Checkout, and open SpecAI at 320 × 568, 390 × 844, 768 × 1024, 1024 × 768, and 1440 × 900. Review each image for clipped Thai/English text, unreadable product names, accidental page scrollbars, safe-area collisions, focus visibility, and mismatch with the PCSpec Emerald/hairline system.

Record the exact tested browser and operating system in `plans/main_flow_responsive_ux_implementation.md`. Record real-device validation as pending until one iPhone and one Android phone are physically tested; do not claim real-device completion from emulation.

- [ ] **Step 5: Commit acceptance coverage and execution record**

```bash
git add frontend/e2e/responsive-main-flow.spec.js plans/main_flow_responsive_ux_implementation.md
git commit -m "test(ui): cover responsive main flow"
```

## Final Acceptance Checklist

- [ ] No page-level horizontal scrolling at all five target viewports.
- [ ] Header, drawer, modal, toast, mobile summary, and SpecAI never cover another required control.
- [ ] Landing → Builder → Price Summary → Checkout remains usable with touch, mouse, and keyboard.
- [ ] Core functionality remains present on mobile.
- [ ] Phone form controls render at 16 px or larger.
- [ ] All interactive coarse-pointer targets are at least 44 × 44 CSS pixels.
- [ ] Compatibility and error states use text/icon plus color.
- [ ] Reduced-motion mode removes nonessential continuous animation.
- [ ] Existing Pinia/API/business logic behavior remains unchanged.
- [ ] `npm test -- --run`, `npm run build`, and responsive Playwright suite pass.
- [ ] Real-device iPhone and Android checks are explicitly recorded as complete or pending.

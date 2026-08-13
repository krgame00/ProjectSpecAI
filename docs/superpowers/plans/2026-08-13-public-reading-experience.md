# Public Reading Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a safe, responsive, Reading-first article list and article detail experience with explicit request states.

**Architecture:** Keep the existing route-prop architecture: the article Pinia store owns collection/loading/error state, and `App.vue` passes those values plus a retry event to routed article components. Put formatting and sanitization in one focused utility backed by DOMPurify, while each view owns only presentation and responsive layout.

**Tech Stack:** Vue 3 Composition API, Pinia 3, Vue Router 4, DOMPurify, Vitest, Vue Test Utils, Playwright, CSS custom properties

## Global Constraints

- Preserve the system font, restrained Emerald accent, dark surfaces, hairline borders, and compact radii used by the Builder.
- Support 320 px, 390 px, 768 px, 1024 px, and desktop viewports without page-level horizontal scrolling.
- Preserve existing routes and backend API contracts.
- Sanitize rich article HTML with an explicit allowlist; render card excerpts as plain text.
- Keep loading, failure, empty, and not-found states distinct.
- Respect `prefers-reduced-motion`; hover must not be required for access.
- Do not modify Admin or article-authoring UI.

---

### Task 1: Safe article-content utilities

**Files:**
- Create: `frontend/src/utils/articleContent.js`
- Create: `frontend/tests/articleContent.test.js`
- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`

**Interfaces:**
- Consumes: untrusted article strings and optional ISO date strings.
- Produces: `sanitizeArticleHtml(value: unknown): string`, `articleExcerpt(value: unknown, maxLength?: number): string`, and `formatArticleDate(value: unknown, options?: Intl.DateTimeFormatOptions): string`.

- [ ] **Step 1: Write failing utility tests**

```js
import { describe, expect, test } from 'vitest'
import { articleExcerpt, formatArticleDate, sanitizeArticleHtml } from '../src/utils/articleContent'

describe('article content utilities', () => {
  test('keeps supported formatting and removes executable markup', () => {
    const html = '<h2>หัวข้อ</h2><p onclick="alert(1)">เนื้อหา</p><script>alert(1)</script><a href="javascript:alert(1)">ลิงก์</a>'
    const safe = sanitizeArticleHtml(html)
    expect(safe).toContain('<h2>หัวข้อ</h2>')
    expect(safe).not.toMatch(/script|onclick|javascript:/i)
  })

  test('turns rich content into a bounded plain-text excerpt', () => {
    expect(articleExcerpt('<p>Alpha <strong>Beta</strong></p>', 10)).toBe('Alpha Beta')
    expect(articleExcerpt(`<p>${'ก'.repeat(20)}</p>`, 10)).toBe(`${'ก'.repeat(10)}…`)
  })

  test('formats valid dates and preserves a supplied fallback', () => {
    expect(formatArticleDate('2026-08-13T00:00:00.000Z')).not.toBe('-')
    expect(formatArticleDate('วันที่เดิม')).toBe('วันที่เดิม')
    expect(formatArticleDate(null)).toBe('-')
  })
})
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `cd frontend && npm test -- articleContent.test.js`

Expected: FAIL because `src/utils/articleContent.js` does not exist.

- [ ] **Step 3: Install DOMPurify**

Run: `cd frontend && npm install dompurify`

Expected: `dompurify` appears under `dependencies` and the lockfile changes.

- [ ] **Step 4: Implement the utility**

```js
import DOMPurify from 'dompurify'

const ALLOWED_TAGS = ['p', 'br', 'h2', 'h3', 'h4', 'strong', 'em', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'pre', 'code']
const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'scope']

export function sanitizeArticleHtml(value) {
  return DOMPurify.sanitize(String(value ?? ''), {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false
  })
}

export function articleExcerpt(value, maxLength = 180) {
  const template = document.createElement('template')
  template.innerHTML = sanitizeArticleHtml(value)
  const text = (template.content.textContent ?? '').replace(/\s+/g, ' ').trim()
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text
}

export function formatArticleDate(value, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
  if (!value) return '-'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime())
    ? String(value)
    : new Intl.DateTimeFormat('th-TH', options).format(parsed)
}
```

- [ ] **Step 5: Run the utility tests**

Run: `cd frontend && npm test -- articleContent.test.js`

Expected: PASS for allowlisting, unsafe URL removal, plain-text truncation, and dates.

- [ ] **Step 6: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/src/utils/articleContent.js frontend/tests/articleContent.test.js
git commit -m "feat(articles): sanitize rich content"
```

### Task 2: Explicit article request state

**Files:**
- Modify: `frontend/src/stores/article.js`
- Modify: `frontend/tests/articleStore.test.js`

**Interfaces:**
- Consumes: `GET /api/v1/articles` with the existing array response.
- Produces: store state `articles: Array`, `isLoading: boolean`, `error: string | null`; `fetchArticles(): Promise<boolean>`.

- [ ] **Step 1: Add failing state tests**

```js
import { afterEach, vi } from 'vitest'

afterEach(() => vi.restoreAllMocks())

test('fetchArticles exposes loading then clears it on success', async () => {
  let finish
  global.fetch = vi.fn(() => new Promise(resolve => { finish = resolve }))
  const store = useArticleStore()
  const request = store.fetchArticles()
  expect(store.isLoading).toBe(true)
  finish({ ok: true, json: async () => [{ id: 1, title: 'Article' }] })
  await expect(request).resolves.toBe(true)
  expect(store.isLoading).toBe(false)
  expect(store.error).toBeNull()
})

test('fetchArticles exposes an actionable error for HTTP and network failures', async () => {
  const store = useArticleStore()
  global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 })
  await expect(store.fetchArticles()).resolves.toBe(false)
  expect(store.error).toMatch(/503/)
  global.fetch = vi.fn().mockRejectedValue(new Error('offline'))
  await expect(store.fetchArticles()).resolves.toBe(false)
  expect(store.error).toBeTruthy()
})
```

- [ ] **Step 2: Run the store test and verify failure**

Run: `cd frontend && npm test -- articleStore.test.js`

Expected: FAIL because `isLoading`, `error`, and the boolean return contract are absent.

- [ ] **Step 3: Implement request state without changing admin mutations**

```js
state: () => ({
  articles: [],
  isLoading: false,
  error: null
}),
actions: {
  async fetchArticles() {
    this.isLoading = true
    this.error = null
    try {
      const res = await fetch(`${API_BASE}/articles`)
      if (!res.ok) throw new Error(`โหลดบทความไม่สำเร็จ (${res.status})`)
      this.articles = await res.json()
      return true
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'โหลดบทความไม่สำเร็จ'
      return false
    } finally {
      this.isLoading = false
    }
  }
}
```

Keep `saveArticle` and `deleteArticle` behavior intact.

- [ ] **Step 4: Run the store tests**

Run: `cd frontend && npm test -- articleStore.test.js`

Expected: PASS, including the existing fetch and delete tests.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/stores/article.js frontend/tests/articleStore.test.js
git commit -m "feat(articles): expose request state"
```

### Task 3: Route-state wiring and parallel startup

**Files:**
- Modify: `frontend/src/App.vue`
- Modify: `frontend/tests/App.test.js`

**Interfaces:**
- Consumes: `articleStore.articles`, `articleStore.isLoading`, `articleStore.error`, and `articleStore.fetchArticles()`.
- Produces for routed components: props `articles`, `articlesLoading`, `articlesError`; event handler `retry-articles`.

- [ ] **Step 1: Add a failing startup-concurrency test**

```js
const mountApp = (router = { push: vi.fn() }) => mount(App, {
  global: {
    plugins: [pinia],
    provide: { [routerKey]: router },
    mocks: { $route: { path: '/' }, $router: router },
    stubs: { RouterView: RouterViewStub }
  }
})

test('starts catalog and article requests without serializing them', async () => {
  let releaseCatalog
  const catalogStore = useCatalogStore()
  const articleStore = useArticleStore()
  catalogStore.fetchCatalog = vi.fn(() => new Promise(resolve => { releaseCatalog = resolve }))
  articleStore.fetchArticles = vi.fn().mockResolvedValue(true)

  mountApp()
  await nextTick()

  expect(catalogStore.fetchCatalog).toHaveBeenCalledOnce()
  expect(articleStore.fetchArticles).toHaveBeenCalledOnce()
  releaseCatalog()
})
```

Use `mountApp()` for the existing tests in this file as a mechanical cleanup; do not create production test hooks.

- [ ] **Step 2: Run the App test and verify failure**

Run: `cd frontend && npm test -- App.test.js`

Expected: FAIL because the article request waits for the unresolved catalog request.

- [ ] **Step 3: Wire route props and parallelize independent startup work**

```vue
<component
  :is="Component"
  :articles="articleStore.articles"
  :articles-loading="articleStore.isLoading"
  :articles-error="articleStore.error"
  @retry-articles="articleStore.fetchArticles"
/>
```

```js
onMounted(async () => {
  await Promise.all([
    catalogStore.fetchCatalog(),
    articleStore.fetchArticles()
  ])
  if (userRole.value === 'admin') await adminStore.fetchOrders()
})
```

Retain every existing routed prop and event not shown in the abbreviated template.

- [ ] **Step 4: Run the App tests**

Run: `cd frontend && npm test -- App.test.js`

Expected: PASS, including mobile navigation and authentication modal coverage.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/App.vue frontend/tests/App.test.js
git commit -m "refactor(app): parallelize startup data"
```

### Task 4: Reading-first article listing

**Files:**
- Modify: `frontend/src/components/ArticlesView.vue`
- Create: `frontend/tests/ArticlesView.test.js`

**Interfaces:**
- Consumes props `articles: Array`, `articlesLoading: boolean`, `articlesError: string | null` and utility functions `articleExcerpt`, `formatArticleDate`.
- Produces event `retry-articles`; semantic links to `{ name: 'article-detail', params: { id } }`.

- [ ] **Step 1: Write failing component-state and semantics tests**

```js
import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'
import ArticlesView from '../src/components/ArticlesView.vue'

const RouterLinkStub = {
  props: ['to'],
  template: '<a :href="`/article/${to.params.id}`"><slot /></a>'
}

const mountView = props => mount(ArticlesView, {
  props,
  global: { stubs: { RouterLink: RouterLinkStub } }
})

test('renders article destinations as links and excerpts as text', () => {
  const wrapper = mountView({ articles: [{ id: 7, title: 'Safe', content: '<b>Read me</b><script>bad()</script>' }] })
  expect(wrapper.get('a[href="/article/7"]').exists()).toBe(true)
  expect(wrapper.get('.article-excerpt').text()).toBe('Read me')
  expect(wrapper.html()).not.toContain('<script>')
})

test.each([
  [{ articlesLoading: true }, '[role="status"]'],
  [{ articlesError: 'offline' }, '[role="alert"]'],
  [{ articles: [] }, '[data-test="articles-empty"]']
])('renders a distinct request state', (override, selector) => {
  const wrapper = mountView({ articles: [], articlesLoading: false, articlesError: null, ...override })
  expect(wrapper.get(selector).exists()).toBe(true)
})

test('emits retry from the failure action', async () => {
  const wrapper = mountView({ articles: [], articlesLoading: false, articlesError: 'offline' })
  await wrapper.get('[data-test="articles-retry"]').trigger('click')
  expect(wrapper.emitted('retry-articles')).toHaveLength(1)
})
```

- [ ] **Step 2: Run the component test and verify failure**

Run: `cd frontend && npm test -- ArticlesView.test.js`

Expected: FAIL because the existing cards are generic clickable divs and request states are conflated.

- [ ] **Step 3: Implement semantic states and safe content**

Use this priority in the template:

```vue
<section v-if="articlesLoading" class="articles-skeleton" role="status" aria-live="polite">
  <span class="sr-only">กำลังโหลดบทความ</span>
</section>
<section v-else-if="articlesError" class="articles-state" role="alert">
  <p>{{ articlesError }}</p>
  <button class="btn btn-primary" data-test="articles-retry" @click="$emit('retry-articles')">ลองอีกครั้ง</button>
</section>
<section v-else-if="articles.length === 0" class="articles-state" data-test="articles-empty">
  <h2>ยังไม่มีบทความ</h2>
</section>
<template v-else>
  <RouterLink class="hero-article" :to="{ name: 'article-detail', params: { id: featuredArticle.id } }">
    <div class="hero-image">
      <img v-if="coverVisible(featuredArticle)" :src="articleImage(featuredArticle)" :alt="featuredArticle.title" @error="markCoverFailed(featuredArticle.id)" />
      <div v-else class="article-image-fallback" role="img" :aria-label="`ไม่มีภาพปกสำหรับ ${featuredArticle.title}`">PCSpec</div>
    </div>
    <div class="hero-content">
      <time>{{ formatArticleDate(featuredArticle.created_at || featuredArticle.date) }}</time>
      <h2>{{ featuredArticle.title }}</h2>
      <p class="article-excerpt">{{ articleExcerpt(featuredArticle.content) }}</p>
      <span class="read-more-link">อ่านต่อ →</span>
    </div>
  </RouterLink>
</template>
```

Track image failures by article id in a `Set` held by `ref`, and render a labelled `.article-image-fallback` when there is no URL or `@error` fires. Call `articleExcerpt(article.content)` and `formatArticleDate(article.created_at || article.date)` in the template; never use `v-html` in this component.

```js
const failedCovers = ref(new Set())
const articleImage = article => article.image_url || article.image || ''
const coverVisible = article => Boolean(articleImage(article)) && !failedCovers.value.has(article.id)
const markCoverFailed = id => failedCovers.value.add(id)
```

Replace inline styles, `minmax(320px, 1fr)`, full-page translate animation, and unconditional hover transforms. Use `minmax(min(100%, 17rem), 1fr)`, phone-first spacing, `:focus-visible`, `@media (hover: hover)`, and a reduced-motion override.

- [ ] **Step 4: Run component and utility tests**

Run: `cd frontend && npm test -- ArticlesView.test.js articleContent.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/ArticlesView.vue frontend/tests/ArticlesView.test.js
git commit -m "feat(articles): redesign reading index"
```

### Task 5: Safe responsive article detail

**Files:**
- Modify: `frontend/src/components/ArticleDetailView.vue`
- Create: `frontend/tests/ArticleDetailView.test.js`

**Interfaces:**
- Consumes props `articles: Array`, `articlesLoading: boolean`, `articlesError: string | null`; current route param `id`; `sanitizeArticleHtml` and `formatArticleDate`.
- Produces event `retry-articles`; visible `/articles` links for recovery and return navigation.

- [ ] **Step 1: Write failing detail-state and sanitization tests**

```js
test('sanitizes rich article content and does not navigate on Escape', async () => {
  const router = { push: vi.fn() }
  const wrapper = mountDetail({
    articles: [{ id: 7, title: 'Article', content: '<p>Safe</p><img src=x onerror=alert(1)><script>bad()</script>' }],
    routeId: '7',
    router
  })
  expect(wrapper.get('.article-content').html()).toContain('<p>Safe</p>')
  expect(wrapper.get('.article-content').html()).not.toMatch(/onerror|script/i)
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  expect(router.push).not.toHaveBeenCalled()
})

test.each([
  [{ articlesLoading: true }, '[role="status"]'],
  [{ articlesError: 'offline' }, '[role="alert"]'],
  [{ articles: [], articlesLoading: false, articlesError: null }, '[data-test="article-not-found"]']
])('renders a distinct detail state', (props, selector) => {
  expect(mountDetail({ ...props, routeId: '404' }).get(selector).exists()).toBe(true)
})

test('uses a stable fallback when the article has no cover', () => {
  const wrapper = mountDetail({ articles: [{ id: 7, title: 'No cover', content: '<p>Body</p>' }], routeId: '7' })
  expect(wrapper.get('.article-image-fallback').attributes('role')).toBe('img')
})
```

Implement the helper with the same injected route objects used by Vue Router:

```js
import { routeLocationKey, routerKey } from 'vue-router'

const mountDetail = ({
  articles = [],
  articlesLoading = false,
  articlesError = null,
  routeId = '7',
  router = { push: vi.fn() }
}) => mount(ArticleDetailView, {
  props: { articles, articlesLoading, articlesError },
  global: {
    provide: {
      [routeLocationKey]: { params: { id: routeId } },
      [routerKey]: router
    },
    stubs: {
      RouterLink: { props: ['to'], template: '<a :href="typeof to === \'string\' ? to : to.path"><slot /></a>' }
    }
  }
})
```

- [ ] **Step 2: Run the detail test and verify failure**

Run: `cd frontend && npm test -- ArticleDetailView.test.js`

Expected: FAIL because loading and not-found share one branch, HTML is unsanitized, and Escape navigates.

- [ ] **Step 3: Implement detail state priority and safe rendering**

```js
const coverFailed = ref(false)
const article = computed(() => props.articles.find(item => String(item.id) === String(route.params.id)) ?? null)
const safeContent = computed(() => sanitizeArticleHtml(article.value?.content))
const articleImage = computed(() => article.value?.image_url || article.value?.image || '')
const coverVisible = computed(() => Boolean(articleImage.value) && !coverFailed.value)
watch(() => article.value?.id, () => { coverFailed.value = false })
```

```vue
<main v-if="articlesLoading" class="article-state" role="status" aria-live="polite">กำลังโหลดบทความ</main>
<main v-else-if="articlesError" class="article-state" role="alert">
  <p>{{ articlesError }}</p>
  <button data-test="article-retry" @click="$emit('retry-articles')">ลองอีกครั้ง</button>
</main>
<main v-else-if="!article" class="article-state" data-test="article-not-found">
  <h1>ไม่พบบทความ</h1>
  <RouterLink to="/articles">กลับไปหน้าบทความ</RouterLink>
</main>
<article v-else class="article-detail-view">
  <RouterLink class="back-link" to="/articles">← กลับไปหน้าบทความ</RouterLink>
  <div class="hero-header">
    <img v-if="coverVisible" class="hero-img" :src="articleImage" :alt="article.title" @error="coverFailed = true" />
    <div v-else class="article-image-fallback" role="img" :aria-label="`ไม่มีภาพปกสำหรับ ${article.title}`">PCSpec</div>
  </div>
  <time>{{ formatArticleDate(article.created_at || article.date) }}</time>
  <h1>{{ article.title }}</h1>
  <div class="article-content" v-html="safeContent"></div>
</article>
```

Remove the global keydown listener. Make the phone hero use an aspect ratio and bounded `clamp()` height instead of `45vh` plus `min-height: 400px`. Keep the body near 70 characters wide. Add deep styles for headings, lists, blockquotes, links, responsive images, `pre`, and code. Make each table its own scroll region with:

```css
.article-content :deep(table) {
  display: block;
  max-width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
}
.article-content :deep(img) { max-width: 100%; height: auto; }
.article-content :deep(a),
.article-content :deep(code) { overflow-wrap: anywhere; }
.article-content :deep(pre) { max-width: 100%; overflow-x: auto; }
```

- [ ] **Step 4: Run detail and utility tests**

Run: `cd frontend && npm test -- ArticleDetailView.test.js articleContent.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/ArticleDetailView.vue frontend/tests/ArticleDetailView.test.js
git commit -m "feat(articles): improve detail reading"
```

### Task 6: Public reading responsive browser coverage

**Files:**
- Create: `frontend/e2e/public-reading-responsive.spec.js`

**Interfaces:**
- Consumes: public `/articles`, `/article/:id`, and the existing Playwright web servers.
- Produces: regression coverage for layout, links, state recovery, focus, rich content, and reduced motion.

- [ ] **Step 1: Write the responsive E2E tests**

```js
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
  const size = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }))
  expect(size.scroll).toBeLessThanOrEqual(size.width)
}

for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1440, height: 900 }]) {
  test(`articles reflow at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await prepare(page)
    await page.goto('/articles')
    await expect(page.getByRole('link', { name: /คู่มือจัดสเปค/ })).toBeVisible()
    await expectNoPageOverflow(page)
    await page.getByRole('link', { name: /คู่มือจัดสเปค/ }).focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/article\/7$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('คู่มือจัดสเปค')
    await expectNoPageOverflow(page)
  })
}
```

Add focused recovery, not-found, motion, and fallback tests in the same file:

```js
test('retries a failed article request', async ({ page }) => {
  let attempts = 0
  await page.route('**/api/v1/hardware/catalog', route => route.fulfill({ json: {} }))
  await page.route('**/api/v1/articles', route => {
    attempts += 1
    return attempts === 1 ? route.fulfill({ status: 503, json: {} }) : route.fulfill({ json: articles })
  })
  await page.goto('/articles')
  await page.getByRole('button', { name: 'ลองอีกครั้ง' }).click()
  await expect(page.getByRole('link', { name: /คู่มือจัดสเปค/ })).toBeVisible()
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
  const duration = await page.locator('.hero-article').evaluate(element => Number.parseFloat(getComputedStyle(element).transitionDuration))
  expect(duration).toBeLessThanOrEqual(0.01)
})
```

- [ ] **Step 2: Run responsive browser coverage**

Run: `cd frontend && npx playwright test --config=e2e/playwright.config.js public-reading-responsive.spec.js`

Expected: PASS because Tasks 1-5 already provide the required overflow, state, fallback, motion, and focus behavior.

- [ ] **Step 3: Run focused and full verification**

Run:

```bash
cd frontend
npm test -- articleContent.test.js articleStore.test.js App.test.js ArticlesView.test.js ArticleDetailView.test.js
npx playwright test --config=e2e/playwright.config.js public-reading-responsive.spec.js
npm test
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 4: Commit**

```bash
git add frontend/e2e/public-reading-responsive.spec.js frontend/src/components/ArticlesView.vue frontend/src/components/ArticleDetailView.vue
git commit -m "test(articles): cover responsive reading"
```

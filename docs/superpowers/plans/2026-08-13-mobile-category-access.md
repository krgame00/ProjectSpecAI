# Mobile Category Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every hardware category reachable in the compact summary and collapse the summary after the user selects a category.

**Architecture:** Keep `PriceSummary` as the single owner of compact-summary state. Prevent its major content sections from shrinking inside the constrained scroll container, then route category activation through one method that emits the selection and closes the panel only on compact viewports.

**Tech Stack:** Vue 3 Composition API, scoped CSS, Playwright E2E, Vitest, Vite

## Global Constraints

- All seven categories must remain reachable at `793x517` and other compact viewports.
- Keep one internal vertical scroll area with `overscroll-behavior-y: auto`.
- Selecting a category must collapse the summary only when the viewport is compact.
- Preserve desktop sticky-sidebar behavior.
- Do not add wheel/touch listeners, a second scroll area, or a new navigation pattern.
- Do not change catalog data, compatibility logic, or page scroll position.

---

## File Structure

- `frontend/e2e/responsive-main-flow.spec.js`: owns the viewport-level regression that proves the last category is reachable and selectable.
- `frontend/src/components/PriceSummary.vue`: owns category activation, compact-summary state, and the flex/overflow layout fix.

### Task 1: Restore complete compact category access

**Files:**
- Modify: `frontend/e2e/responsive-main-flow.spec.js:251`
- Modify: `frontend/src/components/PriceSummary.vue:88`
- Modify: `frontend/src/components/PriceSummary.vue:135`
- Modify: `frontend/src/components/PriceSummary.vue:311`

**Interfaces:**
- Consumes: `isCompactViewport: Ref<boolean>`, `isMobileSummaryOpen: Ref<boolean>`, and the existing `set-active-category` emit contract.
- Produces: `selectCategory(categoryId: string): void`, which emits `set-active-category` and closes the compact summary.

- [ ] **Step 1: Add the failing short-viewport E2E regression**

Add this test after `short viewport summary releases scrolling back to the catalog` in `frontend/e2e/responsive-main-flow.spec.js`:

```js
test('short viewport exposes every category and collapses after selection', async ({ page }) => {
  await page.setViewportSize({ width: 793, height: 517 })
  await prepareApi(page)
  await page.goto('/build')

  const toggle = page.locator('[data-test="mobile-summary-toggle"]')
  const summary = page.locator('#mobile-build-summary')
  const caseCategory = page.locator('.category-button').filter({ hasText: 'Case' })

  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await summary.evaluate(element => { element.scrollTop = element.scrollHeight })

  const summaryBox = await summary.boundingBox()
  const caseBox = await caseCategory.boundingBox()
  expect(caseBox.y).toBeGreaterThanOrEqual(summaryBox.y)
  expect(caseBox.y + caseBox.height).toBeLessThanOrEqual(summaryBox.y + summaryBox.height)

  await caseCategory.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('.category-title-text')).toContainText('Case')
})
```

- [ ] **Step 2: Run the regression to verify RED**

Run:

```powershell
npx.cmd playwright test --config=e2e/playwright.config.js e2e/responsive-main-flow.spec.js --grep "short viewport exposes every category"
```

Working directory: `frontend`

Expected: FAIL because the `Case` button remains below the visible bounds of `#mobile-build-summary`; the clipped category wrapper does not contribute its full natural height to the summary scroll range.

- [ ] **Step 3: Route category activation through the compact-aware method**

In `frontend/src/components/PriceSummary.vue`, retain the emitter and call it from a named method:

```js
const emit = defineEmits(['set-active-category', 'remove-item', 'checkout'])

const selectCategory = (categoryId) => {
  emit('set-active-category', categoryId)
  if (isCompactViewport.value) isMobileSummaryOpen.value = false
}
```

Update the category button binding:

```vue
@click="selectCategory(cat.id)"
```

- [ ] **Step 4: Stop compact flex children from being clipped**

Inside the existing `@media (max-width: 63.99rem)` block in `frontend/src/components/PriceSummary.vue`, add:

```css
.summary-details > * {
  flex-shrink: 0;
}
```

Keep the existing `.summary-details` maximum-height, `overflow-y: auto`, and `overscroll-behavior-y: auto` declarations unchanged.

- [ ] **Step 5: Run focused tests to verify GREEN**

Run:

```powershell
npx.cmd playwright test --config=e2e/playwright.config.js e2e/responsive-main-flow.spec.js --grep "short viewport exposes every category|short viewport summary releases|mobile summary expands"
npm.cmd test -- --run tests/PriceSummary.test.js
```

Expected: 3 Playwright tests pass and all `PriceSummary` component tests pass.

- [ ] **Step 6: Run full verification**

Run from `frontend`:

```powershell
npm.cmd test -- --run
npx.cmd playwright test --config=e2e/playwright.config.js e2e/responsive-main-flow.spec.js
npm.cmd run build
```

Expected: all frontend unit tests pass, all responsive E2E tests pass, and Vite exits with code 0.

- [ ] **Step 7: Inspect and commit the focused change**

Run from the repository root:

```powershell
git diff --check
git diff -- frontend/e2e/responsive-main-flow.spec.js frontend/src/components/PriceSummary.vue
git add frontend/e2e/responsive-main-flow.spec.js frontend/src/components/PriceSummary.vue
git diff --cached --check
git commit -m "fix(ui): restore mobile category access"
```

Expected: the commit contains only the regression test and `PriceSummary` behavior/layout changes.

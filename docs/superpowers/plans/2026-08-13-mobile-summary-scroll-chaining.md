# Mobile Summary Scroll Chaining Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users continue scrolling the hardware catalog after the expanded compact summary reaches its scroll boundary.

**Architecture:** Preserve the existing fixed summary disclosure and its internal scrolling. Change only compact-layout CSS: allow vertical scroll chaining and reduce the expanded panel height cap on short viewports; protect the behavior with a Playwright regression test.

**Tech Stack:** Vue 3, scoped CSS, Playwright.

## Global Constraints

- Preserve the existing summary toggle, safe-area offsets, checkout actions, and SpecAI non-overlap.
- Do not add JavaScript wheel or touch listeners.
- Use native browser scroll chaining with `overscroll-behavior-y: auto`.
- At viewport heights up to 700 CSS pixels, cap expanded summary content at `48dvh`.
- Keep the existing `min(60dvh, 32rem)` cap for taller compact viewports.

---

### Task 1: Restore Catalog Scroll Chaining

**Files:**
- Modify: `frontend/e2e/responsive-main-flow.spec.js`
- Modify: `frontend/src/components/PriceSummary.vue`

**Interfaces:**
- Consumes: `[data-test="mobile-summary-toggle"]` and `#mobile-build-summary` from `PriceSummary.vue`.
- Produces: Compact summary CSS that permits scroll chaining and exposes at most `48dvh` on short viewports.

- [ ] **Step 1: Write the failing regression test**

Append this test to `frontend/e2e/responsive-main-flow.spec.js`:

```js
test('short viewport summary releases scrolling back to the catalog', async ({ page }) => {
  await page.setViewportSize({ width: 883, height: 589 })
  await prepareApi(page)
  await page.goto('/build')
  await page.locator('.product-card .add-btn').first().click()
  await page.locator('[data-test="mobile-summary-toggle"]').click()

  const behavior = await page.locator('#mobile-build-summary').evaluate(element => {
    const style = getComputedStyle(element)
    return {
      maxHeight: Number.parseFloat(style.maxHeight),
      overscrollY: style.overscrollBehaviorY
    }
  })

  expect(behavior.maxHeight).toBeLessThanOrEqual(589 * 0.48 + 1)
  expect(behavior.overscrollY).toBe('auto')
})
```

- [ ] **Step 2: Run the regression test and verify RED**

Run:

```powershell
Set-Location frontend
npx playwright test --config e2e/playwright.config.js e2e/responsive-main-flow.spec.js --grep "short viewport summary"
```

Expected: FAIL because computed `overscrollBehaviorY` is `contain` and the max height is approximately `60dvh`.

- [ ] **Step 3: Implement the minimal CSS fix**

In the existing `@media (max-width: 63.99rem)` block in `PriceSummary.vue`, replace containment with vertical scroll chaining:

```css
.summary-details {
  max-height: min(60dvh, 32rem);
  overflow-y: auto;
  overscroll-behavior-y: auto;
}
```

Add a short-height override after that compact block:

```css
@media (max-width: 63.99rem) and (max-height: 43.75rem) {
  .summary-details {
    max-height: 48dvh;
  }
}
```

- [ ] **Step 4: Verify GREEN and existing responsive behavior**

Run:

```powershell
Set-Location frontend
npx playwright test --config e2e/playwright.config.js e2e/responsive-main-flow.spec.js --grep "short viewport summary|mobile summary expands"
npm test -- --run tests/PriceSummary.test.js
npm run build
```

Expected: Both Playwright tests pass, PriceSummary unit tests pass, and Vite exits 0.

- [ ] **Step 5: Run final diff checks and commit**

```powershell
Set-Location ..
git diff --check
git add frontend/e2e/responsive-main-flow.spec.js frontend/src/components/PriceSummary.vue
git commit -m "fix(ui): release summary scroll chaining"
```

Expected: Commit contains only the regression test and compact summary CSS fix.

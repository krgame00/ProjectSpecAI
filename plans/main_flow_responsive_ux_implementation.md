# Main-Flow Responsive UX — AI Execution Guide

## File and Architecture Mapping

The authoritative task plan is `docs/superpowers/plans/2026-08-12-main-flow-responsive-ux.md`. The approved design is `docs/superpowers/specs/2026-08-12-main-flow-responsive-ux-design.md`.

Implementation stays in the existing Vue 3 frontend:

- `frontend/src/style.css`: shared responsive tokens, safe areas, touch/focus/motion rules
- `frontend/src/App.vue`: adaptive header and authentication modal
- `frontend/src/views/LandingView.vue`: responsive landing surface
- `frontend/src/views/BuilderView.vue`: builder region composition
- `frontend/src/components/HardwareSelection.vue`: catalog and product details
- `frontend/src/components/PriceSummary.vue`: desktop sticky and mobile expandable summary
- `frontend/src/components/CheckoutView.vue`: checkout layout and validation semantics
- `frontend/src/components/ChatbotWindow.vue`: adaptive SpecAI overlay
- `frontend/src/components/ToastNotification.vue`: safe notification layer
- `frontend/e2e/responsive-main-flow.spec.js`: five-viewport acceptance suite

## Step-by-Step Execution Commands

Execute Tasks 1–8 in order from the authoritative plan. Each task follows this loop:

```powershell
Set-Location frontend
npm test -- --run tests/App.test.js tests/BuilderView.test.js tests/HardwareSelection.test.js tests/PriceSummary.test.js tests/CheckoutView.test.js tests/ChatbotWindow.test.js
npx playwright test --config=e2e/playwright.config.js e2e/responsive-main-flow.spec.js
npm run build
Set-Location ..
git diff --check
git status --short
```

Use the exact test paths, expected failure, implementation snippet, verification command, and commit boundary stated in each task. Do not batch Tasks 1–8 into one commit.

## Code Rules and Edge-Case Handling

- Preserve one Vue/Pinia state graph for every viewport; CSS handles presentation, while JavaScript handles drawer/disclosure/dialog state only.
- Keep existing component props, emitted events, route names, API URLs, authentication, compatibility, order, and chatbot behavior stable.
- Test 320 × 568, 390 × 844, 768 × 1024, 1024 × 768, and 1440 × 900.
- Prevent page-level horizontal overflow from long hardware model names, Thai copy, prices, images, category navigation, and overlays.
- Use `100dvh` plus safe-area insets for phone overlays; do not assume `100vh` equals usable mobile height.
- Coarse-pointer targets are at least 44 × 44 CSS pixels; phone form inputs use at least 16 px text.
- Hover may enhance, never unlock, functionality.
- Pair status color with visible text or an icon.
- Use semantic z-index tokens rather than arbitrary large values.
- Preserve visible focus and honor `prefers-reduced-motion`.
- Do not claim physical-device validation unless one iPhone and one Android phone were actually used.

## Testing and Verification Checklist

- [ ] Task-specific failing test observed before each implementation.
- [ ] Task-specific tests pass after each implementation.
- [ ] Existing `App`, `BuilderView`, `HardwareSelection`, `ChatbotWindow`, checkout, compatibility, and store tests pass.
- [ ] Vite production build exits 0.
- [ ] Responsive Playwright suite passes at all five target viewports.
- [ ] No page-level horizontal scroll.
- [ ] No header/summary/chat/modal/toast overlap.
- [ ] Keyboard navigation and visible focus verified.
- [ ] Reduced-motion behavior verified.
- [ ] Landing, Builder, Checkout, and SpecAI screenshots reviewed.
- [ ] Real iPhone validation recorded as complete or pending.
- [ ] Real Android validation recorded as complete or pending.

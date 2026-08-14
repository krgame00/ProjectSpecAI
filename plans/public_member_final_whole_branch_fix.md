# Public/Member Final Whole-Branch Fix Plan

**Goal:** Close the final accessibility, navigation, responsive-image, semantic-landmark, and navigation-rejection findings without changing routes, APIs, Admin workflows, or business logic.

**Architecture:** Keep untrusted article input restricted to the existing DOMPurify allowlist, then perform a trusted DOM enhancement pass that wraps sanitized tables in named focusable scroll regions. Keep route focus ownership in `App.vue` and trigger it only from actual route transitions. Let `ProfileView.vue` remain a labelled route-level `main` by default while accepting an explicit embedded context from the existing Admin profile tab.

**Tech stack:** Vue 3 Composition API, Vue Router 4, Pinia 3, DOMPurify, Vitest/Vue Test Utils, Playwright, scoped CSS.

## File and architecture map

- `frontend/src/utils/articleContent.js`: sanitize first; add trusted table wrappers and normalized machine-readable datetimes after sanitization.
- `frontend/src/components/ArticleDetailView.vue`: render enhanced rich content, contain table overflow, handle horizontal arrow keys, expose a route-focus heading, and bind `<time datetime>`.
- `frontend/src/components/ArticlesView.vue`: expose a route-focus heading, bind `<time datetime>`, and give the phone feature cover a definite bounded box.
- `frontend/src/App.vue`: focus and announce the destination heading after route transitions only.
- `frontend/src/views/ProfileView.vue`: visible AA loading copy, rejection-safe landing replacement, and context-aware semantic root.
- `frontend/src/components/AdminDashboard.vue`: mark the existing profile embed explicitly; no layout or workflow redesign.
- `frontend/tests/articleContent.test.js`, `ArticleDetailView.test.js`, `ArticlesView.test.js`, `App.test.js`, `ProfileView.test.js`, and a focused Admin regression: component contracts and failure branches.
- `frontend/e2e/public-reading-responsive.spec.js`: real keyboard table scrolling, route focus/announcement, datetime, and successful phone cover bounds.
- `frontend/e2e/profile-responsive.spec.js`: computed loading-text contrast while retaining status and footprint.

## TDD execution

### 1. Trusted rich-content enhancement and dates

1. Add tests proving author `tabindex`, ARIA, role, and wrapper classes are stripped while sanitized tables receive trusted `role=region`, a stable label, `tabindex=0`, and a non-author-controlled class.
2. Add detail component and browser tests proving the wrapper receives keyboard focus, ArrowRight changes `scrollLeft`, and initially off-screen cells become reachable without page overflow.
3. Add list/detail tests for valid machine-readable `datetime` values and omission for unparseable legacy display dates.
4. Run the focused tests and record the expected failures before production edits.
5. Implement the smallest enhancement/date helpers and wrapper CSS/keyboard behavior; rerun to green.

### 2. Route focus and phone cover bounds

1. Add App/component and Playwright tests that activate an article link with Enter, focus and announce its destination heading, then activate Back with the keyboard and focus/announce the article-list heading.
2. Assert unrelated same-route state changes do not invoke the route focus handoff.
3. Add a 320 px successful-cover browser case that verifies a definite bounded feature image box and `object-fit: cover`.
4. Run red, implement transition-scoped focus/announcement plus phone image sizing, and rerun green.

### 3. Profile perception, safe redirects, and Admin semantics

1. Add component/browser assertions for visible loading copy and a computed contrast ratio of at least 4.5:1 on the resolved background while retaining `role=status`, `aria-live=polite`, four skeleton rows, and action footprint.
2. Add a direct missing-token component case where `router.replace('/')` rejects; prove no profile request occurs and the rejection is consumed.
3. Add default-profile and actual Admin-embed regressions: `/profile` has one labelled `main`; the Admin profile tab has exactly the existing `main.admin-main` and no nested main.
4. Run red, implement a safe replace helper and explicit embedded root, update only the existing Admin call site, and rerun green.

## Code rules and edge cases

- Never add author-controlled `tabindex`, ARIA, roles, classes, styles, IDs, or data attributes to the sanitizer allowlist.
- Trusted wrappers are created only after DOMPurify returns sanitized markup.
- Arrow-key handling applies only when the focused target is a generated table region; it must not hijack keys from links, code, or other article content.
- Route focus runs only on route component transitions, never article-store/profile state updates or modal changes.
- Invalid legacy date strings keep their current visible fallback and receive no `datetime` attribute.
- Navigation replacement is best-effort and must safely consume synchronous throws and rejected/cancelled promises.
- `ProfileView` defaults to `main[aria-labelledby=profile-title]`; only explicit embeds render a section.
- Admin receives no redesign and no new data/API behavior.

## Verification checklist

Run from `F:\Projects\PCSpec\.worktrees\public-member-reading-refresh\frontend`:

1. `npm test -- articleContent.test.js ArticleDetailView.test.js ArticlesView.test.js App.test.js ProfileView.test.js AdminDashboard.test.js`
2. `npx playwright test --config=e2e/playwright.config.js public-reading-responsive.spec.js`
3. `npx playwright test --config=e2e/playwright.config.js profile-responsive.spec.js`
4. `npm test`
5. `npm run build`

Then run from the worktree root:

6. `git diff --check`
7. `git status --short`
8. Review `git diff -- frontend plans` for scope, unsafe sanitizer expansion, duplicate landmarks, focus-stealing, and accidental backend/schema changes.
9. Record exact red/green/full-suite results and the final commit in `.superpowers/sdd/2026-08-13-member-profile-experience/final-whole-branch-fix-report.md`.

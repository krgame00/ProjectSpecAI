# UI Polish: 4 Key Enhancement Points (PCSpec)

## Overview & Objectives
Address 4 key UI/UX friction and inconsistency points identified during comprehensive multi-viewport browser audit:
1. **Share Modal Theme Harmonization (`ShareBuildModal.vue`)**: Migrate hardcoded light theme colors to project Supabase dark design tokens.
2. **Mobile Chatbot FAB Clearance (`ChatbotWindow.vue`)**: Prevent `.chat-fab` from colliding with the mobile summary drawer on viewports <= 63.99rem.
3. **Articles View Global Focus Outline Cleanup (`ArticlesView.vue`)**: Remove the accidental 2px green bounding outline on the entire viewport wrapper.
4. **Hardware Product Cards Image Inset Polish (`HardwareSelection.vue`)**: Refine `.product-img` and `.product-img-wrapper` with a crisp white stage inset and hairline border.

---

## 1. File & Architecture Mapping
- [frontend/src/components/ShareBuildModal.vue](file:///f:/Projects/PCSpec/frontend/src/components/ShareBuildModal.vue): Modal backdrop, card, input, QR container, buttons.
- [frontend/src/components/ChatbotWindow.vue](file:///f:/Projects/PCSpec/frontend/src/components/ChatbotWindow.vue): Mobile media query for `.chat-fab` positioning.
- [frontend/src/components/ArticlesView.vue](file:///f:/Projects/PCSpec/frontend/src/components/ArticlesView.vue): Focus-visible outline removal on `.articles-view`.
- [frontend/src/components/HardwareSelection.vue](file:///f:/Projects/PCSpec/frontend/src/components/HardwareSelection.vue): Clean product image background and border treatment.

---

## 2. Step-by-Step Execution Plan
1. **Refactor `ShareBuildModal.vue`**:
   - Replace `--bg-surface`, `--text-main`, `#ffffff`, `#f9fafb`, `#e5e7eb`, `#d1d5db` with `var(--canvas-night)`, `var(--canvas-soft)`, `var(--ink)`, `var(--ink-mute)`, `var(--hairline-cool)`, and `var(--primary)`.
   - Preserve white background on `.qr-box` for smartphone QR reader scanning contrast.
2. **Update `ChatbotWindow.vue`**:
   - In mobile media query (`max-width: 63.99rem`), set `.chat-fab` bottom to `calc(var(--mobile-summary-offset, 4.75rem) + 1rem + env(safe-area-inset-bottom))`.
3. **Refactor `ArticlesView.vue`**:
   - Remove `.articles-view:focus-visible` outline.
4. **Update `HardwareSelection.vue`**:
   - Set `.product-img` background to `#ffffff`, with `border: 1px solid var(--hairline-cool)`, `border-radius: var(--radius-md)`.
   - Set `.product-img-wrapper` in detail modal to matching clean styling.
5. **Verification & Testing**:
   - Run Vitest frontend suite (186 tests).
   - Run Jest backend suite (172 tests).
   - Compile production build (`vite build`).
   - Run Playwright Edge browser verification script and capture comparison screenshots.
   - Stage, commit, and push to `origin main`.

---

## 3. Verification & Testing Checklist
- [x] **Item 1: Share Modal Theme**:
  - Modal card now uses `var(--canvas-night)` and hairline borders matching Supabase theme.
  - QR Code tile maintains solid white background for high camera scan contrast.
  - Evidence: `audit_fixed_1_share_modal.png`.
- [x] **Item 2: Mobile Chatbot FAB Clearance**:
  - `.chat-fab` bottom positioned with `calc(var(--mobile-summary-offset, 4.75rem) + 2.5rem)`.
  - Bounding box y=668, height=60, clear of mobile bottom drawer with 26px breathing room.
  - Evidence: `audit_fixed_2_mobile_fab.png`.
- [x] **Item 3: Articles Focus Outline Removal**:
  - Removed obsolete container `:focus-visible` and added global `[tabindex="-1"]:focus { outline: none !important; }`.
  - Clean edge without 2px green debug border on `/articles` and `/article/:id`.
  - Evidence: `audit_fixed_3_articles.png`.
- [x] **Item 4: Hardware Cards Inset Polish**:
  - Set `.product-img` and `.product-img-wrapper` to `#ffffff` with `border: 1px solid var(--hairline-cool)`.
  - High-contrast, clean e-commerce presentation without gray cutouts.
  - Evidence: `audit_fixed_4_builder_cards.png`.
- [x] **Automated Suites**:
  - Vitest: 25/25 files, 186/186 passed.
  - Jest: 19/19 suites, 172/172 passed.
  - Build: `vite build` completed in 756ms with 0 errors.

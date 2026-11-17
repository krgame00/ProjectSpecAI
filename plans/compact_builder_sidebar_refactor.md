# 🎨 Plan & Technical Spec: Compact Builder Sidebar Refactor

## 1. File & Architecture Mapping
- **Component File**:
  - `frontend/src/components/PriceSummary.vue`:
    - Refactored `.cat-selected-item` from a bulky ~215px vertical block (with 4-row specs table and full-width block remove button) into a high-density, sleek ~93px card (~57% vertical height reduction).
    - `selected-compact-wrap`: Encapsulates component name, formatted price in emerald green, compact horizontal spec tags (`.spec-chip font-mono`), and touch-accessible remove button (`.sidebar-remove-btn`).
    - Maintained WCAG touch targets (`min-width: 44px; min-height: 44px`) on `.sidebar-remove-btn` to satisfy accessibility standards and E2E mobile tests.

---

## 2. Step-by-Step Execution Commands for AI

```bash
# 1. Run Frontend Vitest Unit Tests
cd frontend
npx vitest run tests/PriceSummary.test.js

# 2. Run All Frontend Vitest Tests
npx vitest run

# 3. Build Frontend Production Bundle
npm run build

# 4. Verify Live Visual Rendering & Touch Targets in Edge Browser
node ../.gemini/antigravity/brain/d0ba5ceb-b70f-4d26-88b3-019e5bdf888e/scratch/verify_compact_sidebar.cjs
```

---

## 3. Code Rules & Edge-case Handling

1. **Touch Target Preservation**:
   - `.sidebar-remove-btn` must maintain `min-width: 44px; min-height: 44px` on mobile viewports per WCAG AAA touch targets and `responsive-main-flow.spec.js`.
2. **Horizontal Chip Overflow Handling**:
   - `.item-specs-compact` uses `flex-wrap: wrap; gap: 0.25rem` to gracefully wrap chips on narrower mobile screens without horizontal page overflow.
3. **Typography & Truncation**:
   - `.item-name` truncates gracefully with `text-overflow: ellipsis` and `white-space: nowrap` to prevent multiline vertical stretching.

---

## 4. Testing & Verification Checklist

- [x] **Frontend Unit Tests**: 25/25 files passed, 186/186 tests green.
- [x] **Production Bundle**: `vite build` completed in 936ms.
- [x] **Height Reduction Benchmark**:
  - Previous height: ~215px per selected item.
  - New height: 93px per selected item (57% reduction).
  - Touch target: width=65px, height=44px (compliant).
- [x] **Visual Evidence**:
  - `sidebar_closeup.png`: Shows clean, compact, emerald-accented hardware cards in sidebar.

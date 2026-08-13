# Mobile Category Access Design

## Problem

On compact viewports, `PriceSummary` constrains `.summary-details` to a
viewport-relative height. Its direct flex children are allowed to shrink, and
`.category-list-wrap` clips overflow. The category section can therefore
collapse to only a few visible rows—or no usable height at all—even though all
seven category buttons remain in the DOM. Users cannot reach GPU, Storage,
Power Supply, or Case.

## Approved Behavior

- All seven hardware categories remain reachable on compact phone and tablet
  viewports, including short landscape-like screens.
- The summary panel retains one internal vertical scroll area.
- Scrolling reaches the complete category list and continues to chain back to
  the catalog at the scroll boundaries.
- Selecting a category updates the active category and immediately collapses
  the compact summary so the matching product catalog is visible.
- Desktop behavior remains unchanged.

## Design

Prevent the major sections inside `.summary-details` from shrinking. Their
natural heights will then contribute to the scroll container's `scrollHeight`
instead of being compressed and clipped. Keep the existing compact maximum
height and `overscroll-behavior-y: auto` rules.

Route category selection through a small component method. The method emits
`set-active-category` first, then closes the panel only when the component is
in its compact viewport mode. Desktop selection continues to leave the sticky
sidebar visible.

No new navigation pattern, second nested scroll area, or JavaScript wheel/touch
handler is introduced.

## Accessibility and Interaction

- Existing semantic category buttons and 44px-plus touch targets are retained.
- Keyboard activation uses the same selection method as pointer activation.
- Collapsing the panel does not move focus programmatically; the selected
  button remains the activation source while the main catalog updates.
- The mobile summary toggle remains available to reopen the panel.

## Verification

Add a Playwright regression at `793x517` that:

1. Opens the compact summary.
2. Confirms the panel has real overflow and can scroll to the last category.
3. Selects `Case` through the real category button.
4. Confirms the summary collapses.
5. Confirms the main catalog heading changes to `Case`.

Retain the existing short-viewport scroll-chaining and summary-launcher tests,
then run the component tests, full frontend unit suite, responsive E2E suite,
and production build.

## Out of Scope

- Redesigning categories as tabs, a carousel, or a separate drawer.
- Changing desktop sidebar layout.
- Changing catalog data or compatibility logic.
- Auto-scrolling the page after category selection.

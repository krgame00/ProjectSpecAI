# Admin Professional Operations Design

**Date:** 2026-08-22

**Status:** Approved

**Scope:** Refine the existing responsive Admin interface into a professional operations console. Preserve all routes, CRUD contracts, authorization behavior, responsive mobile cards, and production data.

## Goal

Help operators scan, search, filter, and act on orders, inventory, articles, and users quickly without making the interface visually noisy or changing backend APIs.

## Approved Direction

Use a compact professional operations layout:

- Clear section headers with title, description, and visible result count.
- One toolbar per collection containing local search, relevant filters, and primary actions.
- Dense, readable desktop tables with sticky headers and deliberate column widths.
- Consistent status badges and action controls.
- Existing mobile cards and sticky tab navigation remain the mobile presentation.
- Search and filtering operate only on data already loaded into the page.

## Admin Shell

The desktop sidebar becomes narrower and visually quieter. Navigation icons, labels, spacing, and active state use one consistent system. The active section uses surface, border, and text emphasis rather than a decorative stripe. The return-to-store action remains available but does not dominate the sidebar.

The page heading and section content establish two levels of hierarchy: the Admin context and the active operational task. Main content remains bounded on large screens and uses available width without forcing page-level horizontal scrolling.

## Collection Headers and Toolbars

Orders, Inventory, Articles, and Users receive a shared operations-header pattern:

- Section title and short task-oriented description.
- Result count that updates after filtering.
- Search input with an accessible label and clear button.
- Domain-specific filters.
- Primary action placed at the end of the toolbar.

Toolbar controls wrap at tablet widths and stack cleanly on mobile. Controls retain at least a 44px target on touch devices.

### Orders

- Search by order ID or customer name.
- Filter by order status.
- Keep status update and details actions available in both table and mobile card presentations.

### Inventory

- Search by product ID, name, or visible summary specification.
- Keep category selection as the primary inventory filter.
- Group Sync Prices and Add Product as explicit operations.

### Articles

- Search by article ID or title.
- Filter by update date using an unobtrusive date control.
- Keep Add Article as the primary operation.

### Users

- Search by user ID, name, or email.
- Filter by role.
- Preserve self-protection rules for role and delete actions.

## Table Design

Desktop and tablet tables use:

- Sticky column headers within the scroll region.
- Compact but readable rows with consistent vertical alignment.
- Monospace treatment for IDs, dates, and prices only.
- Right alignment for numeric values.
- Fixed image and action columns.
- Controlled one- or two-line truncation for long article and product titles.
- Clear row hover and keyboard focus-within states.
- Consistent action groups; destructive actions remain visually distinct.

Order status uses semantic badges for Pending, Assembling, and Shipped. Status selection remains a form control and must not be replaced by a decorative-only badge.

## Filtering Behavior

Filtering is local and reactive. It must not create network requests or modify Pinia store arrays.

- Search is case-insensitive and trims surrounding whitespace.
- Multiple active controls combine with AND behavior.
- Result counts reflect the filtered collection.
- When the underlying prop/store data changes after a successful CRUD mutation, filtered results update automatically.
- Clearing search or resetting filters restores the complete loaded collection.
- No-match states say that no results match the current filters and provide a reset action.
- Truly empty collections retain their existing empty-state meaning.

## Responsive Parity

At widths up to 640px, mobile cards consume the same filtered computed collections as desktop tables. Search and filters remain above the cards. Existing full-screen dialogs, sticky navigation, touch targets, and no-page-overflow guarantees remain unchanged.

At 641–1024px, toolbars wrap and tables remain inside labelled horizontal scroll regions. Above 1024px, the compact sidebar and dense full tables are used.

## Visual and Accessibility Rules

- Reuse existing ForgeLabs tokens and dark theme.
- Do not add an icon library or new dependency.
- Use restrained accent color for active state, focus, and primary actions.
- Avoid gradients, glass effects, decorative animation, excessive rounding, and emoji-driven hierarchy.
- Inputs have persistent labels or accessible names.
- Search clear/reset actions are keyboard reachable.
- Sticky headers preserve sufficient contrast over scrolled content.
- Respect `prefers-reduced-motion` through the existing Admin rule.

## States and Error Handling

Existing pending, success, error, session-expired, and retry behaviors remain unchanged. Filters do not hide mutation feedback. Failed CRUD operations keep existing form content and visible records as before.

## Testing Strategy

Implementation follows TDD:

- Component tests prove each search/filter combination, reset behavior, result count, and table/card parity using real rendered content.
- Existing Admin CRUD component and store tests remain green.
- Playwright verifies the operations layout at 320px, 768px, and 1440px, including sticky headers, toolbar reflow, local filtering, action reachability, and absence of page-level horizontal overflow.
- Full frontend tests and production build run before completion.

## Non-Goals

- No backend search, server pagination, API, route, database, or schema changes.
- No production-record creation, update, deletion, or cleanup.
- No changes to public or member-facing interfaces.

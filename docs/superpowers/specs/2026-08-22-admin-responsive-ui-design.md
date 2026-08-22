# Admin Responsive UI Design

**Date:** 2026-08-22

**Status:** Approved

**Scope:** Admin presentation and interaction across mobile, tablet, and desktop. Existing routes, CRUD contracts, authorization, and production data remain unchanged.

## Goal

Make every Admin workflow usable at 320px through large desktop widths without hiding essential actions, forcing page-level horizontal overflow, or making operators scroll through a full navigation sidebar before reaching content.

## Approved Direction

Use a responsive hybrid interface:

- Mobile uses a sticky, horizontally scrollable Admin tab bar and card-based collection views.
- Tablet uses the same sticky tab navigation with responsive tables that can scroll inside their own region.
- Desktop retains a compact sidebar and full data tables.
- Dashboard metrics, toolbars, forms, and dialogs reflow structurally rather than only shrinking.

## Information Architecture

The existing sections remain unchanged: Dashboard, Orders, Inventory, Articles, Users, and Admin Profile. Section names, permissions, and data operations do not change.

At widths up to 1024px, the sidebar becomes a sticky horizontal tab list below the Admin heading. The active tab must stay visually distinct, keyboard reachable, and automatically visible when selected. The return-to-store action remains available without competing with section tabs.

Above 1024px, the current two-column shell remains, with a compact sticky sidebar and the content column using the available width.

## Responsive Layout

### Mobile: 320–640px

- One-column page with no page-level horizontal overflow.
- Sticky horizontal navigation with swipe/scroll support and a visible active state.
- KPI cards use one column.
- Orders, inventory, articles, and users render as semantic summary cards.
- Each card exposes the primary fields and a grouped action area; secondary detail can be expanded or opened using the existing workflow.
- Toolbars stack controls, with the primary action full-width where appropriate.
- Form fields use one column and controls have a minimum 44px target size.
- Edit/create dialogs become full-screen sheets with a scrollable body and sticky footer actions.

### Tablet: 641–1024px

- Sticky horizontal navigation remains.
- KPI cards use two columns where space permits.
- Collection views use tables inside labelled horizontal scroll regions.
- Important identity columns may remain sticky, while actions remain reachable.
- Toolbars wrap naturally without overlapping or clipping.
- Forms may use two columns when individual fields retain readable width.

### Desktop: above 1024px

- Compact sidebar plus main content layout.
- KPI cards use three columns.
- Full tables remain the primary collection view.
- Content width and spacing stay bounded for readability on very wide screens.

## Collection Views

Mobile cards and tablet/desktop tables represent the same state and actions. They must not duplicate network requests or business logic. A CSS breakpoint selects the appropriate presentation while Vue handlers and data remain shared.

Cards prioritize:

- Orders: order ID, customer, total, status, date, and details action.
- Inventory: product identity, category, price, key spec, edit, and delete.
- Articles: title, date, edit, and delete.
- Users: identity, role, role toggle, and delete.

Destructive actions remain visually distinct and require the existing confirmation behavior. Pending actions disable only the affected controls and preserve retryable form content on failure.

## Dashboard, Toolbars, and States

- Dashboard KPI cards reflow from 3 to 2 to 1 columns.
- Headers and toolbars use reusable classes instead of fragile inline fixed-width layout.
- Loading, empty, and error states occupy the content region and provide clear recovery actions when available.
- Tables receive an accessible label and scroll hint where horizontal scrolling is required.
- Mobile cards and tables show the same success/error state produced by the existing Admin store.

## Dialogs and Forms

- Dialog headings remain visible while the body scrolls.
- Mobile dialogs fill the viewport with safe padding and sticky Cancel/Save actions.
- Tablet and desktop dialogs keep a bounded width and height.
- Multi-column inline grids become reusable responsive form-grid classes.
- Focus enters the dialog, remains contained, and returns to the trigger on close using the existing dialog behavior where present.
- Upload previews and long technical-spec values shrink without overflowing.

## Visual and Accessibility Rules

- Reuse the existing ForgeLabs dark theme, spacing, typography, and design tokens.
- Remove the active sidebar's decorative left stripe; use surface, border, and text treatment that works in horizontal and vertical navigation.
- Maintain visible `:focus-visible` states and at least 44px mobile interaction targets.
- Preserve source order and semantic headings.
- Respect `prefers-reduced-motion`; motion is limited to purposeful 150–250ms state transitions.
- Avoid decorative gradients, glass effects, excessive rounding, and animation unrelated to task feedback.

## Testing Strategy

Implementation follows TDD.

- Component tests cover navigation semantics, mobile-card/table parity, pending controls, dialog structure, and accessible scroll regions.
- CSS/source-linked tests verify the actual component styles and breakpoint behavior rather than copied CSS strings.
- Admin Playwright tests run at representative 320px, 768px, and 1440px widths and verify navigation, real collection content, actions, dialog reachability, keyboard focus, and absence of page-level horizontal overflow.
- Existing Admin CRUD tests remain green to prove the redesign does not alter API behavior.
- Full frontend unit tests and production build run before completion.

## Non-Goals

- No API, backend, database, authorization, route, or CRUD contract changes.
- No modification or cleanup of production records.
- No redesign of public/member pages in this round.

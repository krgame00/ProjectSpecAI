# PCSpec Main-Flow Responsive UX Design

**Date:** 2026-08-12
**Status:** Approved for implementation planning
**Selected direction:** Balanced Adaptive

## 1. Goal and Scope

Improve the primary PCSpec journey across phones, tablets, laptops, and large desktop displays while preserving the current information architecture and Supabase-inspired visual identity.

The priority journey is:

1. Landing page
2. PC Builder and hardware selection
3. Price summary
4. Checkout
5. SpecAI assistant used during that journey

Shared UI that directly affects this journey is also in scope: application header, authentication modal, toast notifications, loading states, and empty/error states.

Admin, profile, and article redesigns are not part of this iteration. Shared responsive tokens may improve them incidentally, but page-specific changes to those areas require separate work.

## 2. Existing Architecture and File Mapping

The implementation stays within the existing Vue 3 Composition API, Vue Router, Pinia, and custom CSS architecture. It must not introduce separate mobile and desktop component trees.

| Responsibility | Existing file | Planned responsibility |
| --- | --- | --- |
| Global tokens, layout, header, controls | `frontend/src/style.css` | Responsive spacing, safe areas, touch targets, overflow safeguards, shared focus and reduced-motion rules |
| Application shell and authentication modal | `frontend/src/App.vue` | Adaptive header/navigation and small-screen modal behavior |
| Marketing entry point | `frontend/src/views/LandingView.vue` | Fluid hero, action stacking, responsive hardware scene, feature layout |
| Builder page composition | `frontend/src/views/BuilderView.vue` | Preserve data flow while coordinating adaptive selection and summary regions |
| Product discovery and details | `frontend/src/components/HardwareSelection.vue` | Responsive category navigation, filters, product grid, detail overlays, readable cards |
| Build total and selected parts | `frontend/src/components/PriceSummary.vue` | Desktop sticky sidebar and mobile compact summary with expandable details |
| Checkout form and order summary | `frontend/src/components/CheckoutView.vue` | Adaptive form layout, touch-friendly controls, contextual validation |
| SpecAI | `frontend/src/components/ChatbotWindow.vue` | Desktop floating window and mobile near-full-screen presentation with keyboard/safe-area support |
| Notifications | `frontend/src/components/ToastNotification.vue` | Width, safe-area, and overlay coordination |
| Browser-flow verification | `frontend/e2e/*.spec.js` | Responsive primary-flow and overlay regression coverage |

## 3. Considered Approaches

### A. Balanced Adaptive — selected

Keep one information architecture and component model, but structurally reflow content for the available space. Phones receive a focused single-column journey and reachable actions; tablets use one or two columns based on content fit; desktop retains the established two-column builder.

This provides a meaningful mobile improvement without introducing a second navigation model or duplicating application logic.

### B. Mobile App-like

Make mobile the dominant model with bottom navigation and stronger progressive disclosure. This is highly touch-friendly but changes navigation behavior, increases component restructuring, and creates a larger regression surface.

### C. Desktop-preserving

Keep the current layout and mainly fix overflow, spacing, and touch sizes. This is the lowest-risk implementation but leaves mobile feeling like a compressed desktop interface.

## 4. Responsive Architecture

Breakpoints are content-driven. The initial verification ranges are:

- Phone: 320–767 px
- Tablet: 768–1023 px
- Desktop: 1024 px and above

These ranges are test anchors, not permission to force a layout that has already become crowded. Components may reflow earlier when their content no longer fits.

### Phone

- Use a single primary content column.
- Collapse global navigation into an accessible drawer while preserving the same destinations.
- Keep primary actions full-width where that improves reach and prevents label wrapping.
- Permit two product-card columns only when names, prices, imagery, and actions remain readable; otherwise use one column.
- Place price status and the main continuation action within easy thumb reach without permanently obscuring content.
- Respect viewport safe-area insets and mobile browser chrome.

### Tablet

- Use one or two columns according to orientation and actual content width.
- Show hardware catalog and price summary side by side when both remain usable.
- Preserve touch targets of at least 44 × 44 CSS pixels even when the layout becomes denser.
- Support portrait, landscape, touch, pointer, and hybrid input.

### Desktop

- Retain the builder's two-column working model.
- Constrain overall content width so lines, cards, and controls do not stretch across large displays.
- Keep the price summary sticky when viewport height and layout permit.
- Provide hover enhancements only when hover is available; no core action may depend on hover.

## 5. Surface Design

### Landing Page

- Reduce hero type, spacing, and decorative scene height on narrow screens.
- Stack primary and secondary calls to action and give them sufficient tap area.
- Convert the floating hardware scene into a stable vertical or compact horizontal list on small screens.
- Reflow feature content without horizontal overflow.
- Preserve existing Emerald, white canvas, system typography, hairline borders, and restrained elevation.
- Disable nonessential floating/pulse animation for `prefers-reduced-motion`.

### Builder and Hardware Selection

- Make category navigation discoverably scrollable or wrapping without clipping selected state.
- Ensure product names, specification labels, prices, images, and actions fit at 320 px.
- Use consistent card density rather than shrinking text below readable sizes.
- Adapt filters and product details into viewport-fitting panels; overlays must not be clipped by ancestors.
- Keep selection state and compatibility guidance identical across device sizes.

### Price Summary

- Desktop: remain a sticky sidebar next to product selection.
- Tablet: stay beside the catalog only while both panels have adequate width.
- Phone: become a compact bottom summary that exposes total and continuation action and can expand to show selected components.
- The compact summary must coordinate with SpecAI, safe-area insets, and page scrolling so no action is covered.
- Expansion must preserve focus, support keyboard use, and expose an accessible name and state.

### Checkout

- Stack form and order summary into one column on narrow screens.
- Keep form labels visible and fields at least 16 px text size to avoid unwanted mobile zoom.
- Show validation adjacent to the related field and move focus to the first invalid field on submission.
- Keep order totals and submission action readable without horizontal squeezing.

### SpecAI

- Desktop: retain the floating window behavior and existing reading-position behavior.
- Phone: open as a near-full-screen surface bounded by safe areas.
- Account for the on-screen keyboard using dynamic viewport sizing rather than fixed `100vh` assumptions.
- Keep composer, send control, close control, and conversation content reachable without overlap.
- Coordinate the closed launcher and open window with the mobile price summary.

### Shared Shell and Feedback

- Collapse header navigation without removing destinations or changing route structure.
- Keep authentication modals within the viewport, with internal scrolling only when content genuinely exceeds the available height.
- Keep toasts within the visible width and away from safe-area edges, sticky actions, and SpecAI.
- Define a semantic layer order for header, sticky summary, chatbot, modal backdrop, modal, and toast.

## 6. Interaction and Accessibility

- Interactive targets are at least 44 × 44 CSS pixels on coarse-pointer devices.
- All interactive components provide consistent default, hover where supported, focus-visible, active, disabled, loading, and error states.
- Keyboard navigation follows DOM order and remains visible through focus styling.
- Icon-only controls have accessible names; expanded/collapsed controls expose state.
- Incompatibility, error, warning, and success messages combine text or iconography with color.
- Body and form text meet WCAG AA contrast requirements against the actual surface.
- Long Thai and English text, hardware model identifiers, and prices wrap or truncate intentionally without causing page-level horizontal scrolling.
- Motion is brief and state-driven. Reduced-motion users receive instant changes or simple crossfades.

## 7. State and Data Flow

Pinia stores, API calls, routes, checkout logic, authentication behavior, compatibility calculations, and chatbot session behavior remain unchanged.

Responsive state is presentation-only:

- CSS and input-capability queries handle layout and touch density where possible.
- JavaScript state is allowed only for real interaction state such as navigation drawer, expanded mobile summary, product detail panel, or chatbot visibility.
- Responsive behavior must not create duplicate catalog requests, duplicate selected-component state, or device-specific persistence.
- Closing or crossing a breakpoint must leave interactive surfaces in a valid state; hidden overlays must not retain focus or block the page.

## 8. Loading, Empty, and Error Handling

- Loading placeholders fit the final responsive geometry and do not shift primary controls unexpectedly.
- Empty states explain the next useful action, including how to begin selecting components.
- API and checkout failures stay readable at 320 px and remain associated with the action that failed.
- Offline or delayed responses must not strand the user behind a permanent overlay.
- Product imagery retains aspect ratio and uses a stable placeholder when missing or broken.

## 9. Verification Strategy

Existing unit and component tests must continue to pass. Add focused responsive browser tests for the primary journey at these viewports:

- 320 × 568: minimum supported phone
- 390 × 844: common modern phone
- 768 × 1024: portrait tablet
- 1024 × 768: landscape tablet or compact laptop
- 1440 × 900: desktop

Verification covers:

1. Landing page calls to action and hero content
2. Header navigation open, use, close, and keyboard focus
3. Hardware-category navigation, product selection, and long product names
4. Price-summary collapsed and expanded states
5. Checkout validation and submission layout
6. SpecAI open, close, compose, send, scroll, and coexistence with the summary
7. Authentication modal and toast placement
8. Portrait/landscape reflow and reduced-motion behavior

Automated checks are supplemented with browser screenshots and manual inspection. At least one real iPhone and one real Android phone should be used for final release validation because emulation cannot fully reproduce keyboard, browser chrome, font rendering, or touch behavior.

## 10. Acceptance Criteria

- No page-level horizontal scrolling occurs at the listed viewports.
- No primary content, action, modal, toast, price summary, or chatbot surface overlaps another required control.
- Landing → Builder → Price Summary → Checkout remains fully usable by touch, mouse, and keyboard.
- Core functionality is not hidden on mobile.
- Text remains readable without reducing body or form text below 16 px on phone.
- The implementation preserves the existing Emerald restrained product identity and shared component vocabulary.
- Production build, existing automated tests, and added responsive-flow tests pass.

## 11. Non-Goals

- Rebranding PCSpec or introducing a new color/type system
- Replacing Vue, Pinia, Vue Router, or the existing backend APIs
- Building separate native or mobile-only applications
- Redesigning Admin, Profile, or Articles in this iteration
- Changing product catalog, compatibility, authentication, checkout, or chatbot business logic

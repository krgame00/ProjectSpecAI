# Mobile Summary Scroll Chaining Design

## Problem

On compact and short viewports, the expanded build summary is a fixed panel with its own vertical scroll area. Its current `overscroll-behavior: contain` traps wheel and touch scrolling inside the panel, so users cannot naturally continue scrolling the hardware catalog after reaching the summary boundary.

## Approved Approach

Keep the existing expandable summary and internal scrolling, but allow scroll chaining back to the document at the panel boundaries. Reduce the panel height cap on short viewports so the underlying catalog remains visibly available.

## Interaction Contract

- The summary toggle remains fixed and keyboard accessible.
- Expanded summary content remains independently scrollable when its contents exceed the height cap.
- Wheel and touch scrolling may propagate to the document when the summary reaches its top or bottom edge.
- At viewport heights up to 700 CSS pixels, the summary content cap is reduced from 60dvh to 48dvh.
- Existing safe-area spacing and non-overlap with the SpecAI launcher remain unchanged.
- Collapsing the summary continues to restore the compact total bar.

## Verification

- Add an E2E regression at a short compact viewport matching the reported layout.
- Assert the expanded panel is shorter than half the viewport on short screens.
- Assert computed vertical overscroll behavior permits propagation.
- Confirm the document can scroll after the expanded summary reaches its lower boundary.
- Run the existing responsive suite, unit tests, and production build.

## Out of Scope

- Replacing the summary with a modal or full bottom sheet.
- Automatically closing the summary during catalog scroll.
- Redesigning summary contents or pricing actions.

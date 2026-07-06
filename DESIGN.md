---
name: PCSpec
description: Smart PC Builder with a clean, developer-focused aesthetic.
colors:
  primary: "#3ecf8e"
  primary-deep: "#24b47e"
  canvas: "#ffffff"
  canvas-soft: "#fafafa"
  canvas-night: "#1c1c1c"
  ink: "#171717"
  ink-mute: "#707070"
  hairline: "#dfdfdf"
  danger: "#ff2201"
  success: "#3ecf8e"
  warning: "#ffdb13"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontWeight: 500
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontWeight: 400
  label:
    fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
spacing:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#171717"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
  card:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
---

# Design System: PCSpec

## 1. Overview

**Creative North Star: "The Supabase Laboratory"**

This visual system embraces a developer-focused, highly clinical, and ultra-clean aesthetic inspired by modern technical dashboards like Supabase. It uses a pristine white canvas anchored by razor-thin hairline borders and restrained Emerald green accents. The aesthetic philosophy is rooted in technical clarity and expert confidence—where the interface disappears into the task of building a PC, rather than calling attention to itself through flashy decorations. We explicitly reject dark mode neon glows, thick colorful borders, and unnecessary glassmorphism.

**Key Characteristics:**
- Restrained color strategy: primarily white/gray canvas with a single Emerald accent.
- "Refined and Restrained" interactive components.
- Hairline borders (1px) for structure rather than heavy shadows or distinct backgrounds.
- Layered with subtle, soft shadows strictly for elevation.

## 2. Colors

The palette is highly restrained, leaning on soft tinted neutrals and a singular vibrant accent to guide user focus.

### Primary
- **Emerald Green** (#3ecf8e): Used strictly for primary actions, the "Add to Cart" state, and active navigation indicators. It signals success and progress.
- **Deep Emerald** (#24b47e): Used for hover states on primary actions.

### Neutral
- **Clean Canvas** (#ffffff): The absolute core of the UI. Almost all surfaces are white.
- **Soft Canvas** (#fafafa): Used for secondary backgrounds like table headers, subtle sidebars, or empty states.
- **Ink Black** (#171717): The default text color, providing high contrast against the canvas.
- **Muted Ink** (#707070): Used for secondary text, metadata, and placeholder copy.
- **Hairline Gray** (#dfdfdf): The structural border color. Used pervasively to separate content without visual weight.

### Named Rules
**The Restrained Accent Rule.** The primary Emerald accent is used on ≤10% of any given screen. Its rarity is the point. Do not use it as a large background fill except for primary call-to-action buttons.

## 3. Typography

**Display Font:** System Sans (-apple-system, Segoe UI, Roboto)
**Body Font:** System Sans (-apple-system, Segoe UI, Roboto)
**Label/Mono Font:** ui-monospace, Menlo, Monaco

**Character:** Technical, dense, and highly legible. Using System Fonts throughout reinforces the "Developer Tools" aesthetic, relying on native rendering speed and clean, familiar OS-level typography.

### Hierarchy
- **Display** (500, clamp/large, 1.2): Used for primary marketing heroes or page titles.
- **Headline** (500, 18px-22px, 1.2): Component category headers and modal titles.
- **Body** (400, 14px-16px, 1.5): Standard descriptive text and UI prose.
- **Label** (400, 12px-13px): Technical hardware specs, tags, and small utility text.

### Named Rules
**The System Native Rule.** System fonts carry the entire product UI. Do not introduce a secondary display font for "flavor"; the clinical feel relies on the uniformity and speed of native OS rendering.

## 4. Elevation

Layered with subtle shadows. The interface avoids deep, dramatic shadows or floating glass panels, opting instead for crisp borders and very light drop shadows that only appear when an element needs to lift off the canvas.

### Shadow Vocabulary
- **Card Rest Shadow** (`0 1px 2px rgba(0,0,0,0.04)`): The default extremely subtle shadow for structured containers.
- **Modal Elevation** (`0 16px 48px rgba(0,0,0,0.12)`): The deep shadow used strictly for modals to pull focus from the background.

### Named Rules
**The Border-First Rule.** Rely on 1px hairline borders to separate content areas. Use shadows sparingly, only for interactive feedback (hover) or z-axis overlays (modals, dropdowns).

## 5. Components

Components are "Refined and Restrained"—they feel tactile but do not scream for attention.

### Buttons
- **Shape:** Softly rounded (`6px` for small buttons, `8px` for larger inputs).
- **Primary:** Solid Emerald Green background with Dark Ink text for maximum modern contrast.
- **Hover / Focus:** Deepens slightly, no extreme scale animations.
- **Secondary / Ghost:** Transparent background with a `hairline-strong` border, keeping the UI visually quiet.

### Cards / Containers
- **Corner Style:** Medium-large radius (`12px`).
- **Background:** Clean Canvas (#ffffff).
- **Shadow Strategy:** Uses the Card Rest Shadow with a 1px hairline border.
- **Internal Padding:** Generous (`24px` / `var(--space-xl)`), allowing the technical information to breathe.

### Inputs / Fields
- **Style:** 1px hairline border, white background, `6px` radius.
- **Focus:** Border shifts to Primary Emerald with a soft 3px focus ring (`box-shadow: 0 0 0 3px rgba(62, 207, 142, 0.08)`).

### Status Badges
- **Style:** Pill-shaped (`9999px` radius), using soft background tints (e.g., extremely light green for success) with a slightly darker text hue. Avoid fully saturated backgrounds for badges.

## 6. Do's and Don'ts

### Do:
- **Do** use `var(--hairline)` for all borders to maintain a crisp, clinical layout.
- **Do** ensure text contrast by relying on `var(--ink)` for body copy and `var(--ink-mute)` only for non-critical metadata.
- **Do** leverage the monospace font for technical specifications or hardware model numbers.

### Don't:
- **Don't** use dark mode with purple gradients, neon accents, or glassmorphism. (This was the old "Cyber Forge" anti-pattern).
- **Don't** use border-left greater than 1px as a colored stripe on cards.
- **Don't** use gradient text anywhere in the interface.
- **Don't** use heavy, dark shadows on cards; the page should feel light and layered, not thick.

---
name: PCSpec
description: Smart PC Builder with a premium dark mode and electric cyan accents.
colors:
  bg: "#0a0b0f"
  bg-subtle: "#0e1015"
  fg: "#e8eaf0"
  fg-bright: "#ffffff"
  muted: "#7a8199"
  accent: "#00d4ff"
  accent-secondary: "#7c5cfc"
  danger: "#ff4d6a"
  success: "#00e68a"
  warning: "#ffb84d"
typography:
  display:
    fontFamily: "'Outfit', system-ui, sans-serif"
  body:
    fontFamily: "'Inter', system-ui, sans-serif"
  label:
    fontFamily: "'JetBrains Mono', monospace"
rounded:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "20px"
  xl: "28px"
  full: "9999px"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2rem"
  xl: "3rem"
---

# Design System: PCSpec

## 1. Overview

**Creative North Star: "The Cyber Forge"**

The design is built around a premium dark mode aesthetic (The Cyber Forge), featuring deep dark backgrounds paired with striking electric cyan neon accents and dark glass elements. It feels technical, precise, and cutting-edge, perfectly suited for users assembling custom PC hardware. The system explicitly avoids generic SaaS dashboard tropes and boring gray forms, opting instead for a highly visual, confident interface.

**Key Characteristics:**
- Deep, layered dark mode (not just gray).
- Glowing neon cyan accents for interactions and focus.
- Glassmorphism for floating panels and modals.
- Technical clarity through fluid typography.

## 2. Colors

A premium dark theme punctuated by electric neon accents.

### Primary
- **Electric Cyan** (#00d4ff): The core accent. Used for primary actions, selections, and glowing interactive states.

### Secondary
- **Neon Purple** (#7c5cfc): Used as a secondary gradient pair to Electric Cyan for a futuristic look.

### Neutral
- **Deep Space** (#0a0b0f): The primary page background.
- **Subtle Surface** (#0e1015): Used for subtle separations and secondary backgrounds.
- **Bright Text** (#ffffff): For primary headings and highly emphasized text.
- **Body Text** (#e8eaf0): Standard readable text.
- **Muted Text** (#7a8199): For secondary labels and less important details.

### Status
- **Danger** (#ff4d6a): Used for hardware conflicts and destructive actions.
- **Success** (#00e68a): Used for compatible indicators and success states.
- **Warning** (#ffb84d): For cautionary notifications.

## 3. Typography

**Display Font:** 'Outfit', system-ui, sans-serif
**Body Font:** 'Inter', system-ui, sans-serif
**Label/Mono Font:** 'JetBrains Mono', monospace

**Character:** Technical yet readable. Outfit provides a modern, geometric punch for headings, while Inter ensures maximum legibility for dense hardware specifications. JetBrains Mono is used where absolute technical precision is needed.

### Hierarchy
- **Display**: Used for major marketing heroes or primary section titles.
- **Headline**: Used for component category headers.
- **Body**: Standard descriptive text (max width ~75ch).
- **Label**: Used for hardware specs and tags, leveraging the monospace font for technical alignment.

## 4. Elevation

The system relies on dark, layered surfaces with glowing accent depth. Instead of standard drop shadows, elevation is communicated through deep black shadows combined with cyan glows when active.

### Shadow Vocabulary
- **Card Shadow** (`0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)`): The default elevation for hardware cards.
- **Accent Glow** (`0 0 20px rgba(0, 212, 255, 0.25)`): Used to elevate hovered or selected items, making them pop from the dark background.

## 5. Components

Components are tactile, glowing, and confident.

### Cards (Hardware Components)
- **Shape:** Medium rounded corners (`14px`).
- **Surface:** Uses dark glassmorphism (`rgba(16, 19, 28, 0.75)`) with a subtle `backdrop-filter: blur(20px)`.
- **States:** On hover, the border illuminates slightly and the background tint increases, providing tactile feedback.

### Buttons
- **Shape:** Medium rounded (`14px`) for primary buttons, fully rounded for pill actions.
- **Primary:** Gradient cyan-to-purple background or solid cyan with a glowing hover state.

### Modals
- **Shape:** Large rounded corners (`20px`).
- **Backdrop:** A dark overlay with a blur filter (`blur(8px)`).

## 6. Do's and Don'ts

- **Do** use glowing neon accents sparingly to draw attention to primary interactions or selections.
- **Don't** use light gray or stark white backgrounds; maintain the deep dark mode aesthetic at all times.
- **Do** leverage fluid typography (`clamp()`) to ensure text scales gracefully across devices.
- **Don't** use identical, flat card grids without visual hierarchy. Selected or recommended hardware should stand out via glows or distinct borders.
- **Don't** use generic default scrollbars; ensure the custom modern scrollbar is used across all scrollable areas.

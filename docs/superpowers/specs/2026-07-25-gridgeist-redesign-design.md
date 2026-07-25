# Design Specification: Gridgeist UI Transformation — ForgeLabs

- **Date**: 2026-07-25
- **Status**: Approved by User
- **Author**: Antigravity AI
- **System**: Gridgeist Grid Architecture (Supabase-Inspired Design Tokens)

---

## 1. Overview & Governing Thesis

### 1.1 Purpose
Transform the ForgeLabs PC Builder web application UI into a high-precision, product-native visual system. Replace generic SaaS elements (floating blobs, emojis, mismatched card padding) with hairline grids, monospace micro-labels, live hardware telemetry, and single-signature emerald green accents.

### 1.2 Governing Thesis
> *"ForgeLabs transforms hardware assembly from arbitrary selection into an engineering spec matrix—where clean hairline grids, live benchmark telemetry, and single-signature emerald accents anchor the visual hierarchy across all viewports while preserving established application behavior and component placement."*

---

## 2. Design System Tokens (`style.css` Alignment)

- **Canvas Background**: `#111111` (`--canvas`)
- **Surface Soft**: `#1c1c1c` (`--canvas-soft`)
- **Hairline Borders**: `#2a2a2a` (`--hairline-cool`) — 1px solid borders for all cards and table boundaries
- **Primary CTA Accent**: `#3ecf8e` (`--primary`) — Signature Supabase Emerald Green
- **Typography**: Inter (Body/Heading) + Monospace (Telemetry data, tags, micro-labels)

---

## 3. Component & Page Layout Specifications

### 3.1 Landing Page (`LandingView.vue`)
- **Hero Section**: Retain original 3D card layout framing as requested, with crisp hairline borders and emerald accents.
- **Feature Grid**: Replace generic rounded cards with a 3-column **Quiet Hairline Grid** (`border: 1px solid var(--hairline-cool)`).
  - Feature 1 Tag: `01 // COMPATIBILITY` (Smart Compatibility Engine)
  - Feature 2 Tag: `02 // SPECAI ENGINE` (AI Assistant)
  - Feature 3 Tag: `03 // LIVE CATALOG` (Database Sync 270+ items)

### 3.2 PC Builder View (`BuilderView.vue`, `PriceSummary.vue`, `HardwareSelection.vue`)
- **Left Column (Sidebar - `PriceSummary.vue`)**:
  - Contains selected parts list (CPU, Mobo, RAM, GPU, Storage, PSU, Case).
  - Integrates **Sticky Monospace Spec Matrix & Real-time PSU Wattage Gauge**.
  - Displays compatibility checks (Socket, RAM Type, Case Fit) with hairline row dividers.
- **Right Column (Main Content - `HardwareSelection.vue`)**:
  - Displays hardware catalog grid with monospace price tags and emerald CTA buttons for selecting components.

### 3.3 Admin Panel (`AdminDashboard.vue`)
- **High-Density Data Grid**:
  - Monospace table headers (`ORDER ID`, `CUSTOMER`, `TOTAL PRICE`, `STATUS`).
  - Status Badges styled with Supabase hairline borders:
    - `ASSEMBLING`: Warning yellow soft background
    - `COMPLETED`: Emerald green soft background
    - `SHIPPED`: Info blue soft background

---

## 4. Notifications & User Feedback
- All `alert()` calls are replaced with the centralized `ToastNotification.vue` system using Pinia (`stores/toast.js`).

---

## 5. Verification Plan
- Verify desktop and mobile responsiveness.
- Ensure all Pinia store actions (`builderStore`, `catalogStore`, `adminStore`, `toastStore`) operate without regressions.

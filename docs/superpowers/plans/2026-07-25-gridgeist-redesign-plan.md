# Gridgeist UI Transformation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the ForgeLabs PC Builder web application UI into a high-precision, product-native visual system using the Gridgeist Grid Architecture inspired by Supabase.

**Architecture:** Update `style.css` design tokens, apply Quiet Hairline Grids to `LandingView.vue` feature cards, consolidate parts selection + Sticky Monospace Spec Matrix in `PriceSummary.vue` (Left Sidebar), polish `HardwareSelection.vue` catalog grid (Right Content Area), and refine `AdminDashboard.vue` tabular data grid.

**Tech Stack:** Vue 3 (Composition API), Pinia Store, Custom CSS Variables, Inter + Monospace Typography.

## Global Constraints

- **Theme Palette**: Canvas Dark (`#111111`), Surface Soft (`#1c1c1c`), Hairline Cool (`#2a2a2a`), Primary Emerald (`#3ecf8e`).
- **Preserved Behavior**: Maintain existing Vue Router routes, Pinia store state methods (`builderStore`, `catalogStore`, `adminStore`, `toastStore`), and reactive events.
- **Layout Alignment**: Keep PriceSummary + Spec Matrix in Left Sidebar; keep Hardware Catalog Grid in Right Main Content Area.

---

### Task 1: Update Global Design Tokens & Utility Classes

**Files:**
- Modify: `frontend/src/style.css`

**Interfaces:**
- Produces: CSS custom properties (`--hairline-cool`, `--canvas-night`, `--primary-emerald`) and utility classes (`.font-mono`, `.hairline-grid`, `.badge-emerald`)

- [ ] **Step 1: Check existing tokens in `style.css`**

Run: Inspect `frontend/src/style.css` for root variables.

- [ ] **Step 2: Add missing Gridgeist tokens and utility classes**

Modify `frontend/src/style.css`:
```css
:root {
  --canvas-night: #111111;
  --canvas-night-soft: #1c1c1c;
  --hairline-cool: #2a2a2a;
  --primary-emerald: #3ecf8e;
  --primary-emerald-soft: rgba(62, 207, 142, 0.15);
}

.font-mono {
  font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
}

.hairline-grid {
  border: 1px solid var(--hairline-cool);
}

.badge-emerald {
  background: var(--primary-emerald-soft);
  color: var(--primary-emerald);
  border: 1px solid rgba(62, 207, 142, 0.3);
  font-family: monospace;
}
```

- [ ] **Step 3: Verify CSS build passes without syntax errors**

Run: `npm run build --prefix frontend` or test dev server.

---

### Task 2: Redesign Feature Grid in `LandingView.vue`

**Files:**
- Modify: `frontend/src/views/LandingView.vue`

**Interfaces:**
- Consumes: Global CSS tokens from Task 1

- [ ] **Step 1: Update `LandingView.vue` Feature Cards template**

Replace `.features-grid` contents in `LandingView.vue`:
```vue
<div class="features-grid">
  <div class="feature-card hairline-grid">
    <div class="feature-tag font-mono">01 // COMPATIBILITY</div>
    <h3>Smart Compatibility Engine</h3>
    <p>ระบบตรวจสอบความเข้ากันได้แบบเรียลไทม์ ซ็อกเก็ต CPU/Mainboard, แรม DDR4/5 และคำนวณกำลังไฟ PSU อัตโนมัติ</p>
  </div>
  <div class="feature-card hairline-grid">
    <div class="feature-tag font-mono">02 // SPECAI ENGINE</div>
    <h3>SpecAI Assistant</h3>
    <p>แชตบอตผู้ช่วยส่วนตัว เพียงแค่บอกงบประมาณและสายงาน AI จะจัดเซ็ตที่คุ้มค่าที่สุดให้คุณในพริบตา</p>
  </div>
  <div class="feature-card hairline-grid">
    <div class="feature-tag font-mono">03 // LIVE CATALOG</div>
    <h3>Live Catalog Sync</h3>
    <p>ข้อมูลสินค้า ราคา และรูปภาพกว่า 270+ รายการ อัปเดตล่าสุดจากฐานข้อมูลโดยตรง</p>
  </div>
</div>
```

- [ ] **Step 2: Add scoped CSS for `.feature-tag` and `.feature-card`**

```css
.feature-tag {
  color: var(--primary-emerald);
  font-size: 0.75rem;
  letter-spacing: 1px;
  margin-bottom: 0.75rem;
}
.feature-card {
  background: var(--canvas-night-soft);
  border-radius: 12px;
  padding: 1.5rem;
  transition: border-color 0.2s ease;
}
.feature-card:hover {
  border-color: var(--primary-emerald);
}
```

- [ ] **Step 3: Verify Landing Page render in dev server**

---

### Task 3: Redesign Builder View Sidebar & Spec Matrix in `PriceSummary.vue`

**Files:**
- Modify: `frontend/src/components/PriceSummary.vue`

**Interfaces:**
- Consumes: `builderStore.build`, `builderStore.totalPrice`, `compatibilityIssues`

- [ ] **Step 1: Update `PriceSummary.vue` layout & template**

Integrate Monospace Specification Matrix & Real-time Wattage Meter directly into the left sidebar:
```vue
<template>
  <aside class="price-summary-sidebar hairline-grid">
    <div class="sidebar-header font-mono">
      <span class="text-emerald">SPECIFICATION MATRIX</span>
      <span class="status-dot"></span>
    </div>

    <!-- Selected Hardware Slots -->
    <div class="build-items-list">
      <div v-for="cat in categories" :key="cat.id" class="build-slot-row">
        <div class="slot-info">
          <span class="slot-cat font-mono">{{ cat.name }}</span>
          <span class="slot-name">{{ getSelectedItem(cat.id)?.name || 'ยังไม่ได้เลือก' }}</span>
        </div>
        <div class="slot-action">
          <span v-if="getSelectedItem(cat.id)" class="slot-price font-mono">฿{{ getSelectedItem(cat.id)?.price.toLocaleString() }}</span>
          <button v-if="getSelectedItem(cat.id)" class="btn-remove" @click="$emit('remove-item', cat.id)">✕</button>
        </div>
      </div>
    </div>

    <!-- Wattage & Telemetry Meter -->
    <div class="wattage-gauge-section">
      <div class="gauge-header font-mono">
        <span>ESTIMATED POWER</span>
        <span>{{ estimatedWattage }}W / {{ recommendedWattage }}W</span>
      </div>
      <div class="gauge-bar-bg">
        <div class="gauge-bar-fill" :style="{ width: Math.min((estimatedWattage / recommendedWattage) * 100, 100) + '%' }"></div>
      </div>
      <div class="gauge-status font-mono text-emerald">
        ⚡ {{ recommendedWattage }}W PSU RECOMMENDED
      </div>
    </div>

    <!-- Total Price & Checkout CTA -->
    <div class="summary-footer">
      <div class="total-row font-mono">
        <span>ราคารวมทั้งหมด</span>
        <span class="total-amount text-emerald">฿{{ totalPrice.toLocaleString() }}</span>
      </div>
      <button class="btn btn-primary btn-block btn-lg" :disabled="!hasAnyComponent" @click="$emit('checkout')">
        สั่งซื้อ / พิมพ์ใบเสนอราคา
      </button>
    </div>
  </aside>
</template>
```

- [ ] **Step 2: Add styles for `.price-summary-sidebar` and `.wattage-gauge-section`**

- [ ] **Step 3: Verify BuilderView left sidebar interactivity and reactivity**

---

### Task 4: Polish Catalog Selection Grid in `HardwareSelection.vue`

**Files:**
- Modify: `frontend/src/components/HardwareSelection.vue`

**Interfaces:**
- Consumes: `products`, `selectedItemId`, `@select-item`

- [ ] **Step 1: Update Hardware Cards for crisp Gridgeist styling**

Apply hairline borders, monospace specs, and emerald select buttons to product cards in `HardwareSelection.vue`.

- [ ] **Step 2: Verify component selection emits `@select-item` correctly**

---

### Task 5: Redesign Admin Panel Data Grid in `AdminDashboard.vue`

**Files:**
- Modify: `frontend/src/components/AdminDashboard.vue`

**Interfaces:**
- Consumes: `orders`, `products`

- [ ] **Step 1: Apply High-Density Data Grid styling to Admin Tables**

Update order and product tables in `AdminDashboard.vue` with monospace headers, hairline borders, and `badge-emerald` / `badge-warning` status badges.

- [ ] **Step 2: Test Admin Dashboard login, table viewing, and status updates**

---

## Plan Verification

- Run `npm run build` in `frontend` to verify clean compilation.
- Perform visual verification of Landing Page, BuilderView, and Admin Panel.

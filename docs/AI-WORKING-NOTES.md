# AI Working Notes & System Operational State (PCSpec)

## System Status Log

### [2026-11-17] Compact Builder Sidebar Refactor
- **Status**: `VERIFIED WORKING`
- **Changes Implemented**:
  - Refactored `.cat-selected-item` in `PriceSummary.vue` from bulky 215px vertical block to compact 93px high-density card (57% height reduction).
  - Replaced the 4-row vertical table with horizontal inline spec chips (`[AM5] [8 Cores] [120W]`).
  - Embedded remove button as a sleek inline button next to the price while preserving 44x44px touch target compliance.
- **Verification Evidence**:
  - Frontend Vitest Suite: 25/25 files passed (186/186 tests green).
  - Production Build: `vite build` completed in 936ms.
  - Edge Browser Measurement & Inspection:
    - Bounding box measurement: 93px height per item, remove button 65x44px.
    - Screenshot: `sidebar_closeup.png` confirms compact, scannable, Supabase-styled layout.
  - Production (Vercel) Live Verification (https://project-spec-ai.vercel.app/build):
    - Deployed and live in commit `b0420eba`.
    - Production bounding box: Exactly 93px per item (57% reduction from original ~215px).
    - Screenshot: `prod_compact_sidebar.png` confirms live rendering of inline spec chips and aligned remove button on production.

### [2026-11-17] Upgrade Path Insights in SpecAI (Item 4)
- **Status**: `VERIFIED WORKING`
- **Features Implemented**:
  1. **Analytical Upgrade Engine (`chatbotUpgradePath.js` & `upgradePath.js`)**:
     - Analyzes Socket longevity (AM5 to 2027+, LGA1851, AM4/LGA1700 limits).
     - Calculates system estimated TDP and PSU power headroom wattage for future GPU upgrades.
     - Classifies builds into upgrade tiers (`High`, `Medium`, `Entry`).
  2. **Prompt & Context Injection**:
     - System prompt mandates 3 dimensions (Performance Fit, Value for Money, Upgrade Path Insights).
     - Backend pre-computes upgrade metrics and injects `[การวิเคราะห์เส้นทางอัปเกรดในอนาคต (Upgrade Path Insights)]` into Gemini prompt context.
  3. **Interactive UI Integration in Chat**:
     - Recommended Build Cards now feature an embedded `.build-upgrade-panel` with upgrade badge (`อัปเกรดได้ยาวไกล`) and bullet tips.
     - Added quick prompt pill: `🔮 วิเคราะห์เส้นทางอัปเกรดในอนาคต (Upgrade Path) สำหรับสเปกที่ผมเลือก`.
- **Verification Evidence**:
  - Backend Jest Suite: 19/19 suites passed (172/172 tests green).
  - Frontend Vitest Suite: 25/25 files passed (186/186 tests green).
  - Production Build: `vite build` completed in 962ms.
  - Live Browser Testing on Edge:
    - `live_upgrade_path_1_pills.png`: Dynamic upgrade pill displayed.
    - `live_upgrade_path_2_card.png`: SpecAI detailed platform longevity (AM4 ceiling vs AM5 recommendations) and build card upgrade panel rendered.
  - Production (Vercel) Live Verification (https://project-spec-ai.vercel.app/build):
    - `prod_upgrade_path_1_pills.png`: Dynamic upgrade path pill `🔮 วิเคราะห์เส้นทางอัปเกรดในอนาคต (Upgrade Path) สำหรับสเปกที่ผมเลือก` displayed on production.
    - `prod_upgrade_path_2_response.png`: SpecAI delivered exhaustive, 3-dimensional upgrade analysis on live production, citing Ryzen 7 5700X3D ceiling on AM4, DDR4 limitations, and recommending AM5 B650 platform for multi-year longevity to 2027+.

### [2026-11-17] Context-Aware Builder Sync & Interactive Build Card in SpecAI (Items 1 & 2)
- **Status**: `VERIFIED WORKING`
- **Features Implemented**:
  1. **Context-Aware Builder (SpecAI sees current build)**:
     - `builderStore.build` is automatically transmitted to `/stream` and `/message` when parts are active in the Builder.
     - Backend extracts socket, RAM type, TDP, and prices, and injects `[สเปกคอมพิวเตอร์ที่ลูกค้ากำลังเลือกค้างอยู่ใน Builder หน้าจอขณะนี้...]` into the Gemini prompt.
     - Added context pill `🔍 ช่วยดูสเปกที่ผมเลือกอยู่ตอนนี้ให้หน่อยครับว่าเข้ากันได้มั้ยหรือขาดอะไร` to quick prompt pills.
  2. **Interactive Recommended Build Card in Chat**:
     - SpecAI recommendations render as rich, interactive cards with component table, category badges, prices, and total price.
     - 1-click **"🛒 นำสเปคนี้ใส่ตะกร้า"** replaces/updates the builder with recommended components.
     - 1-click **"🔗 แชร์สเปกนี้"** generates URL query (`?b=...`) and copies to clipboard with green toast.
- **Verification Evidence**:
  - Backend Jest Suite: 18/18 suites passed (168/168 tests green).
  - Frontend Vitest Suite: 24/24 files passed (181/181 tests green).
  - Production Build: `vite build` completed cleanly in 658ms.
  - Edge Headless E2E Browser Testing:
    - `live_chatbot_1_pills.png`: Context pill rendered dynamically.
    - `live_chatbot_2_build_card.png`: Bot acknowledged selected CPU/Motherboard, returned 7-component build card, applied build into main builder (`฿24,540`), and toast displayed.
  - Production (Vercel) Live Verification (https://project-spec-ai.vercel.app/build):
    - `prod_chatbot_1_pills.png`: Quick prompt suggestion pills visible with dynamic context pill `🔍 ช่วยดูสเปกที่ผมเลือกอยู่ตอนนี้ให้หน่อยครับว่าเข้ากันได้มั้ยหรือขาดอะไร`.
    - `prod_chatbot_2_response.png`: SpecAI automatically detected the user's active builder hardware (Ryzen 5 8400F + A520M), alerted socket conflict (AM5 vs AM4), and proposed compatible alternatives.

# 🔮 Plan & Technical Spec: Upgrade Path Insights in SpecAI

## 1. File & Architecture Mapping

- **Upgrade Path Analytical Engine (Core Domain Logic)**:
  - `node-backend/services/chatbotUpgradePath.js`:
    - `analyzeUpgradePath(build)`: Evaluates platform socket longevity (AM5 to 2027+, LGA1851, AM4/LGA1700 limits), calculates system estimated TDP, determines PSU headroom wattage, and assigns upgradeability rating (`High`, `Medium`, `Entry`).
    - `formatUpgradeContext(build)`: Formats analytical breakdown into markdown context block for Gemini injection.
  - `frontend/src/utils/upgradePath.js`:
    - Mirror pure utility for frontend presentation.
    - `getUpgradeTierBadge(rating)`: Maps rating tier to Supabase design token badges (`อัปเกรดได้ยาวไกล`, `อัปเกรดได้ปานกลาง`, `เน้นคุ้มค่าปัจจุบัน`).

- **Backend Integration & Prompt Enhancement**:
  - `node-backend/services/chatbotCatalog.js`:
    - In `formatSelectedContext(...)`: Reconstructs selected component map, invokes `formatUpgradeContext(buildObj)`, and attaches upgrade context to the prompt block.
  - `node-backend/services/chatbotPolicy.js`:
    - In `BUILD_TERMS`: Added keywords `อัปเกรด`, `upgrade`, `เผื่ออนาคต`, `headroom`, `ระยะยาว`, `คุ้มไหม`, `คุ้มมั้ย`.
  - `node-backend/routes/chatbot.js`:
    - Updated `SYSTEM_INSTRUCTION` to mandate 3-dimensional evaluation: (1) Performance Fit, (2) Value for Money, (3) Upgrade Path Insights.

- **Frontend Chatbot UI Integration**:
  - `frontend/src/components/ChatbotWindow.vue`:
    - `.build-upgrade-panel`: Embeds an Upgrade Path Insights sub-card inside `.recommended-build-card` with upgrade tier badge and actionable tips.
    - `promptPills`: Dynamically appends `🔮 วิเคราะห์เส้นทางอัปเกรดในอนาคต (Upgrade Path) สำหรับสเปกที่ผมเลือก` when user has components in the Builder.

---

## 2. Step-by-Step Execution Commands for AI

```bash
# 1. Run Backend Upgrade Path Unit Tests
cd node-backend
npx jest tests/chatbotUpgradePath.test.js --runInBand

# 2. Run All Backend Jest Tests
npx jest --forceExit

# 3. Run Frontend Upgrade Path Unit Tests
cd ../frontend
npx vitest run tests/upgradePath.test.js
npx vitest run tests/ChatbotWindow.test.js

# 4. Run Full Frontend Vitest Suite
npx vitest run

# 5. Build Frontend Production Bundle
npm run build

# 6. Run E2E Verification in Edge Browser
node ../.gemini/antigravity/brain/d0ba5ceb-b70f-4d26-88b3-019e5bdf888e/scratch/live_upgrade_path_verification.cjs
```

---

## 3. Code Rules & Edge-case Handling

1. **PSU Headroom Calculation**:
   - `headroomWatts = Math.max(0, psuWatts - estimatedTotalTdp)`.
   - Headroom >= 250W enables GPU upgrade readiness without requiring PSU upgrade.
   - Headroom < 100W flags tight capacity and prompts 650W-750W PSU recommendations.
2. **Socket Longevity Rules**:
   - AM5: High (longevity up to 2027+, Ryzen 9000 and successors).
   - LGA1851: High (Core Ultra architecture).
   - AM4 & LGA1700: Medium/Entry (mature/capped generation lines with specific flagship upgrade ceilings like 5700X3D or i7/i9 14th gen).
3. **Graceful Degradation on Incomplete Builds**:
   - Both backend and frontend return `{ rating: 'Unrated', score: 0, tips: [] }` when builds have no socket/PSU data, preventing null reference errors.

---

## 4. Testing & Verification Checklist

- [x] **Backend Unit Tests**: `tests/chatbotUpgradePath.test.js` (4/4 passed).
- [x] **Full Backend Regression Suite**: 19 test suites passed, 172/172 tests green.
- [x] **Frontend Unit Tests**: `tests/upgradePath.test.js` (4/4 passed) & `tests/ChatbotWindow.test.js` (10/10 passed).
- [x] **Full Frontend Regression Suite**: 25 test files passed, 186/186 tests green.
- [x] **Frontend Production Build**: `npm run build` completed cleanly in 962ms.
- [x] **Live Edge Browser Verification**:
  - Context pill for upgrade path analysis appears dynamically.
  - SpecAI answers with socket longevity, platform comparison, and GPU power headroom.
  - Interactive recommended build card renders Upgrade Path Insights panel with badge and tips.
  - Screenshots verified: `live_upgrade_path_1_pills.png` & `live_upgrade_path_2_card.png`.

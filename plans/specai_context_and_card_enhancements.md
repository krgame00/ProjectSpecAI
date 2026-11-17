# 🛠️ Plan & Technical Spec: Context-Aware Builder Sync & Interactive Build Card in SpecAI

## 1. File & Architecture Mapping
- **Backend Catalog Formatting & Context Injection**:
  - `node-backend/services/chatbotCatalog.js`:
    - `formatSelectedContext(products, selectedInput)`: Extracts selected items from the Builder (cpu, motherboard, ram, gpu, storage, psu, case), formats socket, ram type, power, and price into `[สเปกคอมพิวเตอร์ที่ลูกค้ากำลังเลือกค้างอยู่ใน Builder หน้าจอขณะนี้...]`.
    - `buildCatalogContext(candidates, selectedContext)`: Prepend selected items block before catalog recommendation candidates.
- **Backend Policy & Routing**:
  - `node-backend/services/chatbotPolicy.js`:
    - Expanded `BUILD_TERMS` to include `สเป[คก]คอม`, `สเป[คก]ที่เลือก`, `สเป[คก]ปัจจุบัน`, `ช่วยดูสเป[คก]`, `ขาดอะไร`.
    - `classifyRequest`: Adds `hasSelected` condition to enable catalog context retrieval.
  - `node-backend/routes/chatbot.js`:
    - `hasSelectedItems(selected)`: Checks if any component is non-null.
    - `loadCatalogContext(...)`: Passes `selectedContext` from `formatSelectedContext` to `buildCatalogContext`.
    - `/message` & `/stream`: Passes `routingOptions(req.body.selected)` with `hasSelected` flag.
- **Frontend State Management**:
  - `frontend/src/stores/chatbot.js`:
    - In `processBotResponse`: Checks `builderStore.hasAnyComponent`. If true, attaches `selected: builderStore.build` to the request payload to `/stream` and `/message`.
- **Frontend UI Component**:
  - `frontend/src/components/ChatbotWindow.vue`:
    - `.recommended-build-card`: Displays structured hardware table (CPU, Mainboard, RAM, GPU, Storage, PSU, Case), category badges, prices, total price header, and action buttons.
    - `.apply-build-btn`: 1-click apply build directly into `builderStore` with toast feedback.
    - `.share-build-btn`: 1-click copy shareable link (`?b=...`) with toast feedback.
    - `.quick-prompt-pills`: Dynamic suggestion pills including context-aware pill `🔍 ช่วยดูสเปกที่ผมเลือกอยู่ตอนนี้ให้หน่อยครับว่าเข้ากันได้มั้ยหรือขาดอะไร`.

---

## 2. Step-by-Step Execution Commands for AI

```bash
# 1. Run Backend Unit Tests for Chatbot Catalog & Policy
cd node-backend
npx jest tests/chatbotCatalog.test.js --runInBand

# 2. Run All Backend Jest Tests
npx jest --runInBand

# 3. Run Frontend Unit Tests for Chatbot Store & ChatbotWindow Component
cd ../frontend
npx vitest run tests/chatbotStore.test.js
npx vitest run tests/ChatbotWindow.test.js

# 4. Run All Frontend Vitest Tests
npx vitest run

# 5. Build Frontend Production Bundle
npm run build

# 6. Run E2E Live Verification in Edge Browser
node ../.gemini/antigravity/brain/d0ba5ceb-b70f-4d26-88b3-019e5bdf888e/scratch/live_chatbot_verification.cjs
```

---

## 3. Code Rules & Edge-case Handling

1. **Pinia Store Safety in Component Tests**:
   - `ChatbotWindow.vue` guards `useCatalogStore()`, `useBuilderStore()`, and `useToast()` with `try/catch` fallbacks.
   - Prevents `[Pinia]: getActivePinia() was called but there was no active Pinia` errors during standalone shallow mounting tests.
2. **Selective Selected Payload**:
   - Only pass `selected` in `chatbotStore.js` when `builderStore.hasAnyComponent` is `true`.
   - Avoids sending empty `{ cpu: null, ... }` objects on cold chats and maintains backward compatibility.
3. **Product Name Fallback in Catalog Context**:
   - Product rows in raw or normalized objects might store names as `item.name` or `[item.brand, item.model]`.
   - `formatSelectedContext` safely coalesces `norm.name || [norm.brand, norm.model].filter(Boolean).join(' ').trim()`.
4. **Thai Keyword Morphology in Classifier**:
   - Users frequently type both `สเปค` and `สเปก`.
   - Regex patterns in `chatbotPolicy.js` must use character class `สเป[คก]` for robust matching.

---

## 4. Testing & Verification Checklist

- [x] **Backend Unit Tests**: `node-backend/tests/chatbotCatalog.test.js` passes 4/4 tests.
- [x] **Full Backend Regression Suite**: 18 test suites passed, 168/168 tests green.
- [x] **Frontend Unit Tests**: `frontend/tests/chatbotStore.test.js` (12/12) and `frontend/tests/ChatbotWindow.test.js` (9/9) passed.
- [x] **Full Frontend Regression Suite**: 24 test files passed, 181/181 tests green.
- [x] **Frontend Production Build**: `npm run build` completed in ~650ms without syntax or rollup errors.
- [x] **Edge Browser Live Verification**:
  - Context pill dynamically shown when builder has parts.
  - Streaming chatbot response acknowledges selected hardware.
  - Recommended Build Card renders with badge, parts list, and price.
  - 1-click "นำสเปคนี้ใส่ตะกร้า" applies parts to the builder.
  - 1-click "แชร์สเปกนี้" generates share link and copies to clipboard.
  - Screenshot verified: `live_chatbot_2_build_card.png`.

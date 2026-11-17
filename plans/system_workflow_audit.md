# PCSpec System Workflow Audit & Architecture Report

## 1. File & Architecture Mapping
- **Frontend Core Shell**: [frontend/src/App.vue](file:///f:/Projects/PCSpec/frontend/src/App.vue)
- **Interactive PC Builder View**: [frontend/src/views/BuilderView.vue](file:///f:/Projects/PCSpec/frontend/src/views/BuilderView.vue)
- **Hardware Selection Component**: [frontend/src/components/HardwareSelection.vue](file:///f:/Projects/PCSpec/frontend/src/components/HardwareSelection.vue)
- **Telemetry & Price Summary**: [frontend/src/components/PriceSummary.vue](file:///f:/Projects/PCSpec/frontend/src/components/PriceSummary.vue)
- **Compatibility Engine**: [frontend/src/utils/compatibility.js](file:///f:/Projects/PCSpec/frontend/src/utils/compatibility.js)
- **Upgrade Path Analytical Engine**: [frontend/src/utils/upgradePath.js](file:///f:/Projects/PCSpec/frontend/src/utils/upgradePath.js)
- **SpecAI Floating Chatbot**: [frontend/src/components/ChatbotWindow.vue](file:///f:/Projects/PCSpec/frontend/src/components/ChatbotWindow.vue)
- **Order Checkout View**: [frontend/src/components/CheckoutView.vue](file:///f:/Projects/PCSpec/frontend/src/components/CheckoutView.vue)
- **Admin Management Panel**: [frontend/src/components/AdminDashboard.vue](file:///f:/Projects/PCSpec/frontend/src/components/AdminDashboard.vue)
- **Backend Orders Controller**: [node-backend/controllers/ordersController.js](file:///f:/Projects/PCSpec/node-backend/controllers/ordersController.js)
- **Backend Chatbot Router**: [node-backend/routes/chatbot.js](file:///f:/Projects/PCSpec/node-backend/routes/chatbot.js)

---

## 2. End-to-End Workflow Analysis

### Workflow 1: Catalog Synchronization & Cache Ingestion
- **Data Flow**: `GET /api/hardware/catalog` -> Pinia `catalogStore` -> `hardwareList`.
- **Domain Modeling**: Hardware categorized into 8 core components (CPU, Motherboard, RAM, GPU, Storage, PSU, Case, Cooler).
- **Status**: `VERIFIED WORKING`. 270+ hardware entries mapped to local images and specs.

### Workflow 2: Interactive PC Builder & Live Validation Loop
- **Data Flow**: User selection in `HardwareSelection.vue` -> updates `builderStore.build` reactive state.
- **Rules & Edge-Case Handling**:
  - Socket validation (AM4, AM5, LGA1700, LGA1851).
  - RAM generation matching (DDR4 vs DDR5).
  - Power telemetry: Total estimated TDP calculated with 1.3x recommended PSU buffer.
  - Cooler clearance and case dimension checking.
  - Upgrade Path Insights engine analyzes socket future-proofing and power headroom.
- **Status**: `VERIFIED WORKING`. Real-time validation verified with Playwright.

### Workflow 3: SpecAI Conversational Assistant Loop
- **Data Flow**: Floating FAB (`.chat-fab`) -> activates `ChatbotWindow.vue` -> SSE stream to `/api/chatbot/stream`.
- **Context Injection**: Active builder components automatically sent in payload and injected into prompt context.
- **Status**: `VERIFIED WORKING`. Supports interactive recommended build cards with 1-click cart insertion.

### Workflow 4: Order Submission & Checkout Flow
- **Data Flow**: `CheckoutView.vue` -> `POST /api/orders` -> `ordersController.create`.
- **Boundary Discipline**: Client-side prices are discarded. Server calculates item prices directly from database catalog records, appends assembly tier fees (Free, Standard ฿500, Premium ฿1,000), and assigns collision-resistant `ORD-YYYYMMDD-XXXXXX` identifiers.
- **Status**: `VERIFIED WORKING`. Tested order placed and verified in database and admin orders table.

### Workflow 5: Back-Office Administration Flow (Admin Panel)
- **Data Flow**: Route `/admin` guarded by JWT token and `admin` role middleware.
- **Operations Supported**:
  - Tab 1 Overview: Sales revenue telemetry and 7-day revenue chart.
  - Tab 2 Orders: Filter orders by status, view hardware item breakdown, update assembly status.
  - Tab 3 Inventory: Hardware catalog inspection, stock editing, and price sync.
  - Tab 4 Articles: CMS for guides and reviews.
  - Tab 5 Users: Member directory management.
- **Status**: `VERIFIED WORKING`. Responsive mobile tabs and full desktop views operational.

---

## 3. Testing & Verification Checklist
- [x] **Vitest Frontend Suites**: 25/25 files passed (186/186 tests).
- [x] **Jest Backend Suites**: 19/19 files passed (172/172 tests).
- [x] **Automated End-to-End Workflow Audit Script**: `scratch/audit_system_workflows.cjs` executed with 100% PASS rate across all 5 workflow phases.
- [x] **Clean Architecture Gate**: Code follows `principle-model-the-domain`, `principle-boundary-discipline`, `principle-experience-first`, and `principle-prove-it-works`.

# แผนงานเชิงเทคนิคและเอกสารสถาปัตยกรรมระบบ (PCSpec System Architecture)
**หัวข้อเอกสาร:** 4.1.1 ภาพรวมของระบบ (System Overview & Block Diagram)  
**ไฟล์แผนภาพ Draw.io:** 
- Block Diagram: [`docs/drawio/system_block_diagram.drawio`](file:///c:/Users/PC/Downloads/PCSpec/docs/drawio/system_block_diagram.drawio)
- Layered Architecture: [`docs/drawio/system_overview_architecture.drawio`](file:///c:/Users/PC/Downloads/PCSpec/docs/drawio/system_overview_architecture.drawio)

---

## 1. สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

ระบบ **PCSpec** ออกแบบตามสถาปัตยกรรมแบบ 3-Tier Layered Architecture ร่วมกับ MVC Pattern ในส่วนของ Backend:

```
PCSpec/
├── frontend/                                   # [Tier 1: Presentation Layer]
│   ├── src/
│   │   ├── components/                         # UI Components (Builder, SpecAI Chatbot, Modals)
│   │   ├── views/                              # Pages (Storefront, Builder, Admin Dashboard)
│   │   ├── stores/                             # Pinia Stores (builderStore, authStore, cartStore)
│   │   └── style.css                           # Design System (Supabase-inspired theme)
│   └── public/images/hardware/                 # Static Hardware Image Assets (270+ items)
│
├── node-backend/                               # [Tier 2: Processing & Logic Layer]
│   ├── controllers/                            # Hardware, Order, Chatbot, Auth Controllers
│   ├── routes/                                 # Express API Endpoints
│   ├── middleware/                             # JWT Authentication & Request Validation
│   └── services/
│       ├── compatibilityService.js             # Core Compatibility Validation Rule Engine
│       ├── specAiService.js                    # LLM Prompt Synthesizer & Recommendations
│       └── powerEstimationService.js           # Total TDP Wattage & PSU Safety Margin Engine
│
└── database-schema.sql                         # [Tier 3: Data Layer - MySQL 'smart_pc_builder']
```

---

## 2. คู่มือและขั้นตอนการรันคำสั่งเชิงลึกเรียงตามลำดับ (Step-by-Step Execution Commands for AI)

### ขั้นตอนที่ 1: การเริ่มทำงานระบบ Backend
```bash
cd c:\Users\PC\Downloads\PCSpec\node-backend
npm install
npm run dev
# Server จะรันที่ http://localhost:5000 พร้อมเชื่อมต่อ MySQL database 'smart_pc_builder'
```

### ขั้นตอนที่ 2: การเริ่มทำงานระบบ Frontend
```bash
cd c:\Users\PC\Downloads\PCSpec\frontend
npm install
npm run dev
# Vite dev server จะรันที่ http://localhost:5173
```

### ขั้นตอนที่ 3: การเปิดและแก้ไขไฟล์แผนภาพไดอะแกรม Draw.io
- บล็อกไดอะแกรมระบบ (Block Diagram): `c:\Users\PC\Downloads\PCSpec\docs\drawio\system_block_diagram.drawio`
- ไดอะแกรมสถาปัตยกรรม (Layered Architecture): `c:\Users\PC\Downloads\PCSpec\docs\drawio\system_overview_architecture.drawio`
- สามารถเปิดด้วย VS Code Extension (Draw.io Integration) หรือเปิดผ่าน [app.diagrams.net](https://app.diagrams.net)

---

## 3. กฎเหล็กในโค้ดและวิธีแก้บั๊ก (Code Rules & Edge-case Handling)

1. **Hardware Compatibility Rules (กฎความเข้ากันได้):**
   - **CPU & Motherboard:** ต้องตรงกันทั้ง Socket (เช่น `LGA1700`, `AM5`, `AM4`)
   - **RAM & Motherboard:** ต้องเป็น Generation เดียวกัน (`DDR4` หรือ `DDR5`)
   - **Power Supply (PSU) Calculation:** คำนวณ TDP รวมของ CPU + GPU + Component อื่นๆ (+ safety margin 20-30%) หากเกินวัตต์ของ PSU ระบบต้องขึ้นแจ้งเตือน `Incompatible / Wattage Warning` ทันที
2. **AI & SpecAI Chatbot Resilience:**
   - เมื่อเรียก External API (Gemini API) ต้องมี Fallback Rule-based Recommendation ในกรณี Network timeout หรือ Quota เต็ม
3. **Design System & Theme:**
   - ต้องคงคอนเซปต์ *Supabase-Inspired Design*: Clean White Canvas, Hairline Borders (`1px solid #e2e8f0`), Emerald Green Accent (`#10b981` / `#059669`).

---

## 4. ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

- [x] ตรวจสอบและตัดโมดูล OCR ออกจาก Block Diagram และ Architecture ทั้งหมด 100%
- [x] ตรวจสอบโครงสร้างไฟล์ `.drawio` ทั้งสองไฟล์ ถูกต้องตามสเปก XML และเรนเดอร์ได้สมบูรณ์
- [x] ตรวจสอบการเชื่อมโยงของ Data Flow Bus (Input Unit -> Processing & Control Unit -> Output Unit)
- [x] ตรวจสอบชื่อตารางและโมดูลให้ตรงกับโครงสร้างจริงของฐานข้อมูล MySQL `smart_pc_builder`

# 🛠️ Plan: PCSpec Phase P1 Remediation (UX, Store Resilience, Security & Design Consistency)

> **เป้าหมาย:** ดำเนินการปรับปรุงคุณภาพระบบใน Phase P1 ตามรายงาน `docs/SYSTEM_REVIEW_2026-09-06.md` ได้แก่ การจัดการ 404 Route, การ Persist ตะกร้าสินค้า, การเพิ่ม Error & Retry State ใน Catalog Store, การยกระดับความปลอดภัย File Upload และ CORS, การแก้ Design Token Drift และการอัปเดตเอกสารหลัก

---

## 1. สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

### 1.1 ไฟล์ที่เกี่ยวข้องใน Phase P1
- **UX & Routing (H3):**
  - `frontend/src/router/index.js` (เพิ่ม 404 catch-all route, ปรับ guard ให้แสดงข้อความแจ้งเตือนเมื่อไม่มีสิทธิ์)
  - `frontend/src/views/NotFoundView.vue` (NEW: หน้า 404 สไตล์ Supabase-inspired พร้อมปุ่มกลับหน้าแรก/หน้าจัดสเปค)
  - `frontend/src/stores/builder.js` (sync ตะกร้าสินค้าลง `localStorage` ป้องกันของหายเมื่อ Refresh)
- **Catalog Resilience:**
  - `frontend/src/stores/catalog.js` (เพิ่ม `error` state และ `fetchCatalog` error handling พร้อม retry)
  - `frontend/src/views/BuilderView.vue` (แสดง Error banner และปุ่ม Retry หากโหลด Catalog ไม่สำเร็จ)
- **Backend Security Hardening (M1, M2):**
  - `node-backend/routes/upload.js` (ตรวจสอบ Magic Bytes และ Whitelist นามสกุลไฟล์รูปภาพอย่างเข้มงวด)
  - `node-backend/server.js` (จำกัด Body size และกำหนด CORS Whitelist อย่างปลอดภัย)
- **Design Tokens & UI (M7, M8, M9):**
  - `frontend/public/images/default.png` (NEW: ภาพ fallback อุปกรณ์คอมพิวเตอร์)
  - `frontend/src/style.css` (ปรับ Header และ tokens ให้สอดคล้องกับ Dark Theme จริงของแอป)
  - `frontend/index.html` (sync `theme-color` เป็น `#111111` และโหลด Inter font จริง)
  - `frontend/src/utils/hardwareSpecs.js` (NEW: รวมฟังก์ชัน `getItemSpecsList` ที่เคยซ้ำซ้อนในหลาย Component)
- **Documentation & Repo Hygiene (L1, L2):**
  - `LICENSE` (NEW: ไฟล์ MIT License)
  - `README.md` (อัปเดตสถิติจำนวน Test suites และการตั้งค่า)
  - `docs/APPENDIX_GUIDE.md` (แก้ path ให้ตรงกับโครงสร้างจริงใน repo)

---

## 2. คู่มือและขั้นตอนการรันคำสั่งเชิงลึกเรียงตามลำดับ (Step-by-Step Execution Commands for AI)

### ขั้นตอนที่ 1: ติดตั้ง 404 Route และ Persist Builder Store
1. สร้าง `frontend/src/views/NotFoundView.vue` ด้วยสไตล์ Supabase Design System
2. เพิ่ม route `/:pathMatch(.*)*` ใน `frontend/src/router/index.js`
3. ใน Router Guard (`router.beforeEach`), หากผู้ใช้ไม่มีสิทธิ์เข้า `/admin` ให้เรียก `toast.error('คุณไม่มีสิทธิ์เข้าถึงส่วนผู้ดูแลระบบ')` ก่อน Redirect
4. ใน `frontend/src/stores/builder.js`, เพิ่มฟังก์ชันโหลดและบันทึก `build` ลงใน `localStorage` ทุกครั้งที่มีการเปลี่ยนแปลง

### ขั้นตอนที่ 2: เสริมความแกร่งให้ Catalog Store
1. ใน `frontend/src/stores/catalog.js`, เพิ่ม `error: null` ใน state และจัดการบันทึก Error เมื่อ `fetch` ล้มเหลว
2. ปรับ `fetchCatalog` ให้คืนค่า boolean สถานะความสำเร็จ
3. ปรับ `frontend/src/views/BuilderView.vue` ให้มี UI รองรับการกดโหลดซ้ำ (Retry) เมื่อแคตตาล็อกล้มเหลว

### ขั้นตอนที่ 3: ป้องกัน File Upload และกระชับ CORS
1. นำตรรกะตรวจสอบ Magic bytes และ MIME whitelist จาก `chatbotSecurity.js` มาใช้กับ `node-backend/routes/upload.js`
2. จำกัดขนาดไฟล์อัปโหลดบทความให้ไม่เกิน 2MB
3. กำหนด CORS Whitelist ใน `node-backend/server.js`

### ขั้นตอนที่ 4: เคลียร์ Design Token Drift และรวม Utility ซ้ำซ้อน
1. สร้างไฟล์ `frontend/public/images/default.png` เป็นรูปไอคอนอะไหล่คอมพิวเตอร์
2. ปรับ `frontend/index.html` ให้โหลดฟอนต์ Inter จาก Google Fonts และเปลี่ยน `theme-color` เป็น `#111111`
3. สร้าง `frontend/src/utils/hardwareSpecs.js` และแทนที่การใช้งานใน `PriceSummary.vue` และ `HardwareSelection.vue`

### ขั้นตอนที่ 5: ปรับปรุงเอกสารและใบอนุญาต
1. สร้างไฟล์ `LICENSE` (MIT License)
2. ปรับแก้ path ใน `docs/APPENDIX_GUIDE.md` จาก `backend/` เป็น `node-backend/`
3. อัปเดต `README.md` ข้อมูลการทดสอบ

---

## 3. กฎเหล็กในโค้ดและวิธีแก้บั๊ก (Code Rules & Edge-case Handling)

1. **LocalStorage Hydration Safety:** ใน `builderStore`, ข้อมูลที่โหลดจาก `localStorage` ต้องผ่านการตรวจสอบว่าเป็น Object ที่มี category keys ถูกต้องเสมอ (`cpu`, `mobo`, ฯลฯ) หาก JSON เสียหายให้ Fallback เป็น state ว่างเปล่าโดยไม่โยนข้อผิดพลาด
2. **Magic Bytes Validation:** การตรวจไฟล์อัปโหลดห้ามเชื่อเฉพาะ `file.mimetype` เพราะผู้ไม่ประสงค์ดีสามารถปลอม header ได้ ต้องอ่าน Buffer 4 ไบต์แรกเสมอ (เช่น PNG = `89 50 4E 47`, JPEG = `FF D8 FF`)
3. **CORS Non-Breaking:** ในโหมด Development ต้องอนุญาต `localhost` ทุกพอร์ตที่ใช้งาน เพื่อให้ Playwright E2E และ Vite Dev Server ยิงเข้าถึงได้
4. **UI Design Tokens:** คุมการแสดงผลผ่าน Design Tokens ใน `style.css` อย่างเคร่งครัดตามแนวทาง Supabase-inspired

---

## 4. ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

### 4.1 คำสั่งทดสอบ
```bash
# ทดสอบ Unit Test ของ Frontend
cd frontend && npm test

# ทดสอบ Unit Test ของ Backend
cd node-backend && npm test

# ทดสอบ Build Bundle
cd frontend && npm run build
```

### 4.2 ตรวจสอบการทำงานของฟีเจอร์ใหม่
- เข้า URL สุ่ม เช่น `/some-invalid-path` ต้องขึ้นหน้า NotFoundView
- เพิ่มอุปกรณ์ใส่ตะกร้าในหน้า `/build` แล้ว Refresh หน้าจอ ตะกร้าต้องคงอยู่ครบ
- ทดสอบอัปโหลดไฟล์ปลอม (.php แกล้งเปลี่ยนชื่อเป็น .jpg) ต้องถูกปฏิเสธ
- ตรวจสอบ `default.png` เมื่อรูปอุปกรณ์ไม่ระบุ ไม่พบ 404
- ตรวจสอบ `hardwareSpecs.js` รวมตรรกะ format specs ทั้งระบบ

### 4.3 ผลลัพธ์การทดสอบหลังเสร็จสิ้น Phase P1 (Verification Results)
- ✅ **Backend Unit Tests:** 9 test suites, 122 tests passed (`npm test` in `node-backend/`)
- ✅ **Frontend Unit Tests:** 23 test suites, 165 tests passed (`npm test` in `frontend/`)
- ✅ **Total Automated Tests:** 32 test suites, 287 tests passing 100%
- ✅ **Production Build:** Vite production build สำเร็จใน 1.28s ไม่มี error, ไม่มี `live.js`, ไม่มี `localhost:3000`
- ✅ **Documentation & License:** เพิ่มไฟล์ `LICENSE` (MIT), ปรับเส้นทางใน `docs/APPENDIX_GUIDE.md`, อัปเดตตัวเลขการทดสอบใน `README.md`


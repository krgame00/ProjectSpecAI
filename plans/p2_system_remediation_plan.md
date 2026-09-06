# 🛠️ Plan: PCSpec Phase P2 Remediation (Security Depth, Repo Cleanliness, Scripts & Validation)

> **เป้าหมาย:** ดำเนินการปรับปรุงเชิงลึกใน Phase P2 ตามรายงาน `docs/SYSTEM_REVIEW_2026-09-06.md` ได้แก่:
> 1. การทำ Re-check Admin Role กับ Database สดๆ เพื่อป้องกันปัญหา Revoked Admin (M3 / P2.1)
> 2. การจัดมาตรฐาน Logging ฝั่ง Backend โดยเปลี่ยน `console.error` มาใช้ `utils/logger.js` ทั้งหมด (M10 / P2.3)
> 3. การเก็บกวาด Scratch Files, Zip ตกค้าง, และไฟล์ที่ไม่เกี่ยวข้องออกจาก Repo (L3, L5, L6)
> 4. การเพิ่ม npm scripts: `test:coverage` (Frontend) และ `db:setup` (Backend) (M12 / P2.4)
> 5. การปรับแก้ตรรกะ Validation ให้รอบคอบขึ้น (M5)

---

## 1. สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

### 1.1 ไฟล์ที่เกี่ยวข้องใน Phase P2
- **Authentication & Authorization (M3):**
  - `node-backend/middleware/authMiddleware.js`: ยกระดับ `adminMiddleware` ให้ query ตรวจสอบสถานะ `role` จากฐานข้อมูล `users` แบบเรียลไทม์
  - `node-backend/tests/adminAuthRevocation.test.js`: ชุดทดสอบยืนยันว่าเมื่อลดสิทธิ์ใน DB แล้ว Token เดิมต้องถูกปฏิเสธด้วย 403 ทันที
- **Backend Logging Standardization (M10):**
  - `node-backend/controllers/authController.js`: เปลี่ยน `console.error` เป็น `logger.error`
  - `node-backend/routes/chatbot.js`: เปลี่ยน `console.error` เป็น `logger.error`
  - `node-backend/routes/upload.js`: เปลี่ยน `console.error` เป็น `logger.error`
- **Validation Engine Polish (M5):**
  - `node-backend/middleware/validation.js`: ปรับปรุงฟังก์ชันตรวจสอบค่าว่างและตัวเลข ป้องกันบั๊กค่า 0 ถูกมองเป็นค่าว่าง
- **NPM Scripts & Developer Tooling (M12):**
  - `node-backend/package.json`: เพิ่มคำสั่ง `db:setup` / `db:seed`
  - `frontend/package.json`: เพิ่มคำสั่ง `test:coverage`
- **Repo Hygiene & File Housekeeping (L3, L5, L6):**
  - ลบ `plans/hermes_update_error_fix.md` (ไฟล์นอกบริบทของโปรเจกต์)
  - ลบ Scratch files: `PCSpec.zip`, `frontend/test_vercel.cjs`, `frontend/test_live_vercel_benchmark.cjs`, `frontend/vercel-test.png`, `catalog.json`

---

## 2. คู่มือและขั้นตอนการรันคำสั่งเชิงลึกเรียงตามลำดับ (Step-by-Step Execution Commands for AI)

### ขั้นตอนที่ 1: ติดตั้ง Live DB Role Re-check ใน `authMiddleware.js`
1. เปิด `node-backend/middleware/authMiddleware.js`
2. ใน `adminMiddleware`, ดึง `req.user.id` มา query ตรวจสอบ `SELECT role FROM users WHERE id = ?`
3. หากพบว่าผู้ใช้ไม่มีอยู่ใน DB หรือ `role !== 'admin'` ให้ตอบกลับ 403 ทันที
4. เขียน unit test `node-backend/tests/adminAuthRevocation.test.js` เพื่อทดสอบ TDD

### ขั้นตอนที่ 2: ปรับปรุง Backend Logging
1. นำเข้า `const logger = require('../utils/logger');` ใน `authController.js`, `routes/chatbot.js`, และ `routes/upload.js`
2. เปลี่ยน `console.error` ทั้งหมดเป็น `logger.error`

### ขั้นตอนที่ 3: ปรับปรุง Validation Engine
1. ใน `node-backend/middleware/validation.js`, ปรับปรุง `validateRequired` ให้ยอมรับค่า `0` (ไม่ใช่ falsy check `!val`)
2. รัน `npm test tests/validation.test.js` เพื่อยืนยันความถูกต้อง

### ขั้นตอนที่ 4: เพิ่ม NPM Scripts และ Coverage Config
1. ใน `frontend/package.json` เพิ่ม script: `"test:coverage": "vitest run --coverage"`
2. ใน `node-backend/package.json` เพิ่ม script: `"db:schema": "mysql -u root -p smart_pc_builder < database-schema.sql"`

### ขั้นตอนที่ 5: เก็บกวาด Scratch Files และไฟล์ตกค้าง
1. ลบไฟล์ scratch ที่ไม่จำเป็นด้วย Node script/unlink
2. รัน `git status` เพื่อตรวจสอบความเรียบร้อย

---

## 3. กฎเหล็กในโค้ดและวิธีแก้บั๊ก (Code Rules & Edge-case Handling)

1. **DB Re-check Fallback Safety:** เมื่อระบบอยู่ใน Mock mode (`db.isFallback() === true`) หรือ MySQL ขัดข้องในโหมด Dev/Test ให้ `adminMiddleware` fallback ไปตรวจสอบ `req.user.role === 'admin'` จาก JWT Payload เพื่อไม่ให้กระทบการทำงานของระบบทดสอบใน CI
2. **Numeric Zero Validation:** ใน JavaScript `0` ถือเป็น falsy (`!0 === true`) ดังนั้นในการเช็ค required field ที่เป็นตัวเลข (เช่น จำนวนสต็อก `stock = 0`) ต้องใช้ `val === undefined || val === null || val === ''` แทน `!val`
3. **Never Log Sensitive PII:** เมื่อเปลี่ยนมาใช้ `logger.error` ห้ามพิมพ์รหัสผ่าน, PIN, หรือ Full Credit Card ลงใน log file เป็นอันขาด

---

## 4. ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

### 4.1 คำสั่งทดสอบ
```bash
# 1) ทดสอบ Unit Tests ฝั่ง Backend
cd node-backend && npm test

# 2) ทดสอบ Unit Tests ฝั่ง Frontend
cd frontend && npm test

# 3) ทดสอบ Build Application
cd frontend && npm run build
```

### 4.2 ตรวจสอบการทำงานรายข้อ
- เมื่อสร้าง Token Admin แล้วจำลองว่าใน DB เปลี่ยนเป็น `customer` -> ได้รับ status 403 Forbidden และไม่สามารถเรียก Admin API ได้
- ค่า price หรือ stock เป็น 0 ผ่านการตรวจสอบ `validateRequired` ได้อย่างถูกต้อง ไม่ถูกตีกลับ
- ไฟล์ zip, scratch scripts, และ drawio duplicates ถูกทำความสะอาดออกจาก workspace 100%

### 4.3 ผลลัพธ์การทดสอบหลังเสร็จสิ้น Phase P2 (Verification Results)
- ✅ **Backend Unit Tests:** 10 test suites, 128 tests passed (`npm test` in `node-backend/`)
- ✅ **Frontend Unit Tests:** 23 test suites, 165 tests passed (`npm test` in `frontend/`)
- ✅ **Total Automated Tests:** 33 test suites, 293 tests passing 100%
- ✅ **Frontend Code Coverage:** Statements 71.09%, Lines 73.24%, Services 96.77% (`npm run test:coverage` in `frontend/`)
- ✅ **Developer Tooling Scripts:** เพิ่ม `test:coverage` ใน frontend, เพิ่ม `db:init` และ `seed:admin` ใน backend


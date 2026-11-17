# แผนงานเชิงเทคนิค: การแก้ไขและฟื้นฟู GitHub Actions E2E Tests CI Pipeline (CI E2E Tests Remediation Plan)

## 1. สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)
- **CI Workflow Configuration**:
  - [.github/workflows/ci.yml](file:///f:/Projects/PCSpec/.github/workflows/ci.yml): กำหนด 3 Jobs หลักบน GitHub Actions ได้แก่ `backend`, `frontend`, และ `e2e` (รันบน Ubuntu runner ด้วย `actions/setup-node@v4` และ Playwright).
- **Frontend Components ที่เกี่ยวข้องกับการแก้ไข**:
  - [frontend/src/components/AdminDashboard.vue](file:///f:/Projects/PCSpec/frontend/src/components/AdminDashboard.vue): ควบคุม Tab bar ของระบบ Admin Dashboard สำหรับ Desktop และ Mobile (`.admin-tabs`).
  - [frontend/src/App.vue](file:///f:/Projects/PCSpec/frontend/src/App.vue): หน้าหลักของระบบ ควบคุม Navbar, Toast Notifications, และ Authentication Modals (Login/Register forms).
- **Playwright E2E Test Suites ที่เกิดปัญหา**:
  - `frontend/e2e/admin.spec.js`: ทดสอบสวิตช์แท็บหลังบ้าน การกรองตาราง และพฤติกรรม Sticky header บน Mobile (`lines 288, 313`).
  - `frontend/e2e/auth.spec.js`: ทดสอบการกรอกฟอร์มสมัครสมาชิกและการเข้าสู่ระบบ (`line 23`).
  - `frontend/e2e/responsive-main-flow.spec.js`: ทดสอบการทำงาน Responsive ตลอดจนการ Dismiss แจ้งเตือน Toast เมื่อเกิด Validation error (`line 348`).

---

## 2. คู่มือและขั้นตอนการรันคำสั่งเชิงลึกเรียงตามลำดับ (Step-by-Step Execution Commands for AI)

### ขั้นตอนที่ 1: ตรวจสอบและดึง Log ข้อผิดพลาดจาก GitHub Actions Run ล่าสุด
```powershell
# ดูรายการ CI Workflow Run ล่าสุด
gh run list -L 5

# ตรวจสอบ Log เฉพาะจุดที่พังใน Run ที่ระบุ
gh run view <RUN_ID> --log-failed
```

### ขั้นตอนที่ 2: ติดตั้ง Dependencies และ Browser Engine สำหรับ Playwright ในเครื่อง
```powershell
Set-Location frontend
npm install
npx playwright install chromium
```

### ขั้นตอนที่ 3: เริ่มต้น Local Backend และ Frontend Server เพื่อจำลอง Environment
```powershell
# Terminal 1: เริ่มต้น Node.js Backend Server พร้อม Mock DB
Set-Location node-backend
$env:ALLOW_MOCK_DB="true"
node server.js

# Terminal 2: เริ่มต้น Frontend Dev Server
Set-Location frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

### ขั้นตอนที่ 4: รันการทดสอบ Playwright E2E เฉพาะจุดและทั้งชุด
```powershell
Set-Location frontend

# รันเฉพาะไฟล์ที่มีปัญหาเพื่อจำลองอาการ
npx playwright test e2e/admin.spec.js --config=e2e/playwright.config.js
npx playwright test e2e/auth.spec.js --config=e2e/playwright.config.js
npx playwright test e2e/responsive-main-flow.spec.js --config=e2e/playwright.config.js

# รัน E2E ครบทั้ง 77 เคส
npx playwright test --config=e2e/playwright.config.js
```

### ขั้นตอนที่ 5: ยืนยันผลการทดสอบ Unit & Integration Test ของระบบ
```powershell
# Vitest Frontend Tests
Set-Location frontend
npm run test:unit

# Jest Backend Tests
Set-Location node-backend
npm test
```

### ขั้นตอนที่ 6: Commit และ Push ตรงขึ้น Main (ห้าม Git Pull ตามกฎ)
```powershell
git add frontend/src/components/AdminDashboard.vue frontend/src/App.vue docs/AI-WORKING-NOTES.md plans/ci_e2e_remediation_plan.md
git commit -m "fix(ci): restore sticky tabs, auth placeholder, and novalidate for E2E tests"
git push origin main
```

### ขั้นตอนที่ 7: ติดตามสถานะ GitHub Actions CI แบบ Realtime
```powershell
gh run watch <NEW_RUN_ID> --exit-status
```

---

## 3. กฎเหล็กในโค้ดและวิธีแก้บั๊ก (Code Rules & Edge-case Handling)

1. **Sticky Header Constraint ใน Admin Dashboard (`AdminDashboard.vue`)**:
   - การทดสอบ `e2e/admin.spec.js` มีการระบุชัดเจนด้วย assertion: `expect(tabs).toHaveCSS('position', 'sticky')`.
   - ห้ามเปลี่ยน CSS ของ `.admin-tabs` บน Mobile Viewport (`@media (max-width: 1024px)`) เป็น `position: relative` เพราะจะทำให้การ Scroll หลุดออกจากหน้าจอ และ Playwright จะ Fail ทันที.
   - ต้องคงค่า `position: sticky; top: 0; z-index: 51;` ไว้เสมอ.

2. **Placeholder Text Strict Matching ใน Auth Modal (`App.vue`)**:
   - การทดสอบ `e2e/auth.spec.js` ใช้ CSS Selector โดยตรง: `input[placeholder="ตั้งรหัสผ่าน"]`.
   - หากต้องการใส่คำแนะนำความยาวรหัสผ่าน (เช่น 6 ตัวอักษรขึ้นไป) ให้ใส่ใน Label Hint หรือ helper text ด้านล่าง ห้ามแก้ string ภายใน attribute `placeholder` ของ `#reg-password` เด็ดขาด.

3. **HTML5 Validation vs Custom Toast (`App.vue`)**:
   - การทดสอบ `e2e/responsive-main-flow.spec.js` ตรวจสอบการแจ้งเตือนของระบบ Toast Notification ผ่าน Vue Event handler (`handleLoginSubmit`, `handleRegisterSubmit`) เมื่อผู้ใช้ส่งฟอร์มว่าง.
   - เมื่อใช้ `<form>` tag หากมี attribute `required` เบราว์เซอร์จะบล็อกไม่ให้เกิด event `submit` และแสดง native browser popup ซึ่ง Playwright มองไม่เห็น toast.
   - **ทางแก้**: ใส่ attribute `novalidate` บนแท็ก `<form @submit.prevent="..." novalidate>` เพื่อให้ logic ตรวจสอบความถูกต้องฝั่ง Vue ทำงานอย่างสมบูรณ์ และแจ้งเตือนผ่าน `.toast-warning` เสมอ.

---

## 4. ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

- [x] **Playwright E2E Suite (Local)**:
  - คำสั่ง: `npx playwright test --config=e2e/playwright.config.js`
  - ผลลัพธ์: `77 passed (42.2s)` (100% Green).
- [x] **Vitest Frontend Tests**:
  - คำสั่ง: `npm run test:unit`
  - ผลลัพธ์: `186 passed` ครบทั้ง 25 ไฟล์ทดสอบ.
- [x] **Jest Backend Tests**:
  - คำสั่ง: `npm test`
  - ผลลัพธ์: `172 passed` ครบทั้ง 19 Test Suites.
- [x] **GitHub Actions Remote Pipeline**:
  - Run ID: `44110791843`
  - Backend Tests: `Successful in 21s`
  - Frontend Tests: `Successful in 26s`
  - E2E Tests: `Successful in 1m14s`
  - สถานะรวม: `COMPLETED SUCCESS` (ผ่านฉลุยทุก Job).

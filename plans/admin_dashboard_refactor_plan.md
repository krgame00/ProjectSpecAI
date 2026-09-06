# 🏗️ แผนการแยกชิ้นส่วน Admin Dashboard (God Component Decomposition — M6)

> **วันที่บันทึก:** 7 กันยายน 2026  
> **เป้าหมาย:** แยก `AdminDashboard.vue` (1,300 บรรทัด) เป็น SFCs ย่อยตามแท็บการทำงานภายใต้ `frontend/src/components/admin/` โดยรักษาความถูกต้องของ Accessibility, Test Selectors และ CSS Styles 100%

---

## 1. สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

```
frontend/src/components/
├── AdminDashboard.vue                       # Coordinator หลัก (Navbar, Tabs, Shell Layout)
└── admin/
    ├── AdminOverviewTab.vue                 # สถิติภาพรวม + กราฟ Chart.js 7 วันย้อนหลัง
    ├── AdminOrdersTab.vue                   # ตารางออเดอร์, ฟิลเตอร์, แก้สถานะ + Modal รายละเอียด
    ├── AdminInventoryTab.vue                # แคตตาล็อกสินค้า, ฟิลเตอร์หมวด, ซิงก์ราคา + Modal เพิ่ม/แก้สินค้า
    ├── AdminArticlesTab.vue                 # รายการบทความ, ฟิลเตอร์วันที่ + Modal เพิ่ม/แก้บทความพร้อม Upload
    ├── AdminUsersTab.vue                    # รายชื่อสมาชิก, ฟิลเตอร์ Role + ปุ่มปรับสิทธิ์/ลบ
    └── AdminConfirmModal.vue                # Confirmation Dialog กลาง (Reusable)
```

### การเชื่อมโยงระดับ Component และ Data Flow:
- **`AdminDashboard.vue`**:
  - เก็บ State: `adminTab` (dashboard, orders, inventory, articles, users, profile)
  - เก็บ Confirm Modal State กลาง: `confirmModal = { show, message, onConfirm, type }`
  - ส่ง Props ไปยัง Child Component:
    - `:orders`, `:catalog`, `:categories`, `:articles`, `:currentUser`
  - รับ Event `@request-confirm` จาก Child Component เมื่อมีการกดลบหรือปรับสิทธิ์ เพื่อให้เกิดการ Confirm ผ่าน Modal เดียวกัน
- **`frontend/tests/AdminDashboard.test.js`**:
  - ยังคง mount `AdminDashboard` ตัวแม่ และทดสอบฟังก์ชันทุกอย่างทะลุไปยัง Child Components ได้อย่างสมบูรณ์ เพราะ Vue Test Utils `mount` จะ render คอมโพเนนต์ลูกทั้งหมดโดยอัตโนมัติ

---

## 2. คู่มือและขั้นตอนการรันคำสั่งเชิงลึกเรียงตามลำดับ (Step-by-Step Execution Commands for AI)

### ขั้นตอนที่ 1: สร้างไดเรกทอรีและคอมโพเนนต์ย่อย
1. สร้างโฟลเดอร์ `frontend/src/components/admin/`
2. สร้างคอมโพเนนต์:
   - `AdminOverviewTab.vue`
   - `AdminOrdersTab.vue`
   - `AdminInventoryTab.vue`
   - `AdminArticlesTab.vue`
   - `AdminUsersTab.vue`
   - `AdminConfirmModal.vue`

### ขั้นตอนที่ 2: ปรับ `AdminDashboard.vue` เป็น Coordinator
1. Import คอมโพเนนต์ย่อยทั้ง 6 ตัว
2. แทนที่ inline template ในแต่ละแท็บด้วยแท็กคอมโพเนนต์ลูก
3. ส่ง props และผูก event `@request-confirm="showConfirm"`
4. จัดการสไตล์ CSS ใน `AdminDashboard.vue` ให้ครอบคลุม subcomponents (เช่น ผ่าน `:deep()` หรือ subcomponent scoped styles)

### ขั้นตอนที่ 3: รันคำสั่งทดสอบและ Build
```bash
# ทดสอบ Unit Tests ทั้งหมดของ frontend
cd frontend && npm test

# ทดสอบเฉพาะ AdminDashboard.test.js
cd frontend && npx vitest run tests/AdminDashboard.test.js

# Build ตรวจสอบความถูกต้องของการแปลง SFC
cd frontend && npm run build
```

---

## 3. กฎเหล็กในโค้ดและวิธีแก้บั๊ก (Code Rules & Edge-case Handling)

1. **ห้ามเปลี่ยนหรือลบ Attributes และ IDs ที่ Tests ผูกอยู่:**
   - `#admin-tab-*` และ `#admin-panel-*`
   - `data-test="orders-search"`, `data-test="orders-result-count"`, `data-test="orders-table-region"`, `data-test="orders-reset"`
   - `data-test="products-search"`, `data-test="products-result-count"`, `data-test="inventory-table-region"`, `data-test="product-card-*"`
   - `data-test="articles-search"`, `data-test="articles-date-filter"`, `data-test="articles-result-count"`, `data-test="articles-table-region"`
   - `data-test="users-search"`, `data-test="users-role-filter"`, `data-test="users-result-count"`, `data-test="users-table-region"`
   - `data-test="product-modal"`, `data-test="article-modal"`, `data-test="save-product"`, `data-test="save-article"`
   - `role="dialog"`, `aria-modal="true"`, `aria-labelledby="confirm-modal-title"`
2. **การจัดการ Confirm Modal Callback:**
   - ส่ง callback `onConfirm` ผ่าน event `@request-confirm="(message, onConfirmCallback, type) => showConfirm(message, onConfirmCallback, type)"` เพื่อรักษา atomic operation และ loading state ของปุ่ม confirm
3. **CSS Scoping Traps ใน Vue 3:**
   - เมื่อแยกแท็บเป็น SFC คอมโพเนนต์ลูก ถ้าแม่ใช้ `<style scoped>` คลาสลูกจะไม่ติดสไตล์
   - ทางแก้: แปลง selector ใน `AdminDashboard.vue` ให้ใช้ `:deep(...)` สำหรับคลาสที่เป็นของลูก เช่น `:deep(.stat-grid)`, `:deep(.data-table)`, `:deep(.operations-toolbar)`, `:deep(.modal-overlay)` เพื่อให้ CSS ถูก apply ลงไปใน DOM tree ของ subcomponents 100%

---

## 4. ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

- [ ] `npx vitest run tests/AdminDashboard.test.js` ผ่านทั้ง 19 ข้อ 100%
- [ ] `npm test` ใน `frontend/` ผ่านครบทั้ง 23 suites 165 tests
- [ ] `npm test` ใน `node-backend/` ผ่านครบทั้ง 10 suites 128 tests
- [ ] `npm run build` ใน `frontend/` สำเร็จโดยไม่มี error หรือ warning ใดๆ

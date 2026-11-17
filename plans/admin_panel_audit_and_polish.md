# Admin Panel Audit & Polish Technical Plan (PCSpec)

## 1. Architecture & Component Mapping
- **Container View**: [frontend/src/views/AdminView.vue](file:///f:/Projects/PCSpec/frontend/src/views/AdminView.vue)
- **Main Dashboard**: [frontend/src/components/AdminDashboard.vue](file:///f:/Projects/PCSpec/frontend/src/components/AdminDashboard.vue)
- **Tab 1: ภาพรวมร้านค้า (Overview)**: [frontend/src/components/admin/AdminOverviewTab.vue](file:///f:/Projects/PCSpec/frontend/src/components/admin/AdminOverviewTab.vue)
- **Tab 2: รายการสั่งซื้อ (Orders)**: [frontend/src/components/admin/AdminOrdersTab.vue](file:///f:/Projects/PCSpec/frontend/src/components/admin/AdminOrdersTab.vue)
- **Tab 3: สินค้าคงคลัง (Inventory)**: [frontend/src/components/admin/AdminInventoryTab.vue](file:///f:/Projects/PCSpec/frontend/src/components/admin/AdminInventoryTab.vue)
- **Tab 4: จัดการบทความ (Articles)**: [frontend/src/components/admin/AdminArticlesTab.vue](file:///f:/Projects/PCSpec/frontend/src/components/admin/AdminArticlesTab.vue)
- **Modal Confirmation**: [frontend/src/components/admin/AdminConfirmModal.vue](file:///f:/Projects/PCSpec/frontend/src/components/admin/AdminConfirmModal.vue)

---

## 2. Audit Findings Across the 4 Core Tabs
1. **Tab 1: ภาพรวมร้านค้า (Store Overview)**:
   - Stat Cards: ยอดขายรวม (Gross Revenue), คำสั่งซื้อทั้งหมด (Total Orders), รอจัดประกอบ (Pending Assembly).
   - Sales Chart: Bar chart 7 วันย้อนหลัง (Chart.js) แสดงยอดขายจริงเมื่อมีคำสั่งซื้อ และแสดง Benchmark ตัวอย่างเมื่อยังไม่มีคำสั่งซื้อ.
   - สุขภาพระบบ: 0 console errors, 0 network errors.
2. **Tab 2: รายการสั่งซื้อ (Orders Management)**:
   - ตารางและตัวกรอง: ค้นหาด้วยหมายเลขหรือชื่อลูกค้า, กรองตามสถานะ (ทุกสถานะ, รอดำเนินการ, กำลังประกอบ, จัดส่งแล้ว).
   - ปรับปรุงการแสดงผลชิ้นส่วนในหน้าต่างรายละเอียด (Order Details Modal):
     - ปรับฟังก์ชัน `getHardwareItem` ให้รองรับทั้ง ID ดั้งเดิมและ ID ตัวเลข ทำให้ชิ้นส่วนฮาร์ดแวร์แสดงรูปภาพ ชื่อรุ่น และราคาจริง ไม่แสดงข้อความ "ไม่พบข้อมูลสินค้า".
     - ปรับกรอบรูปภาพเป็นพื้นหลังสีขาว `#ffffff` เพื่อขับภาพชิ้นส่วนให้ชัดเจน.
3. **Tab 3: สินค้าคงคลัง (Inventory Management)**:
   - แคตตาล็อกแยกตามหมวดหมู่ (CPU, Motherboard, RAM, GPU, Storage, PSU, Case).
   - ปุ่ม "+ เพิ่มสินค้า" เปิดหน้าต่างเพิ่มสินค้าใหม่พร้อม Key-Value spec generator และตัวอย่างรูปภาพ.
   - ปุ่ม "🔄 ซิงก์ราคาล่าสุด" อัปเดตราคาแบบอัตโนมัติ.
4. **Tab 4: จัดการบทความ (Articles Management)**:
   - ตารางบทความ 15 รายการ พร้อมตัวกรองค้นหาและกรองตามวันที่เผยแพร่.
   - ปุ่ม "+ เพิ่มบทความ" เปิดหน้าต่างเขียนบทความพร้อมระบบอัปโหลดภาพปกและตัวอย่างภาพ.
5. **การปรับแต่งดีไซน์ Supabase ในส่วน Modal Headers/Footers**:
   - ขจัดตัวแปรตกค้าง `var(--glass-border)` และพื้นหลัง `rgba(0,0,0,0.2)` ในหน้าต่าง Modal ของแท็บ Orders, Inventory, Articles.
   - ปรับใช้ `var(--hairline-cool)` และ `var(--canvas-soft)` ตามโทนสีมาตรฐานของระบบ.

---

## 3. Testing & Verification Checklist
- [x] **Vitest Frontend Suites**: 25/25 files passed (186/186 tests).
- [x] **Jest Backend Suites**: 19/19 files passed (172/172 tests).
- [x] **Automated Browser Audit (Microsoft Edge)**: `scratch/audit_admin_panel.cjs` passed with 0 console logs and 0 network errors.
- [x] **Screenshots Captured**:
  - `audit_admin_tab1_overview.png`: ภาพรวมร้านค้าพร้อมกราฟแท่งยอดขาย.
  - `audit_admin_tab2_orders.png`: ตารางรายการสั่งซื้อและตัวกรองสถานะ.
  - `audit_admin_tab2_orders_modal.png`: หน้าต่างรายละเอียดคำสั่งซื้อพร้อมรูปภาพและราคาชิ้นส่วนที่ถูกต้อง.
  - `audit_admin_tab3_inventory.png`: ตารางสินค้าคงคลังและปุ่มซิงก์ราคา.
  - `audit_admin_tab3_inventory_modal.png`: ฟอร์มเพิ่มสินค้าใหม่ในคลัง.
  - `audit_admin_tab4_articles.png`: ตารางบทความและตัวกรองวันที่.
  - `audit_admin_tab4_articles_modal.png`: ฟอร์มเขียนบทความใหม่พร้อมอัปโหลดภาพปก.
  - `audit_admin_mobile_overview.png`: แดชบอร์ดบนจอมือถือ (390x844).
  - `audit_admin_mobile_orders.png`: รายการคำสั่งซื้อแบบ Mobile Card.
  - `audit_fixed_admin_mobile_tabs_overview.png`: แถบแท็บแอดมินบนมือถือที่แก้ไขแล้ว พร้อมปุ่มย้อนกลับ SVG และชื่อแท็บกระชับ.
  - `audit_fixed_admin_mobile_tabs_orders.png`: แถบแท็บแอดมินบนมือถือขณะเลือกแท็บคำสั่งซื้อ ไม่ตกขอบ ไม่ถูกตัดตัวอักษร.
  - `audit_fixed_admin_desktop_sidebar.png`: เมนูด้านข้างแอดมินบนเดสก์ท็อปคงสภาพสมบูรณ์พร้อมไอคอนลูกศร SVG.

---

## 4. Mobile Tab Navigation Bar Refinements
- **ปัญหาเดิม**:
  1. ตัวอักษรตกขอบซ้าย (`ashboard ภาพรวม`) เมื่อเลื่อนแนวนอนเนื่องจากขาด padding และ scroll-padding.
  2. ชื่อแท็บยาวเกินไปสำหรับจอมือถือ 390px แสดงผลได้เพียง 1 แท็บกว่าๆ.
  3. ปุ่มกลับหน้าร้านค้าแสดงไอคอน Emoji สีฟ้าของระบบปฏิบัติการ (`⬅️`) ไม่เข้ากับธีม Supabase.
  4. ขาดเส้นแบ่งคั่นระหว่างแถบแท็บที่เลื่อนได้กับปุ่มแอ็กชันย้อนกลับ.
- **การปรับปรุงที่ส่งมอบ**:
  1. เพิ่ม `shortLabel` ให้กับรายการแท็บแอดมิน (ภาพรวม, คำสั่งซื้อ, คลังสินค้า, บทความ, สมาชิก, โปรไฟล์) และแสดงผลบนหน้าจอ `<= 640px` ขณะที่เดสก์ท็อปยังคงชื่อเต็ม.
  2. แทนที่ Emoji `⬅️` ด้วย inline SVG stroke arrow พร้อมรองรับ hover transform และขนาดสัมผัส 38x38px.
  3. เพิ่มเส้นแบ่งคั่น `border-left: 1px solid var(--hairline-cool)` ให้กับ `.admin-return`.
  4. เพิ่ม `scroll-padding-inline: 0.5rem`, `padding: 0.35rem 0.5rem` และ `gap: 0.35rem` ป้องกันตัวอักษรตกขอบขณะเลื่อน.

# 🧹 PCSpec Database Deduplication & Integrity Guide

เอกสารคู่มือทางเทคนิคสำหรับการคลีนและลบข้อมูลสินค้าซ้ำซ้อน (Database Deduplication) ในฐานข้อมูล MySQL `smart_pc_builder`

---

## 1. 🏗️ สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

| ไฟล์ / ตำแหน่ง | ประเภท | หน้าที่และความรับผิดชอบ |
| :--- | :--- | :--- |
| [`node-backend/scripts/check_all_duplicates.js`](file:///c:/Users/PC/Downloads/PCSpec/node-backend/scripts/check_all_duplicates.js) | Node.js Script | สคริปต์สแกนตรวจหาข้อมูลซ้ำซ้อนในตาราง `products`, `users`, `articles`, `order_items` |
| [`node-backend/scripts/deduplicate_products.js`](file:///c:/Users/PC/Downloads/PCSpec/node-backend/scripts/deduplicate_products.js) | Node.js Script | สคริปต์ ACID Migration ทำการรวมและลบแถวสินค้าซ้ำซ้อน 254 แถว พร้อมรักษาสายสัมพันธ์ Foreign Key |
| [`node-backend/scripts/comprehensive_db_audit.js`](file:///c:/Users/PC/Downloads/PCSpec/node-backend/scripts/comprehensive_db_audit.js) | Node.js Script | สคริปต์ตรวจสอบความสมบูรณ์ระดับ 100% ครอบคลุม 12 ตาราง |

---

## 2. ⚡ คู่มือและขั้นตอนการรันคำสั่งเชิงลึก (Step-by-Step Execution Commands for AI)

### ขั้นตอนที่ 1: ตรวจสอบข้อมูลซ้ำซ้อนในฐานข้อมูล
```bash
cd c:\Users\PC\Downloads\PCSpec\node-backend
node scripts/check_all_duplicates.js
```

### ขั้นตอนที่ 2: รันกระบวนการ ACID Deduplication
```bash
cd c:\Users\PC\Downloads\PCSpec\node-backend
node scripts/deduplicate_products.js
```

### ขั้นตอนที่ 3: ตรวจสอบความถูกต้องและ Integrity ทั้งหมด 12 ตาราง
```bash
cd c:\Users\PC\Downloads\PCSpec\node-backend
node scripts/comprehensive_db_audit.js
```

---

## 3. 🛡️ กฎเหล็กในโค้ดและวิธีจัดการ Edge Cases (Code Rules & Edge-case Handling)

1. **Foreign Key Preservation (การรักษาความถูกต้องของคำสั่งซื้อ):**
   - ก่อนจะลบแถวสินค้าที่ซ้ำ จะทำการตรวจเช็กกับตาราง `order_items` เสมอ
   - หากสินค้าตัวใดเคยถูกสั่งซื้อ จะได้รับสิทธิ์เป็น Master Keeper หรือทำการ Re-link `order_items.product_id` ไปยัง Master ID ทันที เพื่อไม่ให้เกิด Orphan Order Item
2. **Category Spec Cascading Cleanup:**
   - การลบแถวใน `products` จะลบแถวในตารางสเปกย่อย (`spec_cpu`, `spec_motherboard`, `spec_ram`, `spec_gpu`, `spec_storage`, `spec_psu`, `spec_case`) ควบคู่กันเสมอใน Transaction เดียวกัน

---

## 4. ✅ ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

- [x] จำนวนสินค้าซ้ำซ้อนในตาราง `products` ลดลงเหลือ **0 รายการ (0% Duplicates)**
- [x] จำนวนสินค้าคงเหลือทั้งหมดคือ **749 ชิ้นที่มีคุณภาพและสเปกครบถ้วน 100%**
- [x] ข้อมูลในตารางสเปกเฉพาะ (`spec_*`) ตรงกับจำนวนสินค้าใน `products` ทุกตาราง ไม่พบ Orphan แต่อย่างใด
- [x] คำสั่งซื้อใน `order_items` ทุกรายการเชื่อมโยงกับสินค้าจริง 100%
- [x] Unit Test ของ Compatibility Engine ผ่านครบทุกกรณี

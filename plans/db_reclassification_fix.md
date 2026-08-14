# 🛠️ PCSpec Database Reclassification & Junk Cleanup Guide

เอกสารคู่มือทางเทคนิคสำหรับการคลีนนิ่งข้อมูลและการย้ายหมวดหมู่ฮาร์ดแวร์ที่จัดเก็บผิดประเภทในฐานข้อมูล MySQL (`smart_pc_builder`) ของระบบ PCSpec

---

## 1. 🏗️ สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

| ไฟล์ / ตำแหน่ง | ประเภท | หน้าที่และความรับผิดชอบ |
| :--- | :--- | :--- |
| [`node-backend/scripts/fix_misclassified_hardware.js`](file:///c:/Users/PC/Downloads/PCSpec/node-backend/scripts/fix_misclassified_hardware.js) | Node.js Migration Script | สคริปต์รัน Database Transaction เพื่อย้ายหมวดหมู่ VGA/RAM และลบ Dummy Items |
| [`node-backend/scripts/comprehensive_db_audit.js`](file:///c:/Users/PC/Downloads/PCSpec/node-backend/scripts/comprehensive_db_audit.js) | Node.js Audit Tool | สคริปต์ตรวจสอบความสมบูรณ์ ความถูกต้อง และ Foreign Keys ของทั้งฐานข้อมูล |
| [`node-backend/config/db.js`](file:///c:/Users/PC/Downloads/PCSpec/node-backend/config/db.js) | DB Connection Pool | โมดูลเชื่อมต่อ MySQL 8+ ผ่าน `mysql2/promise` พร้อมโหมด Fallback |
| [`node-backend/controllers/hardwareController.js`](file:///c:/Users/PC/Downloads/PCSpec/node-backend/controllers/hardwareController.js) | Controller | ดึงและประกอบ JSON Catalog (`/api/hardware/catalog`) ให้กับ Frontend |

---

## 2. ⚡ คู่มือและขั้นตอนการรันคำสั่งเชิงลึก (Step-by-Step Execution Commands for AI)

สำหรับการให้ AI Agent อื่นๆ หรือผู้ดูแลระบบรันต่อ ให้ปฏิบัติตามลำดับดังนี้:

### ขั้นตอนที่ 1: ตรวจสอบสถานะการเชื่อมต่อ MySQL
```bash
cd c:\Users\PC\Downloads\PCSpec\node-backend
node -e "require('dotenv').config(); const mysql=require('mysql2/promise'); mysql.createConnection({host:process.env.DB_HOST||'localhost',user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD||'1234',database:process.env.DB_NAME||'smart_pc_builder'}).then(()=>console.log('DB Connected OK')).catch(console.error);"
```

### ขั้นตอนที่ 2: รันสคริปต์ Reclassification & Cleanup
```bash
cd c:\Users\PC\Downloads\PCSpec\node-backend
node scripts/fix_misclassified_hardware.js
```

### ขั้นตอนที่ 3: รันสคริปต์ Audit ตรวจสอบผลลัพธ์
```bash
cd c:\Users\PC\Downloads\PCSpec\node-backend
node scripts/comprehensive_db_audit.js
```

---

## 3. 🛡️ กฎเหล็กในโค้ดและวิธีจัดการ Edge Cases (Code Rules & Edge-case Handling)

1. **ห้ามลบสินค้าที่มี Foreign Key ใน `order_items`:**
   - ก่อนจะลบรายการ Dummy หรือย้ายสินค้า ต้องทำการตรวจสอบ `SELECT * FROM order_items WHERE product_id = ?` ทุกครั้ง
2. **Transaction Isolation (ACID):**
   - ทุกการอัปเดตข้ามตาราง (`products` + `spec_ram` + `spec_gpu`) ต้องครอบด้วย `connection.beginTransaction()` และ `connection.rollback()` เมื่อเกิดข้อผิดพลาด
3. **Spec Table Synchronization:**
   - เมื่อย้าย `category_id` ของสินค้า ต้องลบ record ใน spec table เดิมทิ้ง และ `INSERT ... ON DUPLICATE KEY UPDATE` ใน spec table ใหม่ทันที เพื่อไม่ให้เกิด Orphaned หรือ Ghost Specs

---

## 4. ✅ ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

- [x] ตาราง `spec_ram` ต้องไม่มีค่า `ram_type` เป็น `GDDR6` หรือ `GDDR6 (ECC)` อีกต่อไป
- [x] ตาราง `spec_gpu` ต้องไม่มีสินค้าที่เป็นชิปแรม DDR2/DDR3 อีกต่อไป
- [x] รายการสินค้า Dummy (`ALL Ram for PC`, `ALL Mainboard`, ฯลฯ) ถูกลบออก 0 รายการคงเหลือ
- [x] สินค้าการ์ดจอที่ย้ายมาใหม่ (เช่น RX 6500 XT, RX 9060 XT, RX 9070 GRE) มีค่า `tdp_watt` และ `length_mm` ถูกต้อง
- [x] สินค้าแรมที่ย้ายมาใหม่ (Blackberry DDR2/DDR3, Hynix, Apacer) มีค่า `capacity_gb` และ `bus_speed` ถูกต้อง

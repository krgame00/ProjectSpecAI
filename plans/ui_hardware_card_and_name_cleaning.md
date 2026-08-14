# 🎨 PCSpec Comprehensive Multi-Category Data & Specification Normalization Guide

เอกสารคู่มือทางเทคนิคสำหรับการตรวจสอบ ซ่อมแซม และจัดระเบียบข้อมูลสเปกของฮาร์ดแวร์ทุกหมวดหมู่ (All 7 Categories) ในระบบ PCSpec

---

## 1. 🏗️ สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

| ไฟล์ / ตำแหน่ง | ประเภท | หน้าที่และความรับผิดชอบ |
| :--- | :--- | :--- |
| [`node-backend/sync_to_tidb.js`](file:///c:/Users/PC/Downloads/PCSpec/node-backend/sync_to_tidb.js) | Node.js Script | สคริปต์ซิงค์ฐานข้อมูลทั้งหมด 13 ตารางขึ้น TiDB Cloud พร้อมระบบ Verification |
| [`node-backend/scripts/fix_placeholder_prices.js`](file:///c:/Users/PC/Downloads/PCSpec/node-backend/scripts/fix_placeholder_prices.js) | Node.js Script | สคริปต์ปรับราคาการ์ดจอ RTX 5060 / 5060 Ti / RX 9060 XT และ Rec. PSU |
| [`node-backend/scripts/fix_cpu_catalog_dups.js`](file:///c:/Users/PC/Downloads/PCSpec/node-backend/scripts/fix_cpu_catalog_dups.js) | Node.js Script | สคริปต์ลบซีพียูตัว Tray/Die ซ้ำซ้อน และปรับราคาซีพียูระดับท็อป |
| [`node-backend/scripts/purge_final_duplicates.js`](file:///c:/Users/PC/Downloads/PCSpec/node-backend/scripts/purge_final_duplicates.js) | Node.js Script | สคริปต์กวาดล้างข้อมูลซ้ำซ้อนรอบสุดท้าย |
| [`frontend/src/components/HardwareSelection.vue`](file:///c:/Users/PC/Downloads/PCSpec/frontend/src/components/HardwareSelection.vue) | Vue Component | แสดงผลการ์ดสินค้าทุกหมวดหมู่ด้วยระบบ 4 แถว (`4-Row Badge System`) สวยงาม เป็นระเบียบ เท่ากันทุกชิ้น |

---

## 2. ⚡ คู่มือและขั้นตอนการรันคำสั่งเชิงลึก (Step-by-Step Execution Commands for AI)

### ขั้นตอนที่ 1: รันซิงค์ฐานข้อมูลทั้งหมดขึ้น TiDB Cloud
```bash
cd c:\Users\PC\Downloads\PCSpec\node-backend
node sync_to_tidb.js
```

### ขั้นตอนที่ 2: ตรวจสอบความถูกต้องของฐานข้อมูลทั้งหมด (Local + TiDB)
```bash
cd c:\Users\PC\Downloads\PCSpec\node-backend
node scripts/comprehensive_db_audit.js
```

---

## 3. ☁️ สรุปผลการซิงค์ขึ้น TiDB Cloud ล่าสุด (100% Synced)

| ตารางข้อมูล (Table) | จำนวนแถวข้อมูล (Rows) | สถานะบน TiDB Cloud |
| :--- | :---: | :---: |
| **`categories`** | 7 แถว | 🟢 ตรงกัน 100% |
| **`products`** | 587 แถว | 🟢 ตรงกัน 100% |
| **`spec_cpu`** | 40 แถว | 🟢 ตรงกัน 100% |
| **`spec_motherboard`** | 113 แถว | 🟢 ตรงกัน 100% |
| **`spec_ram`** | 68 แถว | 🟢 ตรงกัน 100% |
| **`spec_gpu`** | 148 แถว | 🟢 ตรงกัน 100% |
| **`spec_storage`** | 46 แถว | 🟢 ตรงกัน 100% |
| **`spec_psu`** | 56 แถว | 🟢 ตรงกัน 100% |
| **`spec_case`** | 116 แถว | 🟢 ตรงกัน 100% |
| **`articles`** | 12 แถว | 🟢 ตรงกัน 100% |
| **`users`** | 25 แถว | 🟢 ตรงกัน 100% |
| **`orders`** | 13 แถว | 🟢 ตรงกัน 100% |
| **`order_items`** | 19 แถว | 🟢 ตรงกัน 100% |

---

## 4. 🌟 สรุปความพร้อมของระบบ (System Readiness Checklist)

- [x] **0 Duplicates:** ข้อมูลสินค้าทุกหมวดหมู่ไม่มีตัวซ้ำ
- [x] **Clean Model Names:** ตัดรหัส Part Number หางยาวในวงเล็บออกทั้งหมด
- [x] **Realistic Market Prices:** แก้ไขราคาดัมมี่ ฿2,490 ออกครบทุกหมวดหมู่
- [x] **Accurate Specs & Badges:** ทุกการ์ดแสดง 4 แถว (`4-Row Badge System`) เท่าเทียมและสวยงาม
- [x] **TiDB Cloud Synchronization:** ข้อมูลบนคลาวด์ TiDB อัปเดตตรงกับ Local MySQL 100%

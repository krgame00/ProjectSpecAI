# 🔌 PCSpec Socket & RAM Type Normalization Guide

เอกสารคู่มือทางเทคนิคสำหรับการปรับมาตรฐานชื่อ Socket และการเติมเต็ม `ram_type` ในฐานข้อมูล MySQL (`smart_pc_builder`) และระบบ Compatibility Engine ของ PCSpec

---

## 1. 🏗️ สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

| ไฟล์ / ตำแหน่ง | ประเภท | หน้าที่และความรับผิดชอบ |
| :--- | :--- | :--- |
| [`node-backend/scripts/normalize_sockets_and_ram_types.js`](file:///c:/Users/PC/Downloads/PCSpec/node-backend/scripts/normalize_sockets_and_ram_types.js) | Node.js Migration Script | สคริปต์ Database Transaction ปรับ Socket และเติม RAM type ให้ครบ 100% |
| [`frontend/src/utils/compatibility.js`](file:///c:/Users/PC/Downloads/PCSpec/frontend/src/utils/compatibility.js) | Pure Compatibility Engine | เครื่องมือคำนวณและตรวจสอบความเข้ากันได้ของ CPU, Mobo, RAM, GPU, PSU, Case |
| [`node-backend/tests/test_compatibility_node.mjs`](file:///c:/Users/PC/Downloads/PCSpec/node-backend/tests/test_compatibility_node.mjs) | Unit Test Suite | ชุดทดสอบฟังก์ชัน `normalizeSocket`, `socketMatches`, `checkSocket`, `checkRamCompatibility` |
| [`node-backend/scripts/comprehensive_db_audit.js`](file:///c:/Users/PC/Downloads/PCSpec/node-backend/scripts/comprehensive_db_audit.js) | Audit Script | สคริปต์สแกนตรวจสอบความสมบูรณ์และข้อผิดพลาดของข้อมูลในฐานข้อมูล |

---

## 2. ⚡ คู่มือและขั้นตอนการรันคำสั่งเชิงลึก (Step-by-Step Execution Commands for AI)

### ขั้นตอนที่ 1: รันสคริปต์ Database Normalization
```bash
cd c:\Users\PC\Downloads\PCSpec\node-backend
node scripts/normalize_sockets_and_ram_types.js
```

### ขั้นตอนที่ 2: รัน Unit Test ตรวจสอบ Compatibility Engine
```bash
cd c:\Users\PC\Downloads\PCSpec\node-backend
node --test tests/test_compatibility_node.mjs
```

### ขั้นตอนที่ 3: รัน Audit ยืนยันผลลัพธ์ในฐานข้อมูล
```bash
cd c:\Users\PC\Downloads\PCSpec\node-backend
node scripts/comprehensive_db_audit.js
```

---

## 3. 🛡️ กฎเหล็กในโค้ดและวิธีจัดการ Edge Cases (Code Rules & Edge-case Handling)

1. **Defense-in-Depth for Socket Matching:**
   - ในระดับฐานข้อมูล: ชื่อ Socket ต้องไม่มีช่องว่าง เช่น `'LGA1700'`, `'LGA1851'`, `'AM5'`, `'AM4'`, `'sTRX5'`, `'LGA1155'`
   - ในระดับ Frontend / Compatibility Engine: ฟังก์ชัน `normalizeSocket(socket)` ต้องตัดช่องว่างภายในและแปลงเป็นตัวพิมพ์ใหญ่อัตโนมัติ (`replace(/\s+/g, '').trim().toUpperCase()`) และแปลงเลขล้วน เช่น `"1155"` เป็น `"LGA1155"`
2. **Motherboard RAM Type Rules:**
   - เมนบอร์ด Socket `AM5` และ `LGA1851` รองรับเฉพาะแรม `DDR5`
   - เมนบอร์ด Socket `AM4` รองรับเฉพาะแรม `DDR4`
   - เมนบอร์ด Socket `LGA1700` มีทั้งรุ่น `DDR4` (มักมีรหัส D4, DDR4, D4-CSM ในชื่อ) และรุ่น `DDR5` (รุ่นมาตรฐานหรือระบุ D5)

---

## 4. ✅ ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

- [x] เมนบอร์ดทั้ง 181 รายการใน `spec_motherboard` มี Socket ที่เป็นมาตรฐาน (`AM4`, `AM5`, `LGA1700`, `LGA1851`, `LGA1155`) ไม่มีเว้นวรรค
- [x] เมนบอร์ดทั้ง 181 รายการมีค่า `ram_type` ครบถ้วน 100% (ไม่มี NULL หรือค่าว่าง)
- [x] ซีพียู Threadripper (IDs 11165, 12736) มีค่า Socket เป็น `'sTRX5'`
- [x] Unit Test สำหรับ `normalizeSocket` และ `socketMatches` ผ่าน 100%

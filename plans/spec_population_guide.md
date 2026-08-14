# 📊 PCSpec Hardware Specification & Storage Population Guide

เอกสารคู่มือทางเทคนิคสำหรับการเติมเต็มค่า TDP และแก้ไขสเปก CPU/GPU/Storage ในฐานข้อมูล MySQL (`smart_pc_builder`) ของระบบ PCSpec

---

## 1. 🏗️ สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

| ไฟล์ / ตำแหน่ง | ประเภท | หน้าที่และความรับผิดชอบ |
| :--- | :--- | :--- |
| [`node-backend/scripts/populate_missing_specs_and_storage.js`](file:///c:/Users/PC/Downloads/PCSpec/node-backend/scripts/populate_missing_specs_and_storage.js) | Node.js Migration Script | สคริปต์ Database Transaction ปรับปรุงค่า Cores/Threads/TDP ของ CPU/GPU และ Insert ค่าใน `spec_storage` |
| [`node-backend/scripts/comprehensive_db_audit.js`](file:///c:/Users/PC/Downloads/PCSpec/node-backend/scripts/comprehensive_db_audit.js) | Audit Script | สคริปต์ตรวจสอบความสมบูรณ์ทุกตารางและฟิลด์สเปก |
| [`node-backend/controllers/hardwareController.js`](file:///c:/Users/PC/Downloads/PCSpec/node-backend/controllers/hardwareController.js) | Controller | รวบรวมข้อมูลสเปกย่อยส่งผ่าน API `/api/hardware/catalog` |
| [`frontend/src/utils/compatibility.js`](file:///c:/Users/PC/Downloads/PCSpec/frontend/src/utils/compatibility.js) | Compatibility Engine | นำค่า TDP ของ CPU/GPU ไปคำนวณขนาด Watt ของ PSU ที่เหมาะสม |

---

## 2. ⚡ คู่มือและขั้นตอนการรันคำสั่งเชิงลึก (Step-by-Step Execution Commands for AI)

### ขั้นตอนที่ 1: รันสคริปต์ Populate ข้อมูลสเปก
```bash
cd c:\Users\PC\Downloads\PCSpec\node-backend
node scripts/populate_missing_specs_and_storage.js
```

### ขั้นตอนที่ 2: รัน Audit ตรวจสอบสุขภาพฐานข้อมูล 100%
```bash
cd c:\Users\PC\Downloads\PCSpec\node-backend
node scripts/comprehensive_db_audit.js
```

### ขั้นตอนที่ 3: ตรวจสอบผลลัพธ์ผ่าน API Query Simulator
```bash
cd c:\Users\PC\Downloads\PCSpec\node-backend
node scripts/test_catalog_output.js
```

---

## 3. 🛡️ กฎเหล็กในโค้ดและวิธีจัดการ Edge Cases (Code Rules & Edge-case Handling)

1. **การป้องกัน Regex สับสนเลข Socket กับจำนวน Core:**
   - สำหรับ CPU Intel เช่น `Core i7-14700F` หรือ `Core Ultra 5 250KF` ชื่อรุ่นจะมีเลข Socket (1700/1851) ปรากฏอยู่ ห้ามสับสนนำเลข Socket ไปบันทึกเป็นจำนวน Core
2. **การกำหนด TDP ของ CPU และ GPU:**
   - Intel Core i5/i3 non-K: 60W - 65W
   - Intel Core i7/i9 K/KF & Core Ultra K: 125W
   - AMD Ryzen non-X/G: 65W
   - AMD Ryzen X/X3D/XT: 105W - 170W
   - AMD Ryzen Threadripper: 350W
3. **Storage Spec Completeness:**
   - อุปกรณ์เก็บข้อมูลทุกประเภท (SSD, HDD, External Storage, NAS) ต้องมีแถวในตาราง `spec_storage` รองรับการ JOIN ของ `hardwareController.js` เสมอ

---

## 4. ✅ ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

- [x] ซีพียูทั้ง 94 รายการใน `spec_cpu` มีค่า `socket`, `cores`, `threads`, `tdp_watt` ครบถ้วน (0 NULLs)
- [x] การ์ดจอทั้ง 170 รายการใน `spec_gpu` มีค่า `chipset`, `vram_gb`, `tdp_watt`, `length_mm` ครบถ้วน (0 NULLs)
- [x] อุปกรณ์เก็บข้อมูลทั้ง 147 รายการใน `spec_storage` มี Record ตรงกับ `products` 100%
- [x] ผลการ Audit รายงานสถานะสุขภาพฐานข้อมูล: **🟢 100% HEALTHY & PERFECT**

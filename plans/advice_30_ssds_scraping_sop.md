# 🚀 คู่มือสแครปปิ้ง 30 SSD จากเว็บ Advice (Advice 30 SSD Scraping Technical SOP)

> **สถานะการทำงาน (Status):** กำลังดำเนินการรันดึงข้อมูล (11 สิงหาคม 2026)  
> **เป้าหมายหลัก:** สแครปข้อมูลสินค้า SSD จำนวน 30 รายการจากเว็บไซต์ Advice ( advice.co.th ) รวมทั้งราคาขายสด รูปภาพ HD (900px) แบรนด์ และสเปคยิบย่อย บันทึกลง MySQL Database (`smart_pc_builder`) และส่งออกตารางย่อย `spec_storage`

---

## 🛠️ Section 1: สถาปัตยกรรมและไฟล์ที่เกี่ยวข้อง (Architecture & File Mapping)

| ส่วนงาน | ตำแหน่งไฟล์ / Command | คำอธิบายหน้าที่ |
| :--- | :--- | :--- |
| **Advice Scraper** | `scripts/scrape_30_advice_ssds.py` | สแครปเปอร์หลัก ค้นหา URL 30 รายการอัตโนมัติ สแกน JSON-LD + Table + Feature List |
| **Spec Normalizer** | `node-backend/scripts/populate_typed_specs.js` | อ่านสเปค JSON ใน `products` แล้วกระจายลงตารางย่อย `spec_storage` (Form Factor, Capacity, Speed, Warranty) |
| **DB Inspector** | `node-backend/scripts/export_db_to_html.js` | ส่งออกตาราง DB ทั้งหมดเป็นไฟล์ HTML Visual Inspector ที่ `database-export/database_view.html` |
| **Backup Data** | `scraped_30_advice_ssds.json` | ไฟล์ JSON บันทึกข้อมูลทั้ง 30 ชิ้นสำรองไว้สำหรับตรวจสอบ |

---

## 📖 Section 2: ขั้นตอนการรันระบบดึงข้อมูลสำหรับ AI / Developer (Step-by-Step Execution Guide)

### Step 1: รัน Python Advice Scraper
```bash
python scripts/scrape_30_advice_ssds.py
```
- **สิ่งที่สคริปต์ทำ:** ใช้ Scrapling สแกนหมวดหมู่ `ssd-m-2-nvme` และ `ssd-sata-2-5-` เพื่อรวบรวม URL สินค้า 30 รายการ จากนั้นเข้าสแกนหน้ารายละเอียดทีละหน้า สกัดราคา, แบรนด์, รูป HD 900px และสเปคยิบย่อย อัปเดตลงตาราง `products`

### Step 2: รันประมวลผลตารางสเปคย่อย (`spec_storage`)
```bash
node node-backend/scripts/populate_typed_specs.js
```
- **สิ่งที่สคริปต์ทำ:** แปลงฟิลด์สเปคของ SSD (เช่น `Read Speed`, `Write Speed`, `Capacity`, `Form Factor`) ให้เป็นตัวเลข/ชนิดข้อมูลมาตรฐานลงตาราง `spec_storage`

### Step 3: ส่งออก HTML Inspector
```bash
node node-backend/scripts/export_db_to_html.js
```
- **สิ่งที่สคริปต์ทำ:** อัปเดตไฟล์ `database-export/database_view.html` เพื่อใช้เปิดตรวจดูข้อมูล 30 SSD จาก Advice ผ่านเบราว์เซอร์

---

## 🧹 Section 3: กฎเหล็กและการแก้ไขปัญหาเฉพาะกรณี (Code Rules & Edge-case Handling)

1. **การดึงราคา (Advice Price Extraction):**
   - ดึงจาก `JSON-LD Schema` (ฟิลด์ `offers.price`) หากไม่มี ให้ fallback ดึงจากคลาส HTML `.product-price` / `.price`
2. **การทำความสะอาดขยะสเปค (Spec Key Cleaning):**
   - กรองสเปคผ่านฟังก์ชัน `is_valid_spec_key(key)` เพื่อขจัดคีย์ขยะแท็กสคริปต์ คลาส CSS หรือ HTML Comment
3. **การประมวลผลรูปภาพ HD:**
   - แปลงพารามิเตอร์ URL รูปภาพ Advice จาก `width=80` หรือ `width=300` ให้เป็น `width=900` เพื่อให้ได้รูปความละเอียดสูง

---

## 📊 Section 4: ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

- [ ] **การสร้างไฟล์ JSON:** มีไฟล์ `scraped_30_advice_ssds.json` เกิดขึ้นและมีข้อมูลครบ 30 ชิ้น
- [ ] **ตาราง MySQL:** ตาราง `products` มีรายการสินค้าเพิ่มขึ้น/อัปเดต โดยมี `category_id = 5` และ `source = Advice`
- [ ] **ตาราง spec_storage:** ตาราง `spec_storage` มีข้อมูล Form Factor, Capacity, Speed ครบถ้วน
- [ ] **HTML Inspector:** เปิดดูใน `database-export/database_view.html` ตาราง `products` และ `spec_storage` ข้อมูลขึ้นตรงกัน 100%

---
*เอกสารนี้จัดทำขึ้นตามกฎ Mandatory AI Documentation Rule สำหรับโครงการ PCSpec*

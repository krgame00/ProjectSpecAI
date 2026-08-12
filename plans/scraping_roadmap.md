# 🚀 แผนงานและคู่มือปฏิบัติการดึงข้อมูลสินค้าเชิงลึก (PCSpec Hardware Scraping & Technical SOP Guide)

> **สถานะโครงการล่าสุด (Last Updated):** 11 สิงหาคม 2026  
> **เป้าหมายหลัก:** เป็นแผนงานและคู่มือมาตรฐาน (Standard Operating Procedure: SOP) สำหรับ Developer หรือ AI Agent ใดๆ (เช่น Claude, ChatGPT, DeepSeek, Cursor) ให้สามารถทำความเข้าใจโครงสร้าง สแกนดึงข้อมูล แก้ไขขยะสเปค และนำข้อมูลเข้าสู่ฐานข้อมูล MySQL (`smart_pc_builder`) ได้อย่างสมบูรณ์แบบโดยไม่ผิดพลาด

---

## 🛠️ Section 1: สถาปัตยกรรมและไฟล์ที่เกี่ยวข้อง (Architecture & File Mapping)

| ส่วนงาน | ตำแหน่งไฟล์ / Command | คำอธิบายหน้าที่ |
| :--- | :--- | :--- |
| **Scraper Script** | `scripts/fast_scrape_ihavecpu_correct.py` | สแครปเปอร์หลัก ดึง API + เจาะหน้ารายละเอียดเพื่อสกัดสเปคยิบย่อยและรูปภาพ HD |
| **Spec Normalizer** | `node-backend/scripts/populate_typed_specs.js` | อ่านสเปค JSON ใน `products` แล้วกระจายลงตารางย่อย (`spec_cpu`, `spec_storage`, ฯลฯ) |
| **DB Inspector** | `node-backend/scripts/export_db_to_html.js` | ส่งออกตาราง DB ทั้งหมดเป็นไฟล์ HTML Visual Inspector ที่ `database-export/database_view.html` |
| **Backend Server** | `node-backend/server.js` | Express.js API Server (Port 3001) บริการข้อมูลฮาร์ดแวร์ให้ Frontend |
| **Frontend App** | `Frontend/` (`npm run dev`) | Vue 3 Single Page Application หน้าจัดสเปค (`http://localhost:5173/build`) |
| **Config File** | `node-backend/.env` | ตั้งค่า MySQL DB (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) |

---

## 📖 Section 2: ขั้นตอนการรันระบบดึงข้อมูลสำหรับ AI / Developer (Step-by-Step Execution Guide)

หากต้องการดึงข้อมูลฮาร์ดแวร์ใหม่ หรืออัปเดตราคาสเปคให้สดใหม่อยู่เสมอ ให้ปฏิบัติตาม **4 ขั้นตอน** ตามลำดับดังนี้:

### Step 1: รัน Python Scraper ดึงข้อมูลและราคาจริง
```bash
python scripts/fast_scrape_ihavecpu_correct.py
```
- **สิ่งที่สคริปต์ทำ:** ยิงคำขอไปที่ API `https://apisp.ihavecpu.com/api/product/listCate?category_id=...` เพื่อดึงราคาขายจริง (`price_sale`) และรูปภาพ HD (`_800.jpg`) จากนั้นใช้ Scrapling เจาะหน้าสินค้าเพื่อเก็บสเปคยิบย่อย บันทึกลงตาราง `products` ใน MySQL และบันทึกเป็นไฟล์ JSON สำรอง

### Step 2: กระจายสเปคเข้าสู่ Strongly Typed Tables (`spec_*`)
```bash
node node-backend/scripts/populate_typed_specs.js
```
- **สิ่งที่สคริปต์ทำ:** อ่านฟิลด์ `specifications` (JSON) จากตาราง `products` และแปลงค่าชนิดข้อมูล (Socket, RAM Type, Form Factor, Read/Write Speed) ก่อน insert/update ลงตาราง `spec_cpu`, `spec_storage`, `spec_gpu`, `spec_motherboard`, `spec_ram`, `spec_psu`, `spec_case`

### Step 3: ส่งออก HTML Database Inspector
```bash
node node-backend/scripts/export_db_to_html.js
```
- **สิ่งที่สคริปต์ทำ:** สร้างไฟล์ `database-export/database_view.html` สำหรับใช้เปิดดูตาราง MySQL ทั้งหมดผ่านเบราว์เซอร์ได้ทันทีโดยไม่ต้องใช้โปรแกรมจัดการ DB อื่น

### Step 4: เปิดใช้งานระบบบนเว็บจริง
```bash
# Terminal 1: Backend
cd node-backend && node server.js

# Terminal 2: Frontend
cd Frontend && npm run dev
```
- **ผลลัพธ์:** เข้าใช้งานเว็บจัดสเปคได้ที่ `http://localhost:5173/build`

---

## 🧹 Section 3: กฎเหล็กในการสแครปและทำความสะอาดข้อมูล (Data Extraction & Cleaning Rules)

หากจำเป็นต้องแก้ไขหรือเขียนสแครปเปอร์เพิ่ม ให้ปฏิบัติตาม **3 กฎเหล็ก** นี้อย่างเคร่งครัด:

### 1. กฎการดึงราคา (Price Mapping Rule)
- ❌ **อย่าใช้** ฟิลด์ `item.get('price')` จาก API ihavecpu เพราะจะคืนค่าเป็น `0` หรือ `null`
- ✅ **ต้องใช้** ฟิลด์ `item.get('price_sale')` หรือ `item.get('price_before')` เสมอ เพื่อให้ได้ราคาขายจริงตามหน้าร้าน (เช่น ฿3,790, ฿5,790, ฿8,990)

### 2. กฎการระบุแบรนด์ (Brand Extraction Rule)
- ❌ **อย่าตั้ง** แบรนด์เป็น `"Generic"` หากไม่ทราบ
- ✅ **ต้องใช้** ฟิลด์ `item.get('brand')` จาก API หรือใช้ Regex ตรวจจับจากชื่อสินค้า (`title`) เช่น:
  `LEXAR`, `PREDATOR`, `ADATA`, `KINGSTON`, `WD`, `SAMSUNG`, `CRUCIAL`, `CORSAIR`, `ASUS`, `GIGABYTE`, `MSI`

### 3. กฎการกรองขยะสเปค (Spec Key Noise Cleaning Rule)
- **ปัญหาเดิม:** Regex สแกน HTML อาจดึงแท็กขยะ CSS/JS/HTML Comment ติดมาด้วย เช่น `'wait_for_update'`, `<!-- Generator...`, `.css-11jjlqg`
- ✅ **วิธีแก้:** ต้องผ่านฟังก์ชันกรอง `is_valid_spec_key(key)` ทุกครั้งก่อนเก็บบันทึก:
```python
def is_valid_spec_key(key):
    if not key:
        return False
    k = key.strip()
    # ตัดคีย์ที่ขึ้นต้นด้วยอักขระพิเศษหรือขยะ HTML
    if any(k.startswith(char) for char in ["'", '"', '!', '.', '-', '_', '<', '>', '{', '}']):
        return False
    # ตัดคำค้นขยะแท็กสคริปต์และสไตล์ลิสต์
    forbidden_terms = ['{', '}', ';', '=', '<', '>', '"', "'", '\\', 'div', 'class', 
                       'http', 'css', 'style', 'script', 'generator', 'illustrator', 'wait_for_update']
    if any(term in k.lower() for term in forbidden_terms):
        return False
    if len(k) < 2 or len(k) > 40:
        return False
    return True
```

---

## 📌 Section 4: แผนงานที่ดำเนินการแล้วและเป้าหมายถัดไป (Roadmap Status)

- [x] **4.1 Deep Scraper Engine & HD Images:** ดึงหน้ารายละเอียดสินค้าจริงพร้อมรูป HD (900px)
- [x] **4.2 Data Normalization & Typed Spec Tables:** กระจายข้อมูลลงตารางย่อย `spec_*` รวม 575 สินค้า
- [x] **4.3 Price & Noise Fixing:** แก้ปัญหาราคา ฿0 และกรองขยะแท็กสคริปต์/Comment ออก 100%
- [x] **4.4 Supabase UI Spec Modal:** แสดงผลสเปคเชิงลึกในป๊อปอัป Modal สไตล์ Supabase บนเว็บจริง
- [ ] **4.5 Dynamic Compatibility Checker:** ใช้ข้อมูลจาก `spec_*` (Socket, RAM Type, Form Factor, TDP) เพื่อแจ้งเตือนอุปกรณ์ไม่เข้ากันแบบ Real-time (ดูรายละเอียดและโค้ดตัวอย่างใน [plans/next_phases_master_plan.md](file:///c:/Users/PC/Downloads/PCSpec/plans/next_phases_master_plan.md))
- [ ] **4.6 One-Click Sync in Admin UI:** เพิ่มปุ่มใน Admin Dashboard สำหรับรันสคริปต์ซิงค์ราคาสดด้วยคลิกเดียว (ดูแผนการสร้าง API และ UI ใน [plans/next_phases_master_plan.md](file:///c:/Users/PC/Downloads/PCSpec/plans/next_phases_master_plan.md))

---
*เอกสารนี้จัดทำขึ้นเป็นมาตรฐานกลาง (Standard Specification) สำหรับทีมพัฒนาและ AI Agents ในโครงการ PCSpec (อ่านแผนการพัฒนาถัดไปฉบับเต็มได้ที่ [plans/next_phases_master_plan.md](file:///c:/Users/PC/Downloads/PCSpec/plans/next_phases_master_plan.md))*


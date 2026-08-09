# 🚀 แผนงานการปรับปรุงและดึงข้อมูลสินค้าเชิงลึก (PCSpec Hardware Scraping & Data Enrichment Roadmap)

> **สถานะโครงการล่าสุด (Last Updated):** 9 สิงหาคม 2026  
> **เป้าหมายหลัก:** สร้างฐานข้อมูลอุปกรณ์คอมพิวเตอร์ (Hardware Catalog) ที่มีความแม่นยำ รูปภาพความละเอียดสูง (HD 900px) และสเปคเชิงลึก (Deep Specifications 20–50 Fields ต่อสินค้า) สำหรับใช้ในระบบจัดสเปคคอมพิวเตอร์และระบบ AI Chatbot (SpecAI)

---

## 📌 Phase 1: การพัฒนาสแครปเปอร์เชิงลึก (Deep Scraper Engine) [ทำสำเร็จแล้ว ✅]

- [x] **1.1 ระบบดึงข้อมูลรายละเอียดรายชิ้น (Detail Page Scraping)**
  - พัฒนาสแครปเปอร์เข้าถึง URL หน้ารายละเอียดสินค้าจริงของ Advice และ ihavecpu
  - รองรับการดึงข้อมูลสเปคแบบยิบย่อยจาก `JSON-LD Schema`, HTML Spec Tables (`table.table-spec-py`), และ Feature Lists (`.feature-desc li`)
  - สกัดสเปคได้สูงสุด **20 - 49 Fields ต่อสินค้า** (Cores, Threads, Base/Turbo Freq, L1/L2/L3 Cache, Socket, Graphic, TDP, Dimensions, Weight, Volume, Warranty)

- [x] **1.2 ระบบประมวลผลรูปภาพ HD (900px HD Images)**
  - แปลงและทำความสะอาด URL รูปภาพของ Advice และ ihavecpu ให้ดึงรูปต้นฉบับความละเอียดสูง (900px)
  - แก้ไขปัญหาภาพสินค้าซ้ำ ภาพโลโก้แบรนด์ หรือภาพไม่ตรงรุ่น

- [x] **1.3 การทดสอบกับสินค้าจริง (Real 10-Item Validation)**
  - ทดสอบดึงข้อมูลสินค้าจริง 10 รายการ (CPU AMD/Intel, M.2 NVMe SSDs, Mainboards)
  - อัปเดตข้อมูลลงฐานข้อมูล MySQL (`smart_pc_builder`) และส่งออกเป็นไฟล์ `scraped_10_real_deep_products.json` สำเร็จ

---

## 🛠️ Phase 2: การทำความสะอาดและจัดเก็บข้อมูลลง DB (Data Cleaning & DB Normalization) [ทำสำเร็จแล้ว ✅]

- [x] **2.1 สกัดข้อมูลเข้าสู่ Strongly Typed Spec Tables**
  - ปรับปรุงสคริปต์ `node-backend/scripts/populate_typed_specs.js`
  - ทำความสะอาดข้อความ Socket (เช่น แปลง `"AM4 6 cores..."` ให้เหลือเพียง `"AM4"`)
  - กระจายข้อมูลสเปคเข้าสู่ตาราง `spec_cpu`, `spec_storage`, `spec_gpu`, `spec_motherboard`, `spec_ram`, `spec_psu`, `spec_case` รวม **515 สินค้า**

- [x] **2.2 ระบบ HTML Database Inspector**
  - พัฒนาสคริปต์ `node-backend/scripts/export_db_to_html.js`
  - ส่งออกข้อมูลใน DB เป็นเว็บ inspector อยู่ที่ `database-export/database_view.html` เพื่อใช้ตรวจสอบข้อมูลทั้งหมดใน DB ได้สะดวก

---

## 🔄 Phase 3: การรันสแครปเปอร์แบบเต็มรูปแบบ (Full Catalog Scraping) [ทำสำเร็จแล้ว ✅]

- [x] **3.1 การสแครปข้อมูลสินค้าครอบคลุมทุกหมวดหมู่ (Full Multi-Category Scraping)**
  - สร้างและรันสคริปต์ `scripts/run_full_deep_scraper.py` ดึงสเปคเชิงลึกครอบคลุมทุกหมวดหมู่ (CPU, Mainboard, GPU, RAM, Storage, PSU, Case)
  - ดึงข้อมูลสเปคและอัปเดตลง MySQL Database ได้สำเร็จเรียบร้อยแล้ว (รวมสเปคตารางย่อย 561 รายการ)

---

## 🎨 Phase 4: การปรับปรุง UI/UX หน้าจัดสเปค & Admin Dashboard [แผนงานขั้นถัดไป 🎯]

- [x] **4.1 แสดงผล Deep Specs ใน Modal รายละเอียดสินค้า (Product Detail Modal)**
  - ปรับปรุง `Frontend/src/components/HardwareSelection.vue` ให้แสดงผลตารางสเปคยิบย่อยจาก `specifications` (JSON / Typed Spec Tables) ให้สวยงาม สไตล์ Supabase
  - แสดงรูปภาพ HD 900px ใน Modal พร้อมปุ่มเลือกอุปกรณ์เข้าสเปคได้อย่างสวยงามเรียบร้อย

- [ ] **4.2 ระบบเช็คความเข้ากันได้ (Compatibility Engine Enhancement)**
  - นำข้อมูล Socket, RAM Type, Form Factor, TDP จาก `spec_*` มาใช้ในการแจ้งเตือน Compatibility Warning แบบ Real-time เช่น:
    - แจ้งเตือนเมื่อเลือก CPU Socket AM5 แต่ Mainboard เป็น Socket AM4
    - แจ้งเตือนเมื่อเลือก Mainboard DDR5 แต่ RAM เป็น DDR4
    - คำนวณ TDP รวมของ CPU + GPU เพื่อแนะนำกำลังไฟ PSU ที่เหมาะสม

- [ ] **4.3 เพิ่มปุ่ม "Sync Latest Prices" ใน Admin UI**
  - เพิ่มเมนูใน Admin Dashboard สำหรับกดซิงค์ราคาสินค้าและสเปคจาก Advice/ihavecpu ได้ด้วยคลิกเดียว

---

## 📊 ตารางสรุปเวลาดำเนินงาน (Target Timeline)

| Phase | หัวข้อ | สถานะ | กำหนดเสร็จ |
| :--- | :--- | :---: | :---: |
| **Phase 1** | Deep Scraper Engine & HD Images (Advice & ihavecpu) | ✅ เสร็จสิ้น | 9 ส.ค. 2026 |
| **Phase 2** | Data Cleaning & Strongly Typed Spec Tables (515 Products) | ✅ เสร็จสิ้น | 9 ส.ค. 2026 |
| **Phase 3** | Full Multi-Category Scraping (CPU, GPU, MB, RAM, SSD, PSU, Case) | ✅ เสร็จสิ้น | 9 ส.ค. 2026 |
| **Phase 4** | UI Spec Display & Dynamic Compatibility Checker | 🔄 ทำแล้ว 4.1 | 11 ส.ค. 2026 |

---
*เอกสารนี้สร้างขึ้นโดย AI Assistant (PCSpec Project)*

# PCSpec Project Context & Handoff

## 📌 ภาพรวมโปรเจกต์ (Project Overview)
โปรเจกต์ PCSpec เป็นเว็บแอปพลิเคชันสำหรับจัดสเปคคอมพิวเตอร์ (PC Builder) พร้อมระบบ AI Chatbot ผู้ช่วยส่วนตัว โครงสร้างโปรเจกต์แบ่งเป็น:
- **Frontend:** Vue 3 (Composition API, `<script setup>`), CSS แบบ Custom (อ้างอิงดีไซน์ Tech Blog สไตล์ ihavecpu.com)
- **Backend:** Node.js, Express.js 
- **Database:** MySQL (ฐานข้อมูลชื่อ `smart_pc_builder`)

## 🛠 ฟีเจอร์ที่พัฒนาแล้ว (Completed Features)
1. **ระบบจัดสเปค (Hardware Selection):**
   - แสดงรายการอุปกรณ์แยกตามหมวดหมู่ (CPU, Motherboard, RAM, GPU, Storage, PSU, Case)
   - ดึงข้อมูลจริงจาก MySQL ผ่าน API (`/api/hardware/catalog`)
   - ตรวจสอบความเข้ากันได้ (Compatibility Check) แบบ Real-time เช่น ซ็อกเก็ต CPU/Mobo, ประเภท RAM, กำลังไฟ PSU

2. **ระบบ AI Chatbot (SpecAI):**
   - แชตบอตแนะนำสเปคในรูปแบบ Floating Window (`ChatbotWindow.vue`)
   - มีปุ่ม Quick Presets (เช่น สายแอนิเมชัน, อีมูหลายจอ, ประหยัดงบ)
   - เมื่อกด Preset ระบบจะจัดชิ้นส่วนเข้าตะกร้าและคำนวณราคาทันที พร้อมอธิบายเหตุผลที่เลือกสเปคนั้น
   - *Fix ล่าสุด:* แก้ไขบั๊ก Render Crashed ใน `App.vue` (เปลี่ยน `@checkout="handleCheckoutClick"` เป็น `handleCheckout`) ทำให้ราคาอัปเดตปกติเมื่อกด Preset

3. **ระบบจัดการภาพฮาร์ดแวร์ (Hardware Images):**
   - เขียนสคริปต์ Background Node.js (`generate_all_images.js`) เชื่อมต่อ Pollinations API
   - Generate และดาวน์โหลดภาพอุปกรณ์แบบ Studio Quality ครบทั้ง 270+ ชิ้น
   - ภาพทั้งหมดถูกเก็บไว้ที่ `frontend/public/images/hardware/` และอัปเดต Path ใน MySQL แล้ว

4. **ระบบบทความ (Tech Blog / Articles):**
   - หน้าแสดงรายการบทความและอ่านบทความ (`ArticlesView.vue`, `ArticleDetailView.vue`)
   - Backend API สำหรับ CRUD บทความ

## 🧠 ความรู้และแนวทางสำหรับ Agent แชตใหม่ (Agent Instructions)
หากสร้างแชตใหม่ โปรดให้ Agent อ่านไฟล์นี้เป็นอันดับแรก และรับทราบบริบทต่อไปนี้:
- **Style/Aesthetic:** การปรับ UI ต้องเน้นความ Modern, Premium, Glassmorphism, Micro-animations ห้ามทำ UI เรียบๆ ธรรมดาเด็ดขาด (อ้างอิง `DESIGN.md`)
- **Debugging:** หากเจอบั๊กให้ใช้ "Four-Step Debugging Discipline" (Mantra) เสมอ (Reproduce -> Trace Fail Path -> Question Hypothesis -> Cross-reference Breadcrumbs)
- **Database Sync:** ข้อมูลฮาร์ดแวร์ทั้งหมดตอนนี้อยู่ใน MySQL ฝั่ง Frontend จะทำการ fetch `/api/hardware/catalog` มาแทนที่ `catalog` เสมอใน `onMounted`

## 🚀 เทคนิคที่คุยกันไว้ (Discussions)
- **Sub-Agent & Context Management:** 
  - การจัดการความจำระยะสั้นใช้ Sliding Window (ตัดประวัติเก่าทิ้ง)
  - ความจำระยะยาวใช้ Database/Vector DB 
  - การจัดการ State (เช่น การรันสคริปต์โหลดรูป 273 รูปใน Background) ให้ทำผ่าน Node.js พร้อมระบบ Retry/Delay ป้องกัน Rate Limit

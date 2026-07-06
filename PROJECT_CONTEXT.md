# PCSpec Project Context & Handoff

## 📌 ภาพรวมโปรเจกต์ (Project Overview)
โปรเจกต์ PCSpec เป็นเว็บแอปพลิเคชันสำหรับจัดสเปคคอมพิวเตอร์ (PC Builder) พร้อมระบบ AI Chatbot ผู้ช่วยส่วนตัว โครงสร้างโปรเจกต์แบ่งเป็น:
- **Frontend:** Vue 3 (Composition API, `<script setup>`), CSS แบบ Custom, Vue Router สำหรับการนำทาง (Routing)
- **Backend:** Node.js, Express.js (MVC Architecture)
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

3. **ระบบจัดการภาพฮาร์ดแวร์ (Hardware Images):**
   - เขียนสคริปต์ Background Node.js (`generate_all_images.js`) เชื่อมต่อ Pollinations API
   - Generate และดาวน์โหลดภาพอุปกรณ์แบบ Studio Quality ครบทั้ง 270+ ชิ้น
   - ภาพทั้งหมดถูกเก็บไว้ที่ `frontend/public/images/hardware/` และอัปเดต Path ใน MySQL แล้ว

4. **ระบบนำทาง (Vue Router) และ Layouts:**
   - ใช้ `vue-router` จัดการ URL (`/`, `/admin`, `/articles`, `/profile`)
   - แยกหน้า Admin ออกจากหน้าเว็บร้านค้าหลักอย่างชัดเจน ทำให้โครงสร้างปลอดภัยและสะอาดขึ้น
   - ซ่อน UI ของแอดมินออกจากหน้าเว็บร้านค้าทั้งหมด

5. **ระบบยืนยันตัวตนระดับ Server (JWT Auth):**
   - สมัครและล็อกอินด้วยอีเมล + รหัสผ่าน
   - จัดเก็บข้อมูลในตาราง `users` บน MySQL
   - รหัสผ่านถูกเข้ารหัสอย่างปลอดภัยด้วย `bcryptjs`
   - ระบบจำการล็อกอินด้วย **JSON Web Token (JWT)** บันทึกลง `localStorage`
   - มี Backend Middleware (`authMiddleware`, `adminMiddleware`) ป้องกันเส้นทางที่สำคัญ

6. **ระบบจัดการสมาชิกสำหรับแอดมิน (User Management):**
   - แสดงรายชื่อสมาชิกทั้งหมด
   - แอดมินสามารถปรับเปลี่ยนสิทธิ์ (Customer / Admin) ของสมาชิกคนอื่นได้
   - แอดมินสามารถลบบัญชีสมาชิกคนอื่นได้
   - มีระบบบล็อก (Self-protection) ป้องกันไม่ให้แอดมินลดสิทธิ์หรือลบไอดีของตัวเองที่กำลังใช้งานอยู่

## 🧠 ความรู้และแนวทางสำหรับ Agent แชตใหม่ (Agent Instructions)
หากสร้างแชตใหม่ โปรดให้ Agent อ่านไฟล์นี้เป็นอันดับแรก และรับทราบบริบทต่อไปนี้:
- **Style/Aesthetic:** การปรับ UI เปลี่ยนจาก Glassmorphism เป็น "Supabase-inspired" (Clean White Canvas, Hairline Borders, Emerald Green Primary CTA, Inter font) ควบคุมผ่าน Design Tokens ใน `style.css` (อ้างอิง `DESIGN-supabase.md` และ `impeccable` skill)
- **Debugging:** หากเจอบั๊กให้ใช้ "Four-Step Debugging Discipline" (Mantra) เสมอ (Reproduce -> Trace Fail Path -> Question Hypothesis -> Cross-reference Breadcrumbs)
- **Database Sync:** ข้อมูลฮาร์ดแวร์ทั้งหมดตอนนี้อยู่ใน MySQL ฝั่ง Frontend จะทำการ fetch `/api/hardware/catalog` มาแทนที่ `catalog` เสมอใน `onMounted`
- **Authentication:** การเรียก API ที่ต้องใช้สิทธิ์ ให้แนบ `Authorization: Bearer <token>` ไปด้วยเสมอ (ดึงจาก `localStorage.getItem('token')`)

## 🚀 เทคนิคที่คุยกันไว้ (Discussions)
- **Sub-Agent & Context Management:** 
  - การจัดการความจำระยะสั้นใช้ Sliding Window (ตัดประวัติเก่าทิ้ง)
  - ความจำระยะยาวใช้ Database/Vector DB 
  - การจัดการ State (เช่น การรันสคริปต์โหลดรูป 273 รูปใน Background) ให้ทำผ่าน Node.js พร้อมระบบ Retry/Delay ป้องกัน Rate Limit

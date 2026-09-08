# 🏷️ แผนการปรับปรุงเอกสารและชื่อแบรนด์ระบบโปรดักชัน (Production Brand Alignment SOP)

> **วันที่บันทึก:** 8 กันยายน 2026  
> **เป้าหมาย:** ซิงก์ชื่อระบบในไฟล์เอกสาร `README.md` หลัก, `frontend/README.md`, และ `database-export/README.md` ให้ตรงกับชื่อแบรนด์และระบบโปรดักชันจริงคือ **"ForgeLabs"** (จากเดิมที่ค้างชื่อโปรเจกต์ภายใน `PCSpec`)

---

## 1. สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

```
PCSpec/ (Repository Root)
├── README.md                   # เอกสารหน้าแรกของคลังโค้ด (Root README)
├── frontend/
│   ├── README.md               # เอกสารแนะนำระบบฝั่ง Frontend (Vue 3)
│   ├── index.html              # HTML Title & Metadata ระบุ "ForgeLabs"
│   ├── src/
│   │   ├── App.vue             # Header Branding: "ForgeLabs" + Logo
│   │   ├── views/LandingView.vue # Hero/Footer Branding: "ForgeLabs"
│   │   └── stores/chatbot.js   # Chatbot Greeting: "ยินดีต้อนรับสู่เว็บไซต์ ForgeLabs!"
└── database-export/
    └── README.md               # เอกสารเครื่องมือ Database Inspector
```

### การตรวจสอบความสอดคล้องของชื่อแบรนด์ (Brand Discrepancy Analysis):
- **ระบบโปรดักชันจริง (Production UI & Customer Facing):**
  - หัวเว็บ (`frontend/index.html`): `ForgeLabs — ระบบจัดสเปคคอมอัจฉริยะ`
  - โลโก้และแถบนำทาง (`frontend/src/App.vue`): `ForgeLabs` Logo + Brand Title
  - หน้าร้านหลัก (`frontend/src/views/LandingView.vue`): "Why Use ForgeLabs?", "© 2026 ForgeLabs"
  - บอทผู้ช่วย (`frontend/src/stores/chatbot.js`): "สวัสดีครับ! ยินดีต้อนรับสู่เว็บไซต์ ForgeLabs! ผมคือ SpecAI..."
  - เอกสารผู้ใช้งาน (`docs/USER_MANUAL.md`): "คู่มือการใช้งานระบบ ForgeLabs (PCSpec User Manual)"
  - ภาคผนวกระบบ (`docs/APPENDIX_GUIDE.md`): "ระบบจัดสเปกคอมพิวเตอร์อัจฉริยะ ForgeLabs"
- **จุดที่ไม่ตรงกันใน README ก่อนหน้า:**
  - `README.md` บรรทัดที่ 3: เคยระบุเป็น `# ⚡ PCSpec — Smart PC Builder & Hardware Intelligence Platform`
  - `README.md` บรรทัดที่ 26: เคยระบุเป็น `**PCSpec** ถูกพัฒนาขึ้นเพื่อแก้ปัญหา...`
  - `README.md` บรรทัดที่ 123: ในไดอะแกรมโครงสร้างโปรเจกต์ระบุ `PCSpec/`
  - `README.md` บรรทัดที่ 156: เคยระบุเป็น `ตลอดกระบวนการพัฒนาและการดูแลระบบโปรดักชันของ **PCSpec**...`
  - `frontend/README.md` บรรทัดที่ 1: เคยระบุเป็น `# PCSpec — Smart PC Builder (Frontend)`
  - `database-export/README.md` บรรทัดที่ 3: เคยระบุเป็น `...ของโปรเจกต์ PCSpec`

---

## 2. คู่มือและขั้นตอนการรันคำสั่งเชิงลึกเรียงตามลำดับ (Step-by-Step Execution Commands for AI)

### ขั้นตอนที่ 1: ตรวจสอบตำแหน่งคำว่า `PCSpec` และ `ForgeLabs` ในคลังเอกสาร
```bash
# ตรวจสอบจุดที่ปรากฏคำว่า PCSpec ในเอกสาร README ทั้งหมด
git grep -n "PCSpec" -- "*README*"
```

### ขั้นตอนที่ 2: ดำเนินการแทนที่ด้วยชื่อโปรดักชัน `ForgeLabs`
1. อัปเดต `README.md` ให้หัวข้อหลักเป็น `# ⚡ ForgeLabs — Smart PC Builder & Hardware Intelligence Platform`
2. ปรับบทนำใน `README.md` ให้เป็น `**ForgeLabs** ถูกพัฒนาขึ้นเพื่อแก้ปัญหา...`
3. ปรับโครงสร้างไดเรกทอรีใน `README.md` เป็น `ForgeLabs/`
4. ปรับบทวิศวกรรมใน `README.md` เป็น `ตลอดกระบวนการพัฒนาและการดูแลระบบโปรดักชันของ **ForgeLabs**...`
5. ปรับ `frontend/README.md` เป็น `# ForgeLabs — Smart PC Builder (Frontend)`
6. ปรับ `database-export/README.md` เป็น `...ของระบบ ForgeLabs`

### ขั้นตอนที่ 3: ยืนยันการเปลี่ยนแปลงผ่าน Git Diff
```bash
git diff README.md frontend/README.md database-export/README.md
```

---

## 3. กฎเหล็กในโค้ดและวิธีแก้บั๊ก (Code Rules & Edge-case Handling)

1. **ห้ามแก้ URL ของ Repository หรือ Deployment Link สุ่มสี่สุ่มห้า:**
   - ลิงก์ GitHub ยังคงเป็น `https://github.com/krgame00/ProjectSpecAI.git`
   - ลิงก์ Live Demo ยังคงเป็น `https://project-spec-ai.vercel.app/`
   - ลิงก์ Render Backend ยังคงเป็น `https://projectspecai.onrender.com/`
   - ชื่อฐานข้อมูล MySQL ยังคงเป็น `smart_pc_builder`
   - ชื่อบอท AI ยังคงเป็น `SpecAI`
   - **สิ่งที่ต้องปรับคือ Brand/Product Facing Name เท่านั้น** ซึ่งต้องเป็น **`ForgeLabs`**
2. **รักษาความสมบูรณ์ของฟอร์แมต Markdown:**
   - รักษาสไตล์ Badge, Mermaid Diagram, Code Blocks, และตาราง Tech Stack ไว้อย่างครบถ้วน 100%

---

## 4. ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

- [x] ตรวจสอบว่าใน `README.md` ไม่มีคำว่า `PCSpec` หลงเหลือในส่วนของชื่อผลิตภัณฑ์
- [x] ตรวจสอบว่า `frontend/README.md` ใช้ชื่อ `# ForgeLabs — Smart PC Builder (Frontend)`
- [x] ตรวจสอบว่า `database-export/README.md` ใช้อ้างอิงถึงระบบ `ForgeLabs`
- [x] ทดสอบรันคำสั่ง Grep เพื่อยืนยันว่าการเปลี่ยนชื่อสำเร็จสมบูรณ์ 100%:
  ```bash
  git grep -n "PCSpec" -- "*README*"
  ```
  *(ผลลัพธ์ต้องว่างเปล่า ไม่พบคำตกค้างในไฟล์ README)*

<div align="center">

# ⚡ PCSpec — Smart PC Builder & Hardware Intelligence Platform

<p align="center">
  <strong>เว็บแอปพลิเคชันจัดสเปกคอมพิวเตอร์อัจฉริยะ พร้อม AI ผู้ช่วยวิเคราะห์ความเข้ากันได้ และศูนย์รวมบทความฮาร์ดแวร์ยุค 2026</strong>
</p>

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://project-spec-ai.vercel.app/)
[![API Status](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://projectspecai.onrender.com/api/v1/health)
[![Database](https://img.shields.io/badge/Database-TiDB_Cloud-F31260?style=for-the-badge&logo=mysql&logoColor=white)](https://tidbcloud.com/)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

---

[🌐 ทดลองใช้งานจริง (Live Website)](https://project-spec-ai.vercel.app/) • [📖 เอกสารระบบ (Docs)](./docs) • [🛠 สถาปัตยกรรม (Architecture)](#-สถาปัตยกรรมระบบ-system-architecture) • [🚀 วิธีติดตั้ง (Getting Started)](#-วิธีติดตั้งและรันในเครื่อง-getting-started)

</div>

---

## 📌 บทนำ (Introduction)

**PCSpec** ถูกพัฒนาขึ้นเพื่อแก้ปัญหาความยุ่งยากในการจัดสเปกคอมพิวเตอร์ ไม่ว่าจะเป็นปัญหาความเข้ากันไม่ได้ของฮาร์ดแวร์ (Compatibility Issues), การคำนวณกำลังไฟพาวเวอร์ซัพพลาย (PSU Wattage Calculation), ตลอดจนความสับสนในสเปกและราคา โดยการผสานระบบ **Rule-based Compatibility Engine** ร่วมกับ **SpecAI (Generative AI Assistant)** เพื่อช่วยแนะนำและตรวจทานสเปกแบบเรียลไทม์ พร้อมศูนย์รวมบทความเชิงลึกสำหรับผู้สนใจไอที

---

## ✨ ฟีเจอร์เด่น (Key Features)

### 1. 🛠️ ระบบจัดสเปกอัจฉริยะ (Smart PC Builder & Compatibility Engine)
- **Real-time Compatibility Check**: ตรวจสอบความเข้ากันได้ของชิ้นส่วนทันทีที่เลือก
  - Socket CPU กับชิปเซ็ต Motherboard (เช่น AM5, LGA1700)
  - ประเภทและช่องเสียบหน่วยความจำ (RAM DDR4 vs DDR5)
  - ความยาวการ์ดจอ (GPU Length) เทียบกับขนาดช่องว่างภายในเคส (Case Clearance)
  - กำลังไฟรวมของระบบ (Estimated System TDP) เทียบกับขนาดวัตต์ของพาวเวอร์ซัพพลาย (PSU)
- **Dynamic Calculation**: คำนวณราคารวม, ปริมาณวัตต์ที่ต้องการ, และแสดงสเปกสรุปแบบละเอียด
- **Direct Cart Integration**: ส่งสเปกที่จัดเสร็จเข้าตะกร้าสินค้าและทำรายการสั่งซื้อได้ทันที

### 2. 🤖 SpecAI — ผู้ช่วยจัดสเปกอัจฉริยะ (AI Hardware Assistant)
- **Powered by Google Gemini**: สนทนาและปรึกษาแนวทางการจัดสเปกตามงบประมาณและการใช้งานจริง
- **Quick Preset Workflows**: ปลั๊กอินพรีเซ็ตสำเร็จรูป (สายเกมมิ่ง, งานตัดต่อ/แอนิเมชัน, บอทอีมูหลายจอ, งบประหยัด)
- **1-Click Hardware Insertion**: เมื่อ AI แนะนำชิ้นส่วน สามารถกดปุ่มเพื่อใส่ชุดฮาร์ดแวร์เข้าสู่ระบบจัดสเปกได้ทันทีโดยไม่ต้องค้นหาเอง
- **Streaming & Thinking Indicator**: แสดงสถานะการวิเคราะห์ข้อมูลของ AI แบบเรียลไทม์

### 3. 📰 ศูนย์รวมบทความและคลังความรู้ฮาร์ดแวร์ 2026 (Articles & Tech Hub)
- **15 บทความเทคโนโลยีเชิงลึก**: รวบรวมเนื้อหาวิเคราะห์ฮาร์ดแวร์ประจำปี 2026 เช่น การเลือก VRAM, เคสคอมตู้ปลา, แผ่นเปลี่ยนสถานะ PTM7950, และการจัดสเปกรัน Local AI
- **Studio-grade 16:9 Photography**: ภาพหน้าปกฮาร์ดแวร์ระดับพรีเมียม จัดเก็บแบบ Local Assets โหลดรวดเร็ว ไม่พึ่งพาเซิร์ฟเวอร์ภายนอก
- **Safe HTML & XSS Prevention**: ระบบแสดงเนื้อหาบทความผ่านการกรองความปลอดภัยด้วย DOMPurify

### 4. 🛡️ ระบบบริหารจัดการหลังบ้าน (Enterprise Admin Suite)
- **Hardware Inventory Management**: ระบบเพิ่ม, แก้ไข, ปรับสต็อก และลบสินค้าฮาร์ดแวร์ทุกหมวดหมู่
- **Order Tracking & Lifecycle**: จัดการสถานะคำสั่งซื้อ (Pending, Processing, Completed, Cancelled)
- **User Role & RBAC**: ระบบกำหนดสิทธิ์ผู้ใช้งาน (Customer / Admin) พร้อมระบบ Self-protection ป้องกันแอดมินลบบัญชีตัวเอง
- **Article CMS**: ระบบเขียนและแก้ไขบทความสำหรับทีมงาน

### 5. ⚡ ความเสถียรและความปลอดภัยระดับสูง (Reliability & Security)
- **Dual-Database Architecture**: รองรับทั้ง MySQL Local สำหรับการพัฒนา และ TiDB Serverless Cloud สำหรับโปรดักชัน
- **Zero-Downtime Fallback Engine**: เมื่อฐานข้อมูลออฟไลน์ ระบบจะสลับไปอ่านข้อมูลจาก Local Storage (`articles.json`, `catalog.json`) โดยอัตโนมัติ
- **Security Guardrails**: เข้ารหัสรหัสผ่านด้วย `bcryptjs`, ยืนยันตัวตนด้วย JWT (JSON Web Token), ป้องกัน Brute-force ด้วย Rate Limiting, และรักษาความปลอดภัย HTTP Headers ด้วย Helmet

---

## 🏗️ สถาปัตยกรรมระบบ (System Architecture)

```mermaid
graph TD
    Client["🌐 Web Browser (Client)"]
    
    subgraph Frontend_Vercel ["Frontend (Vercel CDN)"]
        SPA["Vue 3 SPA (Composition API)"]
        PiniaStore["Pinia State Management"]
        Router["Vue Router (Storefront / Admin)"]
    end
    
    subgraph Backend_Render ["Backend (Render Web Service)"]
        API["Node.js + Express.js (MVC)"]
        AuthMid["JWT Auth & Admin Middleware"]
        FallbackEngine["Fallback Storage (JSON)"]
    end
    
    subgraph Data_AI ["Data & Cloud Services"]
        TiDB[("☁️ TiDB Cloud (Serverless Distributed MySQL)")]
        LocalMySQL[("💻 Local MySQL 8.0 (Dev)")]
        GeminiAPI["✨ Google Gemini AI API"]
    end

    Client -->|HTTPS / Assets| SPA
    SPA --> PiniaStore
    PiniaStore --> Router
    SPA -->|REST API /api/v1| API
    
    API --> AuthMid
    API -->|Prompt & RAG Catalog| GeminiAPI
    API -->|Connection Pool| TiDB
    API -.->|Dev Environment| LocalMySQL
    API -.->|Database Outage| FallbackEngine
```

---

## 💻 เทคโนโลยีที่ใช้ (Tech Stack)

| เลเยอร์ (Layer) | เทคโนโลยี (Technology) | หน้าที่และรายละเอียด |
| :--- | :--- | :--- |
| **Frontend Framework** | **Vue 3** (Composition API, `<script setup>`) | พัฒนา UI แบบ Reactive ประสิทธิภาพสูง |
| **State Management** | **Pinia 3** | จัดการ Global State (Cart, Hardware Catalog, Auth, Chatbot) |
| **Routing** | **Vue Router 4** | จัดการหน้าเว็บแยกระหว่าง Customer Storefront และ Admin Dashboard |
| **Design System** | **Custom CSS (Supabase-inspired)** | ดีไซน์สะอาดตา Clean White Canvas, Hairline Borders, Emerald Green CTA |
| **Backend Framework** | **Node.js & Express.js** | พัฒนา RESTful API สถาปัตยกรรมแบบ MVC สะอาดและสเกลง่าย |
| **Database** | **MySQL 8.0** & **TiDB Cloud** | ฐานข้อมูลเชิงสัมพันธ์แบบ Distributed SQL รองรับการขยายตัว |
| **Artificial Intelligence** | **Google Gemini API** | โมเดลปัญญาประดิษฐ์ประมวลผลคำแนะนำฮาร์ดแวร์ใน SpecAI Chatbot |
| **Authentication & Security** | **JWT**, **bcryptjs**, **Helmet**, **Rate Limit** | ระบบยืนยันตัวตนและการป้องกันการโจมตี |
| **Testing & Quality Assurance**| **Vitest**, **Jest**, **Playwright E2E** | ทดสอบครอบคลุม Unit Tests (268+ ข้อ) และ E2E Tests (75+ เวิร์กโฟลว์) |
| **DevOps & Hosting** | **Vercel** & **Render** | โฮสต์ Frontend แบบ Edge CDN และ Backend พร้อม CI/CD บน GitHub Actions |

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```text
PCSpec/
├── .github/workflows/          # CI/CD Workflows (Frontend, Backend, Playwright E2E)
├── database-export/            # เครื่องมือตรวจสอบฐานข้อมูล (database_view.html)
├── docs/                       # เอกสารสถาปัตยกรรม, Flowcharts, ER-Diagram
├── frontend/                   # เว็บแอปพลิเคชัน Vue 3
│   ├── e2e/                    # ชุดทดสอบแบบ End-to-End (Playwright)
│   ├── public/                 # Static Assets (ภาพฮาร์ดแวร์และบทความ)
│   │   └── images/
│   │       ├── articles/       # รูปภาพหน้าปกบทความความละเอียดสูง 15 ภาพ
│   │       └── hardware/       # รูปภาพอุปกรณ์ฮาร์ดแวร์สตูดิโอ 270+ ภาพ
│   ├── src/
│   │   ├── components/         # Vue Components (Builder, Admin, Chatbot, Articles)
│   │   ├── stores/             # Pinia Stores (catalog, builder, auth, chatbot, article)
│   │   ├── router/             # Vue Router Configuration
│   │   └── style.css           # Supabase-inspired Design Tokens & Global CSS
│   └── tests/                  # Unit Tests (Vitest) 22 ไฟล์ 157 ข้อ
├── node-backend/               # เซิร์ฟเวอร์ Node.js Express API
│   ├── config/                 # การตั้งค่าฐานข้อมูล (db.js พร้อมระบบ Fallback)
│   ├── controllers/            # Controller Logic (hardware, article, user, order, bot)
│   ├── middleware/             # Middleware (auth, admin, security, error)
│   ├── routes/                 # Express API Routes
│   ├── tests/                  # Unit & Integration Tests (Jest) 8 ชุด 111 ข้อ
│   ├── sync_articles.js        # สคริปต์ซิงค์บทความเข้า Local MySQL และ Fallback File
│   └── sync_articles_to_tidb.js# สคริปต์ซิงค์บทความสู่ Production Database (TiDB Cloud)
├── plans/                      # แผนงานและคู่มือเชิงเทคนิคตามมาตรฐาน AI Documentation Rule
├── database-schema.sql         # โครงสร้างตารางฐานข้อมูลและดัมพ์เริ่มต้น
└── render.yaml                 # การตั้งค่า Deployment บน Render Cloud
```

---

## 🚀 วิธีติดตั้งและรันในเครื่อง (Getting Started)

### ข้อกำหนดเบื้องต้น (Prerequisites)
- **Node.js**: เวอร์ชัน `20.x` ขึ้นไป
- **MySQL**: เวอร์ชัน `8.0` ขึ้นไป (หรือใช้ TiDB Cloud Serverless)
- **Git**

### 1. โคลนโปรเจกต์ (Clone Repository)
```bash
git clone https://github.com/krgame00/ProjectSpecAI.git
cd ProjectSpecAI
```

### 2. ติดตั้งและตั้งค่า Backend (Node.js Express)
```bash
cd node-backend
npm install
```
สร้างไฟล์ `.env` ในโฟลเดอร์ `node-backend/`:
```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smart_pc_builder
JWT_SECRET=your_jwt_secret_key_2026
GEMINI_API_KEY=your_gemini_api_key
```
นำเข้าโครงสร้างฐานข้อมูลเริ่มต้น:
```bash
# บน MySQL CLI
mysql -u root -p smart_pc_builder < ../database-schema.sql
```
เริ่มรัน Backend Server:
```bash
npm start
# เซิร์ฟเวอร์จะเริ่มทำงานที่ http://localhost:3001
```

### 3. ติดตั้งและตั้งค่า Frontend (Vue 3)
เปิด Terminal ใหม่:
```bash
cd frontend
npm install
```
เริ่มรัน Frontend Dev Server:
```bash
npm run dev
# เปิดเบราว์เซอร์ไปที่ http://localhost:5173
```

---

## 🧪 การทดสอบระบบ (Testing & Quality Gates)

โปรเจกต์นี้ใช้แนวคิด **Quality-First Engineering** มีชุดทดสอบครอบคลุมทุกระดับ พร้อมระบบ Pre-push Quality Gate ก่อนขึ้น Production:

### 1. ทดสอบฝั่ง Frontend (Vitest)
```bash
cd frontend
npm test
# ผลการทดสอบ: 22 Test Files passed (157 tests)
```

### 2. ทดสอบฝั่ง Backend (Jest)
```bash
cd node-backend
npm test
# ผลการทดสอบ: 8 Test Suites passed (111 tests)
```

### 3. ทดสอบการทำงานจริง End-to-End (Playwright)
```bash
cd frontend
npm run test:e2e
# ทดสอบ Flow การจัดสเปก, ตะกร้าสินค้า, การล็อกอิน, หน้าบทความ, และหน้า Admin Dashboard
```

---

## ☁️ การขึ้นระบบจริง (Production Deployment)

- **Frontend**: Deploy อัตโนมัติบน **Vercel** ผ่าน Git Integration เมื่อ Push สู่สาขา `main`
- **Backend API**: โฮสต์บน **Render Web Service** เชื่อมต่อฐานข้อมูล TiDB Cloud พร้อม Health Check `/api/v1/health`
- **Database**: ใช้งาน **TiDB Cloud (Serverless)** ในภูมิภาค `ap-southeast-1` (Singapore)

---

## 👨‍💻 ผู้พัฒนาและทีมงาน (Author & Credits)

- **Project Owner**: krgame00 ([@krgame00](https://github.com/krgame00))
- **Tech Stack & Engineering**: Vue 3, Express.js, TiDB, Google Gemini AI
- **License**: MIT License

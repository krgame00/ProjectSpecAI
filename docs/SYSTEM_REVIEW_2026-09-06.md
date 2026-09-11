# 📋 System Review Report — PCSpec (ForgeLabs)

> **วันที่รีวิว:** 6 กันยายน 2026
> **ขอบเขต:** Static review ทั้ง repo — Backend (`node-backend/`), Frontend (`frontend/`), Database schema, Security, Testing, Documentation, Git health
> **วิธีการ:** สำรวจด้วย 3 ทีมวิเคราะห์ขนานกัน (Backend+DB / Frontend / Docs+Project Health) — ไม่มีการแก้โค้ดใดๆ ในเซสชันนี้
> **ผู้อ่านเป้าหมาย:** เจ้าของโปรเจกต์, อาจารย์/กรรมการ, และ AI Agent หรือ Developer ที่จะมาแก้ไขต่อ (อ่านจบแล้วรันงานต่อได้ทันทีโดยไม่ต้องเดา)

---

## 1. สรุปผู้บริหาร (Executive Summary)

**คำตัดสินรวม:** ระบบมีฐานที่แข็งแรงกว่า senior project ทั่วไปชัดเจน — SQL ปลอด SQL injection 100%, มีวินัยการทดสอบ (38 test suites + CI 3 jobs), accessibility ดีเกินมาตรฐาน และเอกสารครบ แต่มี **ปัญหา Critical 3 เรื่อง** ที่ต้องแก้ก่อนส่งโปรเจกต์/ส่งมอบจริง

| ระดับ | จำนวน | สรุป |
|---|---|---|
| 🔴 **Critical** | 3 | Order total เชื่อใจฝั่ง client (แก้ราคาได้) · Git repo บวม 379 MB + PII ลูกค้าติดใน git · บั๊ก dev หลุดขึ้น production 2 จุด |
| 🟠 **High** | 3 | DB ล่ม = มี admin รหัสรู้กัน · Dashboard โชว์ยอดขายปลอม · UX ตายทั้งสองทาง (ไม่มี 404, ตะกร้าหายเมื่อ refresh) |
| 🟡 **Medium** | ~10 | CORS เปิดหมด, upload validation อ่อน, order ID เดาได้, ไม่มี transaction, god components, design-token drift, ฯลฯ |
| ⚪ **Low / Housekeeping** | ~10 | เอกสารเพี้ยน, ไฟล์ซ้ำ, scratch files, branches ค้าง |

**จุดแข็งที่ต้องรักษาไว้ (อย่าทำลายตอนแก้):**

- ✅ **SQL Injection: ศูนย์จุดเสี่ยง** — ทุก query ใน backend ใช้ `?` placeholder ผ่าน mysql2 ทั้งหมด ไม่มี string concatenation ลง SQL เลยแม้แต่จุดเดียว
- ✅ **Test culture แข็งแรง** — 22 Vitest suites (frontend/tests/), 9 Jest suites (node-backend/tests/), 7 Playwright E2E specs (frontend/e2e/) และ CI 3 jobs บน GitHub Actions (`.github/workflows/ci.yml`)
- ✅ **Security พื้นฐานดี** — bcrypt (10 rounds), JWT บังคับมี secret (throw ตอน boot ถ้าไม่มี), rate limit แยกหลายชั้น (global 200/15min, auth 15/15min, chatbot 40/15min ต่อ user), DOMPurify allowlist ทั้ง chatbot และบทความ
- ✅ **Accessibility เกินมาตรฐาน** — focus trap, aria-live route announcements, sr-only, 44px touch targets, `prefers-reduced-motion`, print stylesheet
- ✅ **เอกสารลึก** — USER_MANUAL.md 12 บท + 25 ภาพ annotate, ภาคผนวก จ 12 รูป, ops guides, README มี 6 engineering challenges แบบ root-cause analysis
- ✅ **Git discipline** — conventional commits สม่ำเสมอ 196 commits

---

## 2. สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

### 2.1 ภาพรวม Deployment

```
Browser → Vercel SPA (frontend/, vercel.json SPA rewrite)
        → Render Web Service (node-backend/, rootDir: node-backend, node server.js)
        → TiDB Serverless (MySQL protocol, DB_PORT=4000, DB_SSL=true, db: smart_pc_builder)
        → Google Gemini (@google/genai, GEMINI_API_KEY)
```

- `render.yaml` — บริการเดียว `pcspec-backend`, health check `/api/v1/health`, `autoDeploy: false`
- `frontend/vercel.json` — rewrite ทุก path → `/index.html` (SPA)
- **Vercel deploy อัตโนมัติเมื่อ push ไป main** — ระวังตอน commit งานแก้ไข
- Root `package.json` เป็น shim ให้ Render (ชื่อ "pcspec-backend" แต่ไม่ใช่ตัว backend จริง — อ่านแล้วสับสนได้)

### 2.2 Backend — `node-backend/` (Express 5.2.1, port 3001)

| ส่วน | ไฟล์ | รายละเอียด |
|---|---|---|
| Entry | `node-backend/server.js` | middleware chain: trust proxy → `cors()` เปิดหมด → json 20MB → global rate limit → routes → 308 redirect legacy `/api/*` → `/uploads` static → error middleware → graceful shutdown |
| Routes | `routes/` 6 ไฟล์ (~32 endpoints) | `hardware.js` (6: catalog + admin CRUD + sync-prices), `orders.js` (4), `chatbot.js` (3, SSE), `articles.js` (4), `upload.js` (1), `authRoutes.js` (6) |
| Controllers | `controllers/` 4 ไฟล์ | ส่วนใหญ่ query DB ตรง — **model layer มีแค่ `models/userModel.js`** |
| Middleware | `middleware/authMiddleware.js`, `chatbotSecurity.js`, `validation.js` | JWT verify + admin check; chatbot payload guard (4,000 ตัวอักษร, image 8MB + magic bytes); validation เขียนเอง |
| Services | `services/chatbotSessions.js` (in-memory Map, TTL 24h, cap 10 turns), `services/priceSyncService.js` (ดึงราคา ihavecpu.com) | chat session **ไม่ persist ลง DB** |
| Config | `config/db.js` (mysql2 pool, fallback เป็น mock เมื่อ DB ตาย), `config/mock-data.js` | ดู H1 ด้านล่าง |
| Tests | `tests/` 9 ไฟล์ (Jest, `npm test` = `jest --forceExit --detectOpenHandles`) | unit-level, ไม่มี supertest |
| Scripts | `scripts/` ~120 ไฟล์ | init_db, seed_admin, seed_200_*, scrape_*.py, generate_all_images.js, export_db_to_* |

**Schema DB (11 ตาราง + articles/users):** `categories` ← `products` (CASCADE) ← `spec_cpu / spec_motherboard / spec_ram / spec_gpu / spec_storage / spec_psu / spec_case` (1:1 ตาม product_id) · `orders` ← `order_items` → `products` · `users` (role enum customer/admin) · `articles` (standalone)
ไฟล์: `node-backend/database-schema.sql` (11 ตาราง) และ `node-backend/smart_pc_builder_dump_fixed.sql` (dump เต็ม + articles + users)

### 2.3 Frontend — `frontend/` (Vue 3.5 + Vite 8 + Pinia 3 + vue-router 4, `<script setup>`, Custom CSS)

- **7 routes** (`src/router/index.js`): `/` Landing · `/build` Builder · `/admin` (guard `requiresAdmin`) · `/checkout` (**ไม่มี guard**) · `/articles` · `/article/:id` · `/profile` (guard `requiresAuth`) — **ไม่มี 404 catch-all**
- **7 Pinia stores** (`src/stores/`): `auth` (localStorage token+user), `catalog` (fetch `/hardware/catalog`), `builder` (ตะกร้าสเปค + compatibility engine ฝั่ง client), `chatbot` (SSE client), `admin`, `article`, `toast`
- **ตัวใหญ่สุด:** `AdminDashboard.vue` (1,254 บรรทัด), `HardwareSelection.vue` (1,091), `ChatbotWindow.vue` (840), `PriceSummary.vue` (673)
- **API_BASE ถูกประกาศซ้ำ 6 ที่:** `App.vue:147`, `stores/catalog.js:18`, `stores/chatbot.js:6`, `stores/article.js:5`, `services/adminApi.js:5` (ตรงกันหมด) และ `components/CheckoutView.vue:179` (**ผิด port** — ดู C3)
- **SpecAI:** FAB + floating window ใน `BuilderView`, ส่ง `POST /chatbot/stream` (Bearer + sessionId ใน localStorage), รับ event `build_data` → ปุ่ม "นำสเปคนี้ใส่ตะกร้า" → `chatbotStore.applyBuild()` → เติม builder store
- **รูปสินค้า:** `public/images/hardware/` มี 259 ไฟล์ gen (ไม่ใช่ 270+ ตาม copy), fallback `@error` ไป `/images/{category}.png`

### 2.4 ความเข้ากันได้ระหว่าง docs กับโครงสร้างจริง

เอกสารบางไฟล์อ้าง path ที่ไม่มีจริง — แก้ก่อนส่งรายงาน (ดู §3 กลุ่ม Docs):

- `docs/APPENDIX_GUIDE.md` อ้าง `backend/services/geminiService.js`, `PCBuilderView.vue`, `SpecAIChat.vue`, และโครง `backend/` + `database/` — ทั้งหมดไม่มีใน repo (ของจริงคือ `node-backend/`, `frontend/src/views/BuilderView.vue`, `frontend/src/components/ChatbotWindow.vue`)

---

## 3. ผลการรีวิวจัดตามความรุนแรง (Findings)

### 🔴 CRITICAL — ต้องแก้ก่อนส่งโปรเจกต์

#### C1 · ยอดเงินคำสั่งซื้อมาจากฝั่ง client + checkout ไม่ต้องล็อกอิน

**หลักฐาน:**
- `node-backend/routes/orders.js:6` — `POST /` **ไม่มี `authMiddleware`** → guest checkout โดยไม่ได้ตั้งใจ (ร่องรอย: `App.vue:301` มี `handleCheckout()` ที่เคย gate ด้วย login แต่ตายแล้ว ไม่มีใครเรียก)
- `node-backend/controllers/ordersController.js` (ฟังก์ชัน `create`) — รับ `total_price` จาก request body แล้ว **insert ลง `orders.total_price` ตรงๆ** ทั้งที่ในลูปเดียวกัน controller **ดึงราคาจริงจาก DB** (`SELECT price FROM products WHERE id = ?`) ใส่ `order_items.price` ไปแล้ว แต่ไม่เอามาบวกตรวจ/คำนวณใหม่
- `frontend/src/components/CheckoutView.vue` — ส่ง `total_price` ที่คำนวณใน browser ขึ้นไป

**ผลกระทบ:** ใครก็ POST `/api/v1/orders` ด้วย `total_price: 50` สำหรับเครื่องราคา 50,000 ได้ — เป็นช่องโหว่ระดับ business-critical และกรรมการที่เทสต์ด้วย DevTools จะเจอ
**โบนัสที่พบพร้อมกันใน flow เดียว:** ไม่มี transaction ครอบ order + order_items (เขียนครึ่งวงได้) · order ID เป็น `ORD-` + เลขสุ่ม 4 หลัก (เดา/ชนได้) · `GET /orders/:id/status` เป็น public → สแกนสถานะได้ · มี hardcoded demo orders `ORD-1001/1002` ตอบแม้ไม่มีใน DB

#### C2 · Git repo บวม 379 MB + ข้อมูลส่วนบุคคล (PII) ติดในประวัติ git

**หลักฐาน:**
- `git ls-files | grep -c scraper_env` = **13,698 ไฟล์** จากทั้งหมด 14,538 ไฟล์ (**94% ของ git index คือ Python venv** `node-backend/scripts/scraper_env/`) — รวม `node.exe` 92 MB × 2 ตัว (playwright driver + patchright driver) — `.gitignore` มีกติกา `scraper_env/` อยู่แล้วแต่**เพิ่มทีหลังจาก commit ไปแล้ว** จึงยังถูก track
- `.pyc` ถูก track **3,390 ไฟล์** — สาเหตุ/ทางแก้เดียวกัน
- **PII:** `node-backend/orders.json` (ชื่อ/เบอร์/ที่อยู่ลูกค้าจริง-test) · `smart_pc_builder_dump_fixed.sql:368` (email + bcrypt hash ของ user 4 คน) · `database-export/pcspec.db` (ข้อมูล user/order ชุดเดียวกัน — ถูก commit ตั้งใจตาม comment ใน .gitignore แต่ก็ยังเสี่ยง)
- **รหัสผ่าน hardcoded:** `scripts/seed_admin.js` (admin@pc.com / `'admin'`), `scripts/generate_all_images.js:10` + `scripts/get_presets.js:7` (`'1234'`)
- **Git object store ไม่แข็งแรง:** `git count-objects -vH` → 20,296 loose objects 217 MB **ไม่มี pack เลย** + garbage tmp-pack 92.6 MB (มีร่องรอย pack ถูกขัดจังหวะ)

**ผลกระทบ:** ถ้า repo เผยแพร่สู่สาธารณะ (GitHub public / แนบส่งอาจารย์) = PII รั่วทันที; ขนาด clone ใหญ่โดยไม่จำเป็น; มีความเสี่ยง corruption จาก garbage objects

#### C3 · บั๊ก dev หลุดขึ้น production 2 จุด

**หลักฐาน:**
- `frontend/src/components/CheckoutView.vue:179` — `API_BASE` fallback ไปที่ `http://localhost:3000` ขณะที่อีก 5 จุดใช้ `:3001` → สั่งซื้อผ่าน dev server ล้มเหลว (prod รอดเพราะ branch PROD ถูกใช้ — แต่เป็นระเบิดเวลาทุกครั้งที่แตะไฟล์นี้) **รากเหตุ:** `API_BASE` ถูก copy-paste 6 ที่
- `frontend/index.html` — โหลด `<script src="http://localhost:8400/live.js">` (dev tool "impeccable-live") **และติอยู่ใน `dist/index.html` ที่ build ขึ้น prod แล้ว** → ทุกหน้า prod ยิง request หา localhost ที่ไม่มีอยู่

### 🟠 HIGH — ควรแก้ในรอบถัดไปอันตรง

#### H1 · DB ล่ม = มีบัญชี admin รหัสรู้กัน + ข้อมูลหายเงียบๆ

**หลักฐาน:** `node-backend/models/userModel.js:16-23` + `config/db.js` — เมื่อ `DB_HOST` ไม่ได้ตั้ง หรือ MySQL เชื่อมต่อไม่ได้ ระบบ **สลับไป mock mode เงียบๆ**: seed บัญชี `admin@pcspec.dev / admin123` ให้ล็อกอินได้, order/article เขียนลงไฟล์ JSON ในเครื่อง (บน Render ไฟล์หายทุกครั้งที่ redeploy = **ลูกค้าสั่งซื้อหาย**)
**ที่น่ากลัว:** ไม่มี log ดังเตือนผู้ดูแลให้เห็นชัดว่ากำลัง serve mock data อยู่
**หมายเหตุ:** ต้องระวังตอนแก้ — **CI e2e job ไม่มี MySQL service container** และอาศัย fallback นี้อยู่ (ดู §5 ข้อ 4)

#### H2 · Dashboard ผู้ดูแลแสดงยอดขายปลอมเป็นสถิติจริง

**หลักฐาน:** `frontend/src/components/AdminDashboard.vue:676` — กราฟรายได้ 7 วันเป็น **hardcoded mock** ("Mock 7-day revenue", ค่า 15,000…60,000) และตัวเลขนี้ยังไปหล่อเลขสถิติ "ยอดซื้อเฉลย" ด้วย — ถ้ากรรมการถาม "ยอดนี้มาจากไหน" จะตอบไม่ได้
**พวกพ้อง:** `AdminDashboard.vue:934` ใช้ `https://placehold.co/600x400/...` เป็นภาพเริ่มต้นบทความใหม่ (ภายนอก+ไม่ตรงแบรนด์), `LandingView.vue:102` มี fallback เลขสินค้า hardcoded `270`

#### H3 · UX ตายทั้งสองทาง: ไม่มี 404 + state หายเมื่อ refresh

- **ไม่มี 404 catch-all route** (`src/router/index.js`) — URL ผิดเจอหน้าเปล่าใต้ nav
- **Guard เด้งเงียบๆ** — คนที่ไม่ใช่ admin เข้า `/admin` โดน redirect ไป `/` โดยไม่มีข้อความอธิบาย (ทำให้การ์ด "unauthorized" ใน `AdminView.vue` ถึงปลายทางไม่ได้ด้วย routing)
- **ตะกร้าสเปคไม่ persist** — store `builder.js` ไม่ sync ลง localStorage ต่างจาก auth/chat session → refresh = สเปคที่ประกอบไว้หายทั้งหมด
- **JWT ใน localStorage** — token เก่า/หมดอายุถูกเคลียร์แบบ reactive เฉพาะจุดที่ 401/403 (admin, chatbot, profile) — ส่วน catalog ล้มเหลวแบบเงียบๆ ไม่มี error state ให้ user กด retry

### 🟡 MEDIUM — คุณภาพ/ความปลอดภัยระดับรอง

| # | ประเด็น | หลักฐาน |
|---|---|---|
| M1 | CORS เปิดหมด + JSON body limit 20MB + global rate limit หลวม | `node-backend/server.js:34` (`app.use(cors())`) |
| M2 | Upload validation อ่อน — เช็คแค่ `mimetype.startsWith('image/')` ไม่มี whitelist นามสกุล/ไม่เช็ค magic bytes (ต่างจาก chatbot ที่ทำครบ) | `node-backend/routes/upload.js` |
| M3 | JWT role เก่า — `adminMiddleware` เช็คจาก payload อย่างเดียว ไม่ re-check DB → demote admin แล้วยังเข้าได้อีก ≤ 1 วัน | `node-backend/middleware/authMiddleware.js:28-36` |
| M4 | `recommended_build` จาก AI ไม่ถูก validate ID กับ DB ฝั่ง server → ป้อนเข้า flow order เดียวกับ C1 | `node-backend/routes/chatbot.js` (`getCatalogContext` / system prompt) |
| M5 | Validation เขียนเองมีตรรกะแปลก: `validateRequired` ใช้ falsy check → ค่า `0` ถือเป็น "ไม่กรอก", `validatePositiveNumber` รับ 0 | `node-backend/middleware/validation.js` |
| M6 | God components — `AdminDashboard.vue` 1,254 บรรทัด (6 แท็บรวมไฟล์เดียว), `HardwareSelection.vue` 1,091, `ChatbotWindow.vue` 840 | `frontend/src/components/` |
| M7 | Logic ซ้ำแบบแตกกิ่ง: `getItemSpecsList` มี 2 เวอร์ชันต่างกัน (`PriceSummary.vue:211` vs `HardwareSelection.vue:259`), array `categories` ซ้ำใน `App.vue` + `BuilderView.vue` | frontend |
| M8 | Design-token ขัดกันเอง: header `style.css` บอก "Clean White Canvas" แต่ token เป็น **dark** (`--canvas:#111111`), `<meta theme-color="#ffffff">`, token `--*-soft` เป็น pastel สว่างบนผืน dark, preconnect Google Fonts แต่**ไม่ได้โหลด Inter จริง**, `.glass-panel` เหลือเป็น alias, `AdminDashboard` ประกาศ "Night Mode" ซ้ำกับธีมทั้งแอปที่เป็น dark อยู่แล้ว | `frontend/src/style.css`, `frontend/index.html`, `App.vue:86` |
| M9 | Image fallback พัง: `HardwareSelection.vue:148` อ้าง `/images/default.png` ซึ่ง**ไม่มีไฟล์จริง**ใน `public/images/` → modal รายละเอียด 404 เมื่อรูปหาย | frontend |
| M10 | โค้ด backend ซ้ำ: branch `db.isFallback()` ถูกเขียนซ้ำในทุก controller + userModel + chatbot.js (แต่ละที่ implement JSON fallback เอง), `console.error` แทน `utils/logger.js` ใน `authController.js` ×5, `routes/chatbot.js` ×7, `routes/upload.js` ×1, dependency `body-parser` ซ้ำซ้อนกับ Express 5 | node-backend |
| M11 | Dead code: `App.vue:301 handleCheckout()` ไม่มีใครเรียก, `BuilderView` ประกาศ emit `checkout` ที่ไม่ได้ใช้, scaffold `HelloWorld.vue` + `assets/hero.png`, `vite.svg`, `vue.svg`, `gridgeist-full-preview.html` | frontend |
| M12 | DevOps ตกขอบ: CI e2e job **ไม่มี MySQL service container** (อาศัย JSON-fallback ของ backend), Jest ไม่มี config file (config ซ่อนใน npm script), ติดตั้ง `@vitest/coverage-v8` แต่ไม่มี script `coverage`/threshold, ไม่มี npm script seed/migrate (DB setup ต้อง `mysql <` เอง) | `.github/workflows/ci.yml`, package.json ทุกไฟล์ |

### ⚪ LOW / HOUSEKEEPING — เอกสารและความสะอาดของ repo

| # | ประเด็น | หลักฐาน |
|---|---|---|
| L1 | README บอก **MIT License แต่ไม่มีไฟล์ LICENSE**; เขียน "8 Test Suites" ทั้งที่มี 9; "268+ tests" ไม่เคยพิสูจน์ | `README.md` |
| L2 | ภาคผนวก จ อ้างไฟล์ที่ไม่มีจริง (`geminiService.js`, `PCBuilderView.vue`, `SpecAIChat.vue`) และโครงสร้าง `backend/`+`database/` ที่ผิด — **ต้องแก้ก่อนส่งรายงานอาจารย์** | `docs/APPENDIX_GUIDE.md` |
| L3 | drawio ซ้ำซ้อน: `pcspec_all_system_diagrams_master (1).drawio` == `(2)` byte-identical (md5 bade5b7f, 251,796 B); ตระกูล master 4 เวอร์ชัน (รวม `.xml` rename); ตระกูล flowchart 4 เวอร์ชัน; ER diagram มี `backup`/`from_downloads`; แถม lock file `.$pcspec_all_11_flowcharts.drawio.bkp` ถูก track ทั้งที่กติกา `*.drawio.bkp` ไม่ครอบ prefix `.$` | `docs/drawio/` (30 ไฟล์) |
| L4 | งานมีค่าแต่ยัง untracked (43 ไฟล์): `docs/diagrams/` (27 PNG), `pcspec_activity_diagram.drawio`, `pcspec_usecase_diagram.drawio`, `ForgeLabs.drawio`, PDF `ForgeLabs — ระบบจัดสเปคคอมพิวเตอร์อัจฉริยะ.pdf` | `git status --short` |
| L5 | `plans/` มี 23 ไฟล์ แต่**มีแค่ 11 ไฟล์ที่ครบ 4 หัวข้อตามกฎเหล็กข้อ 6 ของ AGENTS.md** และ `plans/hermes_update_error_fix.md` เป็นแผนแก้เครื่องมือ "Hermes" ของเครื่องผู้ใช้ — ไม่เกี่ยวกับ PCSpec เลย | `plans/` |
| L6 | Scratch files ถูก track: `PCSpec.zip` (563 KB — zip ของโปรเจกต์อยู่ในโปรเจกต์), `frontend/test_vercel.cjs`, `test_live_vercel_benchmark.cjs`, `vercel-test.png`, ซากแตก docx ใน `scripts/` (`customXml_*.xml.xml`, `doc2_raw.txt` 276 KB), `node-backend/scripts/index.html` (1.9 MB หน้าที่ scrape มา), `catalog.json` ไฟล์เปล่า, รูปบทความ JPG ซ้ำสองที่ (`node-backend/public/uploads/` + `frontend/public/images/articles/`) | git ls-files |
| L7 | Branch/worktree ค้าง: 5 สาขา `codex/*` + 5 worktrees (2 อยู่นอกไดรฟ์ `F:\Projects\PCSpec\.worktrees\`) — `codex/admin-article-table-spacing` อยู่ commit เก่ากว่าเพื่อน | git branch/worktree list |
| L8 | ข้อความไทยใน `articles.json`/dump SQL เป็น mojibake (encoding เพี้ยน) | `node-backend/articles.json` |
| L9 | ภาพสินค้ามี 259 ไฟล์ แต่ copy บอก "270+"; เป็น PNG ไม่ optimize, `<img>` ไม่ใส่ width/height (CLS เล็กน้อย — มี `img{max-width:100%}` ช่วยพยุง) | `frontend/public/images/hardware/` |

---

## 4. คู่มือการแก้ไขเรียงลำดับ (Step-by-Step Fix Runbook)

> ลำดับนี้ออกแบบให้ **แก้แล้วไม่พังสิ่งที่กำลังทำงานอยู่** — ทำ P0 ให้ครบก่อนส่งโปรเจกต์ แล้วค่อยไล่ P1/P2
> ⚠️ **กติกาก่อนเริ่ม:** Vercel deploy อัตโนมัติจาก push ไป `main` — จัด commit เป็นก้อนเล็กๆ ที่ test ผ่านทีละก้อน อย่า push รวบ

### Phase P0 — ก่อนส่งโปรเจกต์ (ประมาณ 1-2 วันทำงาน)

**P0.1 คิดเงินฝั่ง server + ปิดช่อง C1** *(แก้ทันทีที่สุด — ผลตอบแทนสูงสุด)*
1. แก้ `node-backend/controllers/ordersController.js` → ฟังก์ชัน `create`: **ห้ามรับ `total_price` จาก body อีกต่อไป** — ใช้ราคาที่ fetch จาก DB อยู่แล้ว (`SELECT price FROM products WHERE id = ?`) มา `sum` เป็นยอดจริง แล้ว insert ลง `orders.total_price`
2. ครอบ `connection.beginTransaction()` … `commit/rollback` รอบการ insert `orders` + `order_items` (mysql2 pool → `pool.getConnection()` ก่อน เพื่อให้ transaction ใช้ connection เดียวกัน)
3. ตัดสินใจเรื่อง guest checkout: ถ้าต้องล็อกอิน → เพิ่ม `authMiddleware` ที่ `routes/orders.js` POST `/` และแนบ Bearer ที่ `CheckoutView.vue`; ถ้าอยากเปิด guest จริง → ให้ `order_items` เป็นหลักฐานและบันทึก `user_id = null` ชัดเจน
4. Validate `items[].id` ว่าเป็น product ที่มีจริง (ปิดทางเข้าจาก M4 ด้วย — `recommended_build` ของ chatbot ต้องผ่านจุดนี้ทุกครั้ง)
5. เปลี่ยน order ID จากเลขสุ่ม 4 หลัก → `ORD-` + สุ่มยาว/ตาม timestamp (เช่น `ORD-20260906-XXXXXX`) และซ่อน demo `ORD-1001/1002` ไว้หลัง env flag
6. อัปเดต `frontend/e2e/checkout.spec.js` ให้สอดคล้อง (โดยเฉพาะถ้าเพิ่มการบังคับล็อกอิน)
7. ตรวจว่า mock-fallback path ของ order ไม่ได้ถูกใช้เป็นทางเลี่ยง (ดู P0.3)

**P0.2 รวม API_BASE + ลบ dev script (C3)**
1. สร้าง export เดียว เช่น `frontend/src/services/apiBase.js` → `export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api/v1'`
2. แทนที่ copy ทั้ง 6 จุด: `App.vue:147`, `stores/catalog.js:18`, `stores/chatbot.js:6`, `stores/article.js:5`, `services/adminApi.js:5`, `components/CheckoutView.vue:179`
3. ลบ `<script src="http://localhost:8400/live.js">` ออกจาก `frontend/index.html`
4. `npm run build` แล้วเปิด `dist/index.html` ยืนยันว่าไม่มี live.js และไม่มี localhost:3000

**P0.3 ปิดปาก mock fallback (H1)**
1. ใน `config/db.js` — เปลี่ยนเงื่อนไข fallback ให้ต้องมี env ยืนยันชัดเจน เช่น `ALLOW_MOCK_DB=true` ถึงจะสลับ mock ได้; production (Render) ไม่ตั้งค่านี้ → DB ล่มแล้วต้อง 500 แจ้งเตือน ไม่ใช่ serve mock
2. ลบ seed บัญชี `admin@pcspec.dev / admin123` ออกจาก `models/userModel.js:16-23` หรือย้ายไปอยู่หลัง env เดียวกัน
3. **ต้องทำคู่กัน:** เพิ่ม MySQL service container ให้ CI e2e job ใน `.github/workflows/ci.yml` (ดู §6) — ไม่งั้น e2e พังทันทีที่ fallback ถูกปิด

**P0.4 กู้สุขภาพ Git + ลบ PII (C2)**
1. `git rm -r --cached node-backend/scripts/scraper_env` และ `git rm -r --cached` ทุกที่ที่มี `__pycache__` (`.gitignore` มีกติกาอยู่แล้ว — แค่เลิก track)
2. `git rm --cached node-backend/orders.json PCSpec.zip frontend/test_vercel.cjs frontend/test_live_vercel_benchmark.cjs frontend/vercel-test.png catalog.json 'docs/drawio/.$pcspec_all_11_flowcharts.drawio.bkp'` และซาก docx ใน `scripts/`
3. แก้ PII ในไฟล์ที่ยังต้องใช้: ลบแถว user + order ที่มีข้อมูลจริงออกจาก `smart_pc_builder_dump_fixed.sql` และ `database-export/pcspec.db` (หรือ anonymize เป็น test data)
4. ล้างประวัติด้วย `git filter-repo` (scrub `scraper_env/`, `__pycache__/`, `orders.json`, dump) → **force push** → หมายเหตุ: force push จะ trigger Vercel redeploy — ทำตอนพร้อม
5. `git count-objects -vH` → แล้ว `git gc --aggressive --prune=now` เพื่อเก็บ garbage tmp-pack
6. เปลี่ยนรหัสผ่านจริงที่เคย hardcode ใน `scripts/seed_admin.js`, `scripts/generate_all_images.js:10`, `scripts/get_presets.js:7` → อ่านจาก env แทน

**P0.5 แก้ยอดขายปลอม (H2)**
1. `AdminDashboard.vue` — ดึงยอดจริงจาก `GET /orders` (ฝั่ง backend มี endpoint อยู่แล้ว ระดับ admin) มา aggregate ต่อวัน หรือถ้ายังไม่มีเวลา ให้**ซ่อน/ติดป้าย "ข้อมูลตัวอย่าง"** ชัดๆ ห้ามโชว์เป็นสถิติจริง
2. ลบ `placehold.co` ออกจาก `AdminDashboard.vue:934` → ใช้ภาพ fallback ในเครื่อง

### Phase P1 — คุณภาพและเอกสาร (1 สัปดาห์)

1. เพิ่ม 404 catch-all route + ทำ guard redirect ให้แสดง toast อธิบาย + persist `builder` store ลง localStorage (ทำ pattern เดียวกับ auth store)
2. Catalog store: เพิ่ม error state + ปุ่ม retry (ทำตาม pattern ของ article store ที่มีอยู่แล้ว)
3. Upload: whitelist นามสกุล + magic bytes (ก๊อปแนวทางจาก `middleware/chatbotSecurity.js` ที่ทำไว้ดีอยู่แล้ว); ลด body limit เหลือ 1-2MB ยกเว้น chatbot image; ปรับ CORS เป็น whitelist origin
4. แก้ M9 (เพิ่มไฟล์ `public/images/default.png` หรือเปลี่ยน path), M8 (ตัดสินใจธีมเดียว: แก้ header ของ style.css ให้ตรงความจริง, sync `theme-color`, โหลด Inter จริงหรือลบ preconnect, ลบ Night Mode override ซ้ำ), M7 (รวม `getItemSpecsList` เป็น util เดียว)
5. แยก `AdminDashboard.vue` เป็น 6 ไฟล์ตามแท็บ (ทำแบบ incremental ทีละแท็บ + รัน vitest ทุกครั้ง)
6. เอกสาร: แก้ path ใน `docs/APPENDIX_GUIDE.md` ให้ตรง `node-backend/` + ชื่อไฟล์จริง; เพิ่มไฟล์ `LICENSE`; แก้ README (จำนวน suite, ยืนยันเลข test); commit ไฟล์ diagram ที่ยัง untracked; ลบ drawio เวอร์ชันซ้ำเหลือ canonical เดียว/ไดอะแกรม; ย้าย `plans/hermes_update_error_fix.md` ออกนอก repo; เติม 4 หัวข้อกฎเหล็กให้ plans/ ที่ขาด

### Phase P2 — เชิงลึก (เมื่อมีเวลา)

1. `adminMiddleware` re-check role จาก DB (cache สั้นๆ ได้) — ปิด M3
2. แยก token ออกจาก localStorage → พิจารณา cookie httpOnly หรืออย่างน้อยตั้ง expiry สั้น + refresh
3. แยก mock-fallback branch ที่ซ้ำในทุก controller เป็น helper เดียว; เปลี่ยน `console.error` → `utils/logger.js`
4. เพิ่ม npm scripts: `db:seed`, `db:migrate`, `coverage` (มี @vitest/coverage-v8 แล้ว) + jest.config แยกไฟล์
5. ล้าง branch/worktree `codex/*` หลัง merge; mojibake ใน articles.json

---

## 5. กฎเหล็กในโค้ดและวิธีแก้บั๊ก (Code Rules & Edge-case Handling)

กฎที่ AI Agent/Developer ต้องถือเวลาแก้ตามรายงานนี้:

1. **ห้ามเชื่อตัวเลขจาก client ในธุรกรรมเงิน ทุกกรณี** — ตอนแก้ C1 อย่าทำแค่ "compare total ที่ส่งมากับที่คำนวณ" แล้ว reject เพราะยังเป็นการเผยข้อมูลราคาภายใน; ให้ **คำนวณใหม่จาก DB แล้วใช้ค่าที่คำนวณได้เท่านั้น** เป็น authoritative และตอบกลับด้วยยอดจริง
2. **Transaction ต้องใช้ connection เดียว** — `pool.getConnection()` → `conn.beginTransaction()` → insert ทั้งหมดผ่าน `conn` → `commit/rollback` → `conn.release()` ใน `finally`; ห้ามใช้ `pool.query()` ปนเพราะอาจได้ connection อื่น
3. **แก้ mock fallback ต้องดู CI ก่อนเสมอ** — e2e job ใน `.github/workflows/ci.yml` **ไม่มี MySQL container** และ backend รอดใน CI เพราะ fallback; ถ้าปิด fallback โดยไม่เพิ่ม container = CI แดงทันที
4. **`VITE_API_BASE` ต้องยัง override ได้ทุกจุด** — Playwright config (`frontend/e2e/playwright.config.js`) inject env นี้ให้ webServer; ถ้ารวม API_BASE แล้วลืมอ่าน `import.meta.env` จะทำ e2e ชน prod URL
5. **history rewrite มีผลข้ามระบบ** — force push หลัง `git filter-repo` จะ (ก) ทำให้ worktree/branch ที่เหลือทั้ง 5 ต้อง rebase (ข) trigger Vercel redeploy (ค) ไม่มีผลกับ Render (`autoDeploy: false`) — แจ้งทีม/ปิด auto deploy ช่วงทำ
6. **รหัสที่เคย hardcode ให้ถือว่ารั่วแล้ว** — หลังลบจากโค้ด ต้องเปลี่ยนรหัส admin จริงใน DB และหมุน `JWT_SECRET`/`GEMINI_API_KEY` ด้วยถ้าตัดสินใจ scrub history
7. **กติกา validation ปัจจุบัน:** `validateRequired` ใช้ falsy check → ค่า `0` ถือว่าหาย (เขียน test ครอบไว้ก่อนแก้); `validatePositiveNumber` รับ 0 — ตอนแก้ M5 ต้องไล่ดูว่ามี field ไหนใช้ 0 ได้ถูกต้องบ้าง
8. **อย่าลบ `config/mock-data.js` ทิ้งจนกว่า CI จะมี MySQL** — มันคือเสาหลักของ e2e ใน CI ปัจจุบัน
9. **แก้ธีมให้เลือกข้างเดียว** — ปัจจุบัน style.css เป็น dark จริงๆ แต่เอกสาร/DESIGN-supabase.md บอก white; ตัดสินใจก่อนแล้ว sync ทั้ง tokens, `theme-color`, `--*-soft` และเอกสารพร้อมกัน ไม่งั้นจะเพี้ยนสองทางอีก
10. **Debug Mantra (กฎเหล็กไล่ล่าบั๊ก):** Reproduce → Trace Fail Path → Question Hypothesis → Cross-reference Breadcrumbs — ใช้กับทุกข้อในรายงานนี้ก่อนแก้จริง โดยเฉพาะ C1 (ต้อง reproduce การส่ง total ปลอมผ่าน curl ก่อนเสมอ)

---

## 6. ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

### 6.1 คำสั่งทดสอบพื้นฐาน (รันได้ทันทีทั้ง 3 ชุด)

```bash
# 1) Frontend unit tests (22 suites)
cd frontend && npm test

# 2) Backend unit tests (9 suites)
cd node-backend && npm test

# 3) E2E ครบวง (boot backend :3001 + frontend :5173 เอง)
cd frontend && npm run test:e2e

# 4) Build และตรวจของหลุด
cd frontend && npm run build
grep -n "live.js" dist/index.html            # ต้องไม่มีผลลัพธ์ (C3)
grep -rn "localhost:3000" src/               # ต้องไม่มีผลลัพธ์ (C3)
grep -rn "API_BASE" src/ | wc -l             # หลังรวมแล้วต้องเหลือน้อยจุดมาก (เป้าหมาย: 1 export)
```

### 6.2 Checklist ตรวจรับรายข้อ (หลังแก้แต่ละ finding)

| ข้อแก้ | วิธียืนยันว่า "แก้แล้วจริง" |
|---|---|
| **C1** order total | `curl -X POST .../api/v1/orders -H "Content-Type: application/json" -d '{"items":[{"id":<ราคาแพงสุด>}],"total_price":50,"customer_name":"T","phone":"0800000000","address":"T"}'` → สั่งสำเร็จแล้ว `orders.total_price` ใน DB ต้องเป็นราคาจาก DB **ไม่ใช่ 50** · และ test e2e checkout ต้องผ่าน |
| **C1** transaction | จำลอง insert `order_items` ล้มเหลว (id ปลอม) → ต้องไม่มีแถว `orders` ค้างใน DB |
| **C2** git | `git ls-files \| grep -c scraper_env` → `0` · `git ls-files \| grep -c "\.pyc$"` → `0` · `git ls-files \| grep orders.json` → ว่าง · clone ใหม่แล้วขนาด < ~50 MB |
| **C3** dev leftovers | `npm run build` แล้ว `grep live.js dist/index.html` → ว่าง · เข้าหน้า checkout บน dev → Network tab ไม่มี request ไป `:3000` |
| **H1** mock fallback | ตั้ง `DB_HOST` ผิดแล้ว start server → ต้อง fail ชัดเจน/log เตือน ไม่ serve mock · `admin@pcspec.dev` ล็อกอินไม่ได้ · CI e2e (มี MySQL container ใหม่) ยังเขียว |
| **H2** mock chart | เปิด `/admin` แท็บ dashboard → กราฟแสดงข้อมูลจาก API จริง หรือมีป้าย "ตัวอย่าง" ชัดเจน |
| **H3** UX | พิมพ์ URL มั่ว → เจอหน้า 404 มีปุ่มกลับ · refresh หน้า `/build` หลังเลือกสเปค → ตะกร้ายังอยู่ |
| **M2** upload | อัปโหลดไฟล์ `.php` ที่ mimetype ปลอมเป็น image → ต้องถูกปฏิเสธ |
| **M3** role | UPDATE user เป็น customer ใน DB แล้วใช้ token เดิมเรียก admin API → ต้อง 403 (หลังทำ P2.1) |

### 6.3 คำสั่งตรวจสุขภาพ Git (หลัง P0.4)

```bash
git count-objects -vH          # count-pack ต้องมากกว่า 0, garbage = 0
git fsck --full                # ไม่ต้องมี dangling/corrupt ที่เป็นอันตราย
git status --short             # จำนวน untracked ลดลงเหลือเฉพาะของที่ตั้งใจค้าง
```

### 6.4 เกณฑ์ผ่านรวม (Definition of Done ของ P0)

- [ ] ทั้ง 3 ชุด test เขียวทั้งหมดบนเครื่อง + CI เขียวบน GitHub Actions
- [ ] `curl` ส่ง total ปลอมแล้วระบบคิดราคาจาก DB เสมอ
- [ ] `dist/index.html` ไม่มี live.js / localhost
- [ ] `git ls-files` ไม่มี scraper_env, .pyc, orders.json
- [ ] Dashboard ไม่แสดง mock เป็นข้อมูลจริง
- [ ] แก้เอกสารเพี้ยนหัวใหญ่: APPENDIX_GUIDE paths, LICENSE, README จำนวน suite

---

*รายงานนี้เป็นเอกสารรีวิวเท่านั้น — ไม่มีการแก้ไขโค้ดเกิดขึ้นในเซสชันที่เขียนรายงาน ทุกข้ออ้างอิง `file:line` ตรวจสอบย้อนกลับได้จาก repo ณ commit `0546ca1`*

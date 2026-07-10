# PCSpec Project — Full System Inspection Report

**วันที่:** 2026-07-10
**โปรเจก:** PCSpec (Smart PC Builder)
**ผู้ inspect:** opencode AI
**เวอร์ชัน:** v1.0

---

## Executive Summary

PCSpec เป็น Full-stack PC Builder application ที่มี Vue 3 frontend, Node.js/Express backend, และ MySQL database โปรเจกมีจุดแข็งเรื่อง architecture ที่ค่อนข้างดี (มี Pinia stores, มี health check, มี rate limiting) แต่ยังมีปัญหาหลายระดับที่ต้องแก้ไขก่อน production-ready

**จุดแข็ง:**
- Design system documentation ดี (DESIGN.md, DESIGN-supabase.md)
- มี rate limiting สำหรับ auth endpoints
- Health check endpoint พร้อม database status
- Graceful shutdown pattern
- SSE streaming chatbot ทำงานได้

**จุดอ่อนหลัก:**
- Hardcoded secrets ในโค้ด (วิกฤตด้านความปลอดภัย)
- App.vue monolith 600 บรรทัด ยัง refactor ไม่เสร็จ
- Backend ไม่มี tests เลย
- Mock data 4,858 บรรทัด ปนกับ DB connection logic

---

## 1. Security Audit

### 1.1 Hardcoded JWT Secret — CRITICAL

**ปัญหา:** JWT secret key hardcode ใน 2 ไฟล์

```javascript
// middleware/authMiddleware.js:3
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_pcspec_key_123';

// controllers/authController.js:5
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_pcspec_key_123';
```

**ผลกระทบ:** ถ้า attacker รู้ secret นี้ จะสามารถ forge JWT token ใดก็ได้ รวมถึง admin token
**วิธีแก้:**
- ลบ hardcoded fallback
- ใช้ `process.env.JWT_SECRET` เท่านั้น (throw error ถ้าไม่มี)
- สร้าง secret ที่ปลอดภัย (32+ bytes, random)

### 1.2 Hardcoded DB Credentials in Scripts

**ปัญหา:** รหัสผ่าน database hardcode ใน scripts

```javascript
// scripts/create_users_table.js:9
password: '1234'

// scripts/init_db.js:11
password: '1234'
```

**วิธีแก้:** ใช้ environment variables จาก `.env` file

### 1.3 CORS Origin Wildcard

**ปัญหา:** CORS อนุญาตทุก origin

```javascript
// server.js:30
let corsOptions = { origin: '*' };
```

**ผลกระทบ:** ทุก domain สามารถเรียก API ได้
**วิธีแก้:** ตั้งค่า specific origins (production URL + localhost สำหรับ dev)

### 1.4 Excessive Body Size Limit

**ปัญหา:** body limit ตั้งไว้ 50MB

```javascript
// server.js:35
app.use(express.json({ limit: '50mb' }));
```

**ผลกระทบ:** เสี่ยงต่อ DoS attacks
**วิธีแก้:** ลดเหลือ `1mb` หรือ `500kb` (สำหรับ file uploads ใช้ multer แยก)

### 1.5 localStorage Token Storage

**ปัญหา:** JWT token เก็บใน localStorage

```javascript
// stores/auth.js — ใช้ localStorage.setItem('token', token)
// App.vue:247 — localStorage.getItem('token')
```

**ผลกระทบ:** เสี่ยงต่อ XSS attacks (JavaScript สามารถเข้าถึง localStorage ได้)
**วิธีแก้:** ใช้ HTTP-only cookies สำหรับ token storage

### 1.6 API Key Exposure Risk

**ปัญหา:** `.env` file มี GEMINI_API_KEY

```
GEMINI_API_KEY=AQ.Ab8RN6KeXOyvquDa4EHd_fFyxEgTm1wzaqmn4aOXV3-U3OetXw
```

**สถานะ:** `.gitignore` มี `.env` แต่ไม่ได้ test ว่า git ไม่ track แล้วจริง
**วิธีแก้:** รัน `git ls-files --ignored --exclude-standard | grep .env` เพื่อ verify

### 1.7 Missing Input Validation

**ปัญหา:** Routes หลายตัวไม่มี input validation อย่างเป็นทางการ

- `routes/hardware.js` — POST/PUT ไม่ validate `price`, `category`
- `routes/orders.js` — POST ใช้ default values แทน returning error

**วิธีแก้:** เพิ่ม Joi/Zod validation middleware

---

## 2. Code Quality Analysis

### 2.1 App.vue Monolith — HIGH

**ปัญหา:** `App.vue` มี 601 บรรทัด จัดการ:

- Auth modal (login/register forms)
- Admin data fetching (orders)
- Chatbot state + SSE streaming
- CRUD handlers (products, articles, orders)
- Navigation
- Route-level state

**Plan เดิม:** Pinia refactor plan มีอยู่แล้วใน `docs/superpowers/plans/2026-07-05-builder-refactor.md`
**สถานะ:** Task 1-4 เสร็จแล้ว (stores สร้างแล้ว) แต่ Task 5 (refactor App.vue) ยังไม่เสร็จ

**วิธีแก้:**
- ย้าย admin CRUD handlers -> adminStore
- ย้าย chatbot logic -> chatbotStore
- ย้าย article logic -> articleStore
- เหลือแค่ navigation + modal ใน App.vue

### 2.2 Duplicated mapFrontendIdToDbId Function

**ปัญหา:** ฟังก์ชัน `mapFrontendIdToDbId` ถูก copy-paste ใน 2 ไฟล์

```javascript
// routes/hardware.js:18-31
// routes/orders.js:10-24
```

**วิธีแก้:** ย้ายไป `utils/idMapper.js` แล้ว import

### 2.3 Magic Numbers in ID Mapping

**ปัญหา:** Category ID mapping hardcode

```javascript
// routes/hardware.js:6-14
if (categorySlug === 'cpu') return `c${dbId}`;
if (categorySlug === 'mobo') return `m${dbId - 10}`;
// ... (10, 20, 30, 40, 50, 60)
```

**วิธีแก้:** ใช้ constants object

```javascript
const CATEGORY_OFFSETS = { cpu: 0, mobo: 10, ram: 20, gpu: 30, storage: 40, psu: 50, case: 60 };
```

### 2.4 Mock Data in Config File — HIGH

**ปัญหา:** `config/db.js` มี 4,858 บรรทัด ประกอบด้วย:

- DB connection logic (~50 บรรทัด)
- Mock products data (~4,700 บรรทัด)
- Fallback query functions (~100 บรรทัด)

**วิธีแก้:** แยก mock data ไป `config/mock-data.js` แล้ว import

### 2.5 Console.log Statements

**ปัญหา:** มี `console.log` / `console.error` มากกว่า 100 ตัวใน production code

**ตัวอย่าง:**
- `server.js:94` — `console.log('Server is running...')`
- `routes/orders.js:121` — `console.log('[Fallback DB] Saved order...')`
- `App.vue:146` — `console.error('Failed to load articles:', error)`

**วิธีแก้:** ใช้ logging library (winston/pino) พร้อม log levels

### 2.6 Fat Routes (No Controller Layer)

**ปัญหา:** Routes มี business logic ปนกับ routing

```
routes/hardware.js  — 200 บรรทัด (routing + DB queries + formatting)
routes/orders.js    — 230 บรรทัด (routing + DB queries + file I/O)
```

**วิธีแก้:** สร้าง `controllers/` directory แล้วย้าย logic ไป

### 2.7 Unused Variables in App.vue

**ปัญหา:** ตัวแปรบางตัวประกาศแต่ไม่ได้ใช้

```javascript
// App.vue:321
const handleReadArticle = (article) => { ... }; // ไม่ได้ถูกเรียกใช้
const selectedArticle = ref(null); // ไม่ได้ประกาศ (จะ error)
```

---

## 3. Architecture Review

### 3.1 Missing Lazy Loading / Code Splitting

**ปัญหา:** Vue Router ไม่มี dynamic imports

```javascript
// frontend/src/router/index.js
import LandingView from '../views/LandingView.vue'
import BuilderView from '../views/BuilderView.vue'
import AdminView from '../views/AdminView.vue'
// ... ทุกตัว static import
```

**ผลกระทบ:** Bundle size ใหญ่, initial load ช้า
**วิธีแก้:**

```javascript
{
  path: '/admin',
  component: () => import('../views/AdminView.vue')
}
```

### 3.2 Missing Pagination

**ปัญหา:** API ดึงข้อมูลทั้งหมดในครั้งเดียว

- `routes/orders.js:38` — `SELECT * FROM orders ORDER BY created_at DESC`
- `authController.js:111` — `getAllUsers()` ดึงทุก user

**วิธีแก้:** เพิ่ม `LIMIT` + `OFFSET` parameters

### 3.3 No API Versioning

**ปัญหา:** ไม่มี `/v1/` prefix

```
/api/hardware, /api/orders, /api/auth
```

**วิธีแก้:** เปลี่ยนเป็น `/api/v1/hardware` เป็นต้น

### 3.4 Deprecated Package

**ปัญหา:** `duckduckgo-images-api` เป็น deprecated package

**วิธีแก้:** หา alternative หรือ remove ถ้าไม่ได้ใช้

### 3.5 Incomplete Pinia Refactor

**ปัญหา:** Plan เดิมเขียนไว้ใน `docs/superpowers/plans/2026-07-05-builder-refactor.md`

**สถานะ:**
- Task 1: สร้าง authStore — เสร็จแล้ว
- Task 2: สร้าง builderStore — เสร็จแล้ว
- Task 3: สร้าง catalogStore — เสร็จแล้ว
- Task 4: เขียน tests — เสร็จแล้ว
- Task 5: Refactor App.vue — ยังไม่เสร็จ

---

## 4. Test Coverage Analysis

### 4.1 Frontend Tests — 11 Tests

| ไฟล์ | จำนวน tests | สิ่งที่ test |
|------|-------------|-------------|
| `authStore.test.js` | 3 | setUser, logout, initial state |
| `builderStore.test.js` | 3 | setItem, clearItem, clearAll |
| `catalogStore.test.js` | 2 | fetchCatalog, getCategorizedHardware |
| `HardwareSelection.test.js` | 3 | render, click, selected badge |

**覆盖率:** มี test แค่ stores + 1 component (HardwareSelection)
**ไม่มี test:** AdminView, ArticlesView, ChatbotWindow, PriceSummary, CheckoutView

### 4.2 Backend Tests — 0 Tests

**ปัญหา:** `package.json` มี placeholder:

```json
"test": "echo \"Error: no test specified\" && exit 1"
```

**ไม่มี test สำหรับ:**
- Auth flows (register, login, profile)
- Hardware CRUD
- Order creation
- Chatbot API
- Middleware (auth, rate limiting)

### 4.3 Missing Test Types

- E2E tests (Cypress/Playwright)
- API integration tests
- Load/stress tests
- Security tests

---

## 5. Configuration & Deployment

### 5.1 .env Security

**สถานะ:** `.gitignore` มี `.env` บรรทัดที่ 2

**ปัญหาที่พบ:**
- `.env.production` ใน frontend ไม่ได้ gitignore (มี production API URL)
- ต้อง verify ว่า `.env` ไม่ได้ commit แล้วจริง

### 5.2 Missing CI/CD

**ปัญหา:** ไม่มี GitHub Actions workflow, ไม่มี GitLab CI

**สิ่งที่ควรมี:**
- Lint check
- Test run
- Build verification
- Auto-deploy to Railway/Vercel

### 5.3 Deployment Config

**สถานะ:**
- Procfile สำหรับ Railway — มีแล้ว
- vercel.json สำหรับ frontend — มีแล้ว
- Dockerfile — ไม่มี
- Health check monitoring — ไม่มี

---

## 6. Documentation Quality

### 6.1 Documentation Inventory

| ไฟล์ | สถานะ | หมายเหตุ |
|------|-------|---------|
| `DESIGN.md` | ดี | Design system overview |
| `DESIGN-supabase.md` | มากเกินไป | ~400 บรรทัด, aspirational |
| `PRODUCT.md` | OK | Product purpose |
| `PROJECT_CONTEXT.md` | ดี | Thai-language handoff doc |
| `frontend/README.md` | Boilerplate | Default Vite README |
| `docs/superpowers/` | ดี | Prior plans + specs |

### 6.2 DESIGN.md vs Actual Implementation Gap

**ปัญหา:** DESIGN-supabase.md ระบุ design tokens หลายตัวที่ไม่ได้ใช้จริงใน `style.css`

---

## 7. Prioritized Remediation Plan

### Phase 1: Critical Security (ต้องทำทันที)

| # | ปัญหา | ไฟล์ | ความยาก |
|---|--------|------|---------|
| 1.1 | ลบ hardcoded JWT secret | `middleware/authMiddleware.js`, `controllers/authController.js` | ง่าย |
| 1.2 | ลบ hardcoded DB password | `scripts/create_users_table.js`, `scripts/init_db.js` | ง่าย |
| 1.3 | ตั้งค่า CORS restrictive | `server.js` | ง่าย |
| 1.4 | ลด body limit | `server.js` | ง่าย |
| 1.5 | Verify .env not in git | `.gitignore` | ง่าย |

### Phase 2: Code Quality (ทำหลัง Phase 1)

| # | ปัญหา | ไฟล์ | ความยาก |
|---|--------|------|---------|
| 2.1 | แยก mock data จาก db.js | `config/db.js` -> `config/mock-data.js` | กลาง |
| 2.2 | สร้าง idMapper utility | `utils/idMapper.js` | ง่าย |
| 2.3 | เพิ่ม API versioning | `server.js` + all routes | กลาง |
| 2.4 | เพิ่ม input validation | middleware | กลาง |
| 2.5 | ลบ/แทน console.log | ทั้ง backend | ง่าย |

### Phase 3: Architecture (ทำหลัง Phase 2)

| # | ปัญหา | ไฟล์ | ความยาก |
|---|--------|------|---------|
| 3.1 | Refactor App.vue | `App.vue` -> stores | ยาก |
| 3.2 | เพิ่ม lazy loading | `router/index.js` | ง่าย |
| 3.3 | เพิ่ม pagination | routes | กลาง |
| 3.4 | ลบ deprecated package | `package.json` | ง่าย |
| 3.5 | สร้าง controller layer | `controllers/` | กลาง |

### Phase 4: Testing & CI/CD (ทำหลัง Phase 3)

| # | ปัญหา | ไฟล์ | ความยาก |
|---|--------|------|---------|
| 4.1 | เพิ่ม backend tests | `node-backend/tests/` | กลาง |
| 4.2 | เพิ่ม frontend component tests | `frontend/tests/` | กลาง |
| 4.3 | สร้าง CI/CD pipeline | `.github/workflows/` | กลาง |
| 4.4 | อัปเดต frontend README | `frontend/README.md` | ง่าย |

### Phase 5: Polish (ทำเมื่อมีเวลา)

| # | ปัญหา | ไฟล์ | ความยาก |
|---|--------|------|---------|
| 5.1 | ปรับ logging library | ทั้ง backend | กลาง |
| 5.2 | HTTP-only cookies สำหรับ auth | frontend + backend | ยาก |
| 5.3 | E2E tests | `tests/e2e/` | ยาก |

---

## Appendix: File Reference

| ไฟล์ที่มีปัญหา | บรรทัด | ปัญหา |
|----------------|--------|-------|
| `middleware/authMiddleware.js` | 3 | Hardcoded JWT secret |
| `controllers/authController.js` | 5 | Hardcoded JWT secret |
| `scripts/create_users_table.js` | 9 | Hardcoded DB password |
| `scripts/init_db.js` | 11 | Hardcoded DB password |
| `server.js` | 30 | CORS wildcard |
| `server.js` | 35 | 50mb body limit |
| `config/db.js` | 7-4858 | Mock data 4,700+ บรรทัด |
| `routes/hardware.js` | 6-14 | Magic numbers |
| `routes/orders.js` | 10-24 | Duplicated function |
| `frontend/src/router/index.js` | 1-53 | No lazy loading |
| `frontend/src/App.vue` | 1-601 | Monolith component |
| `frontend/src/stores/auth.js` | — | localStorage token |

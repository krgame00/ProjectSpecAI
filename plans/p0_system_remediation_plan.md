# 🛠️ Plan: PCSpec Phase P0 Remediation (Security, Integrity, & Clean Architecture)

> **เป้าหมาย:** ดำเนินการแก้ไขข้อบกพร่องระดับ Critical และ High ใน Phase P0 ตามเอกสาร `docs/SYSTEM_REVIEW_2026-09-06.md` เพื่อปิดช่องโหว่ความปลอดภัย คืนความสมบูรณ์ของระบบสั่งซื้อ และฟื้นฟูสุขภาพของ Repository

---

## 1. สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

### 1.1 ไฟล์เป้าหมายที่ต้องแก้ไขใน Phase P0
- **P0.1 Server-side Order Calculation & Transaction:**
  - `node-backend/controllers/ordersController.js` (คำนวณราคายอดรวมจากฐานข้อมูล, ครอบ transaction ด้วย mysql2 connection, สุ่ม order ID ให้ปลอดภัย, ป้องกัน mock fallback ราคาหลุด)
  - `node-backend/routes/orders.js` (ตรวจสอบ validation และ route handlers)
  - `frontend/src/components/CheckoutView.vue` (ลบการพึ่งพา client-side total price ที่ส่งไปให้เซิร์ฟเวอร์เชื่อ)
- **P0.2 Single Source of Truth API_BASE & Dev Tools Cleanup:**
  - `frontend/src/services/apiBase.js` (NEW: รวมศูนย์การอ่านค่า API_BASE จาก env พร้อม fallback port 3001)
  - `frontend/src/App.vue` (ใช้นำเข้า `API_BASE`)
  - `frontend/src/stores/catalog.js` (ใช้นำเข้า `API_BASE`)
  - `frontend/src/stores/chatbot.js` (ใช้นำเข้า `API_BASE`)
  - `frontend/src/stores/article.js` (ใช้นำเข้า `API_BASE`)
  - `frontend/src/services/adminApi.js` (ใช้นำเข้า `API_BASE`)
  - `frontend/src/components/CheckoutView.vue` (แก้วิกฤต port 3000 และใช้นำเข้า `API_BASE`)
  - `frontend/index.html` (ลบแท็ก `<script src="http://localhost:8400/live.js">` ออก)
- **P0.3 Strict Mock Fallback Guard & CI Infrastructure:**
  - `node-backend/config/db.js` (ล็อกให้ fallback ได้เฉพาะเมื่อตั้ง env `ALLOW_MOCK_DB=true`)
  - `node-backend/models/userModel.js` (ป้องกัน in-memory default admin123 รั่วไหลบน production)
  - `.github/workflows/ci.yml` (เพิ่ม MySQL service container ให้กับ e2e test job เพื่อให้รันบน CI ได้อย่างสมบูรณ์แม้ปิด mock)
- **P0.4 Git Repository Hygiene & PII Purge:**
  - `.gitignore` (ยืนยันกฎ ignore `scraper_env/`, `__pycache__/`, `orders.json`, scratch files)
  - Git index (`git rm -r --cached` ไฟล์ 13,698 ชิ้นของ python venv, pycache, orders.json)
  - `scripts/seed_admin.js`, `scripts/generate_all_images.js`, `scripts/get_presets.js` (ย้าย hardcoded password ไปอ่านจาก process.env)
- **P0.5 True Metrics in Admin Dashboard:**
  - `frontend/src/components/AdminDashboard.vue` (ติดป้ายตัวอย่างข้อมูล หรือเชื่อมโยงคำนวณจาก orders จริง)

---

## 2. คู่มือและขั้นตอนการรันคำสั่งเชิงลึกเรียงตามลำดับ (Step-by-Step Execution Commands for AI)

### ขั้นตอนที่ 1: P0.1 แก้ระบบสั่งซื้อ (Server-side Total + Transaction)
1. ตรวจสอบโค้ด `node-backend/controllers/ordersController.js` ในฟังก์ชัน `create`
2. ดึง connection จาก pool: `const conn = await db.getConnection ? await db.getConnection() : (db.pool ? await db.pool.getConnection() : null)`
3. ดำเนินการ query ราคาจากตาราง `products` ด้วย DB ID สำหรับทุกชิ้นใน `build_items`
4. คำนวณ `calculatedTotal` บนเซิร์ฟเวอร์
5. สุ่ม order ID แบบ Collision-resistant: `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
6. บันทึกลงตาราง `orders` และ `order_items` ภายใน `conn.beginTransaction()` ... `conn.commit()` / `conn.rollback()`
7. คืน connection ในบล็อก `finally` เสมอ (`conn.release()`)
8. ในกรณี `db.isFallback()`, ให้คำนวณราคาจาก mock catalog แทนที่จะเชื่อ `req.body.total_price`

### ขั้นตอนที่ 2: P0.2 รวมศูนย์ API_BASE และกำจัด Script แปลกปลอม
1. สร้างไฟล์ `frontend/src/services/apiBase.js`
2. แทนที่ตัวแปร `API_BASE` ใน 6 ไฟล์ของ Frontend
3. เปิด `frontend/index.html` และลบ `live.js`
4. รัน `npm run build` ใน `frontend/` และตรวจสอบ `dist/index.html`

### ขั้นตอนที่ 3: P0.3 จัดการ Guard Mock Database และ CI Workflow
1. ปรับปรุง `node-backend/config/db.js` ให้ตรวจเช็ค `process.env.ALLOW_MOCK_DB === 'true'` ก่อนเปิด fallback mode
2. ปรับปรุง `node-backend/models/userModel.js` ไม่ให้ inject `admin123` หากไม่ได้อนุญาต mock
3. ปรับปรุง `.github/workflows/ci.yml` ใส่ MySQL container ในขั้นตอน E2E

### ขั้นตอนที่ 4: P0.4 ทำความสะอาด Git Index และ Secrets
1. รัน `git rm -r --cached node-backend/scripts/scraper_env`
2. รัน `git rm --cached node-backend/orders.json` และไฟล์ขยะที่ระบุในรายงาน
3. ย้าย Hardcoded passwords ใน scripts ไปอ่านจาก env

### ขั้นตอนที่ 5: P0.5 ปรับ Dashboard ไม่ให้หลอกผู้ใช้
1. ปรับแต่ง `AdminDashboard.vue` ในส่วน 7-day revenue chart ให้สะท้อนข้อมูลจริงหรือระบุชัดเจนว่าเป็นโหมดจำลอง (Simulated / Demo Data)

---

## 3. กฎเหล็กในโค้ดและวิธีแก้บั๊ก (Code Rules & Edge-case Handling)

1. **Zero-Trust Client Pricing:** ตัวเลขราคาและยอดรวมที่ส่งมาจาก Client ให้ถือเป็นเพียง "ข้อมูลอ้างอิงเพื่อการแสดงผล" เท่านั้น การบันทึกลงตาราง `orders` และการตัดเงินจริงต้องใช้ยอดที่ Server ดึงและคำนวณจาก Table `products` เสมอ
2. **Strict Connection Release:** เมื่อเรียก `conn = await pool.getConnection()` ต้องมั่นใจ 100% ว่าคำสั่ง `if (conn) conn.release()` จะถูกเรียกในบล็อก `finally` เสมอ เพื่อป้องกันปัญหา Database Pool Exhaustion
3. **Environment Backward Compatibility:** ใน Frontend ต้องคงรูปแบบ `import.meta.env.VITE_API_BASE` เอาไว้ เพื่อให้ Playwright E2E test และ Docker/Vercel preview สามารถ override ค่าได้โดยไม่พัง
4. **CI Preservation:** ห้ามปิด Mock database จนกว่า CI Workflow จะมี Database Service Container รองรับ หรือจนกว่า e2e test จะทำงานได้แบบ Standalone

---

## 4. ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

### 4.1 คำสั่งทดสอบโค้ด
```bash
# ทดสอบ Unit Test ของ Backend
cd node-backend && npm test

# ทดสอบ Unit Test ของ Frontend
cd frontend && npm test

# ทดสอบ Build Frontend
cd frontend && npm run build
```

### 4.2 ตรวจสอบการเล็ดลอดของโค้ด Dev
```powershell
# ต้องไม่มี live.js หลงเหลือใน dist
Select-String -Path "frontend/dist/index.html" -Pattern "live.js"

# ต้องไม่มี localhost:3000 ใน src
Select-String -Path "frontend/src/**/*.*" -Pattern "localhost:3000"
```

### 4.3 ตรวจสอบผลลัพธ์การคลีน Git
```powershell
# ต้องเป็น 0
git ls-files | Select-String "scraper_env" | Measure-Object -Line
```

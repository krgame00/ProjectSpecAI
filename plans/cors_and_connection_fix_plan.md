# 🛠️ แผนวิเคราะห์และแก้ไขปัญหาเชื่อมต่อข้อมูลไม่ได้ (CORS & Connection Fix)

> **วันที่บันทึก:** 7 กันยายน 2026  
> **ปัญหา:** เว็บไซต์ Production บน Vercel (`https://project-spec-ai.vercel.app`) หรือการเชื่อมต่อจาก Client ได้รับข้อผิดพลาด ไม่สามารถดึงข้อมูล Catalog และ API อื่นๆ ได้ (`HTTP 500: Blocked by CORS policy: origin not allowed`)

---

## 1. สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

```
Client Browser (https://project-spec-ai.vercel.app)
       │
       ▼ [HTTP Request with Origin: https://project-spec-ai.vercel.app]
Render Web Service (https://projectspecai.onrender.com)
       │
       ├── node-backend/server.js                 # ตั้งค่า CORS origin whitelist
       ├── node-backend/tests/corsSecurity.test.js # Unit test ตรวจสอบ CORS security
       └── render.yaml                            # กำหนด autoDeploy: true และ ALLOWED_ORIGINS env
```

---

## 2. คู่มือและขั้นตอนการรันคำสั่งเชิงลึกเรียงตามลำดับ (Step-by-Step Execution Commands for AI)

### ขั้นตอนที่ 1: ตรวจสอบและแก้ไข CORS ใน `node-backend/server.js`
- ขยาย `defaultAllowedOrigins` ให้รวม `https://project-spec-ai.vercel.app`
- เพิ่มฟังก์ชัน `isAllowedOrigin(origin)` ที่รองรับ Wildcard domain ของ Vercel (`.vercel.app`) เพื่อให้ Preview Branch และ Production Deployments เข้าถึง API ได้

### ขั้นตอนที่ 2: อัปเดต `render.yaml`
- ตั้งค่า `autoDeploy: true` เพื่อให้ Render pull โค้ดจาก branch `main` อัตโนมัติเมื่อ push
- ระบุ `ALLOWED_ORIGINS` ใน `envVars` เป็นค่าเริ่มต้น

### ขั้นตอนที่ 3: ทดสอบและ Deploy
```bash
# รัน Unit Tests ใน node-backend เพื่อยืนยันว่า CORS ทำงานถูกต้อง
cd node-backend && npm test

# ทำการ commit และ push ขึ้น origin main
git add node-backend/server.js node-backend/tests/corsSecurity.test.js render.yaml
git commit -m "fix(cors): whitelist Vercel domains and enable autoDeploy in render.yaml"
git push origin main
```

---

## 3. กฎเหล็กในโค้ดและวิธีแก้บั๊ก (Code Rules & Edge-case Handling)

1. **Debug Mantra:**
   - `Reproduce`: ใช้ `curl.exe -i -H "Origin: https://project-spec-ai.vercel.app" https://projectspecai.onrender.com/api/v1/hardware/catalog` จะพบ `HTTP 500 {"error":"Blocked by CORS policy: origin not allowed"}` ทันที
   - `Trace`: พบว่า `defaultAllowedOrigins` ใน `server.js` มีเฉพาะ localhost และ Render รันด้วย `NODE_ENV=production` โดยไม่มี `ALLOWED_ORIGINS` ใน environment
   - `Question Hypothesis`: ทำไม localhost จึงใช้ได้แต่ vercel ใช้ไม่ได้? เพราะ policy จำกัดเข้มงวดเกินไปโดยไม่ได้เผื่อ domain ของ Vercel
   - `Cross-reference`: ตรวจสอบโดเมนจริงใน `README.md` และ `render.yaml` พบว่าเป็น `https://project-spec-ai.vercel.app`
2. **การรองรับ Dynamic Vercel Previews:**
   - ต้องตรวจสอบ `url.hostname.endsWith('.vercel.app')` ร่วมด้วย เพื่อไม่ให้ติดปัญหาเวลา deploy ผ่าน preview branch บน Vercel
3. **Render Manual Deploy Trigger:**
   - หาก Render ยังไม่ได้ดึง commit อัตโนมัติ ให้เข้าไปกด **Manual Deploy -> Deploy latest commit** ที่ [Render Dashboard](https://dashboard.render.com) เพื่อให้ Render โหลดโค้ดใหม่ที่มีการแก้ CORS ขึ้นใช้งานทันที

---

## 4. ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

- [x] `tests/corsSecurity.test.js` ผ่านทั้ง 6 การทดสอบ
- [x] Backend test suite ทั้งหมด (11 suites, 134 tests) ผ่าน 100%
- [x] Frontend test suite ทั้งหมด (23 suites, 165 tests) ผ่าน 100%
- [x] Production bundle build ผ่านใน 1.3 วินาที

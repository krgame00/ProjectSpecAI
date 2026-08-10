# PCSpec — Production Architecture & Ops Guide (สำหรับ AI Agent รุ่นต่อไป)

> อัปเดตล่าสุด: 2026-08-10
> ไฟล์นี้เป็นเอกสารต่อจาก `PROJECT_CONTEXT.md` / `PRODUCT.md` — อ่านพร้อมกันได้
> ใช้เมื่อ: ต้องการ deploy, แก้ข้อมูล, แก้ bug เกี่ยวกับ production หรือดึง/อัปข้อมูลขึ้นเว็บ

---

## 1. สถาปัตยกรรมปัจจุบัน (Changed 2026-08-10)

```
Browser ──▶ Vercel (static SPA)  project-spec-ai.vercel.app
                │  frontend/src/* เรียก API ตรงๆ (axios/fetch)
                ▼
            Render (Web Service, free)  projectspecai.onrender.com
                │  Express backend (node-backend/server.js)
                ▼
            TiDB Cloud (Serverless, MySQL-compatible)
                gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000
                DB: smart_pc_builder
```

### สิ่งสำคัญที่สุด (อ่านก่อน!)
1. **Railway หมดอายุแล้ว (ฟรี expired 8/2026)** — `projectspecai-production.up.railway.app` ตายแล้ว (404) อย่าใช้ URL นี้เด็ดขาด
2. **Vercel เป็น static อย่างเดียว** — `/api/*` ที่ Vercel คืน index.html (SPA fallback) **ไม่ใช่ proxy** อย่าไปคาดหวัง API จาก Vercel
3. **Vercel dashboard env `VITE_API_BASE` override ค่าใน repo** — แก้ env ที่ Vercel Dashboard เสมอ (Settings → Environment Variables) แล้ว Redeploy
4. **Render free หลับหลัง 15 นาที idle** — เปิดเว็บครั้งแรกอาจใช้เวลา ~1 นาที (Render แสดงหน้า loading ให้อัตโนมัติ) — ไม่ใช่ bug

---

## 2. ตัวแปร Environment

### 2.1 Render (backend) — ตั้งใน Render Dashboard → Service → Environment
| Key | Value |
|---|---|
| `DB_HOST` | `gateway01.ap-southeast-1.prod.aws.tidbcloud.com` |
| `DB_PORT` | `4000` |
| `DB_USER` | `2zvWBJeXCf3SPRp.root` |
| `DB_PASSWORD` | (TiDB password — อยู่ใน `node-backend/sync_to_tidb.js` บรรทัด 15) |
| `DB_NAME` | `smart_pc_builder` |
| `DB_SSL` | `true` |
| `JWT_SECRET` | (ค่าจริงอยู่ `node-backend/.env` — ยาว 36 ตัว) |
| `GEMINI_API_KEY` | (ค่าจริงอยู่ `node-backend/.env` — ยาว 53 ตัว; ไม่ใส่ = chatbot ไม่ทำงาน) |

### 2.2 Vercel (frontend) — ตั้งใน Vercel Dashboard → Project → Settings → Environment Variables
| Key | Value |
|---|---|
| `VITE_API_BASE` | `https://projectspecai.onrender.com/api/v1` |

> ⚠️ **ถ้า env นี้ใน Vercel เป็นค่า Railway เก่า** → ข้อมูลบนเว็บจะไม่ขึ้น (bundle ยังชี้ railway) ต้องแก้ที่ dashboard + Redeploy

### 2.3 Local (.env — gitignored)
- `node-backend/.env` — DB local (localhost MySQL) + JWT_SECRET + GEMINI_API_KEY
- `frontend/.env.production` — VITE_API_BASE (ค่าเดียวกันกับ Vercel)
- `frontend/.env.production.example` — template (commit ได้)

---

## 3. จำนวนข้อมูล (ณ 2026-08-10)

| ตาราง | จำนวน (TiDB + Local) |
|---|---|
| products | 561 |
| spec_cpu | 59 |
| spec_motherboard | 88 |
| spec_ram | 86 |
| spec_gpu | 168 |
| spec_psu | 70 |
| spec_storage | 15 |
| spec_case | 75 |

ข้อมูลหลัก: Local MySQL (localhost, `C:\Users\PC\Downloads\PCSpec\node-backend\.env`) = แหล่ง truth สำหรับแก้ไข/cleansing
TiDB = production (สิ่งที่เว็บแสดง)

---

## 4. ขั้นตอน: อัปเดตข้อมูลขึ้นเว็บ (Data Update SOP)

> ตาม `DATA_UPDATE_WORKFLOW.md` — แต่ปรับแล้ว (Railway → Render)

### 4.0 ตรวจ schema ก่อน (สำคัญ!)
ถ้าเพิ่ม column ใหม่ใน local (เช่น Phase 4.2/4.3) **TiDB จะยังไม่มี** → ต้อง ALTER ก่อน sync:

```bash
cd node-backend
node -e "
const mysql = require('mysql2/promise');
(async () => {
  const local = await mysql.createPool({ host: 'localhost', user: 'root', password: '1234', database: 'smart_pc_builder' });
  const tidb = await mysql.createPool({ host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com', port: 4000, user: '2zvWBJeXCf3SPRp.root', password: 'PASTE_PW', database: 'smart_pc_builder', ssl: { rejectUnauthorized: true } });
  const tables = ['products','spec_cpu','spec_motherboard','spec_ram','spec_gpu','spec_psu','spec_storage','spec_case'];
  for (const t of tables) {
    const [l] = await local.query('SHOW COLUMNS FROM ' + t);
    const [tb] = await tidb.query('SHOW COLUMNS FROM ' + t);
    const missing = l.map(c=>c.Field).filter(c=>!tb.map(x=>x.Field).includes(c));
    if (missing.length) console.log(t, 'MISSING:', missing.join(', '));
  }
  console.log('check done — ถ้ามี MISSING ให้ ALTER เติมก่อน');
  await local.end(); await tidb.end();
})();
"
```

ถ้ามี column ขาด → รัน ALTER (ตัวอย่าง):
```sql
ALTER TABLE products ADD COLUMN product_url VARCHAR(500) NULL;
ALTER TABLE spec_cpu ADD COLUMN cores VARCHAR(50) NULL, ADD COLUMN threads VARCHAR(50) NULL;
```

### 4.1 Sync ข้อมูล local → TiDB
```bash
cd node-backend
node sync_to_tidb.js
# ผลที่ควรเห็น: "Synced N rows for products." + ทุก spec_* + "All tables synced successfully!"
```
> ⚠️ สคริปต์นี้ TRUNCATE ก่อนคัดลอก — ตรวจ local ให้ดีก่อนรัน (ข้อมูล TiDB เก่าจะถูกแทนทั้งหมด)

### 4.2 ตรวจผลบน Render (ไม่ต้อง redeploy — อ่าน DB สด)
```bash
curl -s https://projectspecai.onrender.com/api/v1/hardware/catalog | head -c 300
# ควรได้ {"cpu":[{...}]} — ถ้า {"error":"Unknown column '...'"} → schema ยังไม่ครบ (กลับไป 4.0)
curl -s https://projectspecai.onrender.com/api/v1/health
# {"status":"ok","database":"connected"}
```

---

## 5. ขั้นตอน: Deploy Backend ใหม่ / แก้โค้ด backend

### 5.1 Push ขึ้น GitHub (`krgame00/ProjectSpecAI`, branch main)
Render **auto-deploy = false** (ตั้งใน render.yaml) → หลัง push ต้องกด deploy มือ:
1. Render Dashboard → service `pcspec-backend` → **Manual Deploy → Clear build cache & Deploy**
2. รอ build ~1-3 นาที (npm install --omit=dev เร็ว เพราะไม่เอา puppeteer)
3. ดู log ว่า "Connected to MySQL database successfully" + "Your service is live"

### 5.2 โครงสร้าง deploy (สำคัญ)
- `render.yaml` (root) — blueprint: rootDir `node-backend`, build `npm install --production`, start `node server.js`
- `package.json` (root) — กัน Render default `yarn` error; postinstall ติดตั้ง deps backend
- `node-backend/Procfile` — `web: node server.js`
- **puppeteer อยู่ใน devDependencies** (ใช้แค่ scraper scripts ไม่ใช่ server) — กัน Chromium ดาวน์โหลดบน Render

### 5.3 ถ้า deploy error
| Error | สาเหตุ/แก้ |
|---|---|
| `Couldn't find a package.json in /opt/render/project/src` | root package.json หาย/ไม่ถูก commit → push ให้ครบ |
| `Unknown column 'xxx' in field list` | TiDB schema เก่า → ทำตาม 4.0 |
| `JWT_SECRET environment variable is required` | env ไม่ครบใน Render dashboard → ใส่ JWT_SECRET |
| Build นาน/พังตอน install | puppeteer กลับไปอยู่ใน dependencies → ย้ายกลับ devDependencies |

---

## 6. ขั้นตอน: Deploy Frontend (Vercel)

1. แก้โค้ด/URL ใน `frontend/src/` → ตรวจไม่เหลือ railway เก่า:
   ```bash
   grep -rn "railway" frontend/src/   # ควรว่าง (หรือมีแค่ comment)
   ```
2. Commit + push main → Vercel auto-deploy (Git integration)
3. **เช็คว่า Vercel dashboard env `VITE_API_BASE` เป็นค่าใหม่** (onrender) — ถ้าเก่า (railway) แก้ที่ dashboard + Redeploy
4. verify:
   ```bash
   # bundle ล่าสุดต้องไม่มี railway:
   BUNDLE=$(curl -s https://project-spec-ai.vercel.app/ | grep -oE '/assets/index-[^"]*\.js' | head -1)
   curl -s "https://project-spec-ai.vercel.app$BUNDLE" | grep -c railway
   # ควรได้ 0
   ```

---

## 7. ข้อมูลบัญชี/สิทธิ์

- GitHub repo: `krgame00/ProjectSpecAI` — **PUBLIC**
- Admin เว็บ: `admin@pc.com` / `admin` (test account)
- TiDB: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com` user `2zvWBJeXCf3SPRp.root` (password ใน sync_to_tidb.js — ไม่ commit)
- Render: dashboard.render.com (บัญชี GitHub ของ user)
- Vercel: vercel.com (บัญชีของ user; project `project-spec-ai`)

---

## 8. ข้อควรระวัง (Lessons Learned)

1. **Vercel env override repo env** — เคยเจอ: แก้โค้ด + push แล้วเว็บยังใช้ค่าเก่า เพราะ Vercel dashboard env ค้างค่า railway → แก้ที่ dashboard เสมอ
2. **TiDB schema drift** — local schema ใหม่ขึ้น แต่ TiDB เก่า → error `Unknown column` ทำให้เว็บว่าง (500) → เช็ค/ALTER schema ก่อน sync เสมอ
3. **Railway free หมดอายุ** — เคยพังทั้งระบบ เพราะ backend ตายเงียบๆ → ตอนนี้ Render มี health check `/api/v1/health` ใช้ monitor ได้
4. **Render free หลับ** — เปิดเว็บครั้งแรก ~1 นาที cold start (เป็นปกติ ไม่ใช่ bug)
5. **อย่า commit secret** — `.env*` ใน gitignore; `sync_to_tidb.js` มี TiDB password อยู่ใน repo (legacy — ถ้าจะ cleanup ควรย้ายไป env)
6. **scraped_*.json / database-export/ ถูก gitignore** — อย่า `git add -f` เผลอ

---

## 9. คำสั่งเช็คสถานะเร็ว (Health Check)

```bash
# 1. Backend อยู่ไหม
curl -s https://projectspecai.onrender.com/api/v1/health
# {"status":"ok","database":"connected"}

# 2. ข้อมูลครบไหม
curl -s https://projectspecai.onrender.com/api/v1/hardware/catalog | python -c "
import json,sys
d=json.load(sys.stdin)
print('categories:', list(d.keys()))
print('total:', sum(len(v) for v in d.values()))
"

# 3. Frontend เสิร์ฟไหม
curl -s -o /dev/null -w "%{http_code}" https://project-spec-ai.vercel.app/

# 4. bundle ใช้ URL ถูกไหม (ควร 0 railway)
BUNDLE=$(curl -s https://project-spec-ai.vercel.app/ | grep -oE '/assets/index-[^"]*\.js' | head -1)
curl -s "https://project-spec-ai.vercel.app$BUNDLE" | grep -c railway
```
# 🚀 Deploy Backend ขึ้น Render (Free) — คู่มือทีละขั้น

> backend Express (node-backend/) → Render Web Service (free)
> DB: TiDB Cloud (มีข้อมูล 477 รายการแล้ว)
> Frontend: Vercel (project-spec-ai.vercel.app) — ชี้มาที่ Render URL

## 1. เข้า Render Dashboard
ไปที่ https://dashboard.render.com → Login (GitHub account)

## 2. New Web Service
กด **"New +"** → **"Web Service"**
- เชื่อมต่อ **GitHub repo: krgame00/ProjectSpecAI** (ถ้ายังไม่เคยเชื่อม ให้ Connect GitHub ก่อน)
- เลือกสาขา **main**

## 3. ตั้งค่า Service (Render อ่านจาก render.yaml อัตโนมัติ)
Render จะเจอ `render.yaml` blueprint และตั้งค่าให้อัตโนมัติ:
- **Name:** `pcspec-backend`
- **Root Directory:** `node-backend`
- **Runtime:** Node
- **Build Command:** `npm install --production`
- **Start Command:** `node server.js`
- **Plan:** Free

## 4. ใส่ Environment Variables (สำคัญ!)
กด **Advanced** → **Environment Variables** แล้วเพิ่ม:

| Key | Value |
|---|---|
| `DB_HOST` | `gateway01.ap-southeast-1.prod.aws.tidbcloud.com` |
| `DB_PORT` | `4000` |
| `DB_USER` | `2zvWBJeXCf3SPRp.root` |
| `DB_PASSWORD` | (รหัสผ่าน TiDB — จาก `node-backend/sync_to_tidb.js`) |
| `DB_NAME` | `smart_pc_builder` |
| `DB_SSL` | `true` |
| `JWT_SECRET` | (สุ่มยาวๆ เช่น `openssl rand -hex 32`) |
| `GEMINI_API_KEY` | (คีย์ Gemini สำหรับ chatbot — ไม่มีก็ได้ chatbot ไม่ทำงาน) |

> ⚠️ render.yaml มี `sync: false` สำหรับตัวแปรลับ → Render จะไม่เดามาจาก blueprint ต้องกรอกเองใน Dashboard

## 5. Deploy
กด **"Create Web Service"** → รอ build เสร็จ (~2-3 นาที)

## 6. เช็คว่าทำงาน
เปิด `https://<ชื่อ-service>.onrender.com/api/v1/health` → ควรได้ `{"status":"ok"...}`

## 7. อัปเดต frontend ให้ชี้มา Render
`frontend/.env.production` (บนเครื่อง local):
```
VITE_API_BASE=https://<ชื่อ-service>.onrender.com/api/v1
```
build + push ขึ้น Vercel (หรือ Vercel auto-deploy จาก GitHub)

## 8. ตรวจหน้าเว็บ
เปิด https://project-spec-ai.vercel.app/build → ควรเห็นรายการสินค้าขึ้น

---
### ⚠️ หมายเหตุ Free Tier
- หลับหลัง **15 นาที** ไม่มีใครเข้า → ครั้งแรกที่เปิดอาจโหลด ~1 นาที (Render แสดงหน้า loading)
- **750 ชม./เดือน** (หลับไม่นับชั่วโมง) — ใช้ฟรีได้ตลอด ไม่หมดอายุ
- ถ้าใช้ครบ 750 ชม. จะ suspend จนต้นเดือนถัดไป
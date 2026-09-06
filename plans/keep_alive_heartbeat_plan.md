# 💓 แผนงานตั้งค่าระบบปลุกอัตโนมัติ 24/7 (Render Keep-Alive Heartbeat)

> **วันที่บันทึก:** 7 กันยายน 2026  
> **เป้าหมาย:** ป้องกันไม่ให้ Backend บน Render (Free Tier) หลับหรือ Spin Down หลังจากไม่มีการใช้งานเกิน 15 นาที โดยใช้ GitHub Actions Scheduled Cron Job สะกิด Endpoint `/api/v1/health` ทุกๆ 14 นาที

---

## 1. สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

```
GitHub Actions Scheduler (Cron every 14 mins)
       │
       ▼ [GET /api/v1/health]
Render Web Service (https://projectspecai.onrender.com)
       │
       ├── .github/workflows/keep-alive.yml      # Workflow สำหรับยิงสะกิด heartbeat ทุก 14 นาที
       └── node-backend/server.js                 # ให้บริการ endpoint /api/v1/health
```

---

## 2. คู่มือและขั้นตอนการรันคำสั่งเชิงลึกเรียงตามลำดับ (Step-by-Step Execution Commands for AI)

### ขั้นตอนที่ 1: สร้างไฟล์ Workflow
สร้างไฟล์ `.github/workflows/keep-alive.yml` กำหนด schedule cron:
```yaml
on:
  schedule:
    - cron: '*/14 * * * *'
  workflow_dispatch:
```

### ขั้นตอนที่ 2: ทดสอบการทำงานของคำสั่ง Ping ใน Local
```bash
# ทดสอบคำสั่ง curl เพื่อยืนยันว่า Endpoint health ส่งสถานะ 200 กลับมา
curl -s -w "\n%{http_code}" https://projectspecai.onrender.com/api/v1/health
```

### ขั้นตอนที่ 3: Git Commit & Push
```bash
git add .github/workflows/keep-alive.yml plans/keep_alive_heartbeat_plan.md
git commit -m "ci: add Render keep-alive heartbeat cron workflow"
git push origin main
```

---

## 3. กฎเหล็กในโค้ดและวิธีแก้บั๊ก (Code Rules & Edge-case Handling)

1. **โควตาเวลาของ Render Free Tier:**
   - Render ให้โควตา 750 ชั่วโมง/เดือน ซึ่งใน 1 เดือนมี 720–744 ชั่วโมง ดังนั้นการตั้งให้ตื่นตลอดเวลาจะไม่เกินขีดจำกัดสำหรับ 1 Web Service
2. **GitHub Actions Cron Delay:**
   - GitHub Actions Scheduled Crons อาจมี Delay เล็กน้อย (1-5 นาที) ในช่วงที่เซิร์ฟเวอร์ GitHub มีคิวหนาแน่น แต่เนื่องจากเราตั้งทุกๆ 14 นาที (ก่อนที่ Render จะหลับที่นาทีที่ 15) การสะกิดจะครอบคลุมช่วงเวลาหลับได้เป็นอย่างดี
3. **Manual Trigger Fallback (`workflow_dispatch`):**
   - รองรับการกดปุ่ม "Run workflow" จากหน้า GitHub Actions UI ได้ด้วยตนเองเมื่อต้องการทดสอบทันทีโดยไม่ต้องรอรอบเวลา Cron

---

## 4. ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

- [x] ไฟล์ `.github/workflows/keep-alive.yml` รูปแบบ YAML ถูกต้องตามสเปก GitHub Actions
- [x] คำสั่ง `curl` ยิง Endpoint `/api/v1/health` ตอบกลับด้วย `HTTP 200 OK`
- [x] Push ขึ้น branch `main` บน GitHub สำเร็จ

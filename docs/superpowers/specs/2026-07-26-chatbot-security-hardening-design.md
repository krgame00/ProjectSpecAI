# Chatbot Security Hardening Design

## Goal

ปิดช่องโหว่ XSS, ป้องกันการใช้ session ข้ามบัญชี, จำกัดค่าใช้จ่าย AI และบังคับให้เฉพาะสมาชิกที่ล็อกอินแล้วใช้งาน chatbot ได้ โดยรักษา SSE streaming, image analysis, Google grounding และการนำสเปกจาก AI ใส่ PC Builder ไว้เหมือนเดิม

## Scope

ครอบคลุม endpoint ต่อไปนี้:

- `POST /api/v1/chatbot/message`
- `POST /api/v1/chatbot/stream`
- `POST /api/v1/chatbot/clear`

ครอบคลุมการแสดงข้อความและ grounding links ใน `ChatbotWindow.vue` ไม่รวมระบบบทความ, การย้าย session ไป Redis หรือการเปลี่ยนผู้ให้บริการ AI

## Architecture

แยกกฎความปลอดภัยออกจาก `routes/chatbot.js` เป็นหน่วยที่ทดสอบได้โดยไม่เรียก Gemini:

- `node-backend/middleware/chatbotSecurity.js` รับผิดชอบ authentication-adjacent validation, per-user quota และ payload validation
- `node-backend/services/chatbotSessions.js` รับผิดชอบการสร้าง, อ่าน, ล้าง และตรวจเจ้าของ session
- `frontend/src/utils/chatSecurity.js` รับผิดชอบการ escape ข้อความ, render Markdown แบบจำกัด และตรวจ URL แหล่งอ้างอิง

Route เดิมยังรับผิดชอบ prompt construction, catalog injection, Gemini calls และ SSE transport

## Authentication and Authorization

ทุก chatbot endpoint ต้องเรียก `authMiddleware` ก่อน security middleware อื่น เพื่อให้มี `req.user.id`

Frontend แนบ `Authorization: Bearer <token>` จาก auth store/localStorage ทุกคำขอ หากไม่มี token จะไม่ส่งคำขอ หาก backend ตอบ `401` frontend จะล้างสถานะ login และแจ้งให้ผู้ใช้เข้าสู่ระบบใหม่

## Rate Limit

จำกัด 40 คำขอต่อ user ID ในช่วงเวลา rolling/fixed window 15 นาที โดยไม่ใช้ IP เป็น key หลัก ผู้ใช้หลัง proxy หรือเครือข่ายเดียวกันจึงไม่แย่ง quota กัน

เมื่อเกิน quota backend ตอบ `429` พร้อม JSON `{ "error": "Chatbot rate limit exceeded" }` และ standard rate-limit headers

ทั้ง `/message` และ `/stream` ใช้ quota เดียวกัน ส่วน `/clear` ต้องยืนยันตัวตนแต่ไม่นับ quota เพราะไม่เรียก AI

## Payload Validation

ข้อความ:

- ต้องเป็น string เมื่อมีค่า
- trim แล้วต้องยาวไม่เกิน 4,000 ตัวอักษร
- request ต้องมีข้อความหรือรูปอย่างน้อยหนึ่งอย่าง

รูป:

- รูปแบบ object `{ data, mimeType }`
- รองรับ `image/jpeg`, `image/png`, `image/webp`
- base64 ต้อง decode ได้
- decoded bytes ต้องไม่เกิน 8 MiB
- magic bytes ต้องตรงกับ MIME ที่ประกาศ

ข้อมูลที่ไม่ผ่าน validation ต้องถูกปฏิเสธด้วย `400` ก่อนเรียก Gemini

## Session Ownership

`/stream` เป็น endpoint ที่ใช้ session ส่วน `/message` ยังคงเป็น legacy stateless endpoint แต่ต้องผ่าน auth, quota และ payload validation เช่นเดียวกัน

สำหรับ `/stream` server เป็นผู้สร้าง session ID ด้วย `crypto.randomUUID()` เมื่อ request ไม่มี session ID และส่งกลับด้วย SSE `event: session`

แต่ละ session record เก็บ `ownerId`, `history` และ `lastAccessedAt` การอ่านหรือล้าง session ต้องใช้ user ID เดียวกับเจ้าของ หาก session ไม่มีอยู่ backend จะสร้างใหม่เฉพาะกรณีที่ client ไม่ส่ง ID; หาก client ส่ง ID ที่ไม่รู้จักหรือเป็นของบัญชีอื่น ให้ตอบ `404` เพื่อไม่เปิดเผยว่า session นั้นมีจริงหรือไม่

Session หมดอายุหลังไม่มีการใช้งาน 24 ชั่วโมง และมี cleanup แบบ lazy ระหว่างการเข้าถึงเพื่อป้องกัน memory growth โดยยังไม่เพิ่ม Redis ในรอบนี้

เมื่อ backend restart แล้ว session ใน `localStorage` หายจาก server frontend จะล้าง session ID และ retry คำขอหนึ่งครั้งโดยไม่ส่ง ID เพื่อสร้าง session ใหม่

## Safe Rendering

ข้อความจาก user และ AI ถือเป็น untrusted input เสมอ

`renderSafeMarkdown(text)` ต้อง escape `&`, `<`, `>`, `"`, `'` ก่อน แล้วจึงแปลงเฉพาะ:

- `**text**` เป็น `<strong>`
- `*text*` เป็น `<em>`
- newline เป็น `<br>`

Raw HTML, attributes, scripts และ event handlers จึงไม่สามารถผ่านเข้าสู่ `v-html`

Grounding URL ต้องผ่าน `toSafeHttpsUrl(value)` ซึ่งคืน URL เฉพาะ protocol `https:` เท่านั้น ลิงก์ใช้ `target="_blank"` และ `rel="noopener noreferrer"` URL ที่ไม่ผ่านจะไม่ถูก render เป็นลิงก์

## Error Handling

- `400`: payload หรือรูปไม่ถูกต้อง
- `401`: ไม่มี token, token หมดอายุ หรือ token ใช้ไม่ได้
- `404`: session ID ไม่รู้จักหรือไม่ได้เป็นเจ้าของ
- `429`: quota ต่อผู้ใช้เต็ม
- `500/503`: provider หรือระบบภายในผิดพลาด ใช้ SSE error event เมื่อ response เริ่ม stream แล้ว

ข้อความ error ที่ส่งผู้ใช้ต้องไม่เปิดเผย stack trace, API key, prompt หรือรายละเอียด provider credential

## Testing

Backend unit tests:

- quota แยกตาม user ID และ block request ที่ 41
- `/clear` ไม่นับ quota
- reject ข้อความเกิน 4,000 ตัวอักษร
- reject MIME ที่ไม่รองรับ, base64 เสีย, รูปเกิน 8 MiB และ magic bytes ไม่ตรง
- session สร้างโดย server, อ่านได้เฉพาะ owner, user อื่นอ่าน/ล้างไม่ได้ และ session หมดอายุ

Frontend unit tests:

- escape script tags และ event attributes
- Markdown ที่อนุญาตยัง render ได้
- ยอมรับเฉพาะ HTTPS grounding URLs
- chatbot store แนบ JWT
- `401` ทำให้ logout
- unknown session retry ได้เพียงหนึ่งครั้ง

Verification:

- backend Jest suite
- frontend Vitest suite
- frontend production build

## Constraints and Trade-offs

- Session และ quota อยู่ใน memory จึงแยกกันต่อ backend instance และหายเมื่อ restart เหมาะกับ deployment instance เดียวในปัจจุบัน
- หาก scale หลาย instance ต้องย้าย session และ rate-limit store ไป Redis
- การ escape ก่อน render ลดความสามารถ Markdown เหลือเฉพาะรูปแบบที่ระบุ เพื่อแลกกับ attack surface ที่เล็กและไม่เพิ่ม sanitizer dependency

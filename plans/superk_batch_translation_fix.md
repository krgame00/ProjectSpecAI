# 📑 SuperK Batch Translation Fix Plan (คู่มือแก้ปัญหาแปลมังงะ 13-26 หน้าล้มเหลว)

## 1. 🏗️ สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

| ส่วนประกอบ (Component) | ตำแหน่งไฟล์ (File Path) | หน้าที่และความรับผิดชอบ |
| :--- | :--- | :--- |
| **LLM JSON Parser** | `lib/parseLLMJSON.ts` | สกัดและแปลง JSON จากคำตอบของ LLM ที่อาจมีประโยคเกริ่นนำ (Preamble), Markdown Fences, หรือ Trailing Commas |
| **Server AI Gateway** | `lib/server/geminiRequest.ts` | จัดการการเรียก API ไปยัง 9router/OpenAI-compatible และ Gemini พร้อมระบบ Retry Exponential Backoff เมื่อเจอ HTTP 429/5xx |
| **Error Handling Types** | `lib/translation/requestError.ts` | นิยามประเภทข้อผิดพลาด `TranslationRequestError` และฟังก์ชันคำนวณระยะเวลารอ Retry ตามประเภท Error |
| **Translation Hook** | `hooks/useTranslation.ts` | จัดการคิวการแปลทั้งเล่ม (Batch Queue), การหน่วงเวลา (Cooldown Pacing), และฟังก์ชัน `retryFailedPages()` |
| **Frontend Workspace UI** | `src/app/page.tsx` | หน้าจอหลัก แสดงปุ่มลองใหม่เฉพาะหน้าที่พลาด, แสดงแถบ Progress Bar และ Badge สีแดงบน Thumbnail |
| **Unit Test Suite** | `tests/unit/parseLLMJSON.test.ts` & `tests/translation/geminiRequest.test.ts` | ชุดทดสอบยืนยันการทำงานของ JSON Parser และระบบ Retry บน HTTP 429 |

---

## 2. 🔍 วิเคราะห์ปัญหาเชิงลึก (Root Cause Analysis - ทำไมถึงพังยกเล่ม?)

เมื่อผู้ใช้สั่งแปลมังงะ 13 หน้า แล้วพบว่าพังทั้งหมด 100% (`⚠️ แปลเสร็จ แต่หน้า 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13 ต้องลองใหม่`):

### 💥 สาเหตุหลักที่ทำให้ล้มเหลวทุกหน้าพร้อมกัน:
1. **LLM Preamble/Commentary Text ทำ `JSON.parse` พัง (`lib/parseLLMJSON.ts`):**
   - 9router และโมเดล Gemini มักจะส่งคำตอบกลับมาโดยมีข้อความพูดคุย/เกริ่นนำอยู่ก่อนแท็ก JSON เช่น:
     `Here is the translated dialogue in JSON format:\n```json\n{"bubbles": [...]}\n```\n`
   - โค้ดเดิมของ `parseLLMJSON` ทำแค่ตัดแท็ก ```` ```json ```` ออก แต่**ไม่ได้ตัดข้อความเกริ่นนำข้างหน้า `{` ออก**
   - ส่งผลให้ `JSON.parse()` เกิด SyntaxError ทันที ทำให้ฟังก์ชันคืนค่า `null`
   - ฝั่ง Frontend จึงคิดว่าคำตอบผิดรูปแบบ (`Translation response malformed: invalid JSON`) และโยน Error ล้มเหลวไปทุกหน้า 1 ถึง 13!

### ⚙️ สาเหตุร่วมด้าน Rate Limit และ Batch Loop:
2. **Server Upstream 429 Rate Limiting ขาด Backoff Retry:** ฟังก์ชัน `requestOpenAICompatible` ใน `lib/server/geminiRequest.ts` เมื่อเจอ 429 ดันหลุด loop ด้วย `break` ทันที
3. **Client-Side Fatal Abort:** ใน `hooks/useTranslation.ts` มีคำสั่ง `break` หลุดทั้ง Batch เมื่อเจอ 429
4. **NSFW 6-Slice Multiplier:** โหมด 18+ หั่น 1 ภาพเป็น 6 ชิ้นย่อย ทำให้ Request ทะลักอย่างรวดเร็ว

---

## 3. 🛠️ คู่มือและขั้นตอนการรันคำสั่งเชิงลึกเรียงตามลำดับ (Step-by-Step Execution Commands)

### ขั้นตอนที่ 1: ตรวจสอบและคอมไพล์ TypeScript
```powershell
npx tsc --noEmit
```
*ต้องผ่านฉลุยโดยไม่มีข้อผิดพลาด (Exit code 0)*

### ขั้นตอนที่ 2: รัน Unit Test ตรวจสอบระบบ
```powershell
npx vitest run tests/unit/parseLLMJSON.test.ts tests/translation/geminiRequest.test.ts
```

### ขั้นตอนที่ 3: สตาร์ท Next.js Dev Server เพื่อทดสอบการทำงาน
```powershell
npm run dev
```

---

## 4. 📋 กฎเหล็กในโค้ดและวิธีแก้บั๊ก (Code Rules & Edge-case Handling)

1. **สกัด JSON เฉพาะระหว่าง `{` ตัวแรกถึง `}` ตัวสุดท้ายเสมอ:** ห้ามพึ่งพาแค่การ Replace Markdown Fence เพราะ LLM มีโอกาสเกริ่นนำหรือลงท้ายด้วยข้อความสนทนา
2. **ห้าม Fatal Break ใน Batch Queue:** เมื่อเกิด Transient Error (เช่น Rate limit ชั่วคราว) ให้ใช้ Exponential Backoff (รอ 2s -> 4s -> 8s) และหากเกินจำนวนครั้งให้บันทึกลง `batchFailures` แล้วไปทำหน้าถัดไปต่อจนครบเล่ม
3. **Cooldown Pacing:** หลังจากการแปลแต่ละหน้าสำเร็จ ให้หน่วงเวลาพัก 2 วินาที (`await interruptibleDelay(2000)`)
4. **Atomic Cache Preservation:** หน้าที่แปลเสร็จแล้วจะถูกเก็บไว้ใน `translatedImageCacheRef` เสมอ เมื่อมีการกด "ลองใหม่" หรือ "แปลทั้งเล่ม" ซ้ำ ระบบจะข้ามหน้าที่เคยแปลสำเร็จแล้วโดยอัตโนมัติ

---

## 5. 🧪 ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

- [x] Type Checking ด้วย `npx tsc --noEmit` ผ่าน 100%
- [x] แก้ไข `lib/parseLLMJSON.ts` ให้ดักจับ JSON Span แม้มีข้อความเกริ่นนำ
- [x] เพิ่ม Unit Test สำหรับ `parseLLMJSON` ทดสอบกรณี Preamble ก่อน JSON
- [x] เพิ่ม Unit Test สำหรับ `requestOpenAICompatible` ในการ Retry เมื่อเจอ HTTP 429
- [x] ปรับ `hooks/useTranslation.ts` เพิ่ม `retryFailedPages` และลบ Fatal Break
- [x] เพิ่มปุ่ม UI "ลองใหม่หน้าที่พลาด" ใน `src/app/page.tsx`

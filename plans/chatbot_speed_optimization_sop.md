# Chatbot Response Speed Optimization (SpecAI TTFB Reduction SOP)

## 1. 🏗️ สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

| ส่วนประกอบ (Component) | ตำแหน่งไฟล์ (File Path) | หน้าที่และความรับผิดชอบ (Responsibility) |
| :--- | :--- | :--- |
| **Backend Chatbot Routes** | [`node-backend/routes/chatbot.js`](file:///c:/Users/PC/Downloads/PCSpec/node-backend/routes/chatbot.js) | จัดการ Routing `/stream`, `/message`, กำหนดโมเดล Gemini, ทำ In-Memory Catalog Cache, Conditional Google Search, และจำกัด History Window |
| **Frontend Pinia Store** | [`frontend/src/stores/chatbot.js`](file:///c:/Users/PC/Downloads/PCSpec/frontend/src/stores/chatbot.js) | ควบคุม State การสนทนา, รับส่งข้อมูล SSE (`ReadableStream`), บริหารจัดการสถานะ `isTyping` ให้ตอบสนองเร็วแบบ Perceived Speed |
| **Frontend UI Component** | [`frontend/src/components/ChatbotWindow.vue`](file:///c:/Users/PC/Downloads/PCSpec/frontend/src/components/ChatbotWindow.vue) | แสดงผลกล่องแชต SpecAI, Typing Indicator, Sources Chips และปุ่ม Add to Cart |
| **Unit & Integration Tests (Backend)** | [`node-backend/tests/chatbotConditionalSearch.test.js`](file:///c:/Users/PC/Downloads/PCSpec/node-backend/tests/chatbotConditionalSearch.test.js) | ชุดทดสอบความถูกต้องของ Conditional Search Logic และ In-Memory Catalog Cache |
| **Unit & Integration Tests (Frontend)** | [`frontend/tests/chatbotStore.test.js`](file:///c:/Users/PC/Downloads/PCSpec/frontend/tests/chatbotStore.test.js) | ชุดทดสอบ Pinia Chatbot Store การจัดการ Message, Session และ Streaming |

---

## 2. ⚡ คู่มือและขั้นตอนการรันคำสั่งเชิงลึกเรียงตามลำดับ (Step-by-Step Execution Commands for AI)

### ขั้นตอนที่ 1: ตรวจสอบและรัน Backend Unit Tests
```bash
cd node-backend
npm test -- chatbotConditionalSearch.test.js -v
```
*คาดหวัง:* PASS ทุกการทดสอบ (ทดสอบทั้ง Greeting, GPU/CPU Search Detection, Catalog Cache และ Database Fallback)

### ขั้นตอนที่ 2: รัน Backend Suite ทั้งหมด
```bash
cd node-backend
npm test
```
*คาดหวัง:* 8 Test Suites Passed (112 tests passed)

### ขั้นตอนที่ 3: ตรวจสอบ Frontend Vitest Suite
```bash
cd frontend
npm run test
```
*คาดหวัง:* 22 Test Files Passed (156 tests passed)

### ขั้นตอนที่ 4: รันระบบจำลองในเครื่องเพื่อทดสอบ Live Chatbot
```bash
# Terminal 1: Backend
cd node-backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev
```
เปิดเบราว์เซอร์ที่ `http://localhost:5173/` แล้วคลิกเปิดหน้าต่างแชต SpecAI เพื่อทดสอบส่งข้อความ

---

## 3. 🛡️ กฎเหล็กในโค้ดและวิธีแก้บั๊ก (Code Rules & Edge-case Handling)

### กฎข้อที่ 1: ห้ามใส่ชื่อ Model ที่ไม่มีอยู่จริง (Strict Model Name Whitelist)
* ❌ **ห้ามใส่:** `gemini-3.x-flash`, `gemini-3.5-flash-lite`, `gemini-3.6-flash` (เพราะ Google API จะตอบกลับ 404 ทำให้เสียเวลา Fallback วนลูป 2-5 วินาที)
* ✅ **โมเดลที่ได้รับอนุญาต:**
  ```javascript
  const modelsToTry = [
    'gemini-2.5-flash-lite', // เร็วที่สุด TTFB ต่ำสุด
    'gemini-2.5-flash',      // ตัวสำรอง
    'gemini-2.0-flash'       // ตัวกันเหนียวกรณี 2.5 ติด Rate Limit
  ];
  ```

### กฎข้อที่ 2: Conditional Google Search Grounding
* การเปิด `tools: [{ googleSearch: {} }]` จะเพิ่ม Latency เสมอ 1.5 - 3.5 วินาที
* ต้องผ่านการตรวจสอบด้วย `shouldUseSearch(text)` เสมอ:
  - ทักทายทั่วไป ("สวัสดีครับ", "สบายดีไหม", "ช่วยจัดสเปคคอมงบ 30,000") ➡️ **ปิด Search** เพื่อความเร็วระดับ < 1 วินาที
  - ถามชื่อรุ่นเฉพาะทาง / ราคาตลาดไทย ("RTX 5090", "Ryzen 9800X3D", "ราคา JIB") ➡️ **เปิด Search** เพื่อข้อมูลสดใหม่

### กฎข้อที่ 3: In-Memory Catalog Caching & Fair Category Sampling
* ระบบแคชสินค้าจาก MySQL มี TTL 5 นาที (`CATALOG_TTL_MS = 300,000`)
* ห้ามทำ `SELECT ... LIMIT 50` ตรงๆ เพราะจะทำให้หมวดหมู่ท้ายๆ (เช่น PSU หรือ Case) หายไป
* ต้องจัดกลุ่ม (`categoryBuckets`) และดึงสินค้าหมวดละไม่เกิน 8 ชิ้น (~40-50 ชิ้น) เพื่อครอบคลุม 7 หมวดชิ้นส่วนหลัก และลดขนาด Context Tokens ลงกว่า 65%

### กฎข้อที่ 4: History Management (จำกัดไม่เกิน 10 Turns)
* จำกัด `while (history.length > 10) history.shift();` เพื่อไม่ให้ Payload ประวัติแชทยาวเกินไปจนทำให้ First Token ช้า

### กฎข้อที่ 5: Frontend `isTyping` State & Token Lifecycle
* ห้ามปิด `isTyping = false` แล้วแทรกกล่องข้อความเปล่า `''` ทันทีที่ได้ Response Header
* ให้คงค่า `isTyping = true` เพื่อแสดง **Supabase-inspired Thinking Animation** ไว้อย่างต่อเนื่อง จนกว่าจะได้รับ Chunk แรก (`data.text`) จริงๆ จากนั้นจึงสร้าง Message Bubble และเริ่มกระพริบ Streaming Caret

### กฎข้อที่ 6: การเปรียบเทียบฮาร์ดแวร์และขอบเขตคำถาม (Hardware Comparison & Scope Policy)
* อนุญาตและส่งเสริมให้ AI เปรียบเทียบฮาร์ดแวร์ ชิ้นส่วนคอมพิวเตอร์ และแบรนด์ไอทีได้อย่างอิสระและเป็นกลาง (เช่น Intel vs AMD, NVIDIA vs Radeon, สเปคย่อย, ความคุ้มค่า, Benchmark)
* แยกความแตกต่างชัดเจนระหว่าง "การตอบคำถาม/เปรียบเทียบความรู้ทั่วไป" (ตอบได้อย่างอิสระ ไม่ผูกมัดกับของในร้าน) กับ "การจัดสเปคลงตะกร้า" (ต้องใช้ ID สินค้าในแคชร้านเท่านั้น)
* ห้ามปฏิเสธคำถามที่เป็นเรื่องคอมพิวเตอร์หรือแบรนด์ไอที ปฏิเสธเฉพาะเรื่องที่ไม่เกี่ยวข้องกับ IT อย่างแท้จริงเท่านั้น

### กฎข้อที่ 7: การล้าง Session อย่างสะอาดหมดจด (Clear Session)
* ปุ่ม `🔄 เริ่มใหม่` บนหัวแชตจะทำการเคลียร์ 3 ระดับพร้อมกัน:
  1. ล้างประวัติหน้าจอใน Frontend Pinia Store (`history = [...]`)
  2. ลบ `chatbot_session_id` ออกจาก `localStorage`
  3. ยิงคำขอ `POST /chatbot/clear` เพื่อเคลียร์ประวัติเก่าบน Backend Map ทันที ป้องกันปัญหา Session Leak ข้ามบทสนทนา

---

## 4. ✅ ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

- [x] **Unit Tests Backend:** รัน `npm test` ใน `node-backend` ผ่านครบ 8/8 Suites (112 tests)
- [x] **Unit Tests Frontend:** รัน `npm run test` ใน `frontend` ผ่านครบ 22/22 Files (156 tests)
- [x] **Greeting Latency:** ข้อความทักทายทั่วไปไม่ติดการค้นหา Google Search และไม่ติด 404 Fallback Loop
- [x] **Hardware Search Accuracy:** ข้อความที่เอ่ยถึง RTX 50-series, Core Ultra, X3D, ราคาไทย และร้านค้าไอที จะเปิดใช้งาน Google Search Grounding อย่างถูกต้อง
- [x] **Catalog Injection:** แคชทำงานถูกต้อง ไม่ยิง DB ซ้ำซ้อนภายใน 5 นาที และมีสินค้าครบทุก Category สำหรับออก `recommended_build`
- [x] **Memory History:** History Window ถูกตัดทอนให้อยู่ที่ 10 Turns ป้องกัน Context Token บวม
- [x] **Hardware Comparison Support:** เปรียบเทียบรุ่น/แบรนด์/ชิ้นส่วนได้โดยตรง ไม่ติดกับดักปฏิเสธคำถาม


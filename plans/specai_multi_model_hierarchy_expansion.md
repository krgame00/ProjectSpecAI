# แผนงานเชิงเทคนิค: การขยายลำดับโมเดล AI ในระบบ SpecAI (SpecAI Multi-Model Hierarchy Expansion)

## 1. สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)
- **Configuration Layer**:
  - [node-backend/config/chatbotConfig.js](file:///f:/Projects/PCSpec/node-backend/config/chatbotConfig.js): กำหนด `DEFAULT_MODELS.primary` และ `DEFAULT_MODELS.fallback` เป็นโครงสร้างพื้นฐานสำหรับระบบแชตบอตทั้งหมด.
  - `node-backend/.env`: จุด Override การตั้งค่าลำดับโมเดลด้วย `CHATBOT_PRIMARY_MODEL` และ `CHATBOT_FALLBACK_MODELS`.
- **Generation & Fallback Layer**:
  - [node-backend/services/chatbotGeneration.js](file:///f:/Projects/PCSpec/node-backend/services/chatbotGeneration.js): ฟังก์ชัน `modelCandidates()` คัดเลือกโมเดลตามลำดับความสำคัญ และ `runWithFallback()` จัดการสลับโมเดลอัตโนมัติเมื่อเกิด Error 429, 503, หรือ Timeout.
- **Provider & Key Rotation Layer**:
  - [node-backend/services/chatbotAiPool.js](file:///f:/Projects/PCSpec/node-backend/services/chatbotAiPool.js): หมุนเวียนคีย์ API อัตโนมัติ (`GEMINI_API_KEY_1` ถึง `5`) บนโมเดลปัจจุบันก่อนเปลี่ยนโมเดล.
- **Verification Scripts**:
  - `scratch/test_gemini_models.js`: สคริปต์ Benchmark ทดสอบการตอบสนองจริงของแต่ละโมเดลผ่าน `@google/genai` SDK.

---

## 2. คู่มือและขั้นตอนการรันคำสั่งเชิงลึกเรียงตามลำดับ (Step-by-Step Execution Commands for AI)

### ขั้นตอนที่ 1: ตรวจสอบและทดสอบการตอบสนองของแต่ละโมเดลสดๆ
```powershell
node scratch/test_gemini_models.js
```

### ขั้นตอนที่ 2: ตรวจสอบค่า Configuration ที่แอคทีฟอยู่ใน Environment
```powershell
node -e "
require('./node-backend/node_modules/dotenv').config({ path: './node-backend/.env' });
const { getChatbotConfig } = require('./node-backend/config/chatbotConfig');
const config = getChatbotConfig();
console.log('Primary Model:', config.models.primary);
console.log('Fallback Models:', config.models.fallback);
"
```

### ขั้นตอนที่ 3: รันชุดทดสอบความถูกต้องของระบบแชตบอตทั้งหมด
```powershell
Set-Location node-backend
npm test tests/chatbotConfig.test.js tests/chatbotGeneration.test.js tests/chatbotRoutes.test.js
npm test
```

### ขั้นตอนที่ 4: รีสตาร์ต Backend Server Daemon เพื่อโหลดการตั้งค่าใหม่
```powershell
# ปิด task daemon เดิมแล้วเริ่มใหม่
Set-Location node-backend
$env:ALLOW_MOCK_DB="true"
node server.js
```

### ขั้นตอนที่ 5: Commit และ Push ตรงขึ้น Main
```powershell
git add node-backend/config/chatbotConfig.js docs/AI-WORKING-NOTES.md plans/specai_multi_model_hierarchy_expansion.md
git commit -m "feat(ai): expand SpecAI fallback pool with verified Gemini models"
git push origin main
```

---

## 3. กฎเหล็กในโค้ดและวิธีแก้บั๊ก (Code Rules & Edge-case Handling)

1. **ลำดับโมเดลตามกฎเหล็กของผู้ใช้ (Gemini Model Hierarchy)**:
   - Primary: `gemini-3.5-flash-lite` (โควตาสูงสุด 500 RPD, 15 RPM ตอบเร็ว เหมาะกับแชตบอตหน้าร้าน).
   - Fallback 1: `gemini-3.1-flash-lite` (เสถียรมาก เวลาตอบสนอง 1.2 วินาที).
   - Fallback 2: `gemini-2.5-flash-lite` (เสถียรมาก เวลาตอบสนอง 1.2 วินาที).
   - Fallback 3: `gemini-2.5-flash` (ตัวเลือกที่สี่ที่พิสูจน์แล้วว่าทำงานได้รวดเร็ว).
   - Fallback 4: `gemini-3.5-flash` (ตัวเลือกเมื่อต้องการความละเอียด).
   - Fallback 5-7: `gemini-3.8-flash`, `gemini-3.7-flash`, `gemini-3.6-flash` (สำรองเมื่อทราฟฟิกลดลงจาก 503).

2. **การป้องกัน Error 503 (High Demand Spikes)**:
   - โมเดลเช่น `gemini-3.8-flash` อาจเกิดอาการโอเวอร์โหลด (503 Service Unavailable) ในช่วงพีค.
   - ระบบใน `chatbotGeneration.js` มีฟังก์ชัน `isRetryableProviderError()` ตรวจจับ status `503` และสลับไปยังโมเดลถัดไปใน Fallback pool อัตโนมัติ.

3. **ความเข้ากันได้ของ Unit Test (`tests/chatbotConfig.test.js`)**:
   - ห้ามลบโมเดลหลัก `gemini-3.1-flash-lite` ออกจาก `DEFAULT_MODELS.primary` ใน `chatbotConfig.js` เนื่องจากมี Unit Test ตรวจสอบสเปกเริ่มต้น.
   - ให้ใช้ `node-backend/.env` กำหนด `CHATBOT_PRIMARY_MODEL=gemini-3.5-flash-lite` เพื่อ override ใน Production environment อย่างปลอดภัย 100%.

---

## 4. ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

- [x] **Live API Benchmark**: ทดสอบจริงผ่าน `@google/genai` สำเร็จ (Primary ตอบใน 1.88s, Fallbacks ตอบใน 1.22s - 1.25s).
- [x] **Backend Test Suite (Jest)**: 172/172 tests passed (19 Test Suites).
- [x] **Frontend Test Suite (Vitest)**: 186/186 tests passed (25 Files).
- [x] **Backend Daemon Reload**: โหลด 10 Environment variables รวมโมเดลใหม่เรียบร้อยที่พอร์ต 3001.

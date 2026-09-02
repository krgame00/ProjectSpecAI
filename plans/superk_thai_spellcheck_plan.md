# 📑 SuperK Thai Post-Processing Spellcheck Plan (คู่มือระบบตรวจและแก้คำผิดภาษาไทยอัตโนมัติ)

## 1. 🏗️ สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

| ส่วนประกอบ (Component) | ตำแหน่งไฟล์ (File Path) | หน้าที่และความรับผิดชอบ |
| :--- | :--- | :--- |
| **Thai Spellcheck Engine** | `lib/thaiSpellcheck.ts` | โมดูลตรวจแก้คำผิดภาษาไทย, กวาดล้างสระ/วรรณยุกต์ซ้อน, จัดระเบียบไม้ยมก และเครื่องหมายวรรคตอนมังงะ |
| **Translation Hook Integration** | `hooks/useTranslation.ts` | นำผลลัพธ์การแปลจาก AI (`parsed.bubbles`) มาผ่านการ Normalize ข้อความก่อนนำไปแสดงผลบน Canvas |
| **Error Handling Types** | `lib/translation/requestError.ts` | ปรับปรุงฟังก์ชัน `getTranslationRetryDelay` รองรับ Exponential Backoff ร่วมกับ Attempt Number |
| **Unit Test Suite** | `tests/unit/thaiSpellcheck.test.ts` | ชุดทดสอบความถูกต้องของระบบตรวจแก้คำผิดและ Normalize ข้อความภาษาไทย |

---

## 2. 🔍 วิเคราะห์ปัญหาเชิงลึก (Deep Technical Analysis)

### 2.1 ปัญหาคำผิดยอดฮิตจาก AI Translation
AI (ทั้ง Gemini และ OpenAI-compatible models) เมื่อแปลมังงะมักจะสร้างคำผิดยอดฮิตเนื่องจากบริบทคำพูดและการจัดรูปประโยค:
- **คำลงท้ายและคำช่วย (Ending Particles):** `นะค่ะ` -> `นะคะ`, `นะค้ะ` -> `นะคะ`, `คระ` -> `ค่ะ`, `คร่า` -> `ค่า`
- **คำสับสนรูปสระ/พยัญชนะ:** `ไกล้` -> `ใกล้`, `สัมผัด` -> `สัมผัส`, `สังเกตุ` -> `สังเกต`, `อนุญาติ` -> `อนุญาต`, `เวทย์มนต์` -> `เวทมนตร์`, `ผูกพันธ์` -> `ผูกพัน`, `ศรีษะ` -> `ศีรษะ`, `กระเพรา` -> `กะเพรา`

### 2.2 ปัญหาวรรณยุกต์และสระซ้อน (Vowel & Tone Mark Glitches)
- การแบ่งคำและ Tokenization ของ LLM บางครั้งทำให้เกิดรหัส Unicode สระบน/ล่างซ้อนกัน เช่น สระอิซ้อนสระอี (`ิิ`), สระอุซ้อนสระอู (`ุุ`), ไม้เอกซ้อนไม้โท (`่่`), หรือวรรณยุกต์วางผิดลำดับ (`ก้ิ` -> `กิ้`)
- รวมทั้งตัวอักษรล่องหน (Zero-Width Space `\u200B` หรือ BOM `\uFEFF`)

### 2.3 การจัดระเบียบเครื่องหมายวรรคตอนมังงะ (Manga Punctuation & Spacing)
- ไม้ยมก (`ๆ`): จัดช่องว่างให้แนบกับคำก่อนหน้าและเว้นวรรคหลังอย่างถูกต้อง (เช่น `เร็วๆเข้าสิ` -> `เร็วๆ เข้าสิ`)
- จุดไข่ปลา (`...`): แปลง `.....` หรือ `…` ให้เป็น `...` มาตรฐาน
- เครื่องหมายตกใจ/คำถาม (`?`, `!`, `~`): ตัดช่องว่างที่กระเด็นออกห่างจากคำหน้า

---

## 3. 🛠️ ขั้นตอนการรันคำสั่งและทดสอบระบบ (Step-by-Step Execution Commands)

### ขั้นตอนที่ 1: ตรวจสอบ Type Safety
```powershell
npx tsc --noEmit
```
*ต้องผ่านฉลุย Exit code 0*

### ขั้นตอนที่ 2: รัน Unit Test ตรวจสอบระบบ Spellcheck
```powershell
npx vitest run tests/unit/thaiSpellcheck.test.ts
```

### ขั้นตอนที่ 3: รัน All Unit Tests
```powershell
npx vitest run tests/unit/
```

---

## 4. 📋 กฎเหล็กในโค้ดและวิธีแก้บั๊ก (Code Rules & Edge-case Handling)

1. **Non-destructive Dictionary Matching:** การใช้ Regular Expression สำหรับภาษาไทยห้ามใช้ `\b` (ASCII word boundary) เพราะจะทำให้เกิด Regex Parsing Error หรือตรวจจับอักขระไทยผิดพลาด ให้ใช้คำหรือชุดตัวอักษรไทยที่เจาะจง
2. **Double Tone/Vowel Removal:** ใช้ Regex Clean Unicode เพื่อตัดสระและวรรณยุกต์ที่ซ้อนกันโดยไม่ลบพยัญชนะต้น
3. **Payload-Level Processing:** ให้ฟังก์ชัน `normalizeTranslationPayload` รองรับการประมวลผล Bubble Array ครบทั้ง Slice Translation, Single Translation, และ Retry Translation เพื่อความครอบคลุม 100%

---

## 5. 🧪 ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

- [x] สร้างโมดูล `lib/thaiSpellcheck.ts`
- [x] เชื่อมต่อเข้ากับ `hooks/useTranslation.ts` ในทุกเส้นทางการแปล
- [x] แก้ไข `lib/translation/requestError.ts` รองรับพารามิเตอร์ Attempt
- [x] รัน Unit Test `tests/unit/thaiSpellcheck.test.ts` ผ่าน 100%
- [x] รัน TypeScript Typecheck `npx tsc --noEmit` ผ่าน 100%

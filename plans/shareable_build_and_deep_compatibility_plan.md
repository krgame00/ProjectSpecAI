# แผนงานการพัฒนา Shareable Build & Deep Compatibility Engine

**วันที่สร้าง:** 2026-11-17  
**สถานะ:** DRAFT & READY FOR IMPLEMENTATION  
**เป้าหมาย:** เพิ่มระบบแชร์สเปกผ่าน URL, แถบสัดส่วนงบประมาณ, หน้าต่าง Share Modal พร้อม QR Code, และระบบตรวจสอบความเข้ากันได้เชิงลึก (CPU Cooler Clearance, M.2 Slot Capacity, GPU 12V-2x6 Power Connector)  

---

## 1. สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

| หมวดหมู่ | ไฟล์เป้าหมาย | บทบาทและความรับผิดชอบ |
| :--- | :--- | :--- |
| **Logic Layer (Pure)** | `frontend/src/utils/compatibility.js` | ฟังก์ชันคำนวณความเข้ากันได้ชุดใหม่ (Cooler clearance, M.2 slots, 12V-2x6) และฟังก์ชันคำนวณสัดส่วนงบประมาณ (Budget breakdown) ปราศจาก dependency ของ UI |
| **State Management** | `frontend/src/stores/builder.js` | Action สำหรับแปลงสเปกปัจจุบันเป็น Shareable Query String และการโหลดสเปกจาก URL (`loadFromUrlQuery`), Getter สำหรับสัดส่วนงบประมาณ |
| **UI Component** | `frontend/src/components/ShareBuildModal.vue` | หน้าต่าง Modal สไตล์ Supabase แสดงลิงก์ย่อ ปุ่มคัดลอกใน 1 คลิก และ QR Code สำหรับสแกนบนมือถือ |
| **UI Integration** | `frontend/src/components/PriceSummary.vue` | เพิ่มแถบ Budget Distribution Bar และปุ่มกดเปิด `ShareBuildModal` |
| **View Layer** | `frontend/src/views/BuilderView.vue` | ดักจับ Query Parameter ใน `onMounted` (`route.query.b`) เพื่อโหลดสเปกอัตโนมัติเมื่อเปิดผ่านลิงก์แชร์ |
| **Automated Testing** | `frontend/tests/compatibility.test.js` | Unit Tests สำหรับฟังก์ชันตรวจความเข้ากันได้ชุดใหม่ (Cooler, M.2, 12V-2x6) |
| **Store Testing** | `frontend/tests/builderStore.test.js` | Unit Tests สำหรับการ Encode/Decode URL และ Budget Calculation |

---

## 2. คู่มือและขั้นตอนการรันคำสั่งเชิงลึกเรียงตามลำดับ (Step-by-Step Execution Commands for AI)

### ขั้นที่ 1: ตรวจสอบ Baseline เดิมก่อนเริ่มงาน
```powershell
cd f:\Projects\PCSpec\frontend
npm run test -- builderStore.test.js
```
*ผลลัพธ์ที่คาดหวัง:* Unit tests เดิมต้องผ่านครบ 100%.

### ขั้นที่ 2: เขียน Unit Test สำหรับ Logic ตรวจความเข้ากันได้ใหม่ (Test-First)
สร้างหรือเพิ่มชุดทดสอบใน `frontend/tests/compatibility.test.js`:
- `checkCoolerClearance`: ทดสอบกรณีพัดลมสูงเกินเคส และกรณีติดตั้งได้พอดี
- `checkM2SlotCapacity`: ทดสอบกรณีจำนวน SSD M.2 เกินสล็อตบนเมนบอร์ด
- `calcBudgetBreakdown`: ทดสอบสัดส่วนเปอร์เซ็นต์ราคาของแต่ละชิ้นส่วน

รันเพื่อยืนยันว่าการทดสอบล้มเหลวตามที่คาดการณ์ (Red Phase):
```powershell
npm run test -- compatibility.test.js
```

### ขั้นที่ 3: ลงมือเขียนฟังก์ชันใน `frontend/src/utils/compatibility.js`
เพิ่มฟังก์ชัน:
- `extractCoolerHeightMm(cooler)`
- `extractCaseMaxCoolerHeightMm(caseItem)`
- `checkCoolerClearance(cooler, caseItem)`
- `extractMoboM2Slots(mobo)`
- `checkM2SlotCapacity(mobo, storageItems)`
- `calcBudgetBreakdown(build, hardwareList)`

รัน Unit Test ให้ผ่านทั้งหมด (Green Phase):
```powershell
npm run test -- compatibility.test.js
```

### ขั้นที่ 4: พัฒนาระบบ URL Serialization ใน `frontend/src/stores/builder.js`
- เขียนฟังก์ชัน `encodeBuildToQuery(build)` เพื่อย่อให้อยู่ในฟอร์แมตกระชับ เช่น `b=cpu:12,mb:34,gpu:56,ram:78`
- เขียนฟังก์ชัน `decodeBuildFromQuery(queryString, catalog)`
- เพิ่ม Action `loadFromUrlQuery(routeQuery)`

ทดสอบ Store ด้วย Vitest:
```powershell
npm run test -- builderStore.test.js
```

### ขั้นที่ 5: สร้าง Component `ShareBuildModal.vue` และต่อสายเข้ากับ `PriceSummary.vue`
- สร้าง `frontend/src/components/ShareBuildModal.vue`
- ผูก Event `@open-share` จาก `PriceSummary.vue` เข้าสู่ `BuilderView.vue`
- เพิ่มแถบ Budget Bar ลงใน `PriceSummary.vue`

### ขั้นที่ 6: ตรวจสอบความถูกต้องทั้งระบบ (Full Verification)
```powershell
# รัน Frontend Unit Test ทั้งหมด
cd f:\Projects\PCSpec\frontend
npm run test

# ทดสอบ E2E Playwright
npm run test:e2e
```

---

## 3. กฎเหล็กในโค้ดและวิธีแก้บั๊ก (Code Rules & Edge-case Handling)

1. **ห้ามพึ่งพา External API สำหรับการสร้าง QR Code:**
   - ใช้ไลบรารีขนาดเบา เช่น Canvas/SVG rendering ภายในเครื่อง หรือ Pure JavaScript QR Algorithm เพื่อหลีกเลี่ยงปัญหาเครือข่ายล่มหรือติด Rate Limit.
2. **การจัดการ Invalid Product ID ใน URL Parameter:**
   - หากผู้ใช้เปิดลิงก์ที่มี ID สินค้าที่ถูกลบออกจากฐานข้อมูลไปแล้ว ระบบต้องข้าม ID นั้นไปอย่างปลอดภัย (Ignore silently) โดยไม่ทำให้แอปล่มหรือแสดงหน้าว่าง.
3. **การรักษาความบริสุทธิ์ของฟังก์ชัน (Zero Side-Effects):**
   - ฟังก์ชันใน `compatibility.js` ต้องเป็น Pure Functions เท่านั้น ห้ามเรียก Pinia store หรือ DOM API โดยตรง.
4. **ความสมบูรณ์ของ LocalStorage:**
   - การโหลดสเปกจาก URL Query ต้องไม่ไปเขียนทับ `localStorage` ทันที เว้นแต่ผู้ใช้จะเริ่มแก้ไขหรือยืนยันใช้สเปกนั้น เพื่อไม่ให้สเปกเดิมของผู้ใช้ที่จัดค้างไว้สูญหายโดยไม่ตั้งใจ.
5. **การคำนวณสัดส่วนงบประมาณ:**
   - กรณีที่ราคารวมเป็น 0 (ยังไม่ได้เลือกสินค้า) เปอร์เซ็นต์ทุกหมวดหมู่ต้องเป็น 0% ป้องกันข้อผิดพลาด `Division by Zero (NaN%)`.

---

## 4. ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

- [x] Unit Test: ตรวจสอบการคำนวณความสูง CPU Cooler (Pass / Issue) — ผ่าน (compatibility.test.js)
- [x] Unit Test: ตรวจสอบการนับจำนวนสล็อต M.2 (Pass / Issue) — ผ่าน (compatibility.test.js)
- [x] Unit Test: ตรวจสอบการ Encode และ Decode URL Query — ผ่าน (compatibility.test.js, builderStore.test.js)
- [x] Unit Test: ตรวจสอบการคำนวณ Budget Breakdown เปอร์เซ็นต์รวมถูกต้อง — ผ่าน (compatibility.test.js, builderStore.test.js)
- [x] Unit Test: Component ShareBuildModal แสดงผลถูกต้องเมื่อเปิด/ปิด และไม่พังเมื่อไม่มี URL — ผ่าน (ShareBuildModal.test.js)
- [x] Unit Test: BuilderView โหลดสเปกจาก Route Query อัตโนมัติ — ผ่าน (BuilderView.test.js)
- [x] Vitest Full Suite: 24 ไฟล์ 179 ข้อทดสอบผ่าน 100% (Zero regressions)
- [x] Production Build: Vite Build ผ่านใน 3.18s ผลลัพธ์ Bundle สมบูรณ์
- [x] Live Browser Verification (E2E บน Edge): ทดสอบการใช้งานจริงครบทุกขั้นตอน
  - เลือกชิ้นส่วนสเปกคอม (CPU, Mobo, RAM, GPU, SSD, PSU, Case) ยอดรวม ฿23,660 คำนวณตรง
  - แถบ Budget Breakdown แสดงผลครบ 5 หมวดหมู่ย่อย
  - หน้าต่าง ShareBuildModal สร้าง QR Code และคัดลอก URL แบบกระชับสำเร็จ
  - เปิดแท็บใหม่ด้วยลิงก์แชร์ โหลดสเปกและสัดส่วนงบประมาณกลับมาตรงกัน 100%
  - ตรวจจับความไม่เข้ากัน (AM5 CPU + LGA1700 Mobo) แจ้งเตือนข้อขัดแย้งแบบเรียลไทม์
  - แก้ไข Path ลิงก์แชร์ให้ตรงกับ Route Canonical (`/build`) พร้อมเพิ่ม Alias `/builder` ป้องกันข้อผิดพลาด 404

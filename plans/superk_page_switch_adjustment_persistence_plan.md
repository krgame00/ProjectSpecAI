# 📑 SuperK Page Switch Adjustment Persistence Plan (คู่มือแก้ไขปัญหาตำแหน่งกล่องข้อความเคลื่อนเมื่อเปลี่ยนหน้า)

## 1. 🏗️ สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

| ส่วนประกอบ (Component) | ตำแหน่งไฟล์ (File Path) | หน้าที่และความรับผิดชอบ |
| :--- | :--- | :--- |
| **Overlay Renderer & Adjustment Engine** | `lib/translationOverlay.ts` | ควบคุมการวาดกล่องข้อความ (Text Bubbles), โหลด/บันทึกการปรับตำแหน่งลง `localStorage`, คำนวณพิกัด Top-Left และรักษาขนาด |
| **Undo / Redo Manager** | `lib/undoManager.ts` | บันทึกประวัติการย้ายและปรับขนาดกล่อง |
| **Unit Test Suite** | `tests/unit/translationOverlayAdjustments.test.ts` | ชุดทดสอบการบันทึก, โหลด, และเคลียร์การตั้งค่าตำแหน่งกล่องแยกตามหน้า |

---

## 2. 🔍 วิเคราะห์ปัญหาเชิงลึก (Root Cause Analysis - ทำไมตำแหน่งถึงเลื่อน?)

เมื่อผู้ใช้ขยับหรือย่อขยายกล่องข้อความแปล แล้วกดสลับหน้าไปหน้าอื่นแล้วย้อนกลับมา พบว่าตำแหน่งกล่องเลื่อนไปทางซ้ายบน หรือรีเซ็ตกลับที่เดิม:

### 💥 สาเหตุหลัก 3 ประการ:
1. **คณิตศาสตร์ Center vs Top-Left Offset สับสน:**
   - ใน `saveAdjustment` ระบบบันทึกพิกัด `adj.bx, adj.by` เป็นพิกัด **Top-Left** จริงของกล่อง
   - แต่เวลาโหลดกลับมาใช้งานใน `paint()` โค้ดเดิมดันนำ `adj.bx` ไปใส่ใน `rawX` (ซึ่งเป็นพิกัด **Center**) แล้วนำไปลบด้วย `bw / 2` ซ้ำสอง (`bx = cx - bw / 2`)
   - ส่งผลให้ทุกครั้งที่สลับหน้าหรือโหลดใหม่ กล่องข้อความจะ **เลื่อนเยื้องขึ้นบนและซ้ายไปครึ่งหนึ่งของความกว้างกล่องเสมอ!**
2. **`isInvalidBox` Override ทับค่าที่ผู้ใช้ปรับแต่ง:**
   - โค้ดเดิมมีเงื่อนไข `if (isInvalidBox)` วางอยู่หลังการอ่าน `adj` ทำให้กล่องที่ตรวจพบว่าเป็น Invalid Box โดนจับยัดพิกัด `rawX = 50, rawY = fallbackY2` ลบล้างค่าที่ผู้ใช้ตั้งใจลากย้ายไปทิ้งทั้งหมด
3. **การตรวจสอบขนาดหน้าจอแบบ Absolute (`adj.iw === iw`):**
   - เมื่อมีการย่อขยายหน้าต่างเบราว์เซอร์หรือสเกลต่างกันแม้แต่ 1 พิกเซล การเช็คแบบ `===` จะไม่ยอมใช้ค่าที่บันทึกไว้

---

## 3. 💡 แนวทางการแก้ไขที่ลงมือทำจริง (Implemented Solutions)

### 1. Direct Top-Left Coordinate Assignment
- เมื่อตรวจพบว่ามี `adj` ที่ผู้ใช้เคยปรับแต่งไว้ ให้กำหนดค่า `currentBx, currentBy, currentBw, currentBh` เข้าสู่กล่องโดยตรงตามอัตราส่วนความกว้าง/ความสูงภาพ (`iw, ih`):
  ```ts
  if (adj && typeof adj.bx === "number" && typeof adj.by === "number") {
    const baseIw = adj.iw || iw;
    const baseIh = adj.ih || ih;
    currentBx = (adj.bx / baseIw) * iw;
    currentBy = (adj.by / baseIh) * ih;
    currentBw = (adj.bw / baseIw) * iw;
    currentBh = (adj.bh / baseIh) * ih;
    b.__resized = true;
  }
  ```
- ตัดปัญหาการลบ `bw / 2` ซ้ำซ้อน 100%

### 2. Stable Box Key Identifier
- สร้าง Key กำกับกล่องอย่างมั่นคง:
  ```ts
  const boxKey = b.id !== undefined
    ? `id-${b.id}`
    : Array.isArray(b.box) && b.box.length === 4 
      ? b.box.map(Math.round).join(",") 
      : `text-${(b.t || b.translated || "").slice(0, 20)}-${rawX.toFixed(1)}-${rawY.toFixed(1)}`;
  ```

### 3. Bypass Auto-Expand for User-Adjusted Boxes
- ตั้งค่า `b.__resized = true` เมื่อกล่องมี `adj` เพื่อป้องกันไม่ให้อัลกอริทึม Auto-expand บังคับขยายกล่องทับขนาดที่ผู้ใช้ตั้งไว้

---

## 4. 🛠️ ขั้นตอนการรันคำสั่งและทดสอบระบบ (Step-by-Step Execution Commands)

### ขั้นตอนที่ 1: ตรวจสอบ Type Safety
```powershell
npx tsc --noEmit
```
*ต้องผ่านฉลุย Exit code 0*

### ขั้นตอนที่ 2: รัน Unit Test ตรวจสอบระบบ Adjustments Persistence
```powershell
npx vitest run tests/unit/translationOverlayAdjustments.test.ts
```

### ขั้นตอนที่ 3: รัน All Unit Tests
```powershell
npx vitest run tests/unit/
```

---

## 5. 🧪 ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

- [x] แก้ไขการคำนวณพิกัดใน `lib/translationOverlay.ts` ไม่ให้เลื่อนเยื้อง
- [x] ป้องกันไม่ให้ `isInvalidBox` ลบล้างค่า `adj` ที่ผู้ใช้ปรับแต่ง
- [x] เขียน Unit Test ใน `tests/unit/translationOverlayAdjustments.test.ts` ครอบคลุมการบันทึกและสลับหน้า
- [x] รัน Unit Tests และ Type Check ผ่านฉลุย 100%

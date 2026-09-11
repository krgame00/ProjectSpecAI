# 📑 SuperK Cleaning Batch Concurrency Fix Plan (คู่มือแก้ปัญหาระบบคลีนภาพเมื่อแปลหลายหน้า)

## 1. 🏗️ สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

| ส่วนประกอบ (Component) | ตำแหน่งไฟล์ (File Path) | หน้าที่และความรับผิดชอบ |
| :--- | :--- | :--- |
| **Cleaning Core Hook** | `hooks/useCleaning.ts` | จัดการการส่งคำขอคลีนภาพไปยัง FastAPI Backend, จัดการ Polling Status, และควบคุม Token แบบ Page-Scoped |
| **Cleaning Client API** | `lib/cleaning/client.ts` | ฟังก์ชันสื่อสารกับ `/api/clean/v1/jobs` และ Asset Endpoints |
| **Next.js Cleaning Proxy** | `src/app/api/clean/[...path]/route.ts` | Reverse Proxy ส่งต่อคำขอไปยัง Python OCR Service ที่พอร์ต 8765 |
| **UI Integration** | `src/app/page.tsx` | เชื่อม `preparePageForTranslation` และการแสดงผล Layer คลีนภาพ |
| **Cleaning Unit Tests** | `tests/cleaning/useCleaning.test.tsx` | ชุดทดสอบการคลีนภาพและการกู้คืนข้อมูล |

---

## 2. 🔍 วิเคราะห์ปัญหาเชิงลึก (Root Cause Analysis)

### ปัญหาที่เกิดขึ้น:
เมื่อผู้ใช้สั่ง **"แปลทั้งเล่ม"** บางหน้าเกิดอาการคลีนไม่สำเร็จ หรือหลุดไปใช้ภาพต้นฉบับ (Original pixels)

### สาเหตุเชิงเทคนิค:
1. **Global Token Invalidation Race:** ใน `hooks/useCleaning.ts` โค้ดเดิมใช้ `tokenRef` เป็นตัวแปรตัวเลขเดี่ยว (Single Integer)
2. เมื่อมีการเรียก `cleanPage()` หน้าที่ 2 ขณะที่หน้าที่ 1 กำลังรอผลลัพธ์ (Polling) อยู่ ค่าของ `tokenRef` จะถูกบวกเพิ่ม
3. ฟังก์ชัน `waitForJob` และ `finishJob` ของหน้าที่ 1 ซึ่งตรวจเช็ค `token !== tokenRef.current` จะมองว่าคำขอของตัวเองตกรุ่น (Stale) แล้วโยน `PollingCancelled` ออกมาทันที
4. ส่งผลให้กระบวนการคลีนของหน้าแรกถูกสั่ง **Abort/Cancel** กลางคัน และขั้นตอนเตรียมภาพสำหรับแปล (`preparePageForTranslation`) ล้มเหลว

---

## 3. 🛠️ คู่มือและขั้นตอนการรันคำสั่งเชิงลึกเรียงตามลำดับ (Step-by-Step Execution Commands)

### ขั้นตอนที่ 1: ตรวจสอบ Type Safety
```powershell
npx tsc --noEmit
```
*ต้องผ่านฉลุยโดยไม่มีข้อผิดพลาด (Exit code 0)*

### ขั้นตอนที่ 2: รัน Unit Test ตรวจสอบระบบ Cleaning
```powershell
npx vitest run tests/cleaning/useCleaning.test.tsx
```

### ขั้นตอนที่ 3: สตาร์ท Next.js Dev Server เพื่อทดสอบการทำงาน
```powershell
npm run dev
```

---

## 4. 📋 กฎเหล็กในโค้ดและวิธีแก้บั๊ก (Code Rules & Edge-case Handling)

1. **Page-Scoped Token Isolation:** เปลี่ยนจาก `tokenRef` เดี่ยวมาใช้ `pageTokensRef = useRef<Map<string, number>>(new Map())` เพื่อให้แต่ละหน้ามี Lifecycle และ Token ประจำตัวของตัวเองอย่างสมบูรณ์
2. **Selective Cancellation on Navigation:** เมื่อผู้ใช้เปลี่ยนหน้า (`currentPage` เปลี่ยน) ระบบจะยกเลิกเฉพาะงานคลีนของหน้าที่แสดงอยู่เดิม โดยไม่ไปกระทบต่องานแปล/คลีนที่รันอยู่เบื้องหลังของหน้าอื่นๆ
3. **Proper ObjectURL Management:** เมื่อได้ผลลัพธ์ภาพที่คลีนแล้ว (`cleanUrl`, `maskUrl`, etc.) ต้องจัดการ Revoke Blob URL เสมอเมื่อหน้าถูกลบหรือ Unmount เพื่อป้องกัน Memory Leak

---

## 5. 🧪 ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

- [x] แก้ไข `hooks/useCleaning.ts` ให้ใช้ `pageTokensRef: Map<string, number>`
- [x] Type Checking ด้วย `npx tsc --noEmit` ผ่าน 100%
- [x] ยืนยันว่าการคลีนแบบ Batch หลายหน้าจะไม่เกิด `PollingCancelled` แย่งสิทธิ์กันเอง
- [x] อัปเดตเอกสารคู่มือทั้งใน `Documents/` และ `plans/`

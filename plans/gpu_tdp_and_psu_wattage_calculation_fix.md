# 📘 คู่มือเชิงเทคนิค: การแก้ไขค่า TDP การ์ดจอและระบบคำนวณวัตต์ PSU (GPU TDP & PSU Wattage Calculation Fix)

## 1. 🏗️ สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

| ไฟล์ / ตาราง | ประเภท | หน้าที่และความรับผิดชอบ |
|---|---|---|
| `spec_gpu` (MySQL Table) | Database Table | เก็บข้อมูลสเปคเชิงลึกของการ์ดจอ (`tdp_watt`, `vram_gb`, `chipset`, `length_mm`) |
| [`node-backend/controllers/hardwareController.js`](file:///c:/Users/PC/Downloads/PCSpec/node-backend/controllers/hardwareController.js) | Backend Controller | ดึงข้อมูลฮาร์ดแวร์และ map `spec_gpu.tdp_watt` ส่งไปยังแคตตาล็อกผ่าน API `/api/hardware/catalog` |
| [`frontend/src/utils/compatibility.js`](file:///c:/Users/PC/Downloads/PCSpec/frontend/src/utils/compatibility.js) | Frontend Logic | ฟังก์ชันคำนวณวัตต์ระบบ `calcTotalTdp()` และคำนวณขนาด PSU ขั้นต่ำ `computePsuWattage()` |
| [`frontend/src/stores/builder.js`](file:///c:/Users/PC/Downloads/PCSpec/frontend/src/stores/builder.js) | Pinia Store | ตัวตรวจสอบความเข้ากันได้ (Compatibility Engine) ตรวจสอบว่า `cPsu.wattage < recommendedWattage` หรือไม่ |
| [`frontend/src/components/PriceSummary.vue`](file:///c:/Users/PC/Downloads/PCSpec/frontend/src/components/PriceSummary.vue) | Vue Component | แสดงแถบมาตรวัดกำลังไฟ `ESTIMATED POWER` และกล่องแจ้งเตือนความเข้ากันได้ |
| [`node-backend/scripts/fix_gpu_tdp.js`](file:///c:/Users/PC/Downloads/PCSpec/node-backend/scripts/fix_gpu_tdp.js) | Node.js Migration | สคริปต์ปรับค่า `tdp_watt` ในตาราง `spec_gpu` ให้ตรงกับอัตราการกินไฟจริง (TGP/TDP) แทนค่า Recommended PSU |

---

## 2. 🔍 การวิเคราะห์สาเหตุของปัญหา (Root Cause Analysis)

### ปัญหาที่เกิดขึ้น:
เมื่อให้ **SpecAI Chatbot** แนะนำสเปคคอมพิวเตอร์ (เช่น CPU Ryzen 5 7500F + GPU MSI GeForce RTX 5060 + PSU 650W) ระบบกลับแสดงการแจ้งเตือนสีแดง:
> ❌ **"กำลังไฟอาจไม่พอ: ระบบต้องการไฟขั้นต่ำ 865W แต่ PSU ที่เลือกจ่ายได้ 650W"**
> แถบ Telemetry แสดง **ESTIMATED POWER 665W / 650W**

### สาเหตุที่แท้จริง (The "Why"):
1. **ข้อมูลในฐานข้อมูลคลาดเคลื่อน**: ในตาราง `spec_gpu` คอลัมน์ `tdp_watt` ถูกเก็บค่า **"Power Requirement / Recommended PSU" (550W)** จากสเปคผู้ผลิต แทนที่จะเก็บค่า **"TDP / อัตรากินไฟจริงของตัวการ์ดจอ" (140W)**
2. **การทบยอดในสูตรคำนวณ**:
   - สูตรของระบบ: `โหลดรวม = CPU (65W) + GPU (550W ❌) + เมนบอร์ด (35W) + แรม (10W) + SSD (5W) = 665W`
   - ระบบคำนวณวัตต์ PSU แนะนำโดยเผื่อ Safety Margin 30% (x1.3 เท่า): `665W × 1.3 = 864.5W ≈ 865W`
3. **ผลกระทบ**: ระบบจึงคิดว่าเครื่องนี้กินไฟมหาศาล 665W และบังคับให้ใช้ PSU 865W ขึ้นไป ทำให้ PSU 650W ที่แชตบอตแนะนำมาโดนเตือนว่าไฟไม่พอ ทั้งที่ความจริงสเปคนี้กินไฟจริงเพียง **~255W** เท่านั้น

---

## 3. 🛠️ กฎเหล็กในโค้ดและวิธีแก้ (Code Rules & Values)

### ตารางมาตรฐานค่า TDP / Total Board Power (TGP) ของการ์ดจอ:
| ชิปเซ็ตการ์ดจอ (GPU Chipset) | ค่า TDP จริง (Watts) | ขนาด PSU แนะนำจริงของทั้งระบบ |
|---|---|---|
| **GeForce RTX 5090** | 600W | 1000W |
| **GeForce RTX 5080** | 400W | 850W |
| **GeForce RTX 5070 Ti** | 300W | 750W |
| **GeForce RTX 5070** | 250W | 650W |
| **GeForce RTX 5060 Ti** | 180W | 600W |
| **GeForce RTX 5060** | 140W | 550W - 650W |
| **GeForce RTX 5050** | 115W | 500W - 550W |
| **GeForce RTX 3050 6GB** | 70W | 450W |
| **GeForce RTX 3050 8GB** | 130W | 500W |
| **Radeon RX 9070 XT** | 300W | 750W - 850W |
| **Radeon RX 9070 / GRE** | 220W | 650W |
| **Radeon RX 9060 XT** | 160W | 550W - 650W |
| **Radeon RX 7600** | 165W | 550W |
| **Radeon RX 6500 XT** | 107W | 450W |

---

## 4. 🚀 คู่มือคำสั่งรันสำหรับ AI และ Developer (Step-by-Step Execution Commands)

```bash
# 1. รันสคริปต์อัปเดต TDP ของการ์ดจอทุกตัวในฐานข้อมูล
cd node-backend
node scripts/fix_gpu_tdp.js

# 2. รันชุดทดสอบระบบหน้าบ้านเพื่อยืนยันความถูกต้อง
cd ../frontend
npm test
```

---

## 5. ✅ ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)
- [x] ตาราง `spec_gpu` ทั้ง 148 แถว ได้รับการปรับค่า `tdp_watt` เป็นค่าการกินไฟจริงของการ์ดจอ
- [x] RTX 5060 มีค่า `tdp_watt` = 140W (แทนที่ 550W เดิม)
- [x] สเปค Ryzen 5 7500F (65W) + RTX 5060 (140W) คำนวณโหลดรวมได้ **255W**
- [x] PSU 650W ผ่านการตรวจสอบความเข้ากันได้ (Status: Pass 100%)
- [x] ชุดทดสอบ Frontend Unit Tests ทั้ง 20 ไฟล์ (125 tests) ผ่าน 100%

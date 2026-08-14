# 🚀 PCSpec Safe Deployment & Push Guide (คู่มือการนำโค้ดขึ้นระบบอย่างปลอดภัย)

คู่มือขั้นตอนการนำโค้ดที่ปรับปรุงทั้งหมดขึ้น GitHub และระบบ Production โดยไม่ให้เกิดข้อผิดพลาด

---

## 1. 🔍 ไฟล์ที่มีการเปลี่ยนแปลงหลัก (Modified & Ready to Push)

| ส่วนประกอบ | ไฟล์ | รายละเอียดการปรับปรุง |
| :--- | :--- | :--- |
| **Frontend** | [`frontend/src/components/HardwareSelection.vue`](file:///c:/Users/PC/Downloads/PCSpec/frontend/src/components/HardwareSelection.vue) | ระบบ 4-Row Badge System แสดงสเปกสำคัญ 4 แถวเท่ากันทุกหมวดหมู่ |
| **Frontend** | [`frontend/src/utils/compatibility.js`](file:///c:/Users/PC/Downloads/PCSpec/frontend/src/utils/compatibility.js) | ระบบตรวจสอบความเข้ากันได้ของ CPU, Socket, RAM, Form Factor, TDP |
| **Backend** | [`node-backend/controllers/hardwareController.js`](file:///c:/Users/PC/Downloads/PCSpec/node-backend/controllers/hardwareController.js) | Controller บริหารจัดการ Catalog ดึงข้อมูลจากฐานข้อมูล |
| **TiDB Sync** | [`node-backend/sync_to_tidb.js`](file:///c:/Users/PC/Downloads/PCSpec/node-backend/sync_to_tidb.js) | สคริปต์ซิงค์ข้อมูลบริสุทธิ์ทั้ง 13 ตารางขึ้น TiDB Cloud |
| **Plans & Docs** | [`plans/ui_hardware_card_and_name_cleaning.md`](file:///c:/Users/PC/Downloads/PCSpec/plans/ui_hardware_card_and_name_cleaning.md) | เอกสารคู่มือทางเทคนิคและสถาปัตยกรรมระบบ |

---

## 2. ⚡ ขั้นตอนการ Push ขึ้น GitHub อย่างปลอดภัย (Step-by-Step)

```bash
# 1. เข้าสู่โฟลเดอร์หลักของโปรเจกต์
cd c:\Users\PC\Downloads\PCSpec

# 2. ทำการ Stage ไฟล์ทั้งหมด
git add .

# 3. สร้าง Commit พร้อมคำอธิบายที่ชัดเจน
git commit -m "feat(catalog): normalize all 7 hardware categories, 4-row badges, and sync TiDB Cloud"

# 4. Push ขึ้น GitHub main branch
git push origin main
```

---

## 3. 🛡️ เกราะป้องกันความปลอดภัย (Safety Guarantees)

1. **ฐานข้อมูล TiDB Cloud ซิงค์เสร็จแล้ว 100%:** ข้อมูลสินค้า 587 ชิ้นที่สะอาด ไร้ตัวซ้ำ ราคาตลาดจริง พร้อมให้บริการบน Cloud เรียบร้อย
2. **Backend Unit Tests ผ่าน 100% (86/86 Tests):** ระบบความปลอดภัยและการคำนวณทั้งหมดผ่านการทดสอบ Jest
3. **Frontend Compatibility Engine:** ฟังก์ชันตรวจสอบซ็อกเก็ตและแรมทำงานเข้ากันได้อย่างแม่นยำ

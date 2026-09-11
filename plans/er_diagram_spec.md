# 🗄️ PCSpec Database ER Diagram Specification (MySQL `smart_pc_builder` with Full Admin Architecture)

## 1. 🏗️ สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

ฐานข้อมูลของระบบ **PCSpec (Smart PC Builder)** ประกอบด้วย **15 ตารางหลัก** ที่สะท้อนความสัมพันธ์ทั้งฝั่ง **Customer (ลูกค้า)** และ **Admin (ผู้ดูแลระบบ)** อย่างครบถ้วนสมบูรณ์:

| ชื่อตาราง (Table Name) | ประเภทและคำอธิบาย (Type & Description) | Primary Key (PK) | Foreign Keys (FK) |
| :--- | :--- | :--- | :--- |
| **`users`** | ข้อมูลสมาชิกและผู้ใช้งานทั่วไปของระบบ | `id` (INT) | - |
| **`admins`** | **[NEW]** ข้อมูลผู้ดูแลระบบ (Supertype/Subtype กับ `users`) | `id` (INT) | `user_id` ➔ `users(id)` |
| **`admin_logs`** | **[NEW]** บันทึกประวัติการทำงานของแอดมิน (Audit & Activity Logs) | `id` (INT) | `admin_id` ➔ `admins(id)` |
| **`articles`** | บทความและข่าวสารไอที (เขียนและจัดการโดย Admin) | `id` (INT) | `admin_id` ➔ `admins(id)` |
| **`categories`** | หมวดหมู่อุปกรณ์คอมพิวเตอร์ (จัดการโดย Admin) | `id` (INT) | `admin_id` ➔ `admins(id)` |
| **`products`** | ตารางอุปกรณ์คอมพิวเตอร์ (จัดการสต็อก/ราคาโดย Admin) | `id` (INT) | `category_id` ➔ `categories(id)`, `admin_id` ➔ `admins(id)` |
| **`orders`** | ใบคำสั่งซื้อ (สั่งโดย Customer, ตรวจสอบ/อัปเดตสถานะโดย Admin) | `id` (VARCHAR) | `user_id` ➔ `users(id)`, `admin_id` ➔ `admins(id)` |
| **`order_items`** | รายการชิ้นส่วนอุปกรณ์ในแต่ละคำสั่งซื้อ | `id` (INT) | `order_id` ➔ `orders(id)`, `product_id` ➔ `products(id)` |
| **`spec_cpu`** | สเปคย่อย: CPU (Socket, TDP Watt) | `product_id` (INT) | `product_id` ➔ `products(id)` |
| **`spec_motherboard`**| สเปคย่อย: Mainboard (Socket, RAM Type) | `product_id` (INT) | `product_id` ➔ `products(id)` |
| **`spec_ram`** | สเปคย่อย: RAM (RAM Type, Capacity) | `product_id` (INT) | `product_id` ➔ `products(id)` |
| **`spec_gpu`** | สเปคย่อย: VGA (TDP Watt) | `product_id` (INT) | `product_id` ➔ `products(id)` |
| **`spec_storage`** | สเปคย่อย: SSD/HDD (Type, Capacity) | `product_id` (INT) | `product_id` ➔ `products(id)` |
| **`spec_psu`** | สเปคย่อย: Power Supply (Wattage) | `product_id` (INT) | `product_id` ➔ `products(id)` |
| **`spec_case`** | สเปคย่อย: Computer Case (Form Factor) | `product_id` (INT) | `product_id` ➔ `products(id)` |

---

## 2. ⚡ คู่มือและขั้นตอนการรันคำสั่งเชิงลึก (Step-by-Step Execution Commands for AI)

```bash
# 1. เข้าสู่โฟลเดอร์หลักของโปรเจกต์
cd c:\Users\PC\Downloads\PCSpec

# 2. รันสคริปต์สร้าง ER Diagram และอัปเดตไฟล์ Master Draw.io ทั้งหมด
node scripts/generate_er_diagram.js

# 3. ตรวจสอบไฟล์ผลลัพธ์:
# - C:\Users\PC\Downloads\pcspec_all_system_diagrams_master (1).drawio (หน้า ER Diagram Crow's Foot)
# - docs/er_diagram.svg
# - docs/er_diagram_studio.html
```

---

## 3. 🛡️ กฎเหล็กในโค้ดและวิธีแก้บั๊ก (Code Rules & Edge-case Handling)

1. **ความสัมพันธ์ระดับโครงสร้างของ Admin (Admin Hub Architecture)**:
   - `users` 1 ─── 1 `admins` (User ที่มี Role เป็น Admin จะมี Profile ในตาราง `admins`)
   - `admins` 1 ─── N `products` (แอดมินเป็นผู้เพิ่ม/แก้ไข/ลบสินค้าในแคตตาล็อก)
   - `admins` 1 ─── N `categories` (แอดมินเป็นผู้จัดหมวดหมู่อุปกรณ์)
   - `admins` 1 ─── N `orders` (แอดมินเป็นผู้ตรวจสอบ อนุมัติ และเปลี่ยนสถานะคำสั่งซื้อ)
   - `admins` 1 ─── N `articles` (แอดมินเป็นผู้เขียนและเผยแพร่ข่าวสาร/บทความ)
   - `admins` 1 ─── N `admin_logs` (ทุกการกระทำของแอดมินถูกบันทึกลง Audit Log)
2. **ความสัมพันธ์ระดับโครงสร้างของ Customer**:
   - `users` 1 ─── N `orders` (ลูกค้า 1 คน สามารถสั่งซื้อได้หลายออเดอร์)
   - `orders` 1 ─── N `order_items` (1 ออเดอร์ ประกอบด้วยอุปกรณ์คอมพิวเตอร์หลายชิ้น)

---

## 4. ✅ ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

- [x] ตรวจสอบสกีมา 15 ตาราง มีตาราง `admins`, `admin_logs`, และ Foreign Key ชี้จาก `admins` ไปยัง `products`, `categories`, `orders`, `articles`, `admin_logs`
- [x] รัน `node scripts/generate_er_diagram.js` สำเร็จ 100%
- [x] ไฟล์ `pcspec_all_system_diagrams_master (1).drawio` มีเส้นเชื่อมโยง Admin ไปยังทุกส่วนที่แอดมินดูแลครบถ้วน

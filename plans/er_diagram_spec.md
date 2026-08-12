# 🗄️ PCSpec Database ER Diagram Specification (MySQL `smart_pc_builder`)

## 1. 🏗️ สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

ฐานข้อมูลของระบบ **PCSpec (Smart PC Builder)** ชื่อ `smart_pc_builder` ประกอบด้วย **11 ตารางหลัก** ที่ออกแบบมาเพื่อรองรับการตรวจความเข้ากันได้ของอุปกรณ์ (Compatibility Check) และระบบสั่งซื้อ:

| ชื่อตาราง (Table Name) | ประเภทและคำอธิบาย (Type & Description) | Primary Key (PK) | Foreign Keys (FK) |
| :--- | :--- | :--- | :--- |
| **`users`** | ข้อมูลสมาชิกและผู้ดูแลระบบ (Customer / Admin) | `id` (INT) | - |
| **`categories`** | หมวดหมู่อุปกรณ์ (CPU, Mobo, RAM, GPU, ฯลฯ) | `id` (INT) | - |
| **`products`** | ตารางหลักรวมอุปกรณ์คอมพิวเตอร์ทั้งหมด | `id` (INT) | `category_id` ➔ `categories(id)` |
| **`spec_cpu`** | ตารางสเปคย่อย: CPU (Socket, TDP Watt) | `product_id` (INT) | `product_id` ➔ `products(id)` |
| **`spec_motherboard`**| ตารางสเปคย่อย: Mainboard (Socket, RAM Type) | `product_id` (INT) | `product_id` ➔ `products(id)` |
| **`spec_ram`** | ตารางสเปคย่อย: RAM (RAM Type, Capacity) | `product_id` (INT) | `product_id` ➔ `products(id)` |
| **`spec_gpu`** | ตารางสเปคย่อย: VGA (TDP Watt) | `product_id` (INT) | `product_id` ➔ `products(id)` |
| **`spec_storage`** | ตารางสเปคย่อย: SSD/HDD | `product_id` (INT) | `product_id` ➔ `products(id)` |
| **`spec_psu`** | ตารางสเปคย่อย: Power Supply (Wattage) | `product_id` (INT) | `product_id` ➔ `products(id)` |
| **`spec_case`** | ตารางสเปคย่อย: Computer Case (Form Factor) | `product_id` (INT) | `product_id` ➔ `products(id)` |
| **`orders`** | ใบคำสั่งซื้อ/จัดสเปคคอมพิวเตอร์ | `id` (VARCHAR) | `user_id` ➔ `users(id)` |
| **`order_items`** | รายการชิ้นส่วนอุปกรณ์ในแต่ละคำสั่งซื้อ | `id` (INT) | `order_id` ➔ `orders(id)`, `product_id` ➔ `products(id)` |

---

## 2. ⚡ คู่มือและขั้นตอนการรันคำสั่งเชิงลึก (Step-by-Step Execution Commands for AI)

เพื่อทำการเจนเนอเรตไฟล์ ER Diagram ทั้งรูปแบบ `.drawio` และ `.svg`:

```bash
# 1. เข้าสู่โฟลเดอร์หลักของโปรเจกต์
cd c:\Users\PC\Downloads\PCSpec

# 2. รันสคริปต์สร้าง ER Diagram
node scripts/generate_er_diagram.js

# 3. ไฟล์จะถูกสร้างขึ้นที่:
# - docs/drawio/smart_pc_builder_er_diagram.drawio
# - docs/er_diagram.svg
# - docs/er_diagram_studio.html
```

---

## 3. 🛡️ กฎเหล็กในโค้ดและวิธีแก้บั๊ก (Code Rules & Edge-case Handling)

1. **สถาปัตยกรรม Class Table Inheritance (Subtype Spec Tables)**:
   - ตาราง `spec_cpu`, `spec_motherboard`, `spec_ram`, `spec_gpu`, `spec_storage`, `spec_psu`, `spec_case` ใช้ `product_id` เป็นทั้ง **Primary Key และ Foreign Key** ที่เชื่อมไปยัง `products(id)` แบบ 1:1
   - เมื่อมีการลบสินค้าในตาราง `products` ระบบ MySQL จะทำการลบข้อมูลสเปคในตารางย่อยโดยอัตโนมัติ (`ON DELETE CASCADE`)
2. **ความสัมพันธ์ Cardinality**:
   - `users` 1 ─── N `orders` (ผู้ใช้ 1 คน สร้างคำสั่งซื้อได้หลายรายการ)
   - `orders` 1 ─── N `order_items` (คำสั่งซื้อ 1 ใบ มีอุปกรณ์ได้หลายชิ้น)
   - `categories` 1 ─── N `products` (หมวดหมู่ 1 หมวด มีสินค้าได้หลายรายการ)
   - `products` 1 ─── N `order_items` (สินค้า 1 ชิ้น ปรากฏในออเดอร์ได้หลายใบ)
   - `products` 1 ─── 0..1 `spec_*` (สินค้าแต่ละชิ้นขยายสเปคย่อยตามประเภท)

---

## 4. ✅ ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

- [x] ตรวจสอบสกีมาตารางข้อมูลใน `database-schema.sql` ครบถ้วนทุกคอลัมน์
- [x] สคริปต์ `scripts/generate_er_diagram.js` รันผ่านและเจนเนอเรตไฟล์สำเร็จ 100%
- [x] ไฟล์ `.drawio` สามารถเปิดและขยับแก้ไขตารางใน Draw.io ได้อย่างสมบูรณ์
- [x] หน้าพรีวิว `docs/er_diagram_studio.html` แสดงผล ER Diagram ขาวดำคมชัดระดับวิชาการ

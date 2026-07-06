# Advanced Web Scraping & Database Schema Design

## Goal
ปรับปรุงระบบ Web Scraping ให้สามารถเจาะลึกเข้าไปในหน้ารายละเอียดสินค้าของ Advice IT เพื่อดึง **"ราคาหน้าร้าน"** (Storefront Price) และ **"คุณสมบัติแบบละเอียด"** (Detailed Specifications) เช่น Socket, Frequency, Cores, Threads ตามที่ผู้ใช้ระบุ

## Architecture
1. **Scraping Pipeline (2-Step Process)**
   - **Step 1 (Category Scrape):** รัน `Scrapling` ไปที่หน้าหมวดหมู่สินค้า (เช่น `/product/cpu`) เพื่อดึงลิงก์ (URL) ของสินค้าแต่ละชิ้น (จำนวน 50 ชิ้นต่อหมวดหมู่)
   - **Step 2 (Detail Scrape):** นำลิงก์ที่ได้ เข้าไปดึงข้อมูล "ราคาหน้าร้าน" และ กวาดตาราง "ข้อมูลจำเพาะ" ทั้งหมดออกมาเป็น Key-Value Pair
2. **Database Schema Update**
   - การเก็บสเปคแบบเจาะลึก (เช่น Cores, Threads, Cache) จะทำได้ยากถ้าเราฟิกซ์ Column ใน Database แบบตายตัว
   - **แนวทางที่เสนอ:** เพิ่ม Column `specifications` (ชนิด `JSON`) เข้าไปในตาราง `products` เพื่อเก็บข้อมูลจำเพาะแบบยืดหยุ่น (Dynamic Properties) ซึ่งจะรองรับทั้ง CPU, GPU, RAM, และหมวดหมู่อื่นๆ ได้ในโครงสร้างเดียวกัน
3. **Scrapling Tooling**
   - จะยังคงใช้ `AsyncDynamicSession` จากไลบรารี `scrapling-official` เพื่อเปิดหน้าเว็บแบบ Headless Browser ช่วยทะลุกำแพงการโหลดแบบ Dynamic ของ Advice IT

## Proposed Approaches for DB Design
- **Option A (แนะนำ):** เพิ่มคอลัมน์ `specifications` (JSON) ในตาราง `products` ยืดหยุ่นสูงสุด เก็บอะไรก็ได้ ไม่ต้องแก้ Schema บ่อยๆ 
- **Option B:** เพิ่มคอลัมน์เฉพาะเจาะจงลงในตาราง `spec_cpu` (เช่น `cores`, `threads`, `frequency`) วิธีนี้ข้อมูลจะเป๊ะมาก แต่ถ้ามีสเปคใหม่ๆ เข้ามา ต้องมานั่ง `ALTER TABLE` ตลอดเวลา

## Open Questions (สำหรับบอสพิจารณา)
1. บอสเห็นด้วยกับ **Option A (ใช้ JSON)** ในการเก็บข้อมูลจำเพาะไหมครับ? มันจะช่วยให้เราดึงข้อมูลที่บอสก๊อปปี้มา แปะลง Database ได้ครบทุกบรรทัดเลยครับ!
2. เนื่องจากเราต้องเข้าหน้ารายละเอียดสินค้า 50 ชิ้น * 7 หมวดหมู่ = 350 หน้า อาจจะใช้เวลาในการ Scrape นานขึ้น (ประมาณ 5-10 นาที) บอสโอเคไหมครับ?

## Verification Plan
1. `ALTER TABLE products ADD COLUMN specifications JSON;`
2. เขียนสคริปต์ `scripts/scrape_advice_details.py` ให้ทำงานแบบ Async 
3. รันเทสหมวดหมู่ `CPU` แค่ 5 ชิ้นก่อน เพื่อยืนยันว่าดึง "ราคาหน้าร้าน" และ "คุณสมบัติ" ลง JSON ได้ถูกต้อง
4. ถ้าผ่าน จึงจะสั่งรัน 50 ชิ้นครบทุกหมวดหมู่

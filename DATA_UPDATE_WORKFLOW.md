# 🛠️ แผนงานและขั้นตอนการอัปเดตข้อมูล (Data Update Workflow)

เอกสารนี้อธิบายขั้นตอนการทำงาน (SOP) เมื่อต้องการดึงข้อมูลฮาร์ดแวร์ใหม่ๆ จากเว็บไซต์ และนำไปอัปเดตขึ้นสู่ Database Production (TiDB) เพื่อแสดงผลบนเว็บไซต์จริง (Vercel)

---

## 📌 ภาพรวมสถาปัตยกรรม (Architecture Overview)
- **Local Database (MySQL):** ฐานข้อมูลในเครื่องเรา (localhost) ใช้สำหรับทดลองดึงข้อมูล จัดล้างข้อมูล (Data Cleansing) และตรวจสอบความถูกต้องก่อนเอาขึ้นจริง
- **Production Database (TiDB):** ฐานข้อมูลจริงบนคลาวด์ เชื่อมต่อกับ Backend (Railway) และ Frontend (Vercel)

---

## 🚀 ขั้นตอนการอัปเดตข้อมูล (Step-by-Step)

### 1. ดึงข้อมูลใหม่ (Scrape Data)
รันสคริปต์บอทดึงข้อมูล (เช่น Python Scraper หรือ Node.js) เพื่อดึงข้อมูลสินค้าฮาร์ดแวร์ชิ้นใหม่
- ข้อมูลที่ได้จะถูกบันทึกลงในไฟล์ `scraped_data.json` หรือถูกยิงเข้า Local Database โดยตรง

### 2. นำข้อมูลเข้า Local DB และตรวจสอบ (Import & Verify Locally)
- หากข้อมูลอยู่ในรูป `scraped_data.json` ให้ใช้สคริปต์ `node-backend/import_hardware.js` เพื่อนำข้อมูลเข้าสู่ตาราง `products` ใน `smart_pc_builder` (Local)
- ทำการแก้ไขหมวดหมู่ (Category) หรือลบข้อมูลขยะออกให้เรียบร้อยใน Local DB จนกว่าข้อมูลจะสมบูรณ์ 100%

### 3. ซิงค์ข้อมูลขึ้น TiDB (Sync to Production)
เนื่องจากเราทำ Data Cleansing ในเครื่องเสร็จแล้ว วิธีที่ชัวร์และปลอดภัยที่สุดในการเอาขึ้น Production คือการเขียนสคริปต์เชื่อมต่อ 2 Database เพื่อโคลนข้อมูลขึ้นไป

**ตัวอย่างโค้ดสคริปต์ `sync_to_tidb.js` ที่ใช้งาน:**
```javascript
const mysql = require('mysql2/promise');

async function sync() {
  const localDb = await mysql.createConnection({ host: 'localhost', user: 'root', password: '...', database: 'smart_pc_builder' });
  const tidb = await mysql.createConnection({ 
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com', 
    port: 4000, 
    user: '...', password: '...', database: 'smart_pc_builder', 
    ssl: { rejectUnauthorized: true } 
  });

  const [products] = await localDb.query('SELECT * FROM products');
  
  // เคลียร์ข้อมูลเก่าอย่างปลอดภัย (ปิด Foreign Key Check ชั่วคราว)
  await tidb.query('SET FOREIGN_KEY_CHECKS=0');
  await tidb.query('TRUNCATE TABLE products');
  await tidb.query('SET FOREIGN_KEY_CHECKS=1');
  
  // อัดข้อมูลใหม่จาก Local ขึ้น TiDB
  for (const p of products) {
    await tidb.query(
      'INSERT INTO products (id, brand, model, price, image_url, category_id, specifications, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
      [p.id, p.brand, p.model, p.price, p.image_url, p.category_id, typeof p.specifications === 'string' ? p.specifications : JSON.stringify(p.specifications), p.created_at]
    );
  }
  
  console.log(`✅ Copied ${products.length} products to TiDB!`);
  await localDb.end(); await tidb.end();
}
sync();
```
*คำเตือน: หลังจากการ Sync ข้อมูลเสร็จสิ้น ควรลบสคริปต์นี้หรือลบรหัสผ่านออกเพื่อความปลอดภัย*

### 4. ตรวจสอบหน้าเว็บจริง (Verify Production)
- ไปที่ `https://project-spec-ai.vercel.app/`
- กด **Refresh (F5)** หน้าเว็บ 
- ตรวจสอบจำนวนรายการสินค้า หมวดหมู่ และรูปภาพ ว่าแสดงผลตรงกับที่อยู่ใน Local DB หรือไม่

---

## 💡 ข้อควรระวัง
- **ห้ามทดลองดึงข้อมูล (Scrape) อัดเข้า TiDB โดยตรง:** เพราะถ้าดึงมาแล้วหมวดหมู่ผิด หรือข้อมูลเละ จะทำให้หน้าเว็บจริงพังไปด้วย ให้พักข้อมูลที่ Local DB เพื่อคัดกรองก่อนเสมอ
- **CORS & Environment Variables:** หากมีการเพิ่มโดเมนใหม่ หรือเปลี่ยน Database URL อย่าลืมไปอัปเดตตัวแปรในระบบ **Railway** ด้วย ไม่เช่นนั้นระบบอาจจะทำงานผิดพลาดได้

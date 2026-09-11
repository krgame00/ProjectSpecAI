# คู่มือเชิงเทคนิค: การปรับปรุงภาพปกบทความและเพิ่มบทความใหม่ 5 เรื่อง (Articles Refresh & Expansion Spec)

เอกสารฉบับนี้จัดทำขึ้นตาม **Mandatory AI Documentation Rule** เพื่อบันทึกสถาปัตยกรรม แหล่งจัดเก็บไฟล์ คำสั่งรัน ข้อมูลบทความ และแนวทางการตรวจสอบผลลัพธ์ สำหรับให้ AI Agent ตัวอื่น (เช่น Claude, ChatGPT, DeepSeek, Cursor) หรือทีม Developer นำไปต่อยอดและรันงานต่อได้ทันที 100% โดยไม่ต้องเดาสุ่ม

---

## 1. สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

### 1.1 ไฟล์รูปภาพปกบทความ (Local Static Assets)
รูปภาพทั้งหมด 15 ไฟล์ถูกจัดทำในอัตราส่วน 16:9 สไตล์สตูดิโอเทคโนโลยีระดับพรีเมียม (Photorealistic Hardware Studio Photography) โดยถูกสำเนาไว้ 2 จุดเพื่อรองรับทั้ง Frontend Vite Dev/Prod และ Backend Static Hosting:
- **Frontend Assets**: `frontend/public/images/articles/` (ถูกเสิร์ฟโดยตรงผ่าน Vite ที่ `/images/articles/<filename>.jpg`)
- **Backend Fallback Assets**: `node-backend/public/uploads/` (ถูกเสิร์ฟผ่าน Express ที่ `/uploads/<filename>.jpg`)

#### รายชื่อไฟล์รูปภาพทั้ง 15 รายการ:
1. `article-01-monitors-144hz-vs-240hz.jpg` (787 KB) — หน้าจอเกมมิ่ง 144Hz vs 240Hz แบบเคียงข้างกัน
2. `article-02-cpu-intel-vs-amd-2026.jpg` (970 KB) — CPU Intel Core Ultra & AMD Ryzen 9000 บนเมนบอร์ด
3. `article-03-used-gpu-guide.jpg` (832 KB) — ช่างเทคนิคตรวจสอบการ์ดจอมือสองบนโต๊ะซ่อม
4. `article-04-psu-buying-guide.jpg` (773 KB) — พาวเวอร์ซัพพลาย Fully Modular 1000W พร้อมสายถัก
5. `article-05-prebuilt-vs-custom-pc.jpg` (817 KB) — คอมแบรนด์สำเร็จรูปเทียบกับคอมประกอบ Custom Loop
6. `article-06-budget-streamer-pc.jpg` (817 KB) — โต๊ะสตรีมเมอร์งบประหยัดพร้อมไมค์และไฟสตูดิโอ
7. `article-07-ddr5-vs-ddr4-ram.jpg` (733 KB) — แรม DDR5 Trident Z Neo และ Corsair Vengeance
8. `article-08-pcie-gen5-ssd.jpg` (905 KB) — SSD M.2 PCIe Gen 5 พร้อมฮีตซิงก์พัดลมระบายความร้อน
9. `article-09-future-aio-liquid-cooling.jpg` (779 KB) — ชุดน้ำปิด 360mm พร้อมจอ LCD บอกอุณหภูมิแบบเรียลไทม์
10. `article-10-ultimate-4k-gaming-pc.jpg` (813 KB) — สเปกคอมเล่นเกม 4K ต่อจอ OLED Ultrawide
11. `article-11-pc-cable-management-airflow.jpg` (788 KB) — การจัดทิศทางลม Positive Air Pressure และสายไฟ
12. `article-12-vram-demands-2026.jpg` (1.02 MB) — ชิปประมวลผล GPU พร้อมเม็ดแรม GDDR7 / GDDR6X VRAM
13. `article-13-panoramic-aquarium-pc-case.jpg` (733 KB) — เคสคอมตู้ปลาพาโนรามาสองห้องพร้อมพัดลม Reverse Blade
14. `article-14-thermal-paste-vs-ptm7950.jpg` (721 KB) — ซิลิโคน MX-6 เทียบกับแผ่นเปลี่ยนสถานะ Honeywell PTM7950
15. `article-15-local-ai-pc-build-guide.jpg` (116 KB) — การ์ดจอ Nvidia ระดับเวิร์กสเตชันสำหรับประมวลผล Local AI

### 1.2 ไฟล์โค้ดและฐานข้อมูลที่เกี่ยวข้อง
- **MySQL Database**: `smart_pc_builder.articles` (15 แถว พร้อม field `id`, `title`, `content`, `image_url`, `created_at`)
- **Backend Fallback File**: `node-backend/articles.json` (15 รายการ ตรงกับ Database 100%)
- **Backend Controller**: `node-backend/controllers/articleController.js` (อ่านจาก DB หรือ Fallback ผ่าน `canonical()`)
- **Frontend Store**: `frontend/src/stores/article.js` (ดึงข้อมูลผ่าน `GET /api/v1/articles`)
- **Frontend Views**:
  - `frontend/src/components/ArticlesView.vue` (แสดง Hero Article + Grid Articles)
  - `frontend/src/components/ArticleDetailView.vue` (แสดงเนื้อหาเต็มและภาพปก)
  - `frontend/src/utils/articleContent.js` (Sanitize HTML, excerpt, และ format วันที่ไทย)
- **DB HTML Inspector**: `database-export/database_view.html` และ `database-export/all_database_data.json`

---

## 2. คู่มือและขั้นตอนการรันคำสั่งเชิงลึกเรียงตามลำดับ (Step-by-Step Execution Commands for AI)

### ขั้นตอนที่ 1: ตรวจสอบและซิงค์ข้อมูลบทความเข้าฐานข้อมูล
หากต้องการซิงค์ข้อมูลบทความทั้งหมดใหม่ หรือรันบนเครื่องใหม่ ให้รันสคริปต์:
```powershell
cd c:\Users\PC\Downloads\PCSpec\node-backend
node sync_articles.js
```
*ผลลัพธ์ที่คาดหวัง:* ขึ้น `Total articles in DB: 15` และ `Successfully synced 15 articles to articles.json!`

### ขั้นตอนที่ 2: ส่งออกข้อมูลฐานข้อมูลเป็น HTML Inspector
```powershell
cd c:\Users\PC\Downloads\PCSpec\node-backend
node scripts/export_db_to_html.js
```
*ผลลัพธ์ที่คาดหวัง:* ขึ้น `Successfully exported HTML inspector to: .../database-export/database_view.html`

### ขั้นตอนที่ 3: ทดสอบ Backend Unit Tests
```powershell
cd c:\Users\PC\Downloads\PCSpec\node-backend
npm test
```
*ผลลัพธ์ที่คาดหวัง:* `Test Suites: 8 passed, 8 total` และ `Tests: 111 passed, 111 total`

### ขั้นตอนที่ 4: ทดสอบ Frontend Unit Tests
```powershell
cd c:\Users\PC\Downloads\PCSpec\frontend
npm test
```
*ผลลัพธ์ที่คาดหวัง:* `Test Files: 22 passed, 22 total` และ `Tests: 157 passed, 157 total`

### ขั้นตอนที่ 5: สตาร์ท Dev Server เพื่อตรวจสอบบน Browser
- Terminal 1 (Backend):
  ```powershell
  cd c:\Users\PC\Downloads\PCSpec\node-backend
  npm start
  ```
- Terminal 2 (Frontend):
  ```powershell
  cd c:\Users\PC\Downloads\PCSpec\frontend
  npm run dev
  ```
- เปิดเบราว์เซอร์ไปที่ `http://localhost:5173/articles`

---

## 3. กฎเหล็กในโค้ดและวิธีแก้บั๊ก (Code Rules & Edge-case Handling)

1. **ห้ามใช้ URL ภายนอกที่ไม่เสถียร (เช่น Pollinations AI ดิบ)**
   - *เหตุผล:* โหลดช้า มักติด Timeout, HTTP 500/502 หรือโดนบล็อก CORS ส่งผลให้หน้าเว็บกลายเป็น Fallback Box สีเทา
   - *วิธีแก้:* บันทึกภาพลงใน `frontend/public/images/articles/` และอ้างอิงด้วย Absolute Path เช่น `/images/articles/article-xx.jpg`
2. **การคงความเข้ากันได้ระหว่าง MySQL และ Fallback File**
   - ฟิลด์ใน MySQL ใช้ชื่อ `image_url` และ `created_at`
   - ฟิลด์ใน `articles.json` และ API Response ใช้ชื่อ `image` และ `date`
   - `node-backend/controllers/articleController.js` จะใช้ฟังก์ชัน `canonical()` เพื่อ Normalize ทั้งสองฝั่งให้ตรงกันเสมอ:
     ```javascript
     const canonical = row => ({
       id: row.id,
       title: row.title,
       content: row.content || '',
       image: row.image ?? row.image_url ?? '',
       date: isoDate(row.date ?? row.created_at)
     });
     ```
3. **การคลีนข้อมูลเทส (Test Artifacts Cleaning)**
   - ห้ามปล่อยให้บทความทดสอบ (เช่น `เทสๆ`, `test1`) หลุดเข้าไปในหน้าร้าน เพราะจะทำให้ Hero Card หรือ Grid ของหน้าบทความแสดงผลไม่ถูกต้อง
   - สคริปต์ `sync_articles.js` จะทำการลบ `id IN (13, 14)` และชื่อที่ขึ้นต้นด้วย `เทส%` / `test%` ออกเสมอ
4. **ความปลอดภัยของ HTML Content ในบทความ (XSS Prevention)**
   - การแสดงผลเนื้อหาใน `ArticleDetailView.vue` จะต้องผ่าน `sanitizeArticleHtml()` ใน `frontend/src/utils/articleContent.js` ซึ่งครอบด้วย DOMPurify เสมอ

---

## 4. ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

| รายการทดสอบ | คำสั่ง / ตำแหน่งตรวจสอบ | ผลลัพธ์ที่ต้องผ่าน 100% |
| :--- | :--- | :--- |
| **MySQL Articles Check** | `node -e "const m=require('mysql2/promise');m.createConnection({host:'localhost',user:'root',password:'1234',database:'smart_pc_builder'}).then(async c=>{const [r]=await c.query('SELECT COUNT(*) as cnt FROM articles');console.log(r[0].cnt);await c.end();})"` | ได้ค่า `15` |
| **Articles JSON Check** | `node -e "console.log(require('./articles.json').length)"` (ใน `node-backend`) | ได้ค่า `15` |
| **Local Images Check** | ตรวจสอบไฟล์ใน `frontend/public/images/articles/` | มีครบทั้ง 15 ไฟล์ ไม่เสีย ไม่ 0 bytes |
| **Backend Tests** | `npm test` ใน `node-backend/` | `8 passed, 8 total` |
| **Frontend Tests** | `npm test` ใน `frontend/` | `22 passed, 22 total` (รวม `ArticlesView.test.js`, `ArticleDetailView.test.js`, `articleStore.test.js`) |
| **Inspector Update** | `node scripts/export_db_to_html.js` | ได้ไฟล์ `database-export/database_view.html` ล่าสุด |

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function checkDupes() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [existing] = await conn.query('SELECT id, brand, model FROM products WHERE category_id = 7');
  const scrapedPath = path.join(__dirname, '../scraped_cases_ihavecpu.json');
  const scraped = JSON.parse(fs.readFileSync(scrapedPath, 'utf8'));

  console.log(`📊 Existing Cases in DB: ${existing.length}`);
  console.log(`📦 Scraped Cases from ihavecpu: ${scraped.length}\n`);

  let dupes = 0;
  let newItems = 0;

  scraped.forEach(s => {
    const sNameClean = s.name.replace(/CASE\s*\(เคส\)\s*/i, '').trim().toLowerCase();
    
    const match = existing.find(e => {
      const dbFullName = `${e.brand} ${e.model}`.toLowerCase();
      const dbModelLower = e.model.toLowerCase();
      return dbFullName.includes(sNameClean) || sNameClean.includes(dbModelLower);
    });

    if (match) {
      dupes++;
      console.log(`🔴 [ซ้ำ] ${s.name}  ==>  DB ID ${match.id} (${match.brand} ${match.model})`);
    } else {
      newItems++;
      console.log(`🟢 [ใหม่] ${s.name}`);
    }
  });

  console.log(`\n========================================`);
  console.log(`✨ สรุปผลการตรวจสอบ:`);
  console.log(`   - สินค้าใหม่ (พร้อมนำเข้า): ${newItems} รายการ`);
  console.log(`   - สินค้าซ้ำกับ DB: ${dupes} รายการ`);
  console.log(`========================================\n`);

  await conn.end();
}

checkDupes().catch(console.error);

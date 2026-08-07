require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

function splitName(fullName) {
  if (!fullName) return { brand: 'Generic', model: '' };
  const clean = fullName.replace(/CASE\s*\(เคส\)\s*/i, '').trim();
  const parts = clean.split(/\s+/);
  const brand = parts[0] || 'Generic';
  const model = parts.slice(1).join(' ') || clean;
  return { brand, model };
}

async function importCases() {
  console.log('🔌 Connecting to MySQL...');
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

  let imported = 0;
  for (const s of scraped) {
    const sNameClean = s.name.replace(/CASE\s*\(เคส\)\s*/i, '').trim().toLowerCase();
    
    const match = existing.find(e => {
      const dbFullName = `${e.brand} ${e.model}`.toLowerCase();
      const dbModelLower = e.model.toLowerCase();
      return dbFullName.includes(sNameClean) || sNameClean.includes(dbModelLower);
    });

    if (!match) {
      const { brand, model } = splitName(s.name);
      const price = s.price || 1590;
      const img = s.image_url && !s.image_url.includes('logo_light') ? s.image_url : 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/product1048_800.jpg';
      const specsJson = JSON.stringify({
        "Brand": brand,
        "Form Factor Support": s.form_factor || "ATX, Micro-ATX",
        "Max GPU Length": `${s.max_gpu_length_mm || 350}mm`,
        "Source": "ihavecpu"
      });

      const [res] = await conn.query(
        `INSERT INTO products (category_id, brand, model, price, image_url, stock_quantity, specifications)
         VALUES (7, ?, ?, ?, ?, 10, ?)`,
        [brand, model, price, img, specsJson]
      );
      const pid = res.insertId;

      await conn.query(
        `INSERT INTO spec_case (product_id, form_factor_support, max_gpu_length_mm)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE form_factor_support=VALUES(form_factor_support), max_gpu_length_mm=VALUES(max_gpu_length_mm)`,
        [pid, s.form_factor || 'ATX, Micro-ATX', s.max_gpu_length_mm || 350]
      );

      console.log(`✅ Imported ID ${pid}: ${brand} ${model}`);
      imported++;
    }
  }

  console.log(`\n🎉 Successfully imported ${imported} new case products into MySQL!`);
  await conn.end();
}

importCases().catch(err => {
  console.error('❌ Import error:', err);
  process.exit(1);
});

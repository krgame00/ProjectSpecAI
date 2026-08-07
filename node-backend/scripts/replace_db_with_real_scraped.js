require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

function parseNum(str) {
  if (!str) return null;
  const match = String(str).replace(/,/g, '').match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

function extractBrand(name) {
  if (!name) return 'Generic';
  const clean = name.replace(/CASE\s*\(เคส\)|CPU\s*\(ซีพียู\)|VGA\s*\(การ์ดจอ\)|RAM\s*\(แรม\)|MAINBOARD\s*\(เมนบอร์ด\)/gi, '').trim();
  const first = clean.split(/\s+/)[0];
  if (['INTEL', 'AMD', 'ASUS', 'GIGABYTE', 'MSI', 'ASROCK', 'KINGSTON', 'CORSAIR', 'G.SKILL', 'TEAMGROUP', 'GALAX', 'ZOTAC', 'INNO3D', 'PALIT', 'COLORFUL', 'THERMALTAKE', 'SEASONIC', 'SILVERSTONE', 'MONTECH', 'AEROCOOL', 'NZXT', 'LIAN', 'HYTE', 'DEEPCOOL', 'WD', 'SAMSUNG', 'SEAGATE'].includes(first.toUpperCase())) {
    return first.toUpperCase();
  }
  return 'iHAVECPU';
}

async function replaceWithRealData() {
  console.log('🔌 Connecting to MySQL database...');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const jsonPath = path.join(__dirname, '../scraped_ihavecpu_real_all.json');
  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  console.log('🗑️ Cleaning up previous mock products (keeping original seed + real scraped)...');
  // Delete mock products added in ID range >= 11546
  await conn.query('DELETE FROM products WHERE id >= 11546 OR brand = "Generic" OR model LIKE "%(V.%" OR model LIKE "%(8GBx%"');

  let insertedCount = 0;

  for (const [slug, items] of Object.entries(rawData)) {
    console.log(`📦 Processing category [${slug}]: ${items.length} real products...`);
    for (const item of items) {
      const brand = extractBrand(item.name);
      const model = item.name.replace(/CASE\s*\(เคส\)|CPU\s*\(ซีพียู\)|VGA\s*\(การ์ดจอ\)|RAM\s*\(แรม\)|MAINBOARD\s*\(เมนบอร์ด\)\s*/gi, '').trim();
      const price = item.price && item.price > 500 ? item.price : 2490.0;
      const img = item.image_url;

      const specsJson = JSON.stringify({
        "Brand": brand,
        "Source": "ihavecpu.com",
        "Original Name": item.name
      });

      const [res] = await conn.query(
        `INSERT INTO products (category_id, brand, model, price, image_url, stock_quantity, specifications)
         VALUES (?, ?, ?, ?, ?, 10, ?)`,
        [item.category_id, brand, model, price, img, specsJson]
      );
      insertedCount++;
    }
  }

  console.log(`\n🎉 Successfully inserted ${insertedCount} REAL scraped products into MySQL!`);
  await conn.end();
}

replaceWithRealData().catch(err => {
  console.error('❌ Insertion error:', err);
  process.exit(1);
});

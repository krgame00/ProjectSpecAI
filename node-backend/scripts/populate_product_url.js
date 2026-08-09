// Populate products.product_url from scraped JSON outputs
// (image_url -> product page url mapping)
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function main() {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
  });

  // Build lookup: image_url -> url
  const lookup = new Map();
  const candidates = ['scraped_ihavecpu_real_all.json', 'scraped_ihavecpu_real_fast.json'];
  for (const fname of candidates) {
    const fp = path.join(__dirname, '..', fname);
    if (!fs.existsSync(fp)) continue;
    const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
    const items = Array.isArray(data) ? data : Object.values(data).flat();
    for (const it of items) {
      if (it && it.image_url && it.url) lookup.set(it.image_url, it.url);
    }
  }
  console.log('lookup entries:', lookup.size);

  const [rows] = await pool.query(
    'SELECT id, image_url FROM products WHERE product_url IS NULL AND image_url IS NOT NULL LIMIT 2000'
  );
  console.log('rows to match:', rows.length);

  let updated = 0, matchedBySuffix = 0;
  const suffixIndex = new Map();
  for (const [img, url] of lookup) suffixIndex.set(String(img).split('/').pop(), url);

  for (const r of rows) {
    const exact = lookup.get(r.image_url);
    let url = exact;
    if (!url) {
      const base = String(r.image_url).split('/').pop();
      url = suffixIndex.get(base);
      if (url) matchedBySuffix += 1;
    }
    if (url) {
      await pool.query('UPDATE products SET product_url = ? WHERE id = ?', [url, r.id]);
      updated += 1;
    }
  }
  console.log(`updated: ${updated} (exact+suffix), of which suffix-only: ${matchedBySuffix}`);
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [products] = await db.query('SELECT id, model, brand FROM products');
  let updated = 0;

  for (const p of products) {
    let newModel = p.model;

    // Remove category prefixes
    newModel = newModel.replace(/MAINBOARD\s*\(เมนบอร์ด\)\s*\([^)]+\)\s*/i, '');
    newModel = newModel.replace(/RAM\s*\(แรม\)\s*/i, '');
    newModel = newModel.replace(/M\.2\s*\(เอสเอสดี\)\s*/i, '');
    newModel = newModel.replace(/SSD\s*\(เอสเอสดี\)\s*/i, '');
    newModel = newModel.replace(/PSU\s*\(อุปกรณ์จ่ายไฟ\)\s*/i, '');
    newModel = newModel.replace(/CASE\s*\(เคส\)\s*/i, '');

    // Remove duplicate brand if it appears at the start of the remaining model string
    // e.g. brand="Gigabyte", newModel="GIGABYTE A520M..."
    const brandRegex = new RegExp(`^${p.brand}\\s+`, 'i');
    newModel = newModel.replace(brandRegex, '');

    if (newModel !== p.model) {
      await db.query('UPDATE products SET model = ? WHERE id = ?', [newModel, p.id]);
      updated++;
    }
  }

  console.log(`Cleaned up ${updated} product names successfully.`);
  process.exit();
}
run().catch(console.error);

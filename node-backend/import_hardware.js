const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function importHardware() {
  const db = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  try {
    const dataPath = path.join(__dirname, '..', 'scraped_data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const products = JSON.parse(rawData);

    for (const p of products) {
      // Find category_id based on slug
      const [catRows] = await db.query('SELECT id FROM categories WHERE slug = ?', [p.category_slug]);
      let category_id = 1; // Default CPU
      if (catRows.length > 0) {
        category_id = catRows[0].id;
      }

      console.log(`Inserting: ${p.brand} ${p.model} ...`);
      
      const [result] = await db.query(
        'INSERT INTO products (brand, model, price, image_url, category_id, specifications) VALUES (?, ?, ?, ?, ?, ?)',
        [
          p.brand, 
          p.model, 
          p.price, 
          p.image_url, 
          category_id, 
          JSON.stringify(p.specifications)
        ]
      );
      console.log(`✅ Success! Inserted ID: ${result.insertId}`);
      if (p.url) {
        const urlsPath = path.join(__dirname, '..', 'scraped_urls.txt');
        fs.appendFileSync(urlsPath, p.url + '\n', 'utf-8');
      }
    }
  } catch (err) {
    console.error("❌ Error importing:", err.message);
  } finally {
    await db.end();
  }
}

importHardware();

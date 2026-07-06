const mysql = require('mysql2/promise');
const puppeteer = require('puppeteer');
const fs = require('fs');
require('dotenv').config();

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const [rows] = await conn.execute('SELECT id, category_id, brand, model FROM products WHERE image_url LIKE "%pollinations%" LIMIT 20');
  console.log(`Found ${rows.length} components needing real images.`);

  const browser = await puppeteer.launch({ headless: 'new' });
  const failedItems = [];

  for (let i = 0; i < rows.length; i++) {
    const item = rows[i];
    const page = await browser.newPage();
    const cleanModel = item.model.replace(/\s*\(.*?\)\s*/g, ' ').replace(/V\.\d+/gi, '').trim();
    const query = encodeURIComponent(`${item.brand} ${cleanModel}`);
    const searchUrl = `https://www.advice.co.th/search?keyword=${query}`;
    
    console.log(`[${i+1}/${rows.length}] Searching for: ${item.brand} ${cleanModel}`);
    try {
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      // Extract images
      const imageUrl = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        const target = imgs.find(img => {
          const src = img.src || img.getAttribute('data-src');
          return src && (src.includes('advice.co.th/pic') || src.includes('advice.co.th/system_new/pic')) && !src.includes('logo');
        });
        return target ? (target.src || target.getAttribute('data-src')) : null;
      });

      if (imageUrl) {
        console.log(`  -> Found: ${imageUrl}`);
        await conn.execute('UPDATE products SET image_url = ? WHERE id = ?', [imageUrl, item.id]);
      } else {
        console.log(`  -> Not found`);
        failedItems.push(item);
      }
    } catch (err) {
      console.log(`  -> Error: ${err.message}`);
      failedItems.push(item);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  await conn.end();

  fs.writeFileSync('failed_images.json', JSON.stringify(failedItems, null, 2));
  console.log(`Finished. Updated ${rows.length - failedItems.length} items. Failed ${failedItems.length} items.`);
}

run().catch(console.error);

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'smart_pc_builder'
  });

  // Get items that still have pollinations URLs or no URL
  const [rows] = await conn.execute(`
    SELECT id, category_id, brand, model, image_url 
    FROM products 
    WHERE image_url LIKE '%pollinations%' OR image_url IS NULL
  `);

  console.log(`Found ${rows.length} components needing images.`);

  const destDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'hardware');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // To avoid hitting API limits, we'll process them in small batches or one by one
  for (let i = 0; i < rows.length; i++) {
    const item = rows[i];
    const cleanModel = item.model.replace(/\s*\(.*?\)\s*/g, ' ').replace(/V\.\d+/gi, '').trim();
    console.log(`[${i+1}/${rows.length}] Generating image for: ${item.brand} ${cleanModel}`);

    // Create a specific prompt for this hardware
    let hardwareType = 'computer component';
    if(item.category_id === 1) hardwareType = 'CPU processor';
    if(item.category_id === 2) hardwareType = 'motherboard';
    if(item.category_id === 3) hardwareType = 'RAM memory stick';
    if(item.category_id === 4) hardwareType = 'graphics card GPU';
    if(item.category_id === 5) hardwareType = 'SSD storage drive';
    if(item.category_id === 6) hardwareType = 'power supply PSU';
    if(item.category_id === 7) hardwareType = 'PC case';

    const prompt = `high quality studio product photography of ${item.brand} ${cleanModel} ${hardwareType}, isolated on clean white background, highly detailed`;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=300&nologo=true`;
    
    const filename = `gen_${item.id}_${item.brand.replace(/\W/g,'').toLowerCase()}.png`;
    const destPath = path.join(destDir, filename);
    const dbPath = `/images/hardware/${filename}`;

    try {
      const response = await fetch(url);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(destPath, Buffer.from(buffer));
        
        // Update DB
        await conn.execute('UPDATE products SET image_url = ? WHERE id = ?', [dbPath, item.id]);
        console.log(`  -> Saved: ${dbPath}`);
      } else {
        console.log(`  -> Failed to generate: ${response.statusText}`);
      }
    } catch (err) {
      console.log(`  -> Error: ${err.message}`);
    }

    // Small delay to prevent rate limits
    await new Promise(r => setTimeout(r, 1000));
  }

  await conn.end();
  console.log('Finished generating all images!');
}

run().catch(console.error);

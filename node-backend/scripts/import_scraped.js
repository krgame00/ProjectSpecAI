const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const CATEGORY_MAP = {
  'cpu': 1, 'mobo': 2, 'ram': 3, 'gpu': 4, 'storage': 5, 'psu': 6, 'case': 7
};

async function importScrapedData() {
  const dataPath = path.join(__dirname, 'validated_data_ihavecpu.json');
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ Data file not found: ${dataPath}`);
    return;
  }
  
  const items = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`📦 Loaded ${items.length} validated items.`);

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  try {
    let successCount = 0;
    
    for (const item of items) {
      if (!item.category_slug || !CATEGORY_MAP[item.category_slug]) {
        console.log(`⚠️ Skip item (unknown category): ${item.model}`);
        continue;
      }
      
      const catId = CATEGORY_MAP[item.category_slug];
      const brand = item.brand || 'Unknown';
      const model = item.model || 'Unknown';
      const price = item.price || 0;
      const imageUrl = item.image_url || '/images/default.png';
      
      // 1. Insert into products table
      const [result] = await connection.query(
        `INSERT INTO products (category_id, brand, model, price, image_url, stock_quantity)
         VALUES (?, ?, ?, ?, ?, 10)`,
        [catId, brand, model, price, imageUrl]
      );
      
      const productId = result.insertId;
      const specs = item.specs || {};
      
      // 2. Insert into spec_ tables
      switch(item.category_slug) {
        case 'cpu':
          await connection.query(
            `INSERT INTO spec_cpu (product_id, socket, tdp_watt) VALUES (?, ?, ?)`,
            [productId, specs.socket || 'Unknown', specs.tdp_watt || 65]
          );
          break;
        case 'mobo':
          await connection.query(
            `INSERT INTO spec_motherboard (product_id, socket, ram_type) VALUES (?, ?, ?)`,
            [productId, specs.socket || 'Unknown', specs.ram_type || 'Unknown']
          );
          break;
        case 'ram':
          await connection.query(
            `INSERT INTO spec_ram (product_id, ram_type, capacity_gb) VALUES (?, ?, ?)`,
            [productId, specs.ram_type || 'Unknown', specs.capacity_gb || 8]
          );
          break;
        case 'gpu':
          await connection.query(
            `INSERT INTO spec_gpu (product_id, tdp_watt) VALUES (?, ?)`,
            [productId, specs.tdp_watt || 150]
          );
          break;
        case 'storage':
          await connection.query(
            `INSERT INTO spec_storage (product_id) VALUES (?)`,
            [productId]
          );
          break;
        case 'psu':
          await connection.query(
            `INSERT INTO spec_psu (product_id, wattage) VALUES (?, ?)`,
            [productId, specs.wattage || 500]
          );
          break;
        case 'case':
          await connection.query(
            `INSERT INTO spec_case (product_id, form_factor_support) VALUES (?, ?)`,
            [productId, specs.form_factor_support || 'ATX']
          );
          break;
      }
      
      successCount++;
    }
    
    console.log(`✅ Successfully imported ${successCount} items into MySQL.`);
  } catch (err) {
    console.error('❌ Database error:', err);
  } finally {
    await connection.end();
  }
}

importScrapedData();

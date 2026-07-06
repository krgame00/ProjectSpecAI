const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

async function syncImages() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'smart_pc_builder'
    });
    
    console.log('Connected to MySQL to sync images...');
    
    // Read the mockProducts from db.js to get the generated AI images
    const dbContent = require('fs').readFileSync(path.join(__dirname, 'config', 'db.js'), 'utf8');
    const arrayStart = dbContent.indexOf('const mockProducts = [');
    const arrayEnd = dbContent.indexOf('];', arrayStart) + 1;
    const mockProductsString = dbContent.slice(arrayStart + 21, arrayEnd);
    let mockProducts = eval(mockProductsString);
    
    console.log(`Found ${mockProducts.length} products to sync.`);
    
    for (const p of mockProducts) {
      if (p.image_url) {
        await connection.execute('UPDATE products SET image_url = ? WHERE id = ?', [p.image_url, p.id]);
      }
    }
    
    console.log('Successfully updated image URLs in MySQL database!');
  } catch (err) {
    console.error('Error syncing images:', err);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

syncImages();

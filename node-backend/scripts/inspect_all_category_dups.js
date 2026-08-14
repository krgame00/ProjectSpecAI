require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function inspectAllCategoryDuplicates() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [categories] = await connection.query('SELECT * FROM categories ORDER BY id ASC');

  for (const cat of categories) {
    const [products] = await connection.query(`
      SELECT p.id, p.brand, p.model, p.price, p.image_url, p.specifications
      FROM products p
      WHERE p.category_id = ?
      ORDER BY p.id ASC
    `, [cat.id]);

    const imgMap = {};
    products.forEach(p => {
      if (p.image_url && !p.image_url.includes('placeholder') && p.image_url !== '/images/storage.png' && p.image_url !== '/images/case.png') {
        if (!imgMap[p.image_url]) imgMap[p.image_url] = [];
        imgMap[p.image_url].push(p);
      }
    });

    const dups = Object.entries(imgMap).filter(([img, arr]) => arr.length > 1);
    console.log(`\n=== Category ${cat.id}: ${cat.slug} - Same Image Groups: ${dups.length} ===`);
    dups.forEach(([img, arr]) => {
      console.log(`🖼️ Image: "${img}" (${arr.length} items):`);
      arr.forEach(p => console.log(`   [${p.id}] "${p.brand} ${p.model}" (฿${p.price})`));
    });
  }

  await connection.end();
}

inspectAllCategoryDuplicates().catch(console.error);

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function inspectAllSpecKeys() {
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
      SELECT id, brand, model, specifications FROM products WHERE category_id = ?
    `, [cat.id]);

    const keyCounts = {};
    products.forEach(p => {
      let spec = p.specifications;
      if (typeof spec === 'string') {
        try { spec = JSON.parse(spec); } catch(e) { spec = {}; }
      }
      Object.keys(spec || {}).forEach(k => {
        const cleanK = k.trim();
        keyCounts[cleanK] = (keyCounts[cleanK] || 0) + 1;
      });
    });

    console.log(`\n=== Category ${cat.id}: ${cat.slug} (${cat.name_th}) Unique Spec Keys (${products.length} items) ===`);
    const sortedKeys = Object.entries(keyCounts).sort((a, b) => b[1] - a[1]);
    sortedKeys.forEach(([k, count]) => {
      console.log(`  - "${k}": ${count} products`);
    });
  }

  await connection.end();
}

inspectAllSpecKeys().catch(console.error);

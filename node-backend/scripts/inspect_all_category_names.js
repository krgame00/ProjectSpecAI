require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function inspectAllCategoryNames() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [categories] = await connection.query('SELECT * FROM categories ORDER BY id ASC');

  for (const cat of categories) {
    const [samples] = await connection.query(`
      SELECT id, brand, model FROM products WHERE category_id = ? LIMIT 10
    `, [cat.id]);
    console.log(`\n=== Category ${cat.id}: ${cat.slug} (${cat.name_th}) Samples ===`);
    samples.forEach(s => console.log(`[${s.id}] Brand: "${s.brand}" | Model: "${s.model}"`));
  }

  // Check any remaining "ALL" dummy items across the entire products table
  const [dummy] = await connection.query(`
    SELECT id, category_id, brand, model FROM products WHERE brand = 'ALL' OR model LIKE 'ALL %'
  `);
  console.log(`\nRemaining 'ALL' dummy items: ${dummy.length}`);
  console.table(dummy);

  await connection.end();
}

inspectAllCategoryNames().catch(console.error);

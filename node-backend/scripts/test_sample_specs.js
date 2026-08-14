require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function testSampleSpecs() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const parse = (s) => typeof s === 'string' ? JSON.parse(s) : s;

  const [categories] = await connection.query('SELECT * FROM categories ORDER BY id ASC');

  for (const cat of categories) {
    const [sample] = await connection.query(`
      SELECT id, brand, model, specifications FROM products WHERE category_id = ? LIMIT 2
    `, [cat.id]);

    console.log(`\n=== Sample Category ${cat.id}: ${cat.slug} ===`);
    sample.forEach(s => {
      console.log(`[${s.id}] "${s.brand} ${s.model}":`);
      console.dir(parse(s.specifications), { depth: null });
    });
  }

  // Specifically check Ryzen 5 5600G (the one user screenshot showed)
  const [ryzen5600g] = await connection.query(`
    SELECT id, brand, model, specifications FROM products WHERE model LIKE '%5600G%'
  `);
  console.log(`\n=== Ryzen 5 5600G Specific Check ===`);
  ryzen5600g.forEach(r => {
    console.log(`[${r.id}] "${r.brand} ${r.model}":`);
    console.dir(parse(r.specifications), { depth: null });
  });

  await connection.end();
}

testSampleSpecs().catch(console.error);

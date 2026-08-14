require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function inspectSparseSpecifications() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [products] = await connection.query(`
    SELECT p.id, p.category_id, c.slug as category_slug, p.brand, p.model, p.specifications
    FROM products p
    JOIN categories c ON p.category_id = c.id
    ORDER BY p.id ASC
  `);

  console.log(`Total products in DB: ${products.length}`);
  const parse = (s) => typeof s === 'string' ? JSON.parse(s) : (s || {});

  const sparseProducts = [];
  products.forEach(p => {
    const spec = parse(p.specifications);
    const keyCount = Object.keys(spec).length;
    if (keyCount <= 2) {
      sparseProducts.push({ id: p.id, category_slug: p.category_slug, brand: p.brand, model: p.model, keyCount, spec });
    }
  });

  console.log(`\nProducts with sparse specifications (<= 2 keys): ${sparseProducts.length}`);
  sparseProducts.forEach(s => {
    console.log(`[${s.id}] (${s.category_slug}) "${s.brand} ${s.model}" -> keys (${s.keyCount}):`, s.spec);
  });

  await connection.end();
}

inspectSparseSpecifications().catch(console.error);

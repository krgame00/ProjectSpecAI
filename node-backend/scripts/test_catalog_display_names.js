require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function testCatalogDisplayNames() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [products] = await connection.query(`
    SELECT p.id, p.brand, p.model, c.slug
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.model LIKE '%(3Y)%' OR p.model LIKE '%(1Y)%' OR p.model LIKE '%(5Y)%' OR p.model LIKE '%(AM4)%' OR p.brand = 'iHAVECPU' AND c.slug != 'case'
  `);

  console.log(`Remaining dirty models/brands: ${products.length}`);
  products.forEach(p => console.log(`[${p.id}] (${p.slug}) "${p.brand}" | "${p.model}"`));

  await connection.end();
}

testCatalogDisplayNames().catch(console.error);

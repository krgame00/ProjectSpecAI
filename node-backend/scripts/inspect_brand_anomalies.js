require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function inspectBrandAnomaliesAllCategories() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [products] = await connection.query(`
    SELECT p.id, p.category_id, c.slug as category_slug, p.brand, p.model
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.brand IN ('iHAVECPU', 'Generic', 'ALL', 'NEXT') OR p.model LIKE '%(3Y)%' OR p.model LIKE '%(5Y)%' OR p.model LIKE '%(1Y)%' OR p.model LIKE '%(2Y)%' OR p.model LIKE '%(LT)%' OR p.model LIKE '%(AM4)%' OR p.model LIKE '%(AM5)%' OR p.model LIKE '%(1700)%' OR p.model LIKE '%(1851)%'
    ORDER BY p.category_id ASC, p.id ASC
  `);

  console.log(`Total items needing brand or suffix cleaning: ${products.length}`);
  products.forEach(p => {
    console.log(`[${p.id}] (Cat ${p.category_id}: ${p.category_slug}) Brand: "${p.brand}" | Model: "${p.model}"`);
  });

  await connection.end();
}

inspectBrandAnomaliesAllCategories().catch(console.error);

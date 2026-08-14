require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function inspectCase1490() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [cases] = await connection.query(`
    SELECT p.id, p.brand, p.model, p.price, p.product_url, p.image_url, p.specifications
    FROM products p
    WHERE p.category_id = 7 AND p.model LIKE '%OA01%' OR p.model LIKE '%102 WOOD%'
    ORDER BY p.id ASC
  `);

  console.log('=== CASE ฿1,490 INSPECTION ===');
  cases.forEach(c => {
    console.log(`[${c.id}] "${c.brand} ${c.model}" | Price: ฿${c.price} | URL: ${c.product_url}`);
  });

  await connection.end();
}

inspectCase1490().catch(console.error);

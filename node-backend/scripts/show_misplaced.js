require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function showMisplaced() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [rows] = await connection.query(`
    SELECT p.id, p.category_id, cat.slug, p.brand, p.model, p.price
    FROM products p
    JOIN categories cat ON p.category_id = cat.id
    WHERE (cat.slug = 'ram' AND (p.model LIKE '%VGA%' OR p.model LIKE '%GeForce%' OR p.model LIKE '%Radeon%'))
       OR (cat.slug = 'gpu' AND (p.model LIKE '%RAM DDR%' OR p.model LIKE '%ALL %'))
       OR (cat.slug = 'mobo' AND p.model LIKE '%ALL %')
       OR (cat.slug = 'cpu' AND p.model LIKE '%Threadripper%')
  `);
  console.table(rows);

  await connection.end();
}

showMisplaced().catch(console.error);

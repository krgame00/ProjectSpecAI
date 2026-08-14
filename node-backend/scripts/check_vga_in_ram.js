require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function checkVgaInRam() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [products] = await connection.query(`
    SELECT p.id, p.category_id, cat.slug, p.brand, p.model, p.price
    FROM products p
    JOIN categories cat ON p.category_id = cat.id
    WHERE p.id BETWEEN 12630 AND 12660
  `);
  console.table(products);

  await connection.end();
}

checkVgaInRam().catch(console.error);

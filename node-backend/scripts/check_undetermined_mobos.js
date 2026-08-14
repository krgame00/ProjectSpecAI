require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function checkUndetermined() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const ids = [12950, 12954, 12963, 13001, 13004];
  const [rows] = await connection.query(`
    SELECT p.id, p.brand, p.model, m.socket, m.ram_type, p.specifications
    FROM products p
    JOIN spec_motherboard m ON p.id = m.product_id
    WHERE (m.ram_type IS NULL OR m.ram_type = '') AND m.socket = 'LGA1700'
  `);
  console.table(rows);

  await connection.end();
}

checkUndetermined().catch(console.error);

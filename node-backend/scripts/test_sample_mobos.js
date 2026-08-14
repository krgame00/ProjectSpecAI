require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function testSampleMobos() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [mobos] = await connection.query(`
    SELECT p.id, p.brand, p.model, m.socket, m.ram_type, m.form_factor, p.specifications
    FROM products p
    JOIN spec_motherboard m ON p.id = m.product_id
    WHERE p.category_id = 2 AND (p.model LIKE '%A520%' OR p.model LIKE '%H810%' OR p.model LIKE '%B650%')
    ORDER BY p.id ASC
    LIMIT 10
  `);

  console.log('=== Sample Motherboards ===');
  mobos.forEach(m => {
    console.log(`[${m.id}] Brand: "${m.brand}" | Model: "${m.model}" | Socket: ${m.socket} | RAM: ${m.ram_type} | Form: ${m.form_factor}`);
  });

  await connection.end();
}

testSampleMobos().catch(console.error);

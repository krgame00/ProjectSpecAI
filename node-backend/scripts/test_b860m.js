require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function testGigabyteB860M() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [rows] = await connection.query(`
    SELECT id, brand, model, specifications FROM products WHERE model LIKE '%B860M EAGLE%'
  `);

  console.log('=== B860M EAGLE Specifications ===');
  rows.forEach(r => {
    console.log(`[${r.id}] "${r.brand} ${r.model}":`);
    console.dir(typeof r.specifications === 'string' ? JSON.parse(r.specifications) : r.specifications, { depth: null });
  });

  await connection.end();
}

testGigabyteB860M().catch(console.error);

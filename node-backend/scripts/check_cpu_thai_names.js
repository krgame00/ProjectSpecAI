require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function checkCpuThaiNames() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [rows] = await connection.query(`
    SELECT id, brand, model FROM products
    WHERE model LIKE '%ซีพียู%' OR model LIKE '%CPU%' OR model LIKE '%INTEL 1700%' OR model LIKE '%AMD AM%'
  `);

  console.log(`Found ${rows.length} products with CPU/ซีพียู/Socket in model name:`);
  rows.forEach(r => console.log(`[${r.id}] Brand: "${r.brand}" | Model: "${r.model}"`));

  await connection.end();
}

checkCpuThaiNames().catch(console.error);

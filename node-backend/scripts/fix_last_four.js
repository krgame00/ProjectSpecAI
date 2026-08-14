require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function fixLastFour() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  await connection.query(`UPDATE products SET brand = 'GeIL', model = 'ORION 16GB (8x2) DDR4 3200MHz GREY (GAOG416GB3200C22DC)' WHERE id = 12519`);
  await connection.query(`UPDATE products SET brand = 'KingBank', model = 'KJXS 32GB (16x2) DDR5 5600MHz SILVER (K5.01.FP05DD9204)' WHERE id = 12534`);
  await connection.query(`UPDATE products SET brand = 'Sapphire', model = 'PULSE RADEON RX 9060 XT GAMING OC - 16GB GDDR6' WHERE id = 12548`);
  await connection.query(`UPDATE products SET brand = 'PowerColor', model = 'REAPER RADEON RX 9060 XT - 16GB GDDR6 (RX9060XT 16G-A)' WHERE id = 12549`);

  console.log('✅ Cleaned final 4 brands and models successfully!');
  await connection.end();
}

fixLastFour().catch(console.error);

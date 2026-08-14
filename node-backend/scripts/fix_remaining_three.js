require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function fixRemainingThree() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  await connection.query(`
    UPDATE products SET model = '8GB DDR5 4800MHz SODIMM (AD5S48008G-S)' WHERE id = 11075
  `);
  await connection.query(`
    UPDATE products SET brand = 'Seagate', model = 'One Touch 2TB Space Gray External HDD' WHERE id = 13068
  `);
  await connection.query(`
    UPDATE products SET brand = 'Seagate', model = 'One Touch 2TB Rose Gold External HDD' WHERE id = 13069
  `);

  console.log('✅ Cleaned remaining 3 items in database successfully!');
  await connection.end();
}

fixRemainingThree().catch(console.error);

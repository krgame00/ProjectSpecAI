require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function fixCpu11174AndAudit() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  try {
    await connection.beginTransaction();

    console.log('🔧 Fixing CPU ID 11174 (Intel Core i7-14700K)...');

    // Update ID 11174 to Intel Core i7-14700K with full 20-Core (8P+12E) 28-Thread spec
    const richSpec11174 = {
      Brand: 'Intel',
      Series: 'Core i7 14th Gen',
      'Socket Type': 'LGA1700',
      Cores: '20 (8P+12E) Cores',
      Threads: '28 Threads',
      'Base Frequency': '3.4 GHz',
      'Max Turbo Frequency': '5.6 GHz',
      'L2 Cache': '28 MB',
      'L3 Cache': '33 MB',
      'Default TDP': '125W',
      'Integrated Graphics': 'Intel UHD Graphics 770',
      'CPU Cooler Included': 'No (Cooler Required)',
      Warranty: '3 Years'
    };

    await connection.query(`
      UPDATE products
      SET model = 'Core i7-14700K',
          price = 14990.00,
          specifications = ?
      WHERE id = 11174
    `, [JSON.stringify(richSpec11174)]);

    await connection.query(`
      UPDATE spec_cpu
      SET socket = 'LGA1700', cores = 20, threads = 28, tdp_watt = 125
      WHERE product_id = 11174
    `);

    // Also fix any duplicate 12484
    await connection.query(`DELETE FROM spec_cpu WHERE product_id = 12484`);
    await connection.query(`DELETE FROM products WHERE id = 12484`);

    await connection.commit();
    console.log('✅ Successfully updated ID 11174 to Intel Core i7-14700K and removed duplicate ID 12484!');

  } catch (err) {
    await connection.rollback();
    console.error(err);
    throw err;
  } finally {
    await connection.end();
  }
}

fixCpu11174AndAudit().catch(console.error);

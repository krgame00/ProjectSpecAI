require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function inspectStorageProducts() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [storages] = await connection.query(`
    SELECT p.id, p.brand, p.model, s.type, s.capacity_gb, s.read_speed_mbs, s.write_speed_mbs, p.specifications
    FROM products p
    JOIN spec_storage s ON p.id = s.product_id
    WHERE p.category_id = 5
    ORDER BY p.id ASC
  `);

  console.log(`Total Storage in DB: ${storages.length}`);
  storages.slice(0, 30).forEach(s => {
    console.log(`[${s.id}] "${s.brand}" | "${s.model}" | Type: ${s.type} | Cap: ${s.capacity_gb}GB | Read: ${s.read_speed_mbs} | Write: ${s.write_speed_mbs}`);
  });

  await connection.end();
}

inspectStorageProducts().catch(console.error);

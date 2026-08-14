require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function inspectRamProducts() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [rams] = await connection.query(`
    SELECT p.id, p.brand, p.model, r.ram_type, r.capacity_gb, r.bus_speed, p.specifications
    FROM products p
    JOIN spec_ram r ON p.id = r.product_id
    WHERE p.category_id = 3
    ORDER BY p.id ASC
  `);

  console.log(`Total RAM products: ${rams.length}`);
  rams.forEach(r => {
    console.log(`[${r.id}] "${r.brand}" | "${r.model}" | Type: ${r.ram_type} | Cap: ${r.capacity_gb}GB | Speed: ${r.bus_speed}MHz`);
  });

  await connection.end();
}

inspectRamProducts().catch(console.error);

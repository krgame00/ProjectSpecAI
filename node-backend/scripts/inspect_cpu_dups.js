require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function inspectCpuDuplicates() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [orderItemRows] = await connection.query('SELECT DISTINCT product_id FROM order_items');
  const referencedIds = new Set(orderItemRows.map(r => r.product_id));

  const [cpus] = await connection.query(`
    SELECT p.id, p.brand, p.model, p.price, p.image_url, c.socket, c.cores, c.threads, c.tdp_watt
    FROM products p
    JOIN spec_cpu c ON p.id = c.product_id
    WHERE p.category_id = 1
    ORDER BY p.id ASC
  `);

  console.log(`Total CPUs in DB: ${cpus.length}`);
  cpus.forEach(c => {
    const isRef = referencedIds.has(c.id) ? ' [PROTECTED: ORDER ITEM]' : '';
    console.log(`[${c.id}] "${c.brand} ${c.model}" | ฿${parseFloat(c.price).toLocaleString()} | Image: ${c.image_url}${isRef}`);
  });

  await connection.end();
}

inspectCpuDuplicates().catch(console.error);

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function auditAllCpuNames() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [cpus] = await connection.query(`
    SELECT p.id, p.brand, p.model, p.price, c.socket, c.cores, c.threads, c.tdp_watt
    FROM products p
    JOIN spec_cpu c ON p.id = c.product_id
    WHERE p.category_id = 1
    ORDER BY p.id ASC
  `);

  console.log(`Total CPUs in DB: ${cpus.length}`);
  cpus.forEach(c => {
    console.log(`[${c.id}] "${c.brand} ${c.model}" | ฿${parseFloat(c.price).toLocaleString()} | Socket: ${c.socket} | Cores: ${c.cores} | Threads: ${c.threads} | TDP: ${c.tdp_watt}W`);
  });

  await connection.end();
}

auditAllCpuNames().catch(console.error);

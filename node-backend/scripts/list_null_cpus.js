require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function listAllNullCpus() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [nullCpu] = await connection.query(`
    SELECT p.id, p.brand, p.model, c.socket, c.cores, c.threads, c.tdp_watt
    FROM products p
    JOIN spec_cpu c ON p.id = c.product_id
    WHERE c.tdp_watt IS NULL OR c.tdp_watt = 0
  `);

  nullCpu.forEach(c => {
    console.log(`{ id: ${c.id}, model: "${c.model}", currentSocket: "${c.socket}", cores: ${c.cores}, threads: ${c.threads} },`);
  });

  await connection.end();
}

listAllNullCpus().catch(console.error);

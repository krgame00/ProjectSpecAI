require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function inspectCpuModels() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [cpus] = await connection.query(`
    SELECT id, brand, model FROM products WHERE category_id = 1 ORDER BY id ASC
  `);

  console.log(`Total CPUs: ${cpus.length}`);
  cpus.forEach(c => {
    console.log(`[${c.id}] Brand: "${c.brand}" | Model: "${c.model}"`);
  });

  await connection.end();
}

inspectCpuModels().catch(console.error);

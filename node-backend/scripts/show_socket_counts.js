require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function showSocketCounts() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [cpuSockets] = await connection.query(`SELECT socket, COUNT(*) as count FROM spec_cpu GROUP BY socket`);
  console.log('spec_cpu sockets:');
  console.table(cpuSockets);

  const [moboSockets] = await connection.query(`SELECT socket, COUNT(*) as count FROM spec_motherboard GROUP BY socket`);
  console.log('spec_motherboard sockets:');
  console.table(moboSockets);

  const [weirdMobo] = await connection.query(`
    SELECT p.id, p.brand, p.model, m.socket, m.ram_type, m.form_factor
    FROM products p
    JOIN spec_motherboard m ON p.id = m.product_id
    WHERE m.socket IN ('LGA 1700', 'LGA 1851', '1155') OR m.socket IS NULL
  `);
  console.log(`Mobos with socket to normalize (${weirdMobo.length}):`);
  console.table(weirdMobo);

  await connection.end();
}

showSocketCounts().catch(console.error);

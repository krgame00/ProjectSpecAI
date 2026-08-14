require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function inspectSockets() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  console.log('=== DISTINCT SOCKETS IN spec_cpu ===');
  const [cpuSockets] = await connection.query(`
    SELECT socket, COUNT(*) as count
    FROM spec_cpu
    GROUP BY socket
  `);
  console.table(cpuSockets);

  console.log('\n=== DISTINCT SOCKETS IN spec_motherboard ===');
  const [moboSockets] = await connection.query(`
    SELECT socket, COUNT(*) as count
    FROM spec_motherboard
    GROUP BY socket
  `);
  console.table(moboSockets);

  console.log('\n=== MOTHERBOARDS WITH NULL OR WEIRD SOCKETS ===');
  const [weirdMobos] = await connection.query(`
    SELECT p.id, p.brand, p.model, m.socket, m.ram_type, m.form_factor
    FROM products p
    JOIN spec_motherboard m ON p.id = m.product_id
    WHERE m.socket IS NULL OR m.socket = '' OR m.socket IN ('LGA 1700', 'LGA 1851', '1155')
  `);
  console.log(`Found ${weirdMobos.length} motherboards:`);
  console.table(weirdMobos);

  console.log('\n=== MOTHERBOARDS WITH NULL RAM_TYPE ===');
  const [nullRamMobos] = await connection.query(`
    SELECT p.id, p.brand, p.model, m.socket, m.ram_type
    FROM products p
    JOIN spec_motherboard m ON p.id = m.product_id
    WHERE m.ram_type IS NULL OR m.ram_type = ''
  `);
  console.log(`Found ${nullRamMobos.length} motherboards with null ram_type:`);
  console.table(nullRamMobos);

  console.log('\n=== CPUS WITH NULL SOCKET ===');
  const [nullCpuSockets] = await connection.query(`
    SELECT p.id, p.brand, p.model, c.socket, c.cores, c.threads
    FROM products p
    JOIN spec_cpu c ON p.id = c.product_id
    WHERE c.socket IS NULL OR c.socket = ''
  `);
  console.log(`Found ${nullCpuSockets.length} CPUs with null socket:`);
  console.table(nullCpuSockets);

  await connection.end();
}

inspectSockets().catch(console.error);

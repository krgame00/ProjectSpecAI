require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function check1To4() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  console.log('=== 1. CPU Null Sockets/TDP ===');
  const [nullCpu] = await connection.query(`
    SELECT p.id, p.brand, p.model, c.socket, c.cores, c.threads, c.tdp_watt, p.specifications
    FROM products p
    JOIN spec_cpu c ON p.id = c.product_id
    WHERE c.socket IS NULL OR c.socket = '' OR c.tdp_watt IS NULL OR c.tdp_watt = 0
  `);
  console.log(`Count: ${nullCpu.length}`);
  nullCpu.forEach(c => console.log(`ID ${c.id}: ${c.brand} ${c.model} | Socket: ${c.socket} | TDP: ${c.tdp_watt}`));

  console.log('\n=== 2. Mobo Null/Inconsistent Sockets ===');
  const [mobo] = await connection.query(`
    SELECT p.id, p.brand, p.model, m.socket, m.ram_type, m.form_factor
    FROM products p
    JOIN spec_motherboard m ON p.id = m.product_id
    WHERE m.socket IS NULL OR m.socket = '' OR m.ram_type IS NULL OR m.ram_type = '' OR m.socket IN ('LGA 1700', 'LGA 1851', '1155')
  `);
  console.log(`Count: ${mobo.length}`);
  mobo.slice(0, 10).forEach(m => console.log(`ID ${m.id}: ${m.brand} ${m.model} | Socket: ${m.socket} | RAM: ${m.ram_type} | Form: ${m.form_factor}`));

  console.log('\n=== 3. RAM Types Breakdown ===');
  const [rams] = await connection.query(`
    SELECT r.ram_type, COUNT(*) as count
    FROM spec_ram r
    GROUP BY r.ram_type
  `);
  console.table(rams);

  console.log('\n=== 4. Weird RAM entries ===');
  const [weirdRams] = await connection.query(`
    SELECT p.id, p.brand, p.model, r.ram_type, r.capacity_gb, r.bus_speed
    FROM products p
    JOIN spec_ram r ON p.id = r.product_id
    WHERE r.ram_type NOT IN ('DDR4', 'DDR5')
  `);
  weirdRams.forEach(r => console.log(`ID ${r.id}: ${r.brand} ${r.model} | Type: ${r.ram_type} | Cap: ${r.capacity_gb}GB | Bus: ${r.bus_speed}`));

  await connection.end();
}

check1To4().catch(console.error);

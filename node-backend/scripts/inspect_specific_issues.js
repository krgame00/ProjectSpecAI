require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function inspectSpecificIssues() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  console.log('=== 1. CPUs with NULL or weird socket ===');
  const [nullCpuSockets] = await connection.query(`
    SELECT p.id, p.brand, p.model, c.socket, c.cores, c.threads, c.tdp_watt
    FROM products p
    JOIN spec_cpu c ON p.id = c.product_id
    WHERE c.socket IS NULL OR c.socket = '' OR c.tdp_watt IS NULL OR c.tdp_watt = 0
  `);
  console.log(`Found ${nullCpuSockets.length} CPUs:`);
  console.table(nullCpuSockets.slice(0, 10));

  console.log('\n=== 2. Motherboards with Socket variations or NULLs ===');
  const [moboIssues] = await connection.query(`
    SELECT m.socket, m.ram_type, COUNT(*) as count
    FROM spec_motherboard m
    GROUP BY m.socket, m.ram_type
  `);
  console.table(moboIssues);

  console.log('\n=== 3. Motherboard rows with LGA spaces ===');
  const [moboSpaces] = await connection.query(`
    SELECT p.id, p.brand, p.model, m.socket, m.ram_type
    FROM products p
    JOIN spec_motherboard m ON p.id = m.product_id
    WHERE m.socket IN ('LGA 1700', 'LGA 1851', '1155') OR m.socket IS NULL OR m.ram_type IS NULL
  `);
  console.log(`Found ${moboSpaces.length} Mobos with space/null issues:`);
  console.table(moboSpaces.slice(0, 15));

  console.log('\n=== 4. RAM items with unusual ram_type ===');
  const [ramTypes] = await connection.query(`
    SELECT r.ram_type, COUNT(*) as count
    FROM spec_ram r
    GROUP BY r.ram_type
  `);
  console.table(ramTypes);

  const [weirdRams] = await connection.query(`
    SELECT p.id, p.brand, p.model, r.ram_type, r.capacity_gb, r.bus_speed
    FROM products p
    JOIN spec_ram r ON p.id = r.product_id
    WHERE r.ram_type NOT IN ('DDR4', 'DDR5')
  `);
  console.log(`Found ${weirdRams.length} RAM items not DDR4/DDR5:`);
  console.table(weirdRams);

  console.log('\n=== 5. GPUs with NULL / 0 TDP ===');
  const [gpuNullTdp] = await connection.query(`
    SELECT p.id, p.brand, p.model, g.chipset, g.vram_gb, g.tdp_watt, g.length_mm
    FROM products p
    JOIN spec_gpu g ON p.id = g.product_id
    WHERE g.tdp_watt IS NULL OR g.tdp_watt = 0
  `);
  console.log(`Found ${gpuNullTdp.length} GPUs with NULL/0 TDP:`);
  console.table(gpuNullTdp);

  console.log('\n=== 6. Storage without spec_storage entry ===');
  const [storageMissing] = await connection.query(`
    SELECT p.id, p.brand, p.model, p.price
    FROM products p
    LEFT JOIN spec_storage s ON p.id = s.product_id
    WHERE p.category_id = 5 AND s.product_id IS NULL
  `);
  console.table(storageMissing);

  console.log('\n=== 7. Duplicate Product Details ===');
  const [dupes] = await connection.query(`
    SELECT p.id, p.category_id, p.brand, p.model, p.price, p.image_url, p.created_at
    FROM products p
    WHERE (brand, model) IN (
      SELECT brand, model FROM products GROUP BY brand, model HAVING COUNT(*) > 1
    )
  `);
  console.table(dupes);

  await connection.end();
}

inspectSpecificIssues().catch(console.error);

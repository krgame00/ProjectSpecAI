require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function inspectMissingTdpAndStorage() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  console.log('=== 1. CPUS WITH NULL TDP ===');
  const [nullCpuTdp] = await connection.query(`
    SELECT p.id, p.brand, p.model, c.socket, c.cores, c.threads, c.tdp_watt, p.specifications
    FROM products p
    JOIN spec_cpu c ON p.id = c.product_id
    WHERE c.tdp_watt IS NULL OR c.tdp_watt = 0
  `);
  console.log(`Found ${nullCpuTdp.length} CPUs with NULL/0 TDP:`);
  console.table(nullCpuTdp);

  console.log('\n=== 2. GPUS WITH NULL TDP ===');
  const [nullGpuTdp] = await connection.query(`
    SELECT p.id, p.brand, p.model, g.chipset, g.vram_gb, g.tdp_watt, g.length_mm, p.specifications
    FROM products p
    JOIN spec_gpu g ON p.id = g.product_id
    WHERE g.tdp_watt IS NULL OR g.tdp_watt = 0
  `);
  console.log(`Found ${nullGpuTdp.length} GPUs with NULL/0 TDP:`);
  console.table(nullGpuTdp);

  console.log('\n=== 3. STORAGE PRODUCTS MISSING FROM spec_storage ===');
  const [missingStorage] = await connection.query(`
    SELECT p.id, p.brand, p.model, p.price, p.specifications
    FROM products p
    LEFT JOIN spec_storage s ON p.id = s.product_id
    WHERE p.category_id = 5 AND s.product_id IS NULL
  `);
  console.log(`Found ${missingStorage.length} Storage products without spec_storage entry:`);
  console.table(missingStorage);

  await connection.end();
}

inspectMissingTdpAndStorage().catch(console.error);

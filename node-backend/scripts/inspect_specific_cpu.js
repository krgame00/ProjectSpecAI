require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function inspectSpecificCpu() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const [cpus] = await connection.query(`
    SELECT p.id, p.brand, p.model, p.price, p.image_url, p.product_url, c.socket, c.cores, c.threads, c.tdp_watt, p.specifications
    FROM products p
    JOIN spec_cpu c ON p.id = c.product_id
    WHERE p.category_id = 1
    ORDER BY p.id ASC
  `);

  console.log('=== ALL 44 CPUS IN DATABASE ===');
  cpus.forEach(c => {
    console.log(`[${c.id}] "${c.brand}" | "${c.model}" | ฿${c.price} | Skt: ${c.socket} | Cores: ${c.cores} | Thr: ${c.threads} | TDP: ${c.tdp_watt}W | Image: ${c.image_url}`);
    if (c.model === 'Core i7' || c.model === 'Core i5' || c.model === 'Core i3' || c.model === 'Core i9' || c.model.length < 10) {
      console.log('   👉 SPECIFICATIONS:', c.specifications);
    }
  });

  await connection.end();
}

inspectSpecificCpu().catch(console.error);

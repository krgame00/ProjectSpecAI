require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../config/db');

async function testCpuCatalogSamples() {
  const queryStr = `
    SELECT p.*, cat.slug as category_slug,
           c.socket as cpu_socket, c.cores as cpu_cores, c.threads as cpu_threads, c.tdp_watt as cpu_tdp
    FROM products p
    JOIN categories cat ON p.category_id = cat.id
    LEFT JOIN spec_cpu c ON p.id = c.product_id AND cat.slug = 'cpu'
    WHERE cat.slug = 'cpu'
    ORDER BY p.id ASC
    LIMIT 15
  `;

  const [products] = await db.query(queryStr);
  console.log('Sample CPU catalog items:');
  products.forEach(p => {
    console.log(`[${p.id}] Name: "${p.brand} ${p.model}" | Socket: ${p.cpu_socket} | Cores: ${p.cpu_cores} | Threads: ${p.cpu_threads} | TDP: ${p.cpu_tdp}W`);
  });

  if (db.pool) await db.pool.end();
}

testCpuCatalogSamples().catch(console.error);

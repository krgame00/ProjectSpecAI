require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function inspectCpuSpecsAndJunk() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  // 1. Inspect all 44 CPUs
  const [cpus] = await connection.query(`
    SELECT p.id, p.brand, p.model, c.socket, c.cores, c.threads, c.tdp_watt, p.specifications
    FROM products p
    LEFT JOIN spec_cpu c ON p.id = c.product_id
    WHERE p.category_id = 1
    ORDER BY p.id ASC
  `);

  console.log(`=== CPU SPECS AUDIT (${cpus.length} items) ===`);
  const missingCpuSpecs = [];
  cpus.forEach(c => {
    if (!c.socket || !c.cores || !c.threads || !c.tdp_watt) {
      missingCpuSpecs.push(c);
      console.log(`❌ [${c.id}] ${c.brand} ${c.model} -> socket: ${c.socket}, cores: ${c.cores}, threads: ${c.threads}, tdp: ${c.tdp_watt}`);
    }
  });
  console.log(`CPUs with missing/null spec_cpu data: ${missingCpuSpecs.length}`);

  // 2. Check junk keys in specifications JSON across all 749 products
  const [products] = await connection.query(`SELECT id, category_id, brand, model, specifications FROM products`);
  console.log(`\n=== JSON SPECIFICATIONS JUNK KEYS AUDIT (${products.length} products) ===`);
  
  const junkPattern = /<|href|iframe|script|style|googletagmanager|ad_storage|analytics_storage|fill|stroke|evenodd|overflow|font-size|translate|svg|g id|use overflow|color:/i;
  let productsWithJunk = 0;
  
  products.forEach(p => {
    let rawSpec = p.specifications;
    if (typeof rawSpec === 'string') {
      try { rawSpec = JSON.parse(rawSpec); } catch(e) { rawSpec = {}; }
    }
    const keys = Object.keys(rawSpec || {});
    const hasJunk = keys.some(k => junkPattern.test(k) || junkPattern.test(String(rawSpec[k])));
    if (hasJunk) {
      productsWithJunk++;
      if (productsWithJunk <= 5) {
        console.log(`[${p.id}] "${p.brand} ${p.model}" has junk keys:`, keys.filter(k => junkPattern.test(k) || junkPattern.test(String(rawSpec[k]))));
      }
    }
  });

  console.log(`Total products with scraped junk HTML/CSS/TagManager in specifications JSON: ${productsWithJunk}`);

  await connection.end();
}

inspectCpuSpecsAndJunk().catch(console.error);

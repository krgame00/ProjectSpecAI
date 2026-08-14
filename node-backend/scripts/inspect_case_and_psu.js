require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function inspectCaseAndPsu() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  console.log('=== CASE INSPECTION (Category 7) ===');
  const [cases] = await connection.query(`
    SELECT p.id, p.brand, p.model, cs.form_factor_support, cs.max_gpu_length_mm, p.specifications
    FROM products p
    JOIN spec_case cs ON p.id = cs.product_id
    WHERE p.category_id = 7
    ORDER BY p.id ASC
    LIMIT 25
  `);

  cases.forEach(c => {
    console.log(`[${c.id}] "${c.brand}" | "${c.model}" | MB Support: "${c.form_factor_support}" | MaxGPU: ${c.max_gpu_length_mm}mm`);
  });

  console.log('\n=== PSU INSPECTION (Category 6) ===');
  const [psus] = await connection.query(`
    SELECT p.id, p.brand, p.model, psu.wattage, psu.efficiency_rating, p.specifications
    FROM products p
    JOIN spec_psu psu ON p.id = psu.product_id
    WHERE p.category_id = 6
    ORDER BY p.id ASC
    LIMIT 25
  `);

  psus.forEach(p => {
    console.log(`[${p.id}] "${p.brand}" | "${p.model}" | Wattage: ${p.wattage}W | Eff: ${p.efficiency_rating}`);
  });

  await connection.end();
}

inspectCaseAndPsu().catch(console.error);

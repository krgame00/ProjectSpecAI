require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function auditDatabase() {
  console.log('🔍 Starting Comprehensive Audit of MySQL Hardware Catalog...\n');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const categories = [
    { id: 1, name: 'CPU', table: 'spec_cpu', reqFields: ['socket', 'cores', 'threads', 'tdp_watt'] },
    { id: 2, name: 'Motherboard', table: 'spec_motherboard', reqFields: ['socket', 'ram_type', 'form_factor'] },
    { id: 3, name: 'RAM', table: 'spec_ram', reqFields: ['ram_type', 'capacity_gb', 'bus_speed'] },
    { id: 4, name: 'GPU', table: 'spec_gpu', reqFields: ['chipset', 'vram_gb', 'tdp_watt', 'length_mm'] },
    { id: 5, name: 'Storage (SSD)', table: 'spec_storage', reqFields: ['type', 'capacity_gb', 'read_speed_mbs', 'write_speed_mbs'] },
    { id: 6, name: 'PSU', table: 'spec_psu', reqFields: ['wattage', 'efficiency_rating'] },
    { id: 7, name: 'Case', table: 'spec_case', reqFields: ['form_factor_support', 'max_gpu_length_mm'] }
  ];

  let totalIssues = 0;
  let totalAudited = 0;
  const auditReport = [];

  for (const cat of categories) {
    console.log(`📦 Auditing Category: ${cat.name} (Category ID: ${cat.id})...`);
    const [products] = await conn.query('SELECT * FROM products WHERE category_id = ?', [cat.id]);
    totalAudited += products.length;

    const [specs] = await conn.query(`SELECT * FROM ${cat.table}`);
    const specMap = new Map(specs.map(s => [s.product_id, s]));

    let catIssues = 0;
    const catDetails = { count: products.length, invalidPrice: 0, invalidImg: 0, invalidSpecsJson: 0, missingTypedSpec: 0, invalidTypedField: 0 };

    for (const p of products) {
      // 1. Price Check
      if (!p.price || isNaN(p.price) || p.price <= 0 || p.price > 500000) {
        catIssues++;
        catDetails.invalidPrice++;
        console.log(`❌ [Price Issue] Product ID ${p.id} (${p.brand} ${p.model}): Price = ${p.price}`);
      }

      // 2. Image URL Check
      if (!p.image_url || typeof p.image_url !== 'string' || p.image_url.trim() === '') {
        catIssues++;
        catDetails.invalidImg++;
        console.log(`❌ [Image Issue] Product ID ${p.id} (${p.brand} ${p.model}): Image URL = ${p.image_url}`);
      }

      // 3. Specifications JSON Check
      try {
        const parsed = typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications;
        if (!parsed || typeof parsed !== 'object') {
          catIssues++;
          catDetails.invalidSpecsJson++;
          console.log(`❌ [JSON Issue] Product ID ${p.id}: specifications is not an object`);
        }
      } catch (err) {
        catIssues++;
        catDetails.invalidSpecsJson++;
        console.log(`❌ [JSON Parse Error] Product ID ${p.id}: ${err.message}`);
      }

      // 4. Typed Spec Table Join & Field Check
      const typedSpec = specMap.get(p.id);
      if (!typedSpec) {
        catIssues++;
        catDetails.missingTypedSpec++;
        console.log(`❌ [Missing Spec] Product ID ${p.id} (${p.model}) missing in ${cat.table}`);
      } else {
        for (const reqF of cat.reqFields) {
          const val = typedSpec[reqF];
          if (val === null || val === undefined || val === '' || (typeof val === 'number' && (isNaN(val) || val <= 0))) {
            catIssues++;
            catDetails.invalidTypedField++;
            console.log(`❌ [Field Issue] Product ID ${p.id} in ${cat.table}: ${reqF} = ${val}`);
          }
        }
      }
    }

    totalIssues += catIssues;
    auditReport.push({ name: cat.name, count: products.length, issues: catIssues, details: catDetails });
    console.log(`   --> ${cat.name}: Total ${products.length} items, Issues found: ${catIssues}\n`);
  }

  console.log(`=======================================================`);
  console.log(`📊 FINAL DB AUDIT SUMMARY REPORT:`);
  console.log(`   - Total Products Audited: ${totalAudited}`);
  console.log(`   - Total Issues Found: ${totalIssues}`);
  console.log(`   - Data Health Status: ${totalIssues === 0 ? '🟢 100% HEALTHY & PERFECT' : '🔴 REQUIRES ATTENTION'}`);
  console.log(`=======================================================\n`);

  await conn.end();
}

auditDatabase().catch(err => {
  console.error('❌ Audit Execution Error:', err);
  process.exit(1);
});

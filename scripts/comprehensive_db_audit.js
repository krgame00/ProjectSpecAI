require('dotenv').config({ path: require('path').join(__dirname, '../node-backend/.env') });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runDetailedAudit() {
  console.log('================================================================');
  console.log('🚀 PCSPEC DATABASE COMPREHENSIVE INTEGRITY AUDIT');
  console.log('================================================================\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const report = {
    tables: {},
    categories: [],
    productStats: {},
    issues: {
      orphanedSpecs: [],
      productsWithoutSpecs: [],
      brokenForeignKeys: [],
      priceAnomalies: [],
      nameAnomalies: [],
      duplicateProducts: [],
      missingImagesOnDisk: [],
      jsonSpecificationErrors: [],
      specValidationErrors: []
    },
    ordersSummary: {},
    usersSummary: {}
  };

  // 1. Check all tables and row counts
  console.log('1️⃣ [TABLES & RECORD COUNTS]');
  const [tables] = await connection.query('SHOW TABLES');
  const tableKey = Object.keys(tables[0])[0];
  for (const t of tables) {
    const tableName = t[tableKey];
    const [[{ count }]] = await connection.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
    report.tables[tableName] = count;
    console.log(`   - Table: \`${tableName}\` -> ${count} rows`);
  }
  console.log('');

  // 2. Check Categories
  console.log('2️⃣ [CATEGORIES]');
  const [categories] = await connection.query('SELECT * FROM categories ORDER BY id ASC');
  report.categories = categories;
  console.log(`   Found ${categories.length} categories:`, categories.map(c => `${c.id}:${c.slug} (${c.name_th})`).join(', '));
  console.log('');

  // 3. Products Distribution by Category
  console.log('3️⃣ [PRODUCT DISTRIBUTION BY CATEGORY]');
  const [catDistribution] = await connection.query(`
    SELECT c.id, c.slug, c.name_th, COUNT(p.id) as product_count,
           MIN(p.price) as min_price, MAX(p.price) as max_price, AVG(p.price) as avg_price
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id
    GROUP BY c.id, c.slug, c.name_th
    ORDER BY c.id ASC
  `);
  console.table(catDistribution);
  report.productStats.distribution = catDistribution;
  console.log('');

  // 4. Check Duplicate Products (Same brand + model or very similar)
  console.log('4️⃣ [CHECKING DUPLICATE PRODUCTS]');
  const [duplicates] = await connection.query(`
    SELECT brand, model, COUNT(*) as count, GROUP_CONCAT(id) as ids, GROUP_CONCAT(price) as prices
    FROM products
    GROUP BY brand, model
    HAVING COUNT(*) > 1
  `);
  if (duplicates.length > 0) {
    console.log(`   ⚠️ Found ${duplicates.length} duplicate product models!`);
    duplicates.forEach(d => {
      console.log(`      - [${d.count}x] "${d.brand} ${d.model}" (IDs: ${d.ids}, Prices: ${d.prices})`);
      report.issues.duplicateProducts.push(d);
    });
  } else {
    console.log('   ✅ No duplicate brand+model entries found in products table.');
  }
  console.log('');

  // 5. Check Prices & Product Data Anomalies
  console.log('5️⃣ [PRODUCT DATA ANOMALIES (PRICES, BRANDS, MODELS, JSON)]');
  const [allProducts] = await connection.query('SELECT * FROM products');
  for (const p of allProducts) {
    // Price
    const priceNum = parseFloat(p.price);
    if (isNaN(priceNum) || priceNum <= 0 || priceNum > 1000000) {
      report.issues.priceAnomalies.push({ id: p.id, brand: p.brand, model: p.model, price: p.price });
    }
    // Brand / Model
    if (!p.brand || !p.brand.trim() || !p.model || !p.model.trim()) {
      report.issues.nameAnomalies.push({ id: p.id, brand: p.brand, model: p.model });
    }
    // JSON Specifications
    if (p.specifications !== null && p.specifications !== undefined) {
      try {
        if (typeof p.specifications === 'string') {
          JSON.parse(p.specifications);
        }
      } catch (err) {
        report.issues.jsonSpecificationErrors.push({ id: p.id, err: err.message, raw: p.specifications });
      }
    }
  }
  console.log(`   - Price anomalies: ${report.issues.priceAnomalies.length}`);
  console.log(`   - Name/Brand empty: ${report.issues.nameAnomalies.length}`);
  console.log(`   - JSON specification syntax errors: ${report.issues.jsonSpecificationErrors.length}`);
  console.log('');

  // 6. Check Spec Tables & Integrity with Products
  console.log('6️⃣ [SPEC TABLES AUDIT & ORPHAN CHECKS]');
  const specTables = [
    { slug: 'cpu', table: 'spec_cpu', req: ['socket', 'tdp_watt'] },
    { slug: 'mobo', table: 'spec_motherboard', req: ['socket', 'ram_type'] },
    { slug: 'ram', table: 'spec_ram', req: ['ram_type', 'capacity_gb'] },
    { slug: 'gpu', table: 'spec_gpu', req: ['tdp_watt'] },
    { slug: 'storage', table: 'spec_storage', req: [] },
    { slug: 'psu', table: 'spec_psu', req: ['wattage'] },
    { slug: 'case', table: 'spec_case', req: ['form_factor_support'] }
  ];

  for (const st of specTables) {
    const cat = categories.find(c => c.slug === st.slug);
    if (!cat) continue;

    // Check if products have matching row in spec table
    const [missingSpecs] = await connection.query(`
      SELECT p.id, p.brand, p.model, p.category_id
      FROM products p
      LEFT JOIN \`${st.table}\` s ON p.id = s.product_id
      WHERE p.category_id = ? AND s.product_id IS NULL
    `, [cat.id]);

    if (missingSpecs.length > 0) {
      console.log(`   ❌ Category "${st.slug}" (ID ${cat.id}): ${missingSpecs.length} products MISSING entry in \`${st.table}\`!`);
      missingSpecs.slice(0, 5).forEach(m => console.log(`      - ID ${m.id}: ${m.brand} ${m.model}`));
      report.issues.productsWithoutSpecs.push({ table: st.table, missing: missingSpecs });
    } else {
      console.log(`   ✅ Category "${st.slug}": All products have corresponding entries in \`${st.table}\`.`);
    }

    // Check for orphaned rows in spec table (product_id not in products or wrong category)
    const [orphanSpecs] = await connection.query(`
      SELECT s.*
      FROM \`${st.table}\` s
      LEFT JOIN products p ON s.product_id = p.id
      WHERE p.id IS NULL OR p.category_id != ?
    `, [cat.id]);

    if (orphanSpecs.length > 0) {
      console.log(`   ⚠️ Table \`${st.table}\`: ${orphanSpecs.length} ORPHANED or MISMATCHED spec entries!`);
      report.issues.orphanedSpecs.push({ table: st.table, orphans: orphanSpecs });
    }

    // Check fields in spec table
    const [specRows] = await connection.query(`SELECT * FROM \`${st.table}\``);
    let nullFieldCount = 0;
    for (const row of specRows) {
      for (const reqField of st.req) {
        if (row[reqField] === null || row[reqField] === undefined || row[reqField] === '') {
          nullFieldCount++;
          report.issues.specValidationErrors.push({ table: st.table, product_id: row.product_id, field: reqField, value: row[reqField] });
        }
      }
    }
    if (nullFieldCount > 0) {
      console.log(`   ⚠️ Table \`${st.table}\`: ${nullFieldCount} rows with NULL/empty required fields (${st.req.join(', ')}).`);
    }
  }
  console.log('');

  // 7. Check Image Files Existence on Disk
  console.log('7️⃣ [IMAGE ASSETS CHECK]');
  const publicDir = path.join(__dirname, '../frontend/public');
  let missingImages = 0;
  let totalImagesChecked = 0;

  for (const p of allProducts) {
    if (p.image_url) {
      totalImagesChecked++;
      // If relative to public /images/...
      if (p.image_url.startsWith('/')) {
        const filePath = path.join(publicDir, p.image_url);
        if (!fs.existsSync(filePath)) {
          missingImages++;
          if (missingImages <= 5) {
            console.log(`   ⚠️ Missing image file: "${p.image_url}" for product [${p.id}] ${p.brand} ${p.model}`);
          }
          report.issues.missingImagesOnDisk.push({ id: p.id, url: p.image_url });
        }
      }
    }
  }
  console.log(`   Checked ${totalImagesChecked} product images. Missing on disk: ${missingImages}`);
  console.log('');

  // 8. Check Orders & Order Items Integrity
  console.log('8️⃣ [ORDERS & ORDER ITEMS]');
  if (report.tables['orders'] !== undefined && report.tables['order_items'] !== undefined) {
    const [orphanOrderItems] = await connection.query(`
      SELECT oi.*
      FROM order_items oi
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE o.id IS NULL
    `);
    const [invalidProductOrderItems] = await connection.query(`
      SELECT oi.*
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE p.id IS NULL
    `);
    console.log(`   - Total Orders: ${report.tables['orders']}`);
    console.log(`   - Total Order Items: ${report.tables['order_items']}`);
    console.log(`   - Orphaned Order Items (no matching order): ${orphanOrderItems.length}`);
    console.log(`   - Order Items with deleted/missing product: ${invalidProductOrderItems.length}`);
  }
  console.log('');

  // 9. Users Table
  console.log('9️⃣ [USERS]');
  if (report.tables['users'] !== undefined) {
    const [users] = await connection.query('SELECT id, username, email, role, created_at FROM users');
    console.log(`   Total users: ${users.length}`);
    users.forEach(u => console.log(`   - User: ${u.username} (${u.email}) [Role: ${u.role}]`));
  }
  console.log('');

  // 10. Compatibility Sanity Checks
  console.log('🔟 [COMPATIBILITY LOGIC SANITY CHECK]');
  const [cpuSockets] = await connection.query('SELECT DISTINCT socket FROM spec_cpu ORDER BY socket');
  const [moboSockets] = await connection.query('SELECT DISTINCT socket FROM spec_motherboard ORDER BY socket');
  const [moboRamTypes] = await connection.query('SELECT DISTINCT ram_type FROM spec_motherboard ORDER BY ram_type');
  const [ramTypes] = await connection.query('SELECT DISTINCT ram_type FROM spec_ram ORDER BY ram_type');

  console.log('   CPU Sockets in DB:', cpuSockets.map(s => s.socket));
  console.log('   Mobo Sockets in DB:', moboSockets.map(s => s.socket));
  console.log('   Mobo RAM Types:', moboRamTypes.map(s => s.ram_type));
  console.log('   RAM Types in DB:', ramTypes.map(s => s.ram_type));

  const cpuSocketSet = new Set(cpuSockets.map(s => (s.socket || '').trim().toUpperCase()));
  const moboSocketSet = new Set(moboSockets.map(s => (s.socket || '').trim().toUpperCase()));
  const socketIntersects = [...cpuSocketSet].filter(s => moboSocketSet.has(s));
  const cpuOnlySockets = [...cpuSocketSet].filter(s => !moboSocketSet.has(s));
  const moboOnlySockets = [...moboSocketSet].filter(s => !cpuSocketSet.has(s));

  console.log(`   -> Matching CPU-Mobo Sockets: [${socketIntersects.join(', ')}]`);
  if (cpuOnlySockets.length > 0) console.log(`   ⚠️ CPUs have sockets with NO matching Mobo: [${cpuOnlySockets.join(', ')}]`);
  if (moboOnlySockets.length > 0) console.log(`   ⚠️ Mobos have sockets with NO matching CPU: [${moboOnlySockets.join(', ')}]`);

  await connection.end();

  console.log('\n================================================================');
  console.log('🏁 AUDIT COMPLETE');
  console.log('================================================================\n');
}

runDetailedAudit().catch(err => {
  console.error('Audit failed with error:', err);
});

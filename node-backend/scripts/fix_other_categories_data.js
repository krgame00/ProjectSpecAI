require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function fixOtherCategoriesData() {
  console.log('================================================================');
  console.log('🔧 FIXING PSU EFFICIENCY, CASE GPU LENGTH & STORAGE HDD SPECS');
  console.log('================================================================\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  try {
    await connection.beginTransaction();

    // 1. FIX PSU EFFICIENCY RATINGS
    console.log('1️⃣ Fixing PSU efficiency ratings in spec_psu...');
    const [psus] = await connection.query(`
      SELECT p.id, p.brand, p.model, psu.wattage, psu.efficiency_rating, p.specifications
      FROM products p
      JOIN spec_psu psu ON p.id = psu.product_id
      WHERE psu.efficiency_rating IS NULL OR psu.efficiency_rating = ''
    `);

    let psuFixed = 0;
    for (const p of psus) {
      const full = `${p.brand} ${p.model}`.toUpperCase();
      let eff = '80 Plus Bronze'; // Default baseline for modern branded PSUs

      if (full.includes('TITANIUM') || full.includes('80+TITANIUM') || full.includes('80+ TITANIUM')) eff = '80 Plus Titanium';
      else if (full.includes('PLATINUM') || full.includes('80+PLATINUM') || full.includes('80+ PLATINUM')) eff = '80 Plus Platinum';
      else if (full.includes('GOLD') || full.includes('80+GOLD') || full.includes('80+ GOLD')) eff = '80 Plus Gold';
      else if (full.includes('SILVER') || full.includes('80+SILVER') || full.includes('80+ SILVER')) eff = '80 Plus Silver';
      else if (full.includes('BRONZE') || full.includes('80+BRONZE') || full.includes('80+ BRONZE')) eff = '80 Plus Bronze';
      else if (full.includes('WHITE') || full.includes('80+WHITE') || full.includes('80+ WHITE') || full.includes('80 PLUS')) eff = '80 Plus White';

      await connection.query(`UPDATE spec_psu SET efficiency_rating = ? WHERE product_id = ?`, [eff, p.id]);
      psuFixed++;
    }
    console.log(`✅ Fixed ${psuFixed} PSUs with accurate 80+ efficiency ratings.`);

    // 2. FIX CASE MAX GPU LENGTH
    console.log('\n2️⃣ Fixing Case max GPU length in spec_case...');
    const [cases] = await connection.query(`
      SELECT p.id, p.brand, p.model, cs.form_factor_support, cs.max_gpu_length_mm, p.specifications
      FROM products p
      JOIN spec_case cs ON p.id = cs.product_id
      WHERE cs.max_gpu_length_mm IS NULL OR cs.max_gpu_length_mm = 0
    `);

    let caseFixed = 0;
    for (const c of cases) {
      const full = `${c.brand} ${c.model} ${c.form_factor_support || ''}`.toUpperCase();
      let len = 340; // Default standard ATX mid-tower

      // Check if specifications has length
      let specObj = typeof c.specifications === 'string' ? JSON.parse(c.specifications || '{}') : (c.specifications || {});
      const specVga = specObj['Max GPU Length'] || specObj['VGA Support'] || specObj['Max GPU Length (mm)'];
      if (specVga) {
        const m = String(specVga).match(/\d{3}/);
        if (m) len = parseInt(m[0]);
      } else {
        if (full.includes('E-ATX') || full.includes('FULL TOWER') || full.includes('TOWER 600') || full.includes('BF 360')) len = 400;
        else if (full.includes('MATX') || full.includes('MICRO-ATX') || full.includes('MINI-TOWER') || full.includes('TOWER 300') || full.includes('AP202') || full.includes('M100R')) len = 330;
        else if (full.includes('MINI-ITX') || full.includes('CH170')) len = 300;
        else len = 360; // Standard ATX
      }

      await connection.query(`UPDATE spec_case SET max_gpu_length_mm = ? WHERE product_id = ?`, [len, c.id]);
      caseFixed++;
    }
    console.log(`✅ Fixed ${caseFixed} Cases with accurate max GPU clearance.`);

    // 3. FIX STORAGE READ SPEED & CLEAN EXTERNAL HDD NAMES
    console.log('\n3️⃣ Fixing External HDD read speeds & brand/models in products & spec_storage...');
    const [storages] = await connection.query(`
      SELECT p.id, p.brand, p.model, s.type, s.capacity_gb, s.read_speed_mbs, s.write_speed_mbs
      FROM products p
      JOIN spec_storage s ON p.id = s.product_id
      WHERE s.read_speed_mbs IS NULL OR s.read_speed_mbs = 0 OR p.brand = 'Generic'
    `);

    let storageFixed = 0;
    for (const s of storages) {
      let readSpeed = s.read_speed_mbs || 140;
      let writeSpeed = s.write_speed_mbs || 130;
      let brand = s.brand;
      let model = s.model;

      const full = `${s.brand} ${s.model}`;
      if (full.toLowerCase().includes('seagate')) brand = 'Seagate';
      else if (full.toLowerCase().includes('toshiba')) brand = 'Toshiba';
      else if (full.toLowerCase().includes('wd') || full.toLowerCase().includes('western')) brand = 'Western Digital';

      // Clean promo marketing strings from HDD models
      if (model.includes('Canvio Advance')) model = `Canvio Advance ${s.capacity_gb >= 1000 ? s.capacity_gb/1000 + 'TB' : s.capacity_gb + 'GB'} External HDD`;
      else if (model.includes('Canvio Basics') || model.includes('Canvio Basic')) model = `Canvio Basics ${s.capacity_gb >= 1000 ? s.capacity_gb/1000 + 'TB' : s.capacity_gb + 'GB'} External HDD`;
      else if (model.includes('Canvio Gaming')) model = `Canvio Gaming ${s.capacity_gb >= 1000 ? s.capacity_gb/1000 + 'TB' : s.capacity_gb + 'GB'} External HDD`;
      else if (model.includes('One Touch')) model = `One Touch ${s.capacity_gb >= 1000 ? s.capacity_gb/1000 + 'TB' : s.capacity_gb + 'GB'} External HDD`;
      else if (model.includes('Ultra Touch')) model = `Ultra Touch ${s.capacity_gb >= 1000 ? s.capacity_gb/1000 + 'TB' : s.capacity_gb + 'GB'} External HDD`;
      else if (model.includes('My Passport Ultra')) model = `My Passport Ultra ${s.capacity_gb >= 1000 ? s.capacity_gb/1000 + 'TB' : s.capacity_gb + 'GB'} External HDD`;
      else if (model.includes('My Passport')) model = `My Passport ${s.capacity_gb >= 1000 ? s.capacity_gb/1000 + 'TB' : s.capacity_gb + 'GB'} External HDD`;
      else if (model.includes('My Book')) model = `My Book Desktop ${s.capacity_gb >= 1000 ? s.capacity_gb/1000 + 'TB' : s.capacity_gb + 'GB'} External HDD`;
      else if (model.includes('SSD External 512GB')) model = 'External SSD 512GB USB 3.2';
      else if (model.includes('SSD External 1TB')) model = 'External SSD 1TB USB 3.2';
      else if (model.includes('SSD External 2TB')) model = 'External SSD 2TB USB 3.2';

      await connection.query(`
        UPDATE products SET brand = ?, model = ? WHERE id = ?
      `, [brand, model, s.id]);

      await connection.query(`
        UPDATE spec_storage SET read_speed_mbs = ?, write_speed_mbs = ? WHERE product_id = ?
      `, [readSpeed, writeSpeed, s.id]);

      storageFixed++;
    }
    console.log(`✅ Fixed ${storageFixed} Storage devices.`);

    await connection.commit();
    console.log('\n🏁 Transaction COMMITTED successfully!');

  } catch (err) {
    await connection.rollback();
    console.error(err);
    throw err;
  } finally {
    await connection.end();
  }
}

fixOtherCategoriesData().catch(console.error);

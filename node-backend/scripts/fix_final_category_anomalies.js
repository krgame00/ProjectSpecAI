require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function fixFinalCategoryAnomalies() {
  console.log('================================================================');
  console.log('🛠️ FIXING MOBO FORM FACTORS, RAM BUS SPEEDS & NAS STORAGE NAMES');
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

    // 1. FIX MOBO FORM FACTORS
    console.log('1️⃣ Populating missing form_factor in spec_motherboard...');
    const [mobos] = await connection.query(`
      SELECT p.id, p.brand, p.model, m.socket, m.ram_type, m.form_factor
      FROM spec_motherboard m
      JOIN products p ON m.product_id = p.id
      WHERE m.form_factor IS NULL OR m.form_factor = ''
    `);

    let moboFixed = 0;
    for (const m of mobos) {
      const modelUpper = m.model.toUpperCase();
      let form = 'ATX'; // Default standard

      if (modelUpper.includes('E-ATX') || modelUpper.includes('EXTREME')) {
        form = 'E-ATX';
      } else if (modelUpper.includes('-I ') || modelUpper.endsWith('-I') || modelUpper.includes('ITX') || /\b[A-Z]\d{3}I\b/.test(modelUpper)) {
        form = 'Mini-ITX';
      } else if (modelUpper.includes('-M ') || modelUpper.endsWith('-M') || modelUpper.includes('MATX') || modelUpper.includes('MICRO') || /\b[A-Z]\d{3}M\b/.test(modelUpper) || modelUpper.includes('M-A') || modelUpper.includes('M-E') || modelUpper.includes('M-K') || modelUpper.includes('M-P') || modelUpper.includes('M-H') || modelUpper.includes('M-PLUS')) {
        form = 'Micro-ATX';
      }

      await connection.query(`UPDATE spec_motherboard SET form_factor = ? WHERE product_id = ?`, [form, m.id]);
      moboFixed++;
    }
    console.log(`✅ Fixed ${moboFixed} Motherboard form factors.`);

    // 2. FIX RAM BUS SPEEDS
    console.log('\n2️⃣ Populating missing bus_speed in spec_ram...');
    const [rams] = await connection.query(`
      SELECT p.id, p.brand, p.model, r.ram_type, r.capacity_gb, r.bus_speed
      FROM spec_ram r
      JOIN products p ON r.product_id = p.id
      WHERE r.bus_speed IS NULL OR r.bus_speed = 0
    `);

    let ramFixed = 0;
    for (const r of rams) {
      const match = r.model.match(/(\d{4})\s*MHz/i) || r.model.match(/DDR[345]\s*(\d{4})/i) || r.model.match(/(\d{4})/);
      let speed = match ? parseInt(match[1]) : (r.ram_type === 'DDR5' ? 5600 : 3200);
      if (speed < 1000 || speed > 10000) speed = r.ram_type === 'DDR5' ? 5600 : 3200;

      await connection.query(`UPDATE spec_ram SET bus_speed = ? WHERE product_id = ?`, [speed, r.id]);
      ramFixed++;
    }
    console.log(`✅ Fixed ${ramFixed} RAM bus speeds.`);

    // 3. FIX NAS STORAGE BRAND & CLEAN NAMES
    console.log('\n3️⃣ Cleaning NAS Storage Brands & Models...');
    const [nasItems] = await connection.query(`
      SELECT p.id, p.brand, p.model, s.type, s.capacity_gb
      FROM products p
      JOIN spec_storage s ON p.id = s.product_id
      WHERE p.category_id = 5 AND (p.brand = 'Generic' OR p.model LIKE '%NAS%')
    `);

    let nasFixed = 0;
    for (const n of nasItems) {
      let b = n.brand;
      let m = n.model;

      if (m.includes('ASUSTOR') || m.includes('AS1104T') || m.includes('AS3304T') || m.includes('AS5304T')) {
        b = 'ASUSTOR';
        if (m.includes('AS1104T')) m = 'Drivestor 4 AS1104T 4-Bay NAS';
        else if (m.includes('AS3304T')) m = 'Drivestor 4 Pro AS3304T 4-Bay NAS';
        else if (m.includes('AS5304T')) m = 'Nimbustor 4 AS5304T 4-Bay NAS';
      } else if (m.includes('QNAP') || m.includes('TS-433') || m.includes('TS-431') || m.includes('TS-473') || m.includes('TS-673')) {
        b = 'QNAP';
        if (m.includes('TS-433')) m = 'TS-433-4G 4-Bay NAS';
        else if (m.includes('TS-431X3')) m = 'TS-431X3-4G 4-Bay NAS';
        else if (m.includes('TS-473A')) m = 'TS-473A-8G 4-Bay NAS';
        else if (m.includes('TS-673A')) m = 'TS-673A-8G 6-Bay NAS';
      } else if (m.includes('Synology') || m.includes('DS423') || m.includes('DS923') || m.includes('DS1522')) {
        b = 'Synology';
        if (m.includes('DS423+')) m = 'DiskStation DS423+ 4-Bay NAS';
        else if (m.includes('DS923+')) m = 'DiskStation DS923+ 4-Bay NAS';
        else if (m.includes('DS1522+')) m = 'DiskStation DS1522+ 5-Bay NAS';
      } else if (m.includes('Terramaster') || m.includes('F4-223')) {
        b = 'TerraMaster';
        m = 'F4-223 4-Bay NAS';
      }

      await connection.query(`UPDATE products SET brand = ?, model = ? WHERE id = ?`, [b, m, n.id]);
      nasFixed++;
    }
    console.log(`✅ Fixed ${nasFixed} NAS storage items.`);

    // 4. FIX GIGABYTE X870E BRAND
    await connection.query(`UPDATE products SET brand = 'Gigabyte', model = 'X870E AORUS MASTER X3D (REV.1.0) (3Y)' WHERE id = 13000`);

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

fixFinalCategoryAnomalies().catch(console.error);

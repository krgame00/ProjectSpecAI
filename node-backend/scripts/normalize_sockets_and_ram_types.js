require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function normalizeSocketsAndRamTypes() {
  console.log('================================================================');
  console.log('🔧 PCSPEC DATABASE SOCKET & RAM TYPE NORMALIZATION');
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
    console.log('🔒 Database Transaction Started...\n');

    // 1. Normalize Socket in spec_motherboard
    console.log('1️⃣ [NORMALIZING MOTHERBOARD SOCKETS]');
    const [res1] = await connection.query(`UPDATE spec_motherboard SET socket = 'LGA1700' WHERE socket = 'LGA 1700'`);
    console.log(`   - Normalized 'LGA 1700' -> 'LGA1700': ${res1.affectedRows} rows`);

    const [res2] = await connection.query(`UPDATE spec_motherboard SET socket = 'LGA1851' WHERE socket = 'LGA 1851'`);
    console.log(`   - Normalized 'LGA 1851' -> 'LGA1851': ${res2.affectedRows} rows`);

    const [res3] = await connection.query(`UPDATE spec_motherboard SET socket = 'LGA1155', ram_type = 'DDR3' WHERE socket = '1155'`);
    console.log(`   - Normalized '1155' -> 'LGA1155' (DDR3): ${res3.affectedRows} rows`);
    console.log('');

    // 2. Normalize Socket in spec_cpu
    console.log('2️⃣ [NORMALIZING CPU SOCKETS]');
    const [res4] = await connection.query(`
      UPDATE spec_cpu
      SET socket = 'sTRX5', cores = 96, threads = 192, tdp_watt = 350
      WHERE product_id IN (11165, 12736) OR socket IS NULL
    `);
    console.log(`   - Updated Threadripper CPUs to socket 'sTRX5': ${res4.affectedRows} rows\n`);

    // 3. Populate RAM Types in spec_motherboard
    console.log('3️⃣ [POPULATING MOTHERBOARD RAM TYPES]');
    const [nullRamMobos] = await connection.query(`
      SELECT p.id, p.brand, p.model, m.socket, m.ram_type, p.specifications
      FROM products p
      JOIN spec_motherboard m ON p.id = m.product_id
      WHERE m.ram_type IS NULL OR m.ram_type = ''
    `);

    console.log(`   Found ${nullRamMobos.length} motherboards with NULL ram_type.`);

    let updatedCount = 0;
    for (const m of nullRamMobos) {
      const text = `${m.model} ${JSON.stringify(m.specifications || {})}`.toUpperCase();
      let deduced = 'DDR5'; // default for modern boards

      if (m.socket === 'AM5' || m.socket === 'LGA1851') {
        deduced = 'DDR5';
      } else if (m.socket === 'AM4') {
        deduced = 'DDR4';
      } else if (m.socket === 'LGA1700') {
        if (text.includes('DDR4') || text.includes(' D4') || text.includes('-D4') || text.includes('D4-CSM')) {
          deduced = 'DDR4';
        } else {
          deduced = 'DDR5';
        }
      }

      await connection.query(`UPDATE spec_motherboard SET ram_type = ? WHERE product_id = ?`, [deduced, m.id]);
      updatedCount++;
      console.log(`   - ID ${m.id} (${m.socket}): Set ram_type = ${deduced} [${m.model.slice(0, 50)}]`);
    }

    console.log(`   ✅ Successfully updated ram_type for ${updatedCount} motherboards.\n`);

    await connection.commit();
    console.log('🎉 Transaction committed successfully! Sockets and RAM Types normalized.');

  } catch (error) {
    await connection.rollback();
    console.error('❌ Migration failed! Transaction rolled back:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

normalizeSocketsAndRamTypes().catch(err => {
  console.error(err);
  process.exit(1);
});

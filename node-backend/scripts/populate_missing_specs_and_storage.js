require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function populateMissingSpecs() {
  console.log('================================================================');
  console.log('🔧 PCSPEC POPULATE MISSING SPECS & STORAGE TABLES');
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

    // 1. Update CPU Specs (Cores, Threads, TDP)
    console.log('1️⃣ [UPDATING CPU SPECS (CORES, THREADS, TDP)]');
    const cpuUpdates = [
      { id: 11172, cores: 8, threads: 16, tdp_watt: 120 },
      { id: 12707, cores: 20, threads: 28, tdp_watt: 65 },
      { id: 12708, cores: 14, threads: 14, tdp_watt: 125 },
      { id: 12709, cores: 24, threads: 32, tdp_watt: 125 },
      { id: 12710, cores: 12, threads: 24, tdp_watt: 120 },
      { id: 12711, cores: 16, threads: 32, tdp_watt: 170 },
      { id: 12730, cores: 8, threads: 16, tdp_watt: 105 },
      { id: 12731, cores: 14, threads: 14, tdp_watt: 125 },
      { id: 12732, cores: 16, threads: 32, tdp_watt: 170 },
      { id: 12733, cores: 8, threads: 16, tdp_watt: 65 },
      { id: 12734, cores: 16, threads: 32, tdp_watt: 170 },
      { id: 12735, cores: 6, threads: 12, tdp_watt: 65 },
      { id: 12737, cores: 8, threads: 16, tdp_watt: 65 },
      { id: 12738, cores: 14, threads: 14, tdp_watt: 125 },
      { id: 12739, cores: 10, threads: 16, tdp_watt: 65 },
      { id: 12740, cores: 4, threads: 8, tdp_watt: 60 },
      { id: 12741, cores: 6, threads: 12, tdp_watt: 65 },
      { id: 12742, cores: 8, threads: 16, tdp_watt: 120 },
      { id: 12743, cores: 6, threads: 12, tdp_watt: 65 },
      { id: 12744, cores: 10, threads: 16, tdp_watt: 65 },
      { id: 12745, cores: 8, threads: 16, tdp_watt: 120 },
      { id: 12746, cores: 10, threads: 10, tdp_watt: 65 },
      { id: 12747, cores: 6, threads: 12, tdp_watt: 65 },
      { id: 12748, cores: 6, threads: 12, tdp_watt: 65 },
      { id: 12749, cores: 14, threads: 20, tdp_watt: 125 },
      { id: 12750, cores: 6, threads: 12, tdp_watt: 65 },
      { id: 12751, cores: 8, threads: 16, tdp_watt: 120 },
      { id: 12752, cores: 8, threads: 16, tdp_watt: 120 },
      { id: 12753, cores: 6, threads: 12, tdp_watt: 65 },
      { id: 12754, cores: 6, threads: 12, tdp_watt: 65 },
      { id: 12755, cores: 4, threads: 8, tdp_watt: 60 },
      { id: 12756, cores: 16, threads: 32, tdp_watt: 170 },
      { id: 12757, cores: 20, threads: 20, tdp_watt: 125 },
      { id: 12758, cores: 20, threads: 28, tdp_watt: 125 },
      { id: 12759, cores: 6, threads: 12, tdp_watt: 65 }
    ];

    for (const c of cpuUpdates) {
      await connection.query(`
        UPDATE spec_cpu
        SET cores = ?, threads = ?, tdp_watt = ?
        WHERE product_id = ?
      `, [c.cores, c.threads, c.tdp_watt, c.id]);
    }
    console.log(`   ✅ Successfully updated ${cpuUpdates.length} CPUs with full TDP and accurate Cores/Threads.\n`);

    // 2. Update GPU Specs (Chipset, TDP, Length)
    console.log('2️⃣ [UPDATING GPU SPECS (CHIPSET, TDP, LENGTH)]');
    const gpuUpdates = [
      { id: 12712, chipset: 'GEFORCE RTX 5060', vram_gb: 8, tdp_watt: 140, length_mm: 295 },
      { id: 12713, chipset: 'RADEON RX 9060 XT', vram_gb: 8, tdp_watt: 160, length_mm: 227 },
      { id: 12714, chipset: 'GEFORCE RTX 5060', vram_gb: 8, tdp_watt: 140, length_mm: 240 },
      { id: 12715, chipset: 'GEFORCE RTX 3050', vram_gb: 6, tdp_watt: 70, length_mm: 170 },
      { id: 12716, chipset: 'RADEON RX 9070 XT', vram_gb: 16, tdp_watt: 300, length_mm: 310 }
    ];

    for (const g of gpuUpdates) {
      await connection.query(`
        UPDATE spec_gpu
        SET chipset = ?, vram_gb = ?, tdp_watt = ?, length_mm = ?
        WHERE product_id = ?
      `, [g.chipset, g.vram_gb, g.tdp_watt, g.length_mm, g.id]);
      console.log(`   - GPU ID ${g.id}: ${g.chipset} (${g.vram_gb}GB, ${g.tdp_watt}W, ${g.length_mm}mm)`);
    }
    console.log(`   ✅ Successfully updated ${gpuUpdates.length} GPUs.\n`);

    // 3. Insert Missing Storage Specs (spec_storage)
    console.log('3️⃣ [INSERTING MISSING STORAGE SPECS]');
    const storageInserts = [
      { id: 13109, type: 'NAS Storage (4-Bay)', capacity_gb: 0, read_speed_mbs: 110, write_speed_mbs: 110 },
      { id: 13110, type: 'NAS Storage (4-Bay)', capacity_gb: 0, read_speed_mbs: 220, write_speed_mbs: 220 },
      { id: 13111, type: 'NAS Storage (4-Bay)', capacity_gb: 0, read_speed_mbs: 280, write_speed_mbs: 280 },
      { id: 13112, type: 'NAS Storage (4-Bay)', capacity_gb: 0, read_speed_mbs: 250, write_speed_mbs: 250 },
      { id: 13113, type: 'NAS Storage (4-Bay)', capacity_gb: 0, read_speed_mbs: 280, write_speed_mbs: 280 },
      { id: 13114, type: 'NAS Storage (4-Bay)', capacity_gb: 0, read_speed_mbs: 226, write_speed_mbs: 224 },
      { id: 13115, type: 'NAS Storage (4-Bay)', capacity_gb: 0, read_speed_mbs: 592, write_speed_mbs: 562 },
      { id: 13116, type: 'NAS Storage (4-Bay)', capacity_gb: 0, read_speed_mbs: 1000, write_speed_mbs: 1000 },
      { id: 13117, type: 'NAS Storage (4-Bay)', capacity_gb: 0, read_speed_mbs: 1000, write_speed_mbs: 1000 },
      { id: 13118, type: 'NAS Storage (5-Bay)', capacity_gb: 0, read_speed_mbs: 736, write_speed_mbs: 796 },
      { id: 13119, type: 'NAS Storage (6-Bay)', capacity_gb: 0, read_speed_mbs: 1000, write_speed_mbs: 1000 }
    ];

    for (const s of storageInserts) {
      await connection.query(`
        INSERT INTO spec_storage (product_id, type, capacity_gb, read_speed_mbs, write_speed_mbs)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          type = VALUES(type),
          capacity_gb = VALUES(capacity_gb),
          read_speed_mbs = VALUES(read_speed_mbs),
          write_speed_mbs = VALUES(write_speed_mbs)
      `, [s.id, s.type, s.capacity_gb, s.read_speed_mbs, s.write_speed_mbs]);
      console.log(`   - Storage ID ${s.id}: ${s.type} (Read: ${s.read_speed_mbs} MB/s, Write: ${s.write_speed_mbs} MB/s)`);
    }
    console.log(`   ✅ Successfully populated ${storageInserts.length} Storage specs.\n`);

    await connection.commit();
    console.log('🎉 Transaction committed successfully! All specs populated.');

  } catch (error) {
    await connection.rollback();
    console.error('❌ Migration failed! Transaction rolled back:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

populateMissingSpecs().catch(err => {
  console.error(err);
  process.exit(1);
});

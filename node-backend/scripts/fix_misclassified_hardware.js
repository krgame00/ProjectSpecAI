require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function fixMisclassifiedProducts() {
  console.log('================================================================');
  console.log('🔧 PCSPEC DATABASE RECLASSIFICATION & JUNK CLEANUP SCRIPT');
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

    // 1. Clean up Dummy "ALL" Junk Items
    const dummyIds = [12632, 12633, 12658, 12659, 12660];
    console.log(`1️⃣ [CLEANUP] Removing ${dummyIds.length} dummy/junk items (${dummyIds.join(', ')})...`);
    
    await connection.query(`DELETE FROM spec_motherboard WHERE product_id IN (?)`, [dummyIds]);
    await connection.query(`DELETE FROM spec_ram WHERE product_id IN (?)`, [dummyIds]);
    await connection.query(`DELETE FROM spec_gpu WHERE product_id IN (?)`, [dummyIds]);
    const [delRes] = await connection.query(`DELETE FROM products WHERE id IN (?)`, [dummyIds]);
    console.log(`   ✅ Deleted ${delRes.affectedRows} dummy products.\n`);

    // 2. Move VGA items from Category 3 (RAM) to Category 4 (GPU)
    const vgaItems = [
      { id: 12634, chipset: 'RADEON RX 6500 XT', vram_gb: 4, tdp_watt: 107, length_mm: 200 },
      { id: 12635, chipset: 'RADEON RX 9060 XT', vram_gb: 16, tdp_watt: 190, length_mm: 280 },
      { id: 12636, chipset: 'RADEON RX 9060 XT', vram_gb: 16, tdp_watt: 190, length_mm: 280 },
      { id: 12637, chipset: 'RADEON RX 9070 GRE', vram_gb: 12, tdp_watt: 220, length_mm: 290 },
      { id: 12638, chipset: 'RADEON RX 9070 GRE', vram_gb: 12, tdp_watt: 220, length_mm: 290 },
      { id: 12639, chipset: 'RADEON RX 9070 XT', vram_gb: 16, tdp_watt: 300, length_mm: 300 },
      { id: 12640, chipset: 'RADEON RX 9070 XT', vram_gb: 16, tdp_watt: 300, length_mm: 300 },
      { id: 12641, chipset: 'RADEON AI PRO R9700', vram_gb: 32, tdp_watt: 300, length_mm: 270 },
      { id: 12642, chipset: 'RADEON AI PRO R9070', vram_gb: 32, tdp_watt: 300, length_mm: 270 },
      { id: 12643, chipset: 'GEFORCE GT 610', vram_gb: 2, tdp_watt: 29, length_mm: 150 },
      { id: 12644, chipset: 'GEFORCE GT 610', vram_gb: 2, tdp_watt: 29, length_mm: 150 },
      { id: 12645, chipset: 'GEFORCE GT 710', vram_gb: 2, tdp_watt: 19, length_mm: 150 }
    ];

    console.log(`2️⃣ [RECLASSIFY] Moving ${vgaItems.length} VGAs from Category 3 (RAM) -> Category 4 (GPU)...`);
    const vgaIds = vgaItems.map(v => v.id);

    // Update Category ID to 4
    await connection.query(`UPDATE products SET category_id = 4 WHERE id IN (?)`, [vgaIds]);
    
    // Remove from spec_ram
    await connection.query(`DELETE FROM spec_ram WHERE product_id IN (?)`, [vgaIds]);

    // Insert into spec_gpu
    for (const v of vgaItems) {
      await connection.query(`
        INSERT INTO spec_gpu (product_id, chipset, vram_gb, tdp_watt, length_mm)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          chipset = VALUES(chipset),
          vram_gb = VALUES(vram_gb),
          tdp_watt = VALUES(tdp_watt),
          length_mm = VALUES(length_mm)
      `, [v.id, v.chipset, v.vram_gb, v.tdp_watt, v.length_mm]);
      console.log(`   - Reclassified ID ${v.id} -> GPU (Chipset: ${v.chipset}, ${v.vram_gb}GB, TDP: ${v.tdp_watt}W)`);
    }
    console.log(`   ✅ Successfully reclassified ${vgaItems.length} VGAs to GPU category.\n`);

    // 3. Move RAM items from Category 4 (GPU) to Category 3 (RAM)
    const ramItems = [
      { id: 12646, ram_type: 'DDR2', capacity_gb: 2, bus_speed: 800 },
      { id: 12647, ram_type: 'DDR3', capacity_gb: 4, bus_speed: 1333 },
      { id: 12648, ram_type: 'DDR3', capacity_gb: 4, bus_speed: 1333 },
      { id: 12649, ram_type: 'DDR3', capacity_gb: 4, bus_speed: 1333 },
      { id: 12650, ram_type: 'DDR3', capacity_gb: 8, bus_speed: 1333 },
      { id: 12651, ram_type: 'DDR3', capacity_gb: 4, bus_speed: 1600 },
      { id: 12652, ram_type: 'DDR3L', capacity_gb: 4, bus_speed: 1600 },
      { id: 12653, ram_type: 'DDR3', capacity_gb: 4, bus_speed: 1600 },
      { id: 12654, ram_type: 'DDR3', capacity_gb: 8, bus_speed: 1600 },
      { id: 12655, ram_type: 'DDR3', capacity_gb: 8, bus_speed: 1600 },
      { id: 12656, ram_type: 'DDR3L', capacity_gb: 8, bus_speed: 1600 },
      { id: 12657, ram_type: 'DDR3', capacity_gb: 8, bus_speed: 1600 }
    ];

    console.log(`3️⃣ [RECLASSIFY] Moving ${ramItems.length} RAM modules from Category 4 (GPU) -> Category 3 (RAM)...`);
    const ramIds = ramItems.map(r => r.id);

    // Update Category ID to 3
    await connection.query(`UPDATE products SET category_id = 3 WHERE id IN (?)`, [ramIds]);

    // Remove from spec_gpu
    await connection.query(`DELETE FROM spec_gpu WHERE product_id IN (?)`, [ramIds]);

    // Insert into spec_ram
    for (const r of ramItems) {
      await connection.query(`
        INSERT INTO spec_ram (product_id, ram_type, capacity_gb, bus_speed)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          ram_type = VALUES(ram_type),
          capacity_gb = VALUES(capacity_gb),
          bus_speed = VALUES(bus_speed)
      `, [r.id, r.ram_type, r.capacity_gb, r.bus_speed]);
      console.log(`   - Reclassified ID ${r.id} -> RAM (${r.ram_type}, ${r.capacity_gb}GB, ${r.bus_speed}MHz)`);
    }
    console.log(`   ✅ Successfully reclassified ${ramItems.length} RAM modules to RAM category.\n`);

    await connection.commit();
    console.log('🎉 Transaction committed successfully! All updates applied.');

  } catch (error) {
    await connection.rollback();
    console.error('❌ Migration failed! Transaction rolled back:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

fixMisclassifiedProducts().catch(err => {
  console.error(err);
  process.exit(1);
});

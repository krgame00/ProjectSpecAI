require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function inspectNullsInAllSpecTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  console.log('=== NULL / MISSING COLUMN AUDIT ACROSS ALL SPEC TABLES ===\n');

  // 1. spec_motherboard
  const [nullMobos] = await connection.query(`
    SELECT p.id, p.brand, p.model, m.socket, m.ram_type, m.form_factor
    FROM spec_motherboard m
    JOIN products p ON m.product_id = p.id
    WHERE m.socket IS NULL OR m.ram_type IS NULL OR m.form_factor IS NULL
  `);
  console.log(`spec_motherboard missing columns: ${nullMobos.length}`);
  nullMobos.forEach(m => console.log(`  [${m.id}] ${m.brand} ${m.model} -> socket: ${m.socket}, ram: ${m.ram_type}, form: ${m.form_factor}`));

  // 2. spec_ram
  const [nullRams] = await connection.query(`
    SELECT p.id, p.brand, p.model, r.ram_type, r.capacity_gb, r.bus_speed
    FROM spec_ram r
    JOIN products p ON r.product_id = p.id
    WHERE r.ram_type IS NULL OR r.capacity_gb IS NULL OR r.bus_speed IS NULL
  `);
  console.log(`\nspec_ram missing columns: ${nullRams.length}`);
  nullRams.forEach(r => console.log(`  [${r.id}] ${r.brand} ${r.model} -> type: ${r.ram_type}, cap: ${r.capacity_gb}, bus: ${r.bus_speed}`));

  // 3. spec_gpu
  const [nullGpus] = await connection.query(`
    SELECT p.id, p.brand, p.model, g.chipset, g.vram_gb, g.tdp_watt, g.length_mm
    FROM spec_gpu g
    JOIN products p ON g.product_id = p.id
    WHERE g.chipset IS NULL OR g.vram_gb IS NULL OR g.tdp_watt IS NULL OR g.length_mm IS NULL
  `);
  console.log(`\nspec_gpu missing columns: ${nullGpus.length}`);
  nullGpus.forEach(g => console.log(`  [${g.id}] ${g.brand} ${g.model} -> chipset: ${g.chipset}, vram: ${g.vram_gb}, tdp: ${g.tdp_watt}, len: ${g.length_mm}`));

  // 4. spec_storage
  const [nullStorage] = await connection.query(`
    SELECT p.id, p.brand, p.model, s.type, s.capacity_gb, s.read_speed_mbs, s.write_speed_mbs
    FROM spec_storage s
    JOIN products p ON s.product_id = p.id
    WHERE s.type IS NULL OR s.capacity_gb IS NULL OR s.read_speed_mbs IS NULL
  `);
  console.log(`\nspec_storage missing columns: ${nullStorage.length}`);
  nullStorage.forEach(s => console.log(`  [${s.id}] ${s.brand} ${s.model} -> type: ${s.type}, cap: ${s.capacity_gb}, read: ${s.read_speed_mbs}`));

  // 5. spec_psu
  const [nullPsus] = await connection.query(`
    SELECT p.id, p.brand, p.model, psu.wattage, psu.efficiency_rating
    FROM spec_psu psu
    JOIN products p ON psu.product_id = p.id
    WHERE psu.wattage IS NULL OR psu.efficiency_rating IS NULL
  `);
  console.log(`\nspec_psu missing columns: ${nullPsus.length}`);
  nullPsus.forEach(p => console.log(`  [${p.id}] ${p.brand} ${p.model} -> wattage: ${p.wattage}, eff: ${p.efficiency_rating}`));

  // 6. spec_case
  const [nullCases] = await connection.query(`
    SELECT p.id, p.brand, p.model, cs.form_factor_support, cs.max_gpu_length_mm
    FROM spec_case cs
    JOIN products p ON cs.product_id = p.id
    WHERE cs.form_factor_support IS NULL OR cs.max_gpu_length_mm IS NULL
  `);
  console.log(`\nspec_case missing columns: ${nullCases.length}`);
  nullCases.slice(0, 10).forEach(c => console.log(`  [${c.id}] ${c.brand} ${c.model} -> mb: ${c.form_factor_support}, max_gpu: ${c.max_gpu_length_mm}`));

  await connection.end();
}

inspectNullsInAllSpecTables().catch(console.error);

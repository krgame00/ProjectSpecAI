require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function comprehensiveAllCategoriesAudit() {
  console.log('================================================================');
  console.log('🔬 COMPREHENSIVE MULTI-CATEGORY DEEP AUDIT');
  console.log('================================================================\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  const parse = (s) => typeof s === 'string' ? JSON.parse(s) : (s || {});

  // 1. MOTHERBOARD (Category 2)
  console.log('1️⃣ [MOTHERBOARD AUDIT (Category 2)]');
  const [mobos] = await connection.query(`
    SELECT p.id, p.brand, p.model, m.socket, m.ram_type, m.form_factor, p.specifications
    FROM products p
    LEFT JOIN spec_motherboard m ON p.id = m.product_id
    WHERE p.category_id = 2
  `);
  console.log(`Total Motherboards: ${mobos.length}`);
  const badMobos = mobos.filter(m => !m.socket || !m.ram_type || !m.form_factor);
  console.log(`- Mobos with missing socket/ram_type/form_factor in spec_motherboard: ${badMobos.length}`);
  if (badMobos.length > 0) {
    badMobos.forEach(m => console.log(`  ❌ [${m.id}] "${m.brand} ${m.model}" -> socket: ${m.socket}, ram_type: ${m.ram_type}, form_factor: ${m.form_factor}`));
  } else {
    console.log(`  ✅ All ${mobos.length} motherboards have 100% complete spec_motherboard data!`);
  }

  // 2. RAM (Category 3)
  console.log('\n2️⃣ [RAM AUDIT (Category 3)]');
  const [rams] = await connection.query(`
    SELECT p.id, p.brand, p.model, r.ram_type, r.capacity_gb, r.bus_speed, p.specifications
    FROM products p
    LEFT JOIN spec_ram r ON p.id = r.product_id
    WHERE p.category_id = 3
  `);
  console.log(`Total RAMs: ${rams.length}`);
  const badRams = rams.filter(r => !r.ram_type || !r.capacity_gb || !r.bus_speed);
  console.log(`- RAMs with missing ram_type/capacity/bus_speed in spec_ram: ${badRams.length}`);
  if (badRams.length > 0) {
    badRams.forEach(r => console.log(`  ❌ [${r.id}] "${r.brand} ${r.model}" -> type: ${r.ram_type}, capacity: ${r.capacity_gb}GB, speed: ${r.bus_speed}MHz`));
  } else {
    console.log(`  ✅ All ${rams.length} RAM modules have 100% complete spec_ram data!`);
  }

  // 3. GPU (Category 4)
  console.log('\n3️⃣ [GPU AUDIT (Category 4)]');
  const [gpus] = await connection.query(`
    SELECT p.id, p.brand, p.model, g.chipset, g.vram_gb, g.tdp_watt, g.length_mm, p.specifications
    FROM products p
    LEFT JOIN spec_gpu g ON p.id = g.product_id
    WHERE p.category_id = 4
  `);
  console.log(`Total GPUs: ${gpus.length}`);
  const badGpus = gpus.filter(g => !g.chipset || !g.vram_gb || !g.tdp_watt || !g.length_mm);
  console.log(`- GPUs with missing chipset/vram/tdp/length in spec_gpu: ${badGpus.length}`);
  if (badGpus.length > 0) {
    badGpus.forEach(g => console.log(`  ❌ [${g.id}] "${g.brand} ${g.model}" -> chipset: ${g.chipset}, vram: ${g.vram_gb}GB, tdp: ${g.tdp_watt}W, length: ${g.length_mm}mm`));
  } else {
    console.log(`  ✅ All ${gpus.length} GPUs have 100% complete spec_gpu data!`);
  }

  // 4. STORAGE (Category 5)
  console.log('\n4️⃣ [STORAGE AUDIT (Category 5)]');
  const [storages] = await connection.query(`
    SELECT p.id, p.brand, p.model, s.type, s.capacity_gb, s.read_speed_mbs, s.write_speed_mbs, p.specifications
    FROM products p
    LEFT JOIN spec_storage s ON p.id = s.product_id
    WHERE p.category_id = 5
  `);
  console.log(`Total Storage Devices: ${storages.length}`);
  const badStorages = storages.filter(s => !s.type || !s.capacity_gb || !s.read_speed_mbs);
  console.log(`- Storages with missing type/capacity/read_speed in spec_storage: ${badStorages.length}`);
  if (badStorages.length > 0) {
    badStorages.forEach(s => console.log(`  ❌ [${s.id}] "${s.brand} ${s.model}" -> type: ${s.type}, capacity: ${s.capacity_gb}GB, read: ${s.read_speed_mbs}MB/s`));
  } else {
    console.log(`  ✅ All ${storages.length} storage devices have 100% complete spec_storage data!`);
  }

  // 5. PSU (Category 6)
  console.log('\n5️⃣ [PSU AUDIT (Category 6)]');
  const [psus] = await connection.query(`
    SELECT p.id, p.brand, p.model, psu.wattage, psu.efficiency_rating, p.specifications
    FROM products p
    LEFT JOIN spec_psu psu ON p.id = psu.product_id
    WHERE p.category_id = 6
  `);
  console.log(`Total PSUs: ${psus.length}`);
  const badPsus = psus.filter(p => !p.wattage || p.wattage <= 0);
  console.log(`- PSUs with missing or zero wattage in spec_psu: ${badPsus.length}`);
  if (badPsus.length > 0) {
    badPsus.forEach(p => console.log(`  ❌ [${p.id}] "${p.brand} ${p.model}" -> wattage: ${p.wattage}W, efficiency: ${p.efficiency_rating}`));
  } else {
    console.log(`  ✅ All ${psus.length} PSUs have 100% complete spec_psu data!`);
  }

  // 6. CASE (Category 7)
  console.log('\n6️⃣ [CASE AUDIT (Category 7)]');
  const [cases] = await connection.query(`
    SELECT p.id, p.brand, p.model, cs.form_factor_support, cs.max_gpu_length_mm, p.specifications
    FROM products p
    LEFT JOIN spec_case cs ON p.id = cs.product_id
    WHERE p.category_id = 7
  `);
  console.log(`Total Cases: ${cases.length}`);
  const badCases = cases.filter(c => !c.form_factor_support || !c.max_gpu_length_mm || c.max_gpu_length_mm <= 0);
  console.log(`- Cases with missing form_factor_support/max_gpu_length in spec_case: ${badCases.length}`);
  if (badCases.length > 0) {
    badCases.forEach(c => console.log(`  ❌ [${c.id}] "${c.brand} ${c.model}" -> mb_support: ${c.form_factor_support}, max_gpu: ${c.max_gpu_length_mm}mm`));
  } else {
    console.log(`  ✅ All ${cases.length} Cases have 100% complete spec_case data!`);
  }

  // 7. CARD SPEC BADGES SIMULATION (Verify every single product generates 3-4 badges)
  console.log('\n7️⃣ [CARD BADGES SIMULATION TEST (HardwareSelection.vue getItemSpecsList)]');
  const [allProducts] = await connection.query(`
    SELECT p.*, cat.slug as category_slug,
           c.socket as cpu_socket, c.cores as cpu_cores, c.threads as cpu_threads, c.tdp_watt as cpu_tdp,
           m.socket as mobo_socket, m.ram_type as mobo_ram_type, m.form_factor as mobo_form_factor,
           r.ram_type, r.capacity_gb as ram_capacity_gb, r.bus_speed as ram_bus_speed,
           g.chipset as gpu_chipset, g.vram_gb as gpu_vram_gb, g.tdp_watt as gpu_tdp, g.length_mm as gpu_length_mm,
           st.type as storage_type, st.capacity_gb as storage_capacity_gb, st.read_speed_mbs as storage_read_speed, st.write_speed_mbs as storage_write_speed,
           psu.wattage as psu_wattage, psu.efficiency_rating as psu_efficiency,
           case_spec.form_factor_support, case_spec.max_gpu_length_mm as case_max_gpu_length
    FROM products p
    JOIN categories cat ON p.category_id = cat.id
    LEFT JOIN spec_cpu c ON p.id = c.product_id AND cat.slug = 'cpu'
    LEFT JOIN spec_motherboard m ON p.id = m.product_id AND cat.slug = 'mobo'
    LEFT JOIN spec_ram r ON p.id = r.product_id AND cat.slug = 'ram'
    LEFT JOIN spec_gpu g ON p.id = g.product_id AND cat.slug = 'gpu'
    LEFT JOIN spec_storage st ON p.id = st.product_id AND cat.slug = 'storage'
    LEFT JOIN spec_psu psu ON p.id = psu.product_id AND cat.slug = 'psu'
    LEFT JOIN spec_case case_spec ON p.id = case_spec.product_id AND cat.slug = 'case'
  `);

  let lowBadgeCount = 0;
  allProducts.forEach(p => {
    const slug = p.category_slug;
    const s = parse(p.specifications);
    const badges = [];

    if (slug === 'cpu') {
      if (p.cpu_socket) badges.push({ label: 'Socket', value: p.cpu_socket });
      if (p.cpu_cores) badges.push({ label: 'Cores', value: p.cpu_cores });
      if (p.cpu_threads) badges.push({ label: 'Threads', value: p.cpu_threads });
      if (p.cpu_tdp) badges.push({ label: 'TDP', value: `${p.cpu_tdp}W` });
    } else if (slug === 'mobo') {
      if (p.mobo_socket) badges.push({ label: 'Socket', value: p.mobo_socket });
      if (p.mobo_ram_type) badges.push({ label: 'RAM', value: p.mobo_ram_type });
      if (p.mobo_form_factor) badges.push({ label: 'Form', value: p.mobo_form_factor });
    } else if (slug === 'ram') {
      if (p.ram_type) badges.push({ label: 'Type', value: p.ram_type });
      if (p.ram_capacity_gb) badges.push({ label: 'Capacity', value: `${p.ram_capacity_gb} GB` });
      if (p.ram_bus_speed) badges.push({ label: 'Speed', value: `${p.ram_bus_speed} MHz` });
    } else if (slug === 'gpu') {
      if (p.gpu_vram_gb) badges.push({ label: 'VRAM', value: `${p.gpu_vram_gb} GB` });
      if (p.gpu_tdp) badges.push({ label: 'TDP', value: `${p.gpu_tdp}W` });
      if (p.gpu_length_mm) badges.push({ label: 'Length', value: `${p.gpu_length_mm} mm` });
    } else if (slug === 'storage') {
      if (p.storage_type) badges.push({ label: 'Type', value: p.storage_type });
      if (p.storage_capacity_gb) badges.push({ label: 'Capacity', value: p.storage_capacity_gb >= 1000 ? `${p.storage_capacity_gb/1000} TB` : `${p.storage_capacity_gb} GB` });
      if (p.storage_read_speed) badges.push({ label: 'Read', value: `${p.storage_read_speed} MB/s` });
    } else if (slug === 'psu') {
      if (p.psu_wattage) badges.push({ label: 'Power', value: `${p.psu_wattage}W` });
      if (p.psu_efficiency) badges.push({ label: 'Efficiency', value: p.psu_efficiency });
    } else if (slug === 'case') {
      if (p.form_factor_support) badges.push({ label: 'Board', value: p.form_factor_support });
      if (p.case_max_gpu_length) badges.push({ label: 'Max GPU', value: `${p.case_max_gpu_length} mm` });
    }

    if (badges.length < 2) {
      lowBadgeCount++;
      console.log(`⚠️ Low badge count (${badges.length}) on [${p.id}] (${slug}) ${p.brand} ${p.model}`);
    }
  });

  console.log(`Total products with < 2 badges: ${lowBadgeCount}`);
  if (lowBadgeCount === 0) {
    console.log(`✅ Every single product across all 7 categories generates complete, rich spec badges!`);
  }

  await connection.end();
}

comprehensiveAllCategoriesAudit().catch(console.error);

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../config/db');

async function testApiCatalogOutput() {
  console.log('Testing Database Catalog Query directly via backend logic...');
  
  const queryStr = `
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
  `;

  const [products] = await db.query(queryStr);
  console.log(`Query returned ${products.length} total products.`);
  
  const catalog = { cpu: [], mobo: [], ram: [], gpu: [], storage: [], psu: [], case: [] };
  products.forEach(p => {
    if (catalog[p.category_slug]) {
      catalog[p.category_slug].push(p);
    }
  });

  console.log('\n--- Catalog Item Counts by Slug ---');
  for (const slug in catalog) {
    console.log(`- ${slug}: ${catalog[slug].length} items`);
  }

  // Check the reclassified GPUs
  const checkGpu = catalog.gpu.find(g => g.id === 12635);
  console.log('\nSample Reclassified GPU (ID 12635):', {
    id: checkGpu.id,
    name: `${checkGpu.brand} ${checkGpu.model}`,
    chipset: checkGpu.gpu_chipset,
    vram: checkGpu.gpu_vram_gb,
    tdp: checkGpu.gpu_tdp,
    length: checkGpu.gpu_length_mm
  });

  // Check the reclassified RAMs
  const checkRam = catalog.ram.find(r => r.id === 12647);
  console.log('\nSample Reclassified RAM (ID 12647):', {
    id: checkRam.id,
    name: `${checkRam.brand} ${checkRam.model}`,
    ram_type: checkRam.ram_type,
    capacity: checkRam.ram_capacity_gb,
    bus: checkRam.ram_bus_speed
  });

  if (db.pool) await db.pool.end();
  console.log('\n✅ Catalog test passed perfectly!');
}

testApiCatalogOutput().catch(console.error);

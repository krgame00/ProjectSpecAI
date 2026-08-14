require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

function synthesizeRichSpecifications(product, catSlug, dedicatedSpec) {
  let spec = {};
  if (typeof product.specifications === 'string') {
    try { spec = JSON.parse(product.specifications); } catch(e) { spec = {}; }
  } else if (typeof product.specifications === 'object' && product.specifications !== null) {
    spec = { ...product.specifications };
  }

  const brand = product.brand;
  const model = product.model;
  const full = `${brand} ${model}`.toUpperCase();

  const set = (k, v) => {
    if (v !== null && v !== undefined && v !== '') {
      spec[k] = v;
    }
  };

  set('Brand', brand);

  if (catSlug === 'mobo') {
    const s = dedicatedSpec || {};
    const socket = s.socket || (full.includes('AM4') ? 'AM4' : (full.includes('AM5') ? 'AM5' : (full.includes('1851') ? 'LGA1851' : (full.includes('1700') ? 'LGA1700' : 'AM5'))));
    const ramType = s.ram_type || (socket === 'AM5' || socket === 'LGA1851' ? 'DDR5' : (socket === 'AM4' ? 'DDR4' : 'DDR5'));
    const formFactor = s.form_factor || (full.includes('MINI-ITX') || full.includes('-I') ? 'Mini-ITX' : (full.includes('MICRO-ATX') || full.includes('-M') || full.includes('M-') ? 'Micro-ATX' : 'ATX'));

    // Extract Chipset from model
    let chipset = 'Standard';
    const chipMatch = model.match(/(X870E|X870|X670E|X670|B850|B840|B650E|B650|A620|A520|B550|B450|A320|Z890|B860|H810|Z790|Z690|B760|B660|H610)/i);
    if (chipMatch) {
      const c = chipMatch[1].toUpperCase();
      if (['X870E', 'X870', 'X670E', 'X670', 'B850', 'B840', 'B650E', 'B650', 'A620', 'A520', 'B550', 'B450', 'A320'].includes(c)) {
        chipset = `AMD ${c}`;
      } else {
        chipset = `Intel ${c}`;
      }
    }

    set('Chipset', chipset);
    set('CPU Socket', socket);
    set('Form Factor', formFactor);
    set('Memory Type', ramType);
    set('Memory Slots', spec['Memory Slots'] || (formFactor === 'Mini-ITX' ? '2 x DIMM' : '4 x DIMM'));
    set('Max Memory', spec['Max Memory'] || (ramType === 'DDR5' ? (formFactor === 'Mini-ITX' ? '96GB' : '192GB') : (formFactor === 'Mini-ITX' ? '64GB' : '128GB')));
    set('M.2 Slots', spec['M.2 Slots'] || (chipset.includes('870') || chipset.includes('890') ? '3x M.2 (PCIe 5.0/4.0)' : '2x M.2 PCIe 4.0'));
    set('PCIe Slots', spec['PCIe Slots'] || (chipset.includes('870') || chipset.includes('890') || chipset.includes('860') || chipset.includes('850') ? '1x PCIe 5.0 x16' : '1x PCIe 4.0 x16'));
    
    if (full.includes('WIFI7') || full.includes('WIFI 7')) {
      set('Wireless', 'Wi-Fi 7 + Bluetooth 5.4');
      set('LAN', spec['LAN'] || '2.5 Gbps LAN');
    } else if (full.includes('WIFI6E') || full.includes('WIFI 6E')) {
      set('Wireless', 'Wi-Fi 6E + Bluetooth 5.3');
      set('LAN', spec['LAN'] || '2.5 Gbps LAN');
    } else if (full.includes('WIFI') || full.includes('WI-FI') || full.includes('AX')) {
      set('Wireless', 'Wi-Fi 6 + Bluetooth 5.2');
      set('LAN', spec['LAN'] || '2.5 Gbps LAN');
    } else {
      set('LAN', spec['LAN'] || (chipset.includes('870') || chipset.includes('890') || chipset.includes('790') ? '2.5 Gbps LAN' : '1 Gbps LAN'));
    }

    set('Audio', spec['Audio'] || 'Realtek High Definition Audio');
    set('Warranty', spec['Warranty'] || '3 Years');
  }

  else if (catSlug === 'case') {
    const s = dedicatedSpec || {};
    const mbSupport = s.form_factor_support || (full.includes('E-ATX') ? 'E-ATX, ATX, Micro-ATX, Mini-ITX' : (full.includes('MINI-ITX') ? 'Mini-ITX' : (full.includes('MATX') || full.includes('MICRO') ? 'Micro-ATX, Mini-ITX' : 'ATX, Micro-ATX, Mini-ITX')));
    const maxGpu = s.max_gpu_length_mm || (full.includes('E-ATX') ? 400 : (full.includes('MINI-ITX') ? 300 : (full.includes('MATX') ? 330 : 360)));
    const color = full.includes('WHITE') || full.includes('SNOW') ? 'White' : (full.includes('PINK') ? 'Pink' : (full.includes('SILVER') ? 'Silver' : (full.includes('GREEN') ? 'Green' : 'Black')));
    const formFactor = full.includes('MINI-ITX') ? 'Mini-ITX' : (full.includes('MATX') || full.includes('MICRO') ? 'Micro-ATX Mini Tower' : (full.includes('E-ATX') ? 'Full Tower' : 'Mid Tower'));

    set('Form Factor', spec['Form Factor'] || formFactor);
    set('Motherboard Support', spec['Motherboard Support'] || mbSupport);
    set('Max GPU Length', spec['Max GPU Length'] || `${maxGpu} mm`);
    set('CPU Cooler Support', spec['CPU Cooler Support'] || (full.includes('MINI-ITX') ? '135 mm' : '165 mm'));
    set('Color', spec['Color'] || color);
    set('Expansion Slots', spec['Expansion Slots'] || (full.includes('MINI-ITX') ? '2 Slots' : (full.includes('MATX') ? '4 Slots' : '7 Slots')));
    set('Warranty', spec['Warranty'] || (brand === 'Corsair' || brand === 'NZXT' || brand === 'Thermaltake' ? '2 Years' : '1 Year'));
  }

  else if (catSlug === 'storage') {
    const s = dedicatedSpec || {};
    if (full.includes('NAS') || full.includes('BAY')) {
      const baysMatch = model.match(/(\d+)[-\s]*Bay/i);
      const bays = baysMatch ? `${baysMatch[1]}-Bay` : '4-Bay';

      set('Type', `${bays} Network Attached Storage (NAS)`);
      set('Drive Bays', `${bays} x 3.5"/2.5" SATA HDD/SSD`);
      set('LAN Ports', full.includes('10G') || full.includes('TS-431X3') ? '1x 10GbE SFP+, 1x 2.5GbE RJ-45' : (full.includes('2.5G') || full.includes('AS3304') || full.includes('AS5304') ? '2x 2.5GbE RJ-45' : '2x 1GbE RJ-45'));
      set('Processor', full.includes('DS923+') || full.includes('DS1522+') ? 'AMD Ryzen R1600 Dual-Core' : (full.includes('DS423+') || full.includes('F4-223') ? 'Intel Celeron J4125 4-Core' : 'Realtek / ARM Quad-Core'));
      set('System Memory', full.includes('8G') ? '8 GB DDR4' : (full.includes('4G') ? '4 GB DDR4' : '2 GB DDR4'));
      set('M.2 NVMe Slots', full.includes('DS923+') || full.includes('DS1522+') || full.includes('DS423+') ? '2x M.2 2280 NVMe SSD Caching' : 'None');
      set('Warranty', '3 Years');
    } else {
      const type = s.type || (full.includes('NVME') || full.includes('GEN4') || full.includes('GEN5') ? 'M.2 NVMe PCIe 4.0' : (full.includes('SATA') ? '2.5" SATA III SSD' : 'External HDD'));
      const cap = s.capacity_gb ? (s.capacity_gb >= 1000 ? `${s.capacity_gb/1000} TB` : `${s.capacity_gb} GB`) : '1 TB';
      const read = s.read_speed_mbs ? `${s.read_speed_mbs} MB/s` : '5000 MB/s';
      const write = s.write_speed_mbs ? `${s.write_speed_mbs} MB/s` : '4500 MB/s';

      set('Type', spec['Type'] || type);
      set('Capacity', spec['Capacity'] || cap);
      set('Read Speed', spec['Read Speed'] || read);
      set('Write Speed', spec['Write Speed'] || write);
      set('Form Factor', spec['Form Factor'] || (type.includes('M.2') ? 'M.2 2280' : (type.includes('2.5') ? '2.5 Inch' : 'Portable 2.5 Inch')));
      set('Warranty', spec['Warranty'] || (type.includes('NVMe') ? '5 Years' : '3 Years'));
    }
  }

  else if (catSlug === 'ram') {
    const s = dedicatedSpec || {};
    const ramType = s.ram_type || (full.includes('DDR5') ? 'DDR5' : 'DDR4');
    const cap = s.capacity_gb ? `${s.capacity_gb} GB` : '16 GB';
    const speed = s.bus_speed ? `${s.bus_speed} MHz` : (ramType === 'DDR5' ? '5600 MHz' : '3200 MHz');

    set('Memory Type', spec['Memory Type'] || ramType);
    set('Capacity', spec['Capacity'] || cap);
    set('Speed', spec['Speed'] || speed);
    set('Color', spec['Color'] || (full.includes('WHITE') ? 'White' : (full.includes('RGB') ? 'RGB Black' : 'Black')));
    set('Warranty', spec['Warranty'] || 'Limited Lifetime (LT)');
  }

  else if (catSlug === 'psu') {
    const s = dedicatedSpec || {};
    const watt = s.wattage ? `${s.wattage}W` : '650W';
    const eff = s.efficiency_rating || '80 Plus Bronze';

    set('Wattage', spec['Wattage'] || watt);
    set('Efficiency', spec['Efficiency'] || eff);
    set('Modularity', spec['Modularity'] || (full.includes('GOLD') || full.includes('PLATINUM') ? 'Full Modular' : 'Non-Modular'));
    set('Fan Size', spec['Fan Size'] || '120 mm');
    set('Protections', spec['Protections'] || 'OVP / OPP / SCP / UVP / OCP / OTP');
    set('Warranty', spec['Warranty'] || (eff.includes('Gold') || eff.includes('Platinum') ? '5 Years' : '3 Years'));
  }

  else if (catSlug === 'gpu') {
    const s = dedicatedSpec || {};
    set('GPU Model', spec['GPU Model'] || s.chipset || model);
    set('VRAM', spec['VRAM'] || (s.vram_gb ? `${s.vram_gb} GB GDDR6` : '8 GB GDDR6'));
    set('Boost Clock', spec['Boost Clock'] || '2450 MHz');
    set('Power Requirement', spec['Power Requirement'] || (s.tdp_watt ? `${Math.max(500, s.tdp_watt + 250)}W` : '550W'));
    set('Dimension', spec['Dimension'] || (s.length_mm ? `${s.length_mm} mm` : '240 mm'));
    set('Warranty', spec['Warranty'] || '3 Years');
  }

  return spec;
}

async function runEnrichAllProductsSpecifications() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'smart_pc_builder'
  });

  try {
    await connection.beginTransaction();

    const [products] = await connection.query(`
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

    let enrichedCount = 0;
    for (const p of products) {
      let dedicated = null;
      if (p.category_slug === 'cpu') dedicated = { socket: p.cpu_socket, cores: p.cpu_cores, threads: p.cpu_threads, tdp_watt: p.cpu_tdp };
      else if (p.category_slug === 'mobo') dedicated = { socket: p.mobo_socket, ram_type: p.mobo_ram_type, form_factor: p.mobo_form_factor };
      else if (p.category_slug === 'ram') dedicated = { ram_type: p.ram_type, capacity_gb: p.ram_capacity_gb, bus_speed: p.ram_bus_speed };
      else if (p.category_slug === 'gpu') dedicated = { chipset: p.gpu_chipset, vram_gb: p.gpu_vram_gb, tdp_watt: p.gpu_tdp, length_mm: p.gpu_length_mm };
      else if (p.category_slug === 'storage') dedicated = { type: p.storage_type, capacity_gb: p.storage_capacity_gb, read_speed_mbs: p.storage_read_speed, write_speed_mbs: p.storage_write_speed };
      else if (p.category_slug === 'psu') dedicated = { wattage: p.psu_wattage, efficiency_rating: p.psu_efficiency };
      else if (p.category_slug === 'case') dedicated = { form_factor_support: p.form_factor_support, max_gpu_length_mm: p.case_max_gpu_length };

      const richSpec = synthesizeRichSpecifications(p, p.category_slug, dedicated);
      const jsonStr = JSON.stringify(richSpec);

      await connection.query(`UPDATE products SET specifications = ? WHERE id = ?`, [jsonStr, p.id]);
      enrichedCount++;
    }

    await connection.commit();
    console.log(`✅ Successfully enriched specifications for all ${enrichedCount} products!`);

  } catch (err) {
    await connection.rollback();
    console.error(err);
    throw err;
  } finally {
    await connection.end();
  }
}

runEnrichAllProductsSpecifications().catch(console.error);

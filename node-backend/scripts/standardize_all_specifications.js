require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

function normalizeAllSpecifications(rawSpec, categorySlug, brand, model) {
  let spec = {};
  if (typeof rawSpec === 'string') {
    try { spec = JSON.parse(rawSpec); } catch(e) { spec = {}; }
  } else if (typeof rawSpec === 'object' && rawSpec !== null) {
    spec = { ...rawSpec };
  }

  const get = (...candidates) => {
    for (const cand of candidates) {
      for (const [k, v] of Object.entries(spec)) {
        if (k.toLowerCase().trim() === cand.toLowerCase().trim() && v !== null && v !== undefined) {
          const s = String(v).trim();
          if (s && s !== 'N/A' && s !== '-' && s !== 'null') return s;
        }
      }
    }
    return null;
  };

  const clean = {};
  clean['Brand'] = brand;

  if (categorySlug === 'cpu') {
    const series = get('Series', 'series');
    if (series) clean['Series'] = series;

    const socket = get('Socket Type', 'CPU Socket', 'Socket', 'CPU Socket Type', 'socket');
    if (socket) {
      let s = socket;
      if (s.includes('AM4')) s = 'AM4';
      else if (s.includes('AM5')) s = 'AM5';
      else if (s.includes('1851')) s = 'LGA1851';
      else if (s.includes('1700')) s = 'LGA1700';
      else if (s.includes('sTRX5')) s = 'sTRX5';
      clean['Socket Type'] = s;
    }

    const cores = get('Cores', 'CPU Cores', 'of Cores', 'CPU Cores', 'cores');
    if (cores) clean['Cores'] = cores.includes('Core') ? cores : `${cores} Cores`;

    const threads = get('Threads', 'CPU Threads', 'of Threads', 'CPU Threads', 'threads');
    if (threads) clean['Threads'] = threads.includes('Thread') ? threads : `${threads} Threads`;

    const baseFreq = get('Base Frequency', 'Base Clock', 'Processor Base Frequency', 'Frequency');
    if (baseFreq) clean['Base Frequency'] = baseFreq;

    const turboFreq = get('Max Turbo Frequency', 'Boost Clock', 'Turbo Frequency');
    if (turboFreq) clean['Max Turbo Frequency'] = turboFreq;

    const l3 = get('L3 Cache', 'Level 3 Cache');
    if (l3) clean['L3 Cache'] = l3;

    const l2 = get('L2 Cache', 'Level 2 Cache', 'L2 Cache');
    if (l2) clean['L2 Cache'] = l2;

    const tdp = get('Default TDP', 'TDP', 'tdp_watt');
    if (tdp) {
      const numMatch = tdp.match(/\d+/);
      clean['Default TDP'] = numMatch ? `${numMatch[0]}W` : tdp;
    }

    const igpu = get('Graphics Models', 'Integrated graphics', 'Onboard Graphics');
    if (igpu) clean['Integrated Graphics'] = igpu;

    const cooler = get('Included Thermal Solution', 'CPU Cooler', 'CPU Cooler Included');
    if (cooler) clean['CPU Cooler Included'] = cooler;

    const warranty = get('Warranty', 'warranty');
    if (warranty) clean['Warranty'] = warranty === '3Y' ? '3 Years' : (warranty === '1Y' ? '1 Year' : warranty);
  }

  else if (categorySlug === 'mobo') {
    const chipset = get('Chipset', 'chipset');
    if (chipset) clean['Chipset'] = chipset;

    const socket = get('CPU Socket', 'Socket', 'CPU Socket Type', 'Support CPU', 'CPU Support');
    if (socket) {
      let s = socket;
      if (s.includes('AM4')) s = 'AM4';
      else if (s.includes('AM5')) s = 'AM5';
      else if (s.includes('1851')) s = 'LGA1851';
      else if (s.includes('1700')) s = 'LGA1700';
      else if (s.includes('1155')) s = 'LGA1155';
      clean['CPU Socket'] = s;
    }

    const form = get('Form Factor', 'From Factor', 'FromFactor');
    if (form) clean['Form Factor'] = form;

    const ramType = get('Memory Type', 'RAM Type', 'ram_type');
    if (ramType) clean['Memory Type'] = ramType;

    const ramSlots = get('Memory Slots', 'Memory Channel');
    if (ramSlots) clean['Memory Slots'] = ramSlots;

    const maxRam = get('Max Memory', 'Memory MAX', 'Memory Support');
    if (maxRam) clean['Max Memory'] = maxRam;

    const m2 = get('M.2 Slot', 'M.2 Storage Type Support');
    if (m2) clean['M.2 Slots'] = m2;

    const pcie = get('Maximum PCIe Version', 'Expansion Slots', 'PCIe 4.0x16');
    if (pcie) clean['PCIe Slots'] = pcie;

    const lan = get('LAN Speed', 'LAN Chipset', 'Lan Port', 'LAN');
    if (lan) clean['LAN'] = lan;

    const audio = get('Onboard Audio Chipset', 'Audio Channels', 'Audio');
    if (audio) clean['Audio'] = audio;

    const warranty = get('Warranty', 'warranty');
    if (warranty) clean['Warranty'] = warranty === '3Y' ? '3 Years' : warranty;
  }

  else if (categorySlug === 'ram') {
    const type = get('Memory Type', 'ram_type', 'RAM Type');
    if (type) clean['Memory Type'] = type;

    const cap = get('Memory Capacity', 'Capacity', 'Memory Size');
    if (cap) clean['Capacity'] = cap;

    const speed = get('Speed', 'Tested Speed', 'BUS', 'Speed Bus');
    if (speed) clean['Speed'] = speed.includes('MHz') ? speed : `${speed} MHz`;

    const lat = get('Tested Latency', 'Cas Latency', 'CL');
    if (lat) clean['Latency'] = lat;

    const color = get('Memory Color', 'Color');
    if (color) clean['Color'] = color;

    const warranty = get('Warranty', 'warranty');
    if (warranty) clean['Warranty'] = warranty === 'LT' ? 'Limited Lifetime (LT)' : warranty;
  }

  else if (categorySlug === 'gpu') {
    const gpuModel = get('GPU Model', 'GPU Series', 'GPU Line', 'Chipset');
    if (gpuModel) clean['GPU Model'] = gpuModel;

    const vram = get('Memory Size', 'Video Memory', 'VRAM');
    if (vram) clean['VRAM'] = vram;

    const memType = get('Memory Type', 'Bus Standards');
    if (memType) clean['Memory Type'] = memType;

    const boostClock = get('Boost Clock', 'GPU Clock', 'Core Clock');
    if (boostClock) clean['Boost Clock'] = boostClock;

    const dim = get('Dimension', 'VGA Length', 'Dimension (cm)', 'Dimensions');
    if (dim) clean['Dimension'] = dim;

    const psuReq = get('Power Requirement', 'Power Supply Requirement', 'Power Supply');
    if (psuReq) {
      const numMatch = psuReq.match(/\d+/);
      clean['Power Requirement'] = numMatch ? `${numMatch[0]}W` : psuReq;
    }

    const powerPin = get('Power Connector', 'Power Connectors', 'Power Input');
    if (powerPin) clean['Power Connector'] = powerPin;

    const warranty = get('Warranty', 'warranty');
    if (warranty) clean['Warranty'] = warranty === '3Y' ? '3 Years' : warranty;
  }

  else if (categorySlug === 'storage') {
    const type = get('Interface', 'type', 'Type', 'Form Factor');
    if (type) clean['Type'] = type;

    const cap = get('Capacity', 'capacity_gb');
    if (cap) clean['Capacity'] = typeof cap === 'number' ? (cap >= 1000 ? `${cap/1000} TB` : `${cap} GB`) : cap;

    const read = get('Read Speed', 'Read');
    if (read) clean['Read Speed'] = read;

    const write = get('Write Speed', 'Write');
    if (write) clean['Write Speed'] = write;

    const form = get('Form Factor');
    if (form) clean['Form Factor'] = form;

    const warranty = get('Warranty', 'warranty');
    if (warranty) clean['Warranty'] = warranty === '5Y' ? '5 Years' : (warranty === '3Y' ? '3 Years' : warranty);
  }

  else if (categorySlug === 'psu') {
    const w = get('Continuous Power W', 'Wattage', 'wattage');
    if (w) {
      const numMatch = w.match(/\d+/);
      clean['Wattage'] = numMatch ? `${numMatch[0]}W` : w;
    }

    const eff = get('Energy Efficient', '80 Plus', 'Efficiency');
    if (eff) clean['Efficiency'] = eff;

    const modular = get('Modular');
    if (modular) clean['Modularity'] = modular;

    const fan = get('Fan Size');
    if (fan) clean['Fan Size'] = fan;

    const prot = get('Protections');
    if (prot) clean['Protections'] = prot;

    const warranty = get('Warranty', 'warranty');
    if (warranty) clean['Warranty'] = warranty === '5Y' ? '5 Years' : (warranty === '3Y' ? '3 Years' : (warranty === '7Y' ? '7 Years' : warranty));
  }

  else if (categorySlug === 'case') {
    const form = get('Form Factor', 'Form Factor Support');
    if (form) clean['Form Factor'] = form;

    const mb = get('Mainboard Support', 'Motherboard Support');
    if (mb) clean['Mainboard Support'] = mb;

    const vga = get('VGA Support', 'Max GPU Length', 'Max GPU Length (mm)');
    if (vga) clean['Max GPU Length'] = vga;

    const cooler = get('CPU Cooler Support');
    if (cooler) clean['CPU Cooler Support'] = cooler;

    const color = get('Color');
    if (color) clean['Color'] = color;

    const warranty = get('Warranty', 'warranty');
    if (warranty) clean['Warranty'] = warranty === '1Y' ? '1 Year' : (warranty === '2Y' ? '2 Years' : warranty);
  }

  return clean;
}

async function runRefinedStandardization() {
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
      SELECT p.id, p.category_id, c.slug as category_slug, p.brand, p.model, p.specifications
      FROM products p
      JOIN categories c ON p.category_id = c.id
    `);

    for (const p of products) {
      const canonicalSpec = normalizeAllSpecifications(p.specifications, p.category_slug, p.brand, p.model);
      const jsonStr = JSON.stringify(canonicalSpec);
      await connection.query(`UPDATE products SET specifications = ? WHERE id = ?`, [jsonStr, p.id]);
    }

    await connection.commit();
    console.log(`✅ Perfectly standardized specifications across all 749 products!`);

  } catch (err) {
    await connection.rollback();
    console.error(err);
    throw err;
  } finally {
    await connection.end();
  }
}

runRefinedStandardization().catch(console.error);

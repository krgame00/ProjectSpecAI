require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

function parseNum(str) {
  if (!str) return null;
  const num = String(str).replace(/,/g, '').match(/\d+/);
  return num ? parseInt(num[0], 10) : null;
}

async function migrateSpecs() {
  console.log('🔌 Connecting to MySQL...');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'smart_pc_builder',
    multipleStatements: true
  });

  console.log('🛠️ Re-creating spec tables with strongly typed columns...');
  await conn.query(`
    DROP TABLE IF EXISTS spec_case;
    DROP TABLE IF EXISTS spec_psu;
    DROP TABLE IF EXISTS spec_storage;
    DROP TABLE IF EXISTS spec_gpu;
    DROP TABLE IF EXISTS spec_ram;
    DROP TABLE IF EXISTS spec_motherboard;
    DROP TABLE IF EXISTS spec_cpu;

    CREATE TABLE spec_cpu (
      product_id INT PRIMARY KEY,
      socket VARCHAR(50),
      cores INT,
      threads INT,
      tdp_watt INT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
    CREATE TABLE spec_motherboard (
      product_id INT PRIMARY KEY,
      socket VARCHAR(50),
      ram_type VARCHAR(20),
      form_factor VARCHAR(50),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
    CREATE TABLE spec_ram (
      product_id INT PRIMARY KEY,
      ram_type VARCHAR(20),
      capacity_gb INT,
      bus_speed INT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
    CREATE TABLE spec_gpu (
      product_id INT PRIMARY KEY,
      chipset VARCHAR(100),
      vram_gb INT,
      tdp_watt INT,
      length_mm INT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
    CREATE TABLE spec_storage (
      product_id INT PRIMARY KEY,
      type VARCHAR(50),
      capacity_gb INT,
      read_speed_mbs INT,
      write_speed_mbs INT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
    CREATE TABLE spec_psu (
      product_id INT PRIMARY KEY,
      wattage INT,
      efficiency_rating VARCHAR(50),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
    CREATE TABLE spec_case (
      product_id INT PRIMARY KEY,
      form_factor_support VARCHAR(255),
      max_gpu_length_mm INT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);

  console.log('🔍 Fetching all 272 products...');
  const [products] = await conn.query(`
    SELECT p.*, cat.slug as category_slug
    FROM products p
    JOIN categories cat ON p.category_id = cat.id
  `);

  let count = 0;
  for (const p of products) {
    let specs = {};
    if (typeof p.specifications === 'string') {
      try { specs = JSON.parse(p.specifications || '{}'); } catch(e){}
    } else if (p.specifications) {
      specs = p.specifications;
    }

    const slug = p.category_slug;
    const pid = p.id;
    const model = p.model || '';

    if (slug === 'cpu') {
      const socket = specs['CPU Socket'] || specs['Socket'] || (model.includes('AM5') ? 'AM5' : model.includes('AM4') ? 'AM4' : 'LGA1700');
      const tdp = parseNum(specs['TDP'] || specs['Thermal Design Power']) || (model.includes('F') || model.includes('G') ? 65 : 125);
      const cores = parseNum(specs['Cores'] || specs['Core Count']);
      const threads = parseNum(specs['Threads'] || specs['Thread Count']);

      await conn.query(`
        INSERT INTO spec_cpu (product_id, socket, cores, threads, tdp_watt)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE socket=VALUES(socket), cores=VALUES(cores), threads=VALUES(threads), tdp_watt=VALUES(tdp_watt)
      `, [pid, socket, cores, threads, tdp]);

    } else if (slug === 'mobo') {
      const socket = specs['CPU Socket'] || specs['Socket'] || (specs['CPU Support'] && specs['CPU Support'].includes('AM5') ? 'AM5' : specs['CPU Support'] && specs['CPU Support'].includes('AM4') ? 'AM4' : 'LGA1700');
      const ramType = specs['Memory Type'] || specs['RAM Type'] || (model.includes('DDR5') || model.includes('D5') ? 'DDR5' : 'DDR4');
      const formFactor = specs['Form Factor'] || (model.includes('-M') || model.includes('M-') ? 'Micro-ATX' : 'ATX');

      await conn.query(`
        INSERT INTO spec_motherboard (product_id, socket, ram_type, form_factor)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE socket=VALUES(socket), ram_type=VALUES(ram_type), form_factor=VALUES(form_factor)
      `, [pid, socket, ramType, formFactor]);

    } else if (slug === 'ram') {
      const ramType = specs['Memory Type'] || specs['Type'] || (model.includes('DDR5') || model.includes('D5') ? 'DDR5' : 'DDR4');
      const cap = parseNum(specs['Capacity'] || specs['Memory Size']) || parseNum(model.match(/(\d+)GB/i)?.[1]);
      const speed = parseNum(specs['Bus'] || specs['Speed']) || parseNum(model.match(/(\d{4})/)?.[1]);

      await conn.query(`
        INSERT INTO spec_ram (product_id, ram_type, capacity_gb, bus_speed)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE ram_type=VALUES(ram_type), capacity_gb=VALUES(capacity_gb), bus_speed=VALUES(bus_speed)
      `, [pid, ramType, cap, speed]);

    } else if (slug === 'gpu') {
      const chipset = specs['GPU Model'] || specs['Chipset'] || model;
      const vram = parseNum(specs['Memory Size']) || parseNum(model.match(/(\d+)GB/i)?.[1]);
      const tdp = parseNum(specs['Power Requirement'] || specs['TDP']) || (model.includes('5090') ? 600 : model.includes('5080') ? 400 : 250);
      const length = parseNum(specs['Dimension']) || parseNum(specs['Length']);

      await conn.query(`
        INSERT INTO spec_gpu (product_id, chipset, vram_gb, tdp_watt, length_mm)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE chipset=VALUES(chipset), vram_gb=VALUES(vram_gb), tdp_watt=VALUES(tdp_watt), length_mm=VALUES(length_mm)
      `, [pid, chipset, vram, tdp, length]);

    } else if (slug === 'storage') {
      const stType = specs['Form Factor'] || specs['Interface'] || (model.includes('NVMe') || model.includes('M.2') ? 'NVMe M.2' : 'SATA SSD');
      const cap = parseNum(specs['Capacity']) || parseNum(model.match(/(\d+)(GB|TB)/i)?.[1]);
      const capGb = model.includes('TB') && cap && cap <= 8 ? cap * 1000 : cap;
      const readSpeed = parseNum(specs['Read Speed']);
      const writeSpeed = parseNum(specs['Write Speed']);

      await conn.query(`
        INSERT INTO spec_storage (product_id, type, capacity_gb, read_speed_mbs, write_speed_mbs)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE type=VALUES(type), capacity_gb=VALUES(capacity_gb), read_speed_mbs=VALUES(read_speed_mbs), write_speed_mbs=VALUES(write_speed_mbs)
      `, [pid, stType, capGb, readSpeed, writeSpeed]);

    } else if (slug === 'psu') {
      const watt = parseNum(specs['Wattage'] || specs['Power']) || parseNum(model.match(/(\d{3,4})W/i)?.[1]);
      const eff = specs['Efficiency'] || specs['Rating'] || (model.includes('Gold') ? '80 Plus Gold' : '80 Plus Bronze');

      await conn.query(`
        INSERT INTO spec_psu (product_id, wattage, efficiency_rating)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE wattage=VALUES(wattage), efficiency_rating=VALUES(efficiency_rating)
      `, [pid, watt, eff]);

    } else if (slug === 'case') {
      const formFactor = specs['Form Factor'] || specs['Motherboard Support'] || 'ATX, Micro-ATX';
      const maxGpuLength = parseNum(specs['Max GPU Length']) || 350;

      await conn.query(`
        INSERT INTO spec_case (product_id, form_factor_support, max_gpu_length_mm)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE form_factor_support=VALUES(form_factor_support), max_gpu_length_mm=VALUES(max_gpu_length_mm)
      `, [pid, formFactor, maxGpuLength]);
    }

    count++;
  }

  console.log(`✅ Successfully populated spec tables for ${count} products.`);
  await conn.end();
}

migrateSpecs().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});

const db = require('../config/db');
const { mapDbIdToFrontendId, mapFrontendIdToDbId } = require('../utils/idMapper');

function splitName(fullName) {
  if (!fullName) return { brand: '', model: '' };
  const parts = fullName.trim().split(/\s+/);
  const brand = parts[0] || '';
  const model = parts.slice(1).join(' ') || '';
  return { brand, model };
}

const CATEGORY_IDS = { cpu: 1, mobo: 2, ram: 3, gpu: 4, storage: 5, psu: 6, case: 7 };

const specValue = (specs, ...keys) => {
  for (const key of keys) {
    if (specs[key] !== undefined && specs[key] !== '') return specs[key];
  }
  return null;
};

const numericSpec = (specs, ...keys) => {
  const value = specValue(specs, ...keys);
  if (value == null) return null;
  const match = String(value).replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
};

const capacityGb = (specs, ...keys) => {
  const value = specValue(specs, ...keys);
  const amount = numericSpec(specs, ...keys);
  return value != null && /TB/i.test(String(value)) && amount != null ? amount * 1000 : amount;
};

function validateProduct(body) {
  const { name, category, price, specifications = {} } = body || {};
  if (!name || !String(name).trim()) return 'Product name is required';
  if (!CATEGORY_IDS[category]) return 'Invalid product category';
  if (!Number.isFinite(Number(price)) || Number(price) <= 0) return 'Product price must be greater than zero';
  const required = {
    cpu: [['Socket', 'CPU Socket']],
    mobo: [['Socket'], ['Memory Type', 'RAM Type'], ['Form Factor']],
    ram: [['Type', 'Memory Type', 'RAM Type'], ['Capacity', 'Capacity (GB)']],
    gpu: [['Length', 'Length (mm)', 'GPU Length'], ['TDP', 'Power Consumption']],
    psu: [['Wattage', 'Power']],
    case: [['Form Factor', 'Form Factor Support'], ['Max GPU Length', 'Max GPU Length (mm)']]
  };
  const missing = (required[category] || []).find(keys => specValue(specifications, ...keys) == null);
  return missing ? `${missing[0]} specification is required for ${category}` : null;
}

async function upsertTypedSpecs(connection, category, productId, specs) {
  const definitions = {
    cpu: {
      sql: `INSERT INTO spec_cpu (product_id, socket, cores, threads, tdp_watt) VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE socket=VALUES(socket), cores=VALUES(cores), threads=VALUES(threads), tdp_watt=VALUES(tdp_watt)`,
      values: [specValue(specs, 'Socket', 'CPU Socket'), numericSpec(specs, 'Cores'), numericSpec(specs, 'Threads'), numericSpec(specs, 'TDP')]
    },
    mobo: {
      sql: `INSERT INTO spec_motherboard (product_id, socket, form_factor, ram_type) VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE socket=VALUES(socket), form_factor=VALUES(form_factor), ram_type=VALUES(ram_type)`,
      values: [specValue(specs, 'Socket'), specValue(specs, 'Form Factor'), specValue(specs, 'Memory Type', 'RAM Type')]
    },
    ram: {
      sql: `INSERT INTO spec_ram (product_id, ram_type, capacity_gb, bus_speed) VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE ram_type=VALUES(ram_type), capacity_gb=VALUES(capacity_gb), bus_speed=VALUES(bus_speed)`,
      values: [specValue(specs, 'Type', 'Memory Type', 'RAM Type'), numericSpec(specs, 'Capacity', 'Capacity (GB)'), numericSpec(specs, 'Speed', 'Bus Speed')]
    },
    gpu: {
      sql: `INSERT INTO spec_gpu (product_id, chipset, vram_gb, length_mm, tdp_watt) VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE chipset=VALUES(chipset), vram_gb=VALUES(vram_gb), length_mm=VALUES(length_mm), tdp_watt=VALUES(tdp_watt)`,
      values: [specValue(specs, 'GPU', 'Chipset'), numericSpec(specs, 'VRAM'), numericSpec(specs, 'Length', 'Length (mm)', 'GPU Length'), numericSpec(specs, 'TDP', 'Power Consumption')]
    },
    storage: {
      sql: `INSERT INTO spec_storage (product_id, type, capacity_gb, read_speed_mbs, write_speed_mbs) VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE type=VALUES(type), capacity_gb=VALUES(capacity_gb), read_speed_mbs=VALUES(read_speed_mbs), write_speed_mbs=VALUES(write_speed_mbs)`,
      values: [specValue(specs, 'Type', 'Interface'), capacityGb(specs, 'Capacity', 'Capacity (GB)'), numericSpec(specs, 'Read Speed'), numericSpec(specs, 'Write Speed')]
    },
    psu: {
      sql: `INSERT INTO spec_psu (product_id, wattage, efficiency_rating) VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE wattage=VALUES(wattage), efficiency_rating=VALUES(efficiency_rating)`,
      values: [numericSpec(specs, 'Wattage', 'Power'), specValue(specs, 'Efficiency', 'Rating')]
    },
    case: {
      sql: `INSERT INTO spec_case (product_id, form_factor_support, max_gpu_length_mm) VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE form_factor_support=VALUES(form_factor_support), max_gpu_length_mm=VALUES(max_gpu_length_mm)`,
      values: [specValue(specs, 'Form Factor', 'Form Factor Support'), numericSpec(specs, 'Max GPU Length', 'Max GPU Length (mm)')]
    }
  };
  const definition = definitions[category];
  if (definition) await connection.query(definition.sql, [productId, ...definition.values]);
}

function canonicalProduct(id, body) {
  return {
    id, category: body.category, name: String(body.name).trim(), price: Number(body.price),
    image: body.image || `/images/${body.category}.png`, specifications: body.specifications || {}
  };
}

function formatProductName(brand, model) {
  let b = (brand || '').trim();
  let m = (model || '').trim();

  // 1. Remove category prefixes (Thai & English)
  m = m.replace(/^(?:CPU\s*\(ซีพียู\)|MAINBOARD\s*\(เมนบอร์ด\)|RAM\s*\(แรม\)|VGA\s*\(การ์ดจอ\)|PSU\s*\(อุปกรณ์จ่ายไฟ\)|CASE\s*\(เคส\)|(?:M\.2|SSD)\s*\(เอสเอสดี\))\s*/i, '');
  m = m.replace(/^(?:CPU|MAINBOARD|RAM|VGA|PSU|CASE|SSD)\s+/i, '');

  // 2. Standardize brand
  if (b.toUpperCase() === 'INTEL') b = 'Intel';
  else if (b.toUpperCase() === 'AMD') b = 'AMD';
  else if (b.toUpperCase() === 'NEXT') b = 'AMD';

  // 3. Remove duplicate brand and socket prefixes like "INTEL 1700", "AMD AM4", "AM5", "1851"
  m = m.replace(/^(?:AMD|INTEL|NEXT)\s+/i, '');
  m = m.replace(/^(?:AM4|AM5|sTRX5|1700|1851|LGA1700|LGA1851)\s+/i, '');

  // 4. Remove scrape suffixes like GHz, Cores/Threads, tray/box/warranty badges
  m = m.replace(/\s*\b\d+(?:\.\d+)?\s*GHz\b.*/i, '');
  m = m.replace(/\s*\b\d+\s*C\s*\d+\s*T\b.*/i, '');
  m = m.replace(/\s*\([^)]*(?:TRAY|BOX|MPK|3Y|Synnex|WTG|NEXT|REV|V\.\d|384MB)[^)]*\)/gi, '');
  m = m.replace(/\s*\(3Y\)/gi, '');
  m = m.replace(/\s*\(TRAY\)/gi, '');
  m = m.replace(/\s*\(MPK\)/gi, '');
  m = m.replace(/\s*\(BOX\)/gi, '');
  m = m.replace(/\s*\(NEXT\)/gi, '');

  m = m.trim();

  // 5. Normalize CPU capitalization
  m = m.replace(/\bRYZEN\s+THREADRIPPER\s+PRO\s+/i, 'Ryzen Threadripper Pro ');
  m = m.replace(/\bTHREADRIPPER\s+PRO\s+/i, 'Ryzen Threadripper Pro ');
  m = m.replace(/\bCORE\s+ULTRA\s+(\d)/i, 'Core Ultra $1');
  m = m.replace(/\bULTRA\s+(\d)/i, 'Core Ultra $1');
  m = m.replace(/\bCORE\s+I(\d)/i, 'Core i$1');
  m = m.replace(/\bCORE\s+i(\d)/i, 'Core i$1');
  m = m.replace(/\bRYZEN\s+(\d)/i, 'Ryzen $1');
  m = m.replace(/\bATHLON\s+/i, 'Athlon ');
  m = m.replace(/\bPLUS\b/i, 'Plus');
  m = m.replace(/\bCore\s+Core\b/gi, 'Core');
  m = m.replace(/\bRyzen\s+Ryzen\b/gi, 'Ryzen');

  // Strip brand from model if already present at start
  if (b && m.toLowerCase().startsWith(b.toLowerCase())) {
    m = m.slice(b.length).trim();
  }

  return b ? `${b} ${m}` : m;
}

const hardwareController = {
  getCatalog: async (req, res, next) => {
    try {
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
      const catalog = { cpu: [], mobo: [], ram: [], gpu: [], storage: [], psu: [], case: [] };

      products.forEach(product => {
        const slug = product.category_slug;
        if (catalog[slug]) {
          const formatted = {
            id: product.id,
            name: formatProductName(product.brand, product.model),
            price: parseFloat(product.price),
            image: product.image_url || `/images/${slug}.png`,
            specifications: typeof product.specifications === 'string' ? JSON.parse(product.specifications || '{}') : (product.specifications || {})
          };

          if (slug === 'cpu') {
            formatted.socket = product.cpu_socket;
            formatted.tdp = product.cpu_tdp;
            formatted.cores = product.cpu_cores;
            formatted.threads = product.cpu_threads;
          } else if (slug === 'mobo') {
            formatted.socket = product.mobo_socket;
            formatted.ramType = product.mobo_ram_type;
            formatted.formFactor = product.mobo_form_factor;
          } else if (slug === 'ram') {
            formatted.type = product.ram_type;
            formatted.capacityGb = product.ram_capacity_gb;
            formatted.busSpeed = product.ram_bus_speed;
          } else if (slug === 'gpu') {
            formatted.tdp = product.gpu_tdp;
            formatted.chipset = product.gpu_chipset;
            formatted.vramGb = product.gpu_vram_gb;
            formatted.lengthMm = product.gpu_length_mm;
            if (product.gpu_length_mm) formatted.specifications['Length (mm)'] = product.gpu_length_mm;
          } else if (slug === 'storage') {
            formatted.type = product.storage_type;
            formatted.capacityGb = product.storage_capacity_gb;
            formatted.readSpeedMbs = product.storage_read_speed;
            formatted.writeSpeedMbs = product.storage_write_speed;
          } else if (slug === 'psu') {
            let w = product.psu_wattage;
            if (!w) {
              const match = formatted.name.match(/(\d{3,4})W/i);
              w = match ? parseInt(match[1]) : 0;
            }
            formatted.wattage = w;
            formatted.efficiencyRating = product.psu_efficiency;
          } else if (slug === 'case') {
            formatted.formFactorSupport = product.form_factor_support;
            formatted.maxGpuLength = product.case_max_gpu_length;
            if (product.case_max_gpu_length) formatted.specifications['Max GPU Length (mm)'] = product.case_max_gpu_length;
          }

          catalog[slug].push(formatted);
        }
      });

      res.json(catalog);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const frontendId = req.params.id;
      const dbId = mapFrontendIdToDbId(frontendId);

      const [products] = await db.query(`
        SELECT p.*, cat.slug as category_slug
        FROM products p
        JOIN categories cat ON p.category_id = cat.id
        WHERE p.id = ?
      `, [dbId]);

      if (!products || products.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const product = products[0];
      res.json({
        id: frontendId,
        brand: product.brand,
        model: product.model,
        name: formatProductName(product.brand, product.model),
        price: parseFloat(product.price),
        image: product.image_url,
        category: product.category_slug
      });
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    let connection;
    try {
      const validationError = validateProduct(req.body);
      if (validationError) return res.status(400).json({ error: validationError });
      const { name, price, image, category, specifications = {} } = req.body;
      const { brand, model } = splitName(name);

      if (!db.isFallback()) {
        connection = await db.pool.getConnection();
        await connection.beginTransaction();
        const [result] = await connection.query(
          'INSERT INTO products (brand, model, price, image_url, category_id, specifications) VALUES (?, ?, ?, ?, ?, ?)',
          [brand, model, Number(price), image, CATEGORY_IDS[category], JSON.stringify(specifications)]
        );
        await upsertTypedSpecs(connection, category, result.insertId, specifications);
        await connection.commit();
        return res.status(201).json({ success: true, product: canonicalProduct(result.insertId, req.body) });
      } else {
        const dbId = Math.floor(Math.random() * 10000) + 5000;
        return res.status(201).json({ success: true, product: canonicalProduct(dbId, req.body) });
      }
    } catch (error) {
      if (connection) await connection.rollback();
      next(error);
    } finally {
      if (connection) connection.release();
    }
  },

  update: async (req, res, next) => {
    let connection;
    try {
      const validationError = validateProduct(req.body);
      if (validationError) return res.status(400).json({ error: validationError });
      const frontendId = req.params.id;
      const { name, price, image, category, specifications = {} } = req.body;
      const dbId = mapFrontendIdToDbId(frontendId);
      const { brand, model } = splitName(name);

      if (!db.isFallback()) {
        connection = await db.pool.getConnection();
        await connection.beginTransaction();
        const [existing] = await connection.query('SELECT id FROM products WHERE id = ? FOR UPDATE', [dbId]);
        if (!existing.length) {
          await connection.rollback();
          return res.status(404).json({ error: 'Product not found' });
        }
        await connection.query(
          'UPDATE products SET brand = ?, model = ?, price = ?, image_url = ?, category_id = ?, specifications = ? WHERE id = ?',
          [brand, model, Number(price), image, CATEGORY_IDS[category], JSON.stringify(specifications), dbId]
        );
        await upsertTypedSpecs(connection, category, dbId, specifications);
        await connection.commit();
      }
      return res.json({ success: true, product: canonicalProduct(dbId, req.body) });
    } catch (error) {
      if (connection) await connection.rollback();
      next(error);
    } finally {
      if (connection) connection.release();
    }
  },

  delete: async (req, res, next) => {
    try {
      const frontendId = req.params.id;
      const dbId = mapFrontendIdToDbId(frontendId);

      if (!db.isFallback()) {
        const [references] = await db.query('SELECT order_id FROM order_items WHERE product_id = ? LIMIT 1', [dbId]);
        if (references.length) return res.status(409).json({ error: 'สินค้านี้อยู่ในประวัติออเดอร์ จึงไม่สามารถลบได้' });
        const [result] = await db.query('DELETE FROM products WHERE id = ?', [dbId]);
        if (!result.affectedRows) return res.status(404).json({ error: 'Product not found' });
      }

      return res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = hardwareController;

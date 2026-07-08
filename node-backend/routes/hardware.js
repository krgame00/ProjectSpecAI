const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Helper to map DB Product ID to App.vue frontend IDs
function mapDbIdToFrontendId(dbId, categorySlug) {
  if (categorySlug === 'cpu') return `c${dbId}`;
  if (categorySlug === 'mobo') return `m${dbId - 10}`;
  if (categorySlug === 'ram') return `r${dbId - 20}`;
  if (categorySlug === 'gpu') return `g${dbId - 30}`;
  if (categorySlug === 'storage') return `s${dbId - 40}`;
  if (categorySlug === 'psu') return `p${dbId - 50}`;
  if (categorySlug === 'case') return `case${dbId - 60}`;
  return String(dbId);
}

// Helper to parse frontend ID back to DB Product ID
function mapFrontendIdToDbId(frontendId) {
  // If it's already a pure number (from DB catalog), return as-is
  if (/^\d+$/.test(String(frontendId))) return Number(frontendId);
  
  const num = parseInt(String(frontendId).replace(/\D/g, ''), 10);
  if (String(frontendId).startsWith('c')) return num;
  if (String(frontendId).startsWith('m')) return num + 10;
  if (String(frontendId).startsWith('r')) return num + 20;
  if (String(frontendId).startsWith('g')) return num + 30;
  if (String(frontendId).startsWith('s')) return num + 40;
  if (String(frontendId).startsWith('p')) return num + 50;
  if (String(frontendId).startsWith('case')) return num + 60;
  return num;
}

// Helper to split a full product name into brand + model
function splitName(fullName) {
  if (!fullName) return { brand: '', model: '' };
  const parts = fullName.trim().split(/\s+/);
  const brand = parts[0] || '';
  const model = parts.slice(1).join(' ') || '';
  return { brand, model };
}

// GET /api/hardware/catalog
// ดึงข้อมูลแคตตาล็อกสินค้าทั้งหมด พร้อมสเปคสำหรับเช็คความเข้ากันได้
router.get('/catalog', async (req, res, next) => {
  try {
    const queryStr = `
      SELECT p.*, cat.slug as category_slug,
             c.socket as cpu_socket, c.tdp_watt as cpu_tdp,
             m.socket as mobo_socket, m.ram_type as mobo_ram_type,
             r.ram_type, r.capacity_gb,
             g.tdp_watt as gpu_tdp, g.length_mm as gpu_length_mm,
             psu.wattage as psu_wattage,
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
    
    // จัดกลุ่มตาม Category เพื่อส่งให้ Vue.js ใช้งานง่ายๆ
    const catalog = { cpu: [], mobo: [], ram: [], gpu: [], storage: [], psu: [], case: [] };
    
    products.forEach(product => {
      const slug = product.category_slug;
      if (catalog[slug]) {
        // Format product fields to match exactly what Vue frontend expects
        const formatted = {
          id: product.id,
          name: `${product.brand} ${product.model}`,
          price: parseFloat(product.price),
          image: product.image_url || `/images/${slug}.png`,
          specifications: typeof product.specifications === 'string' ? JSON.parse(product.specifications || '{}') : (product.specifications || {})
        };

        // Add special specifications fields
        if (slug === 'cpu') {
          formatted.socket = product.cpu_socket;
          formatted.tdp = product.cpu_tdp;
        } else if (slug === 'mobo') {
          formatted.socket = product.mobo_socket;
          formatted.ramType = product.mobo_ram_type;
        } else if (slug === 'ram') {
          formatted.type = product.ram_type;
        } else if (slug === 'gpu') {
          formatted.tdp = product.gpu_tdp;
          if (product.gpu_length_mm) formatted.specifications['Length (mm)'] = product.gpu_length_mm;
        } else if (slug === 'psu') {
          formatted.wattage = product.psu_wattage;
        } else if (slug === 'case') {
          if (product.case_max_gpu_length) formatted.specifications['Max GPU Length (mm)'] = product.case_max_gpu_length;
        }

        catalog[slug].push(formatted);
      }
    });

    res.json(catalog);
  } catch (error) {
    next(error);
  }
});

// GET /api/hardware/:id
// ดึงข้อมูลสินค้าเฉพาะชิ้น
router.get('/:id', async (req, res, next) => {
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
      name: `${product.brand} ${product.model}`,
      price: parseFloat(product.price),
      image: product.image_url,
      category: product.category_slug
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/hardware
router.post('/', async (req, res, next) => {
  try {
    const { name, price, image, category, specifications } = req.body;
    const { brand, model } = splitName(name);
    
    if (!db.isFallback()) {
      const catIdMap = { cpu: 1, mobo: 2, ram: 3, gpu: 4, storage: 5, psu: 6, case: 7 };
      const catId = catIdMap[category] || 1;
      const [result] = await db.query('INSERT INTO products (brand, model, price, image_url, category_id, specifications) VALUES (?, ?, ?, ?, ?, ?)', 
        [brand, model, price, image, catId, JSON.stringify(specifications || {})]);
      const dbId = result.insertId;
      res.json({ success: true, id: dbId, dbId });
    } else {
      const dbId = Math.floor(Math.random() * 10000) + 5000;
      res.json({ success: true, id: dbId, dbId });
    }
  } catch (error) {
    next(error);
  }
});

// PUT /api/hardware/:id
router.put('/:id', async (req, res, next) => {
  try {
    const frontendId = req.params.id;
    const { name, price, image, specifications } = req.body;
    const dbId = mapFrontendIdToDbId(frontendId);
    const { brand, model } = splitName(name);
    
    if (!db.isFallback()) {
      await db.query('UPDATE products SET brand = ?, model = ?, price = ?, image_url = ?, specifications = ? WHERE id = ?', 
        [brand, model, price, image, JSON.stringify(specifications || {}), dbId]);
    }
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/hardware/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const frontendId = req.params.id;
    const dbId = mapFrontendIdToDbId(frontendId);
    
    if (!db.isFallback()) {
      await db.query('DELETE FROM products WHERE id = ?', [dbId]);
    }
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

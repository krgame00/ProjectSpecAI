const db = require('../config/db');
const { mapDbIdToFrontendId, mapFrontendIdToDbId } = require('../utils/idMapper');

function splitName(fullName) {
  if (!fullName) return { brand: '', model: '' };
  const parts = fullName.trim().split(/\s+/);
  const brand = parts[0] || '';
  const model = parts.slice(1).join(' ') || '';
  return { brand, model };
}

const hardwareController = {
  getCatalog: async (req, res, next) => {
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
      const catalog = { cpu: [], mobo: [], ram: [], gpu: [], storage: [], psu: [], case: [] };

      products.forEach(product => {
        const slug = product.category_slug;
        if (catalog[slug]) {
          const formatted = {
            id: product.id,
            name: `${product.brand} ${product.model}`,
            price: parseFloat(product.price),
            image: product.image_url || `/images/${slug}.png`,
            specifications: typeof product.specifications === 'string' ? JSON.parse(product.specifications || '{}') : (product.specifications || {})
          };

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
        name: `${product.brand} ${product.model}`,
        price: parseFloat(product.price),
        image: product.image_url,
        category: product.category_slug
      });
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const { name, price, image, category, specifications } = req.body;
      const { brand, model } = splitName(name);

      if (!db.isFallback()) {
        const catIdMap = { cpu: 1, mobo: 2, ram: 3, gpu: 4, storage: 5, psu: 6, case: 7 };
        const catId = catIdMap[category] || 1;
        const [result] = await db.query(
          'INSERT INTO products (brand, model, price, image_url, category_id, specifications) VALUES (?, ?, ?, ?, ?, ?)',
          [brand, model, price, image, catId, JSON.stringify(specifications || {})]
        );
        res.json({ success: true, id: result.insertId, dbId: result.insertId });
      } else {
        const dbId = Math.floor(Math.random() * 10000) + 5000;
        res.json({ success: true, id: dbId, dbId });
      }
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const frontendId = req.params.id;
      const { name, price, image, specifications } = req.body;
      const dbId = mapFrontendIdToDbId(frontendId);
      const { brand, model } = splitName(name);

      if (!db.isFallback()) {
        await db.query(
          'UPDATE products SET brand = ?, model = ?, price = ?, image_url = ?, specifications = ? WHERE id = ?',
          [brand, model, price, image, JSON.stringify(specifications || {}), dbId]
        );
      }

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
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
  }
};

module.exports = hardwareController;

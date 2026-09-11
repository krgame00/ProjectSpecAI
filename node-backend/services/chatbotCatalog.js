const CATEGORY_KEYS = ['cpu', 'mobo', 'ram', 'gpu', 'storage', 'psu', 'case'];
const CATEGORY_ALIASES = {
  motherboard: 'mobo',
  mainboard: 'mobo',
  memory: 'ram',
  ssd: 'storage',
  power: 'psu',
  power_supply: 'psu'
};

function categoryKey(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return CATEGORY_ALIASES[normalized] || normalized;
}

function numberValue(value) {
  const parsed = Number.parseFloat(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeProduct(product = {}) {
  const category = categoryKey(product.category || product.category_slug || product.categorySlug);
  const specs = product.specifications || product.specs || {};
  return {
    id: Number.isFinite(Number(product.id)) ? Number(product.id) : product.id,
    category,
    name: product.name || [product.brand, product.model].filter(Boolean).join(' ').trim(),
    brand: product.brand || '',
    model: product.model || '',
    price: numberValue(product.price) || 0,
    image: product.image || product.image_url || '',
    specifications: specs,
    socket: product.socket || product.cpu_socket || product.mobo_socket || specs.Socket || '',
    ramType: product.ram_type || product.mobo_ram_type || specs['Memory Type'] || specs.Type || '',
    wattage: numberValue(product.wattage || product.psu_wattage || specs.Wattage),
    formFactor: product.form_factor || product.form_factor_support || specs['Form Factor'] || '',
    gpuLength: numberValue(product.gpu_length || product.max_gpu_length || specs.Length || specs['Max GPU Length']),
    tdp: numberValue(product.tdp || product.cpu_tdp || product.gpu_tdp || specs.TDP),
    useCase: product.use_case || product.useCase || specs.UseCase || specs['Use Case'] || ''
  };
}

function compatibilityScore(product, selected = {}) {
  let score = 0;
  const cpu = selected.cpu;
  const mobo = selected.mobo;
  const ram = selected.ram;
  if (product.category === 'mobo' && cpu?.socket && product.socket && cpu.socket === product.socket) score += 4;
  if (product.category === 'ram' && mobo?.ramType && product.ramType && mobo.ramType.toLowerCase() === product.ramType.toLowerCase()) score += 4;
  if (product.category === 'psu' && selected.gpu?.tdp && product.wattage && product.wattage >= selected.gpu.tdp * 2.2) score += 3;
  if (product.category === 'case' && mobo?.formFactor && product.formFactor && product.formFactor.toLowerCase().includes(mobo.formFactor.toLowerCase())) score += 2;
  if (product.category === 'case' && selected.gpu?.gpuLength && product.gpuLength) {
    score += product.gpuLength >= selected.gpu.gpuLength ? 2 : -4;
  }
  if (selected.useCase && product.useCase && String(product.useCase).toLowerCase().includes(String(selected.useCase).toLowerCase())) score += 1;
  return score;
}

function extractBudget(text = '', fallback = null) {
  const match = String(text).match(/(?:งบ|budget)\s*(?:ไม่เกิน|ประมาณ|of|:)?\s*([\d,]+)\s*(?:บาท|thb|฿)?/i)
    || String(text).match(/([\d,]+)\s*(?:บาท|thb|฿)/i);
  return match ? Number(match[1].replace(/,/g, '')) : fallback;
}

function budgetAllocation(budget) {
  if (!budget) return {};
  return {
    cpu: budget * 0.18,
    mobo: budget * 0.14,
    ram: budget * 0.1,
    gpu: budget * 0.38,
    storage: budget * 0.08,
    psu: budget * 0.07,
    case: budget * 0.05
  };
}

function selectTargetedCandidates(products, options = {}) {
  const normalized = products.map(normalizeProduct).filter(product => CATEGORY_KEYS.includes(product.category));
  const budget = options.budgetThb || extractBudget(options.text, null);
  const allocations = budgetAllocation(budget);
  const selectedInput = options.selected || {};
  const selected = { ...(options.useCase ? { useCase: options.useCase } : {}) };
  for (const category of CATEGORY_KEYS) {
    const value = selectedInput[category];
    if (value && typeof value === 'object') selected[category] = normalizeProduct(value);
    else if (value !== undefined && value !== null) selected[category] = normalized.find(product => String(product.id) === String(value));
  }
  const categories = options.categories?.map(categoryKey) || CATEGORY_KEYS;
  const limitPerCategory = options.limitPerCategory || 8;
  const result = {};

  for (const category of categories) {
    const candidates = normalized.filter(product => product.category === category);
    const target = allocations[category];
    result[category] = candidates
      .map(product => ({
        product,
        score: compatibilityScore(product, selected) + (target ? Math.max(0, 4 - Math.abs(product.price - target) / Math.max(target, 1) * 4) : 0)
      }))
      .sort((a, b) => b.score - a.score || b.product.price - a.product.price)
      .slice(0, limitPerCategory)
      .map(item => item.product);
  }
  return result;
}

async function loadCatalog(db) {
  const [rows] = await db.query(`
    SELECT p.*, c.slug AS category
    FROM products p
    JOIN categories c ON p.category_id = c.id
  `);
  return Array.isArray(rows) ? rows.map(normalizeProduct) : [];
}

async function retrieveTargetedCatalog({ db, text = '', budgetThb, selected, categories, useCase, limitPerCategory } = {}) {
  const products = await loadCatalog(db);
  const candidates = selectTargetedCandidates(products, { text, budgetThb, selected, categories, useCase, limitPerCategory });
  return { products, candidates };
}

function flattenCandidates(candidates = {}) {
  return Object.values(candidates).flat();
}

function buildCatalogContext(candidates = {}) {
  const lines = flattenCandidates(candidates).map(product => {
    const spec = [product.socket, product.ramType, product.wattage ? `${product.wattage}W` : '', product.formFactor].filter(Boolean).join(', ');
    return `- ID: ${product.id} | Category: ${product.category} | Name: ${product.name} | Price: ฿${product.price.toLocaleString()}${spec ? ` | Specs: ${spec}` : ''}`;
  });
  return lines.length
    ? `\n[ข้อมูลสินค้าในร้านที่คัดตามงบและความเข้ากันได้:\n${lines.join('\n')}\nใช้เฉพาะ ID เหล่านี้ใน recommended_build และใส่ null เมื่อไม่มีตัวเลือกที่ปลอดภัย]`
    : '\n[ข้อมูลสินค้าในร้าน: ไม่พบตัวเลือกที่เข้ากับเงื่อนไข ให้ใส่ null ใน recommended_build]';
}

function validateRecommendedBuild(build, candidates = {}) {
  const allowed = new Map(flattenCandidates(candidates).map(product => [String(product.id), product]));
  const result = {};
  for (const category of CATEGORY_KEYS) {
    const value = build && typeof build === 'object' ? build[category] : null;
    const product = value === null || value === undefined ? null : allowed.get(String(value));
    result[category] = product ? product.id : null;
  }
  return result;
}

module.exports = {
  CATEGORY_KEYS,
  CATEGORY_ALIASES,
  categoryKey,
  normalizeProduct,
  extractBudget,
  budgetAllocation,
  selectTargetedCandidates,
  loadCatalog,
  retrieveTargetedCatalog,
  buildCatalogContext,
  validateRecommendedBuild,
  flattenCandidates
};

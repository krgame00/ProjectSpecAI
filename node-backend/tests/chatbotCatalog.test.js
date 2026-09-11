const { selectTargetedCandidates, validateRecommendedBuild, buildCatalogContext } = require('../services/chatbotCatalog');

const products = [
  { id: 1, category: 'cpu', brand: 'AMD', model: 'Budget', price: 3000, cpu_socket: 'AM5' },
  { id: 2, category: 'cpu', brand: 'AMD', model: 'High', price: 25000, cpu_socket: 'AM5' },
  { id: 3, category: 'mobo', brand: 'Board', model: 'AM5', price: 5000, mobo_socket: 'AM5', mobo_ram_type: 'DDR5' },
  { id: 4, category: 'ram', brand: 'RAM', model: 'DDR5', price: 5000, ram_type: 'DDR5' },
  { id: 5, category: 'gpu', brand: 'GPU', model: 'Fast', price: 40000, gpu_tdp: 300 },
  { id: 6, category: 'psu', brand: 'PSU', model: '850W', price: 5000, psu_wattage: 850 },
];

describe('targeted catalog retrieval', () => {
  test('keeps high-tier candidates available for high budgets', () => {
    const candidates = selectTargetedCandidates(products, { text: 'จัดสเปค งบ 100000' });
    expect(candidates.cpu.map(item => item.id)).toContain(2);
  });

  test('validates only IDs supplied by the catalog', () => {
    const candidates = selectTargetedCandidates(products, { text: 'จัดสเปค งบ 50000' });
    expect(validateRecommendedBuild({ cpu: 1, gpu: 999, ram: 4 }, candidates)).toMatchObject({ cpu: 1, gpu: null, ram: 4 });
    expect(buildCatalogContext(candidates)).toContain('ID:');
  });

  test('filters known incompatible candidates instead of merely lowering their score', () => {
    const candidates = selectTargetedCandidates([
      ...products,
      { id: 7, category: 'mobo', brand: 'Board', model: 'AM4', price: 3000, mobo_socket: 'AM4', mobo_ram_type: 'DDR4' },
      { id: 8, category: 'psu', brand: 'PSU', model: '300W', price: 1000, psu_wattage: 300 },
    ], { selected: { cpu: 1, gpu: 5 }, categories: ['mobo', 'psu'] });
    expect(candidates.mobo.map(item => item.id)).not.toContain(7);
    expect(candidates.psu.map(item => item.id)).not.toContain(8);
  });
});

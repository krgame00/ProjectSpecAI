const { classifyRequest, detectFastIntent, isFreshnessSensitive } = require('../services/chatbotPolicy');

describe('SpecAI routing policy', () => {
  test('routes greeting, thanks and capability to deterministic fast path', () => {
    expect(detectFastIntent('สวัสดีครับ')).toBe('greeting');
    expect(classifyRequest('ขอบคุณครับ').route).toBe('fast');
    expect(classifyRequest('คุณช่วยอะไรได้บ้าง').route).toBe('fast');
    expect(classifyRequest('โอเคครับ').route).toBe('fast');
  });

  test('does not fast-path hardware questions', () => {
    expect(classifyRequest('CPU คืออะไร').route).toBe('ai');
    expect(classifyRequest('ช่วยจัดสเปค งบ 30000').route).toBe('catalog');
    expect(classifyRequest('แนะนำ GPU รุ่นไหนดี')).toMatchObject({ route: 'catalog', categories: ['gpu'] });
    expect(classifyRequest('ขอ RAM สำหรับ AM5')).toMatchObject({ route: 'catalog', categories: ['ram'] });
  });

  test('enables live search only for freshness-sensitive requests', () => {
    expect(isFreshnessSensitive('ราคา RTX ล่าสุดวันนี้')).toBe(true);
    expect(classifyRequest('ราคา RTX ล่าสุดวันนี้')).toMatchObject({ route: 'live_search', useLiveSearch: true, useCatalog: false });
    expect(classifyRequest('ช่วยจัดสเปค งบ 50000 ราคา GPU ล่าสุด')).toMatchObject({ route: 'catalog_live_search', useCatalog: true, useLiveSearch: true });
    expect(classifyRequest('อธิบายความต่างของ DDR4 กับ DDR5')).toMatchObject({ useLiveSearch: false });
  });

  test('can roll back hybrid routing without changing the endpoint contract', () => {
    expect(classifyRequest('สวัสดีครับ', { hybridRouting: false })).toMatchObject({ route: 'ai', useCatalog: false, useLiveSearch: false });
  });
});

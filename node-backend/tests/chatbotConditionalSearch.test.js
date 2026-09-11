const { appendSearchDisclosure, extractSources, sourceTrust } = require('../services/chatbotSearch');

describe('conditional live search safeguards', () => {
  test('discloses when a freshness answer has no verifiable sources', () => {
    expect(appendSearchDisclosure('คำตอบทั่วไป', { useLiveSearch: true, sources: [] })).toContain('ยังยืนยันข้อมูลสดไม่ได้');
    expect(appendSearchDisclosure('คำตอบทั่วไป', { useLiveSearch: true, sources: [{ uri: 'https://intel.com' }] })).toBe('คำตอบทั่วไป');
  });

  test('deduplicates and prioritizes trusted sources', () => {
    const sources = extractSources({ groundingChunks: [
      { web: { uri: 'https://example.com', title: 'Other' } },
      { web: { uri: 'https://jib.co.th/item', title: 'JIB' } },
      { web: { uri: 'https://www.intel.com/spec', title: 'Intel' } },
      { web: { uri: 'https://jib.co.th/item', title: 'JIB duplicate' } },
    ] });
    expect(sources).toHaveLength(3);
    expect(sources.map(source => source.type)).toEqual(['official', 'thai_retailer', 'other']);
    expect(sourceTrust('https://www.intel.com', 'Intel').rank).toBe(1);
  });
});

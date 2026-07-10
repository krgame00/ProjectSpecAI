const { mapDbIdToFrontendId, mapFrontendIdToDbId, CATEGORY_OFFSETS } = require('../utils/idMapper');

describe('idMapper', () => {
  describe('mapFrontendIdToDbId', () => {
    test('returns number as-is', () => {
      expect(mapFrontendIdToDbId(1000)).toBe(1000);
    });

    test('parses pure numeric string', () => {
      expect(mapFrontendIdToDbId('1000')).toBe(1000);
    });

    test('parses cpu prefixed id (c prefix)', () => {
      expect(mapFrontendIdToDbId('c5')).toBe(5);
    });

    test('parses mobo prefixed id (m prefix)', () => {
      expect(mapFrontendIdToDbId('m5')).toBe(5 + CATEGORY_OFFSETS.mobo);
    });

    test('parses ram prefixed id (r prefix)', () => {
      expect(mapFrontendIdToDbId('r5')).toBe(5 + CATEGORY_OFFSETS.ram);
    });

    test('parses gpu prefixed id (g prefix)', () => {
      expect(mapFrontendIdToDbId('g5')).toBe(5 + CATEGORY_OFFSETS.gpu);
    });

    test('parses storage prefixed id (s prefix)', () => {
      expect(mapFrontendIdToDbId('s5')).toBe(5 + CATEGORY_OFFSETS.storage);
    });

    test('parses psu prefixed id (p prefix)', () => {
      expect(mapFrontendIdToDbId('p5')).toBe(5 + CATEGORY_OFFSETS.psu);
    });

    test('parses case prefixed id (case prefix)', () => {
      expect(mapFrontendIdToDbId('case5')).toBe(5 + CATEGORY_OFFSETS.case);
    });

    test('returns NaN string as number fallback', () => {
      expect(mapFrontendIdToDbId('xyz')).toBeNaN();
    });
  });

  describe('mapDbIdToFrontendId', () => {
    test('maps cpu id', () => {
      expect(mapDbIdToFrontendId(5, 'cpu')).toBe('c5');
    });

    test('maps mobo id', () => {
      expect(mapDbIdToFrontendId(15, 'mobo')).toBe('m5');
    });

    test('maps ram id', () => {
      expect(mapDbIdToFrontendId(25, 'ram')).toBe('r5');
    });

    test('maps gpu id', () => {
      expect(mapDbIdToFrontendId(35, 'gpu')).toBe('g5');
    });

    test('maps storage id', () => {
      expect(mapDbIdToFrontendId(45, 'storage')).toBe('s5');
    });

    test('maps psu id', () => {
      expect(mapDbIdToFrontendId(55, 'psu')).toBe('p5');
    });

    test('maps case id', () => {
      expect(mapDbIdToFrontendId(65, 'case')).toBe('case5');
    });

    test('returns string id for unknown category', () => {
      expect(mapDbIdToFrontendId(5, 'unknown')).toBe('5');
    });
  });
});

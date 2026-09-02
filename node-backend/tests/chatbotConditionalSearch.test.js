process.env.JWT_SECRET = 'chatbot-test-jwt-secret';
process.env.GEMINI_API_KEY = 'test-gemini-key';

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn(),
      generateContentStream: jest.fn(),
    },
  })),
}));

jest.mock('../config/db', () => ({
  query: jest.fn(),
  isFallback: jest.fn(() => false),
}));

const { shouldUseSearch, getCatalogContext, clearCatalogCache } = require('../routes/chatbot');
const db = require('../config/db');

describe('Chatbot Conditional Search & Catalog Cache', () => {
  describe('Greeting and General Chat (Should NOT trigger search)', () => {
    test('General greetings without hardware keywords', () => {
      expect(shouldUseSearch('สวัสดีครับ')).toBe(false);
      expect(shouldUseSearch('สวัสดี')).toBe(false);
      expect(shouldUseSearch('สบายดีไหมครับ')).toBe(false);
      expect(shouldUseSearch('ทำอะไรได้บ้าง')).toBe(false);
      expect(shouldUseSearch('ขอบคุณมากๆ ครับ')).toBe(false);
      expect(shouldUseSearch('คุณเป็นใคร')).toBe(false);
    });

    test('General budget spec requests without specific model queries', () => {
      expect(shouldUseSearch('ช่วยจัดสเปคคอมงบ 30000 หน่อยครับ')).toBe(false);
      expect(shouldUseSearch('มีงบ 25,000 เล่น FiveM แนะนำหน่อย')).toBe(false);
    });

    test('Empty or invalid inputs', () => {
      expect(shouldUseSearch('')).toBe(false);
      expect(shouldUseSearch('   ')).toBe(false);
      expect(shouldUseSearch(null)).toBe(false);
      expect(shouldUseSearch(undefined)).toBe(false);
    });
  });

    test('General hardware comparisons without pricing or leak keywords (Should NOT trigger slow web search)', () => {
      expect(shouldUseSearch('RTX 4060 vs RX 7600')).toBe(false);
      expect(shouldUseSearch('เปรียบเทียบ i5 กับ Ryzen 5')).toBe(false);
      expect(shouldUseSearch('การ์ดจอตัวไหนคุ้มกว่ากัน')).toBe(false);
    });

    test('Thai retailers, Market Pricing, and Leaks (Should trigger search)', () => {
      expect(shouldUseSearch('RTX 5090 ราคาเท่าไหร่')).toBe(true);
      expect(shouldUseSearch('ราคา JIB วันนี้')).toBe(true);
      expect(shouldUseSearch('Advice มีของไหม')).toBe(true);
      expect(shouldUseSearch('iHAVECPU มีโปรโมชั่นอะไรบ้าง')).toBe(true);
      expect(shouldUseSearch('ราคาไทยการ์ดจอ RTX 5070')).toBe(true);
      expect(shouldUseSearch('Ryzen 7 9800X3D เปิดตัวเมื่อไหร่')).toBe(true);
      expect(shouldUseSearch('สเปคหลุด RTX 5080')).toBe(true);
      expect(shouldUseSearch('ของเข้าไทยวันไหน')).toBe(true);
    });

  describe('Catalog Cache Mechanism', () => {
    beforeEach(() => {
      clearCatalogCache();
      jest.clearAllMocks();
    });

    test('First call queries DB, second call uses in-memory cache', async () => {
      db.query.mockResolvedValueOnce([[
        { id: 1, category: 'cpu', brand: 'Intel', model: 'i5-14400', price: '7500' },
        { id: 2, category: 'gpu', brand: 'NVIDIA', model: 'RTX 4060', price: '10500' },
      ]]);

      const firstResult = await getCatalogContext();
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(firstResult).toContain('Intel i5-14400');
      expect(firstResult).toContain('RTX 4060');

      const secondResult = await getCatalogContext();
      expect(db.query).toHaveBeenCalledTimes(1); // Cached, no second DB query
      expect(secondResult).toBe(firstResult);
    });

    test('Handles database failure gracefully without crashing', async () => {
      clearCatalogCache();
      db.query.mockRejectedValueOnce(new Error('DB Connection Refused'));

      const result = await getCatalogContext();
      expect(result).toBe('');
    });
  });
});

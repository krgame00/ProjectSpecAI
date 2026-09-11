const HARDWARE_TERMS = /(?:cpu|gpu|ram|ssd|nvme|psu|motherboard|mainboard|computer|pc|hardware|การ์ดจอ|ซีพียู|แรม|เมนบอร์ด|คอม|ประกอบ|สเปก)/i;
const FRESHNESS_TERMS = /(?:ล่าสุด|วันนี้|ตอนนี้|ปัจจุบัน|ราคาล่าสุด|มีของไหม|ของหมดไหม|ข่าว|เพิ่งเปิดตัว|เข้าไทย|driver ล่าสุด|bios ล่าสุด|firmware|jib|advice|banana\s*it|ihavecpu|latest|current|stock|availability|release|launch|เช็กข้อมูลล่าสุด|ค้นเว็บ)/i;
const BUILD_TERMS = /(?:จัดสเปค|จัดคอม|ประกอบคอม|สเปคคอม|แนะนำสเปค|full\s*build|gaming\s*pc|build me|งบ\s*[\d,]+|budget\s*[\d,]+)/i;
const SINGLE_PART_TERMS = /(?:\bcpu\b|\bgpu\b|\bram\b|\bssd\b|\bpsu\b|\bmotherboard\b|\bmainboard\b|การ์ดจอ|ซีพียู|แรม|เมนบอร์ด|เมนบอร์ด|เพาเวอร์|พาวเวอร์|เคส)/i;
const SINGLE_PART_REQUEST = /(?:แนะนำ|เลือก|ขอ|หา|ซื้อ|ช่วยดู|รุ่นไหนดี|ตัวไหนดี|recommend|suggest|which|best)/i;
const CATEGORY_FROM_TEXT = [
  ['cpu', /(?:\bcpu\b|ซีพียู)/i],
  ['mobo', /(?:\bmotherboard\b|\bmainboard\b|เมนบอร์ด)/i],
  ['ram', /(?:\bram\b|แรม)/i],
  ['gpu', /(?:\bgpu\b|การ์ดจอ)/i],
  ['storage', /(?:\bssd\b|\bnvme\b|ฮาร์ดดิสก์|สตอเรจ)/i],
  ['psu', /(?:\bpsu\b|เพาเวอร์|พาวเวอร์)/i],
  ['case', /(?:\bcase\b|เคส)/i],
];
const FAST_PATTERNS = {
  greeting: [/^(?:สวัสดี|หวัดดี|ดีครับ|ดีค่ะ|hello|hi|hey)\s*[!?.ครับค่ะ]*$/i],
  thanks: [/^(?:ขอบคุณ|ขอบใจ|ขอบคุณมาก|thanks|thank you|thx)\s*[!?.ครับค่ะ]*$/i],
  acknowledgement: [/^(?:โอเค|ตกลง|รับทราบ|ได้เลย|ok|okay|got it|sure)\s*[!?.ครับค่ะ]*$/i],
  capability: [/(?:ทำอะไรได้บ้าง|ช่วยอะไรได้บ้าง|ความสามารถ|what can you do|capabilities)/i]
};

function normalizeText(text) {
  return String(text || '').trim().replace(/\s+/g, ' ');
}

function isFreshnessSensitive(text) {
  return FRESHNESS_TERMS.test(normalizeText(text));
}

function isCatalogIntent(text) {
  return BUILD_TERMS.test(normalizeText(text));
}

function isSinglePartIntent(text) {
  const normalized = normalizeText(text);
  return SINGLE_PART_TERMS.test(normalized) && SINGLE_PART_REQUEST.test(normalized);
}

function inferRequestedCategories(text) {
  const normalized = normalizeText(text);
  return CATEGORY_FROM_TEXT.filter(([, pattern]) => pattern.test(normalized)).map(([category]) => category);
}

function detectFastIntent(text) {
  const normalized = normalizeText(text);
  if (!normalized || HARDWARE_TERMS.test(normalized) && !/^(?:สวัสดี|hello|hi)/i.test(normalized)) return null;
  for (const [intent, patterns] of Object.entries(FAST_PATTERNS)) {
    if (patterns.some(pattern => pattern.test(normalized))) return intent;
  }
  return null;
}

function classifyRequest(text, config = {}) {
  const normalized = normalizeText(text);
  if (config.hybridRouting === false) {
    return { route: 'ai', fastIntent: null, useCatalog: false, useLiveSearch: false, requiresBuild: false, text: normalized };
  }
  const fastIntent = config.fastPath === false ? null : detectFastIntent(normalized);
  const catalog = config.targetedCatalog !== false && (isCatalogIntent(normalized) || isSinglePartIntent(normalized));
  const liveSearch = config.liveSearch !== false && isFreshnessSensitive(normalized);
  const route = fastIntent
    ? 'fast'
    : catalog && liveSearch
      ? 'catalog_live_search'
      : catalog
        ? 'catalog'
        : liveSearch
          ? 'live_search'
          : 'ai';
  return {
    route,
    fastIntent,
    useCatalog: catalog,
    useLiveSearch: liveSearch,
    requiresBuild: catalog,
    categories: isCatalogIntent(normalized) ? null : inferRequestedCategories(normalized),
    text: normalized
  };
}

const RESPONSE_BANK = {
  greeting: [
    'สวัสดีครับ ผม SpecAI ช่วยเลือกอุปกรณ์และจัดสเปกคอมให้เหมาะกับงบและการใช้งานได้ครับ',
    'สวัสดีครับ วันนี้อยากให้ช่วยดูชิ้นส่วนไหน หรือมีงบสำหรับจัดคอมเท่าไหร่ครับ',
    'ยินดีต้อนรับครับ บอกงานที่ใช้กับงบประมาณมาได้เลย เดี๋ยวผมช่วยวางสเปกให้ครับ',
    'สวัสดีครับ ถามเรื่อง CPU, GPU, RAM หรือให้ช่วยจัดชุดคอมได้เลยครับ',
    'สวัสดีครับ SpecAI พร้อมช่วยวางสเปกและเช็กความเข้ากันได้ของอุปกรณ์ครับ',
    'สวัสดีครับ เริ่มจากบอกว่าต้องการใช้คอมทำอะไรเป็นหลักได้เลยครับ'
  ],
  thanks: [
    'ยินดีครับ ถ้ามีคำถามเรื่องอุปกรณ์หรืออยากปรับสเปกเพิ่มเติมเรียกผมได้เลยครับ',
    'ด้วยความยินดีครับ ผมพร้อมช่วยเช็กสเปกให้ต่อได้เสมอครับ',
    'ยินดีช่วยครับ ถ้าต้องการเทียบราคาและความเข้ากันได้ของชิ้นส่วนบอกได้เลยครับ',
    'ไม่เป็นไรครับ ถ้าพร้อมจัดชุดจริง ผมช่วยไล่ให้ครบทุกชิ้นได้ครับ',
    'ยินดีครับ ขอให้ได้เครื่องที่ตรงงานและคุ้มงบครับ',
    'ด้วยความยินดีครับ กลับมาถามเรื่องคอมได้ทุกเมื่อครับ'
  ],
  acknowledgement: [
    'รับทราบครับ ถ้าพร้อมแล้วส่งงบหรือรุ่นอุปกรณ์มาได้เลยครับ',
    'ได้เลยครับ ผมพร้อมช่วยตรวจสเปกต่อครับ',
    'โอเคครับ บอกเงื่อนไขเพิ่มเติมได้ทุกเมื่อครับ',
    'รับเรื่องครับ เดี๋ยวช่วยไล่ตัวเลือกให้ครับ',
    'ตกลงครับ เราไปต่อที่รายละเอียดสเปกได้เลยครับ',
    'เข้าใจแล้วครับ ส่งคำถามถัดมาได้เลยครับ'
  ],
  capability: [
    'ผมช่วยแนะนำ CPU, GPU, RAM, เมนบอร์ด และอุปกรณ์อื่น ๆ พร้อมตรวจความเข้ากันได้ได้ครับ',
    'ผมช่วยจัดสเปกตามงบและงานที่ใช้ เปรียบเทียบชิ้นส่วน และอธิบายข้อดีข้อจำกัดให้ครับ',
    'ผมช่วยเลือกชิ้นส่วนจากแคตตาล็อก ตรวจ socket, RAM และกำลังไฟ รวมถึงตอบคำถามฮาร์ดแวร์ครับ',
    'คุณบอกงบ เกมหรือโปรแกรมที่ใช้ และความละเอียดจอมาได้ ผมจะช่วยวางชุดที่เหมาะให้ครับ',
    'ผมช่วยเทียบอุปกรณ์ แนะนำการอัปเกรด และจัด build ที่นำไปใช้ต่อใน Builder ได้ครับ',
    'ผมเชี่ยวชาญเรื่องคอมและฮาร์ดแวร์ ช่วยไล่ตั้งแต่เลือกชิ้นส่วนจนถึงตรวจความเข้ากันได้ครับ'
  ]
};

function getFastPathResponse(intent, session = {}) {
  const variants = RESPONSE_BANK[intent] || [];
  const recent = Array.isArray(session.recentFastResponses) ? session.recentFastResponses : [];
  const available = variants.filter(variant => !recent.includes(variant));
  const pool = available.length ? available : variants;
  const response = pool[Math.floor(Math.random() * pool.length)] || '';
  return { text: response, intent, variants: variants.length };
}

module.exports = {
  HARDWARE_TERMS,
  FRESHNESS_TERMS,
  BUILD_TERMS,
  RESPONSE_BANK,
  normalizeText,
  isFreshnessSensitive,
  isCatalogIntent,
  isSinglePartIntent,
  inferRequestedCategories,
  detectFastIntent,
  classifyRequest,
  getFastPathResponse
};

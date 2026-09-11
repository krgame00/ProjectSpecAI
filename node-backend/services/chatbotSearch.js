const SEARCH_FAILURE_DISCLOSURE = 'หมายเหตุ: ตอนนี้ผมยังยืนยันข้อมูลสดไม่ได้จากเว็บ จึงตอบจากข้อมูลในระบบและความรู้ที่มีอยู่ หากต้องการยืนยันราคา/สต็อกล่าสุดควรตรวจสอบกับร้านค้าอีกครั้งครับ';

function sourceTrust(uri, title = '') {
  const value = `${uri} ${title}`.toLowerCase();
  if (/(?:intel\.com|amd\.com|nvidia\.com|asus\.com|msi\.com|gigabyte\.com|corsair\.com|samsung\.com|microsoft\.com|apple\.com)/.test(value)) return { type: 'official', rank: 1 };
  if (/(?:jib\.co\.th|advice\.co\.th|banana(?:it)?\.com|ihavecpu\.com|computeandmore\.com|speedcom\.co\.th)/.test(value)) return { type: 'thai_retailer', rank: 2 };
  if (/(?:techpowerup|tomshardware|anandtech|theverge|pcmag|linustechtips|hardwareunboxed)/.test(value)) return { type: 'tech_media', rank: 3 };
  return { type: 'other', rank: 4 };
}

function appendSearchDisclosure(reply, { useLiveSearch = false, sources = [] } = {}) {
  const text = String(reply || '');
  if (!useLiveSearch || (Array.isArray(sources) && sources.length > 0)) return text;
  return text ? `${text}\n\n${SEARCH_FAILURE_DISCLOSURE}` : SEARCH_FAILURE_DISCLOSURE;
}

function extractSources(metadata) {
  const chunks = metadata?.groundingChunks || [];
  const seen = new Set();
  return chunks.reduce((sources, chunk) => {
    const web = chunk?.web;
    if (web?.uri && !seen.has(web.uri)) {
      seen.add(web.uri);
      const trust = sourceTrust(web.uri, web.title || '');
      sources.push({ uri: web.uri, title: web.title || web.uri, ...trust });
    }
    return sources;
  }, []).sort((a, b) => a.rank - b.rank);
}

module.exports = { SEARCH_FAILURE_DISCLOSURE, appendSearchDisclosure, sourceTrust, extractSources };

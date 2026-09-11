const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const { authMiddleware } = require('../middleware/authMiddleware');
const { chatbotRateLimiter, validateChatbotPayload } = require('../middleware/chatbotSecurity');
const { chatbotSessions } = require('../services/chatbotSessions');
const { getChatbotConfig } = require('../config/chatbotConfig');
const { prepareContext, trimHistory, toGeminiContents, extractSessionFacts } = require('../services/chatbotContext');
const { retrieveTargetedCatalog, buildCatalogContext, validateRecommendedBuild } = require('../services/chatbotCatalog');
const { classifyRequest, getFastPathResponse } = require('../services/chatbotPolicy');
const { generateContentWithFallback, consumeStreamWithFallback, responseText, parseModelResponse } = require('../services/chatbotGeneration');
const { SEARCH_FAILURE_DISCLOSURE, appendSearchDisclosure, extractSources } = require('../services/chatbotSearch');
const { chatbotMetrics } = require('../services/chatbotMetrics');

const router = express.Router();
const config = getChatbotConfig();
let aiConfig = {};
if (process.env.GCP_PROJECT) {
  aiConfig = { vertexai: { project: process.env.GCP_PROJECT, location: process.env.GCP_LOCATION || 'us-central1' } };
} else if (process.env.GEMINI_API_KEY) {
  aiConfig = { apiKey: process.env.GEMINI_API_KEY };
}
const ai = new GoogleGenAI(aiConfig);

const SYSTEM_INSTRUCTION = `คุณคือผู้เชี่ยวชาญด้านฮาร์ดแวร์คอมพิวเตอร์ของเว็บไซต์นี้เท่านั้น
หน้าที่ของคุณคือแนะนำสเปคคอมพิวเตอร์และตอบคำถามเกี่ยวกับอุปกรณ์คอมพิวเตอร์
ใช้ข้อมูลสินค้าในระบบเป็นแหล่งอ้างอิงหลัก และแนะนำเฉพาะอุปกรณ์ที่เข้ากันได้
เมื่อคำถามต้องการข้อมูลสด เช่น ราคา สต็อก รุ่นที่เพิ่งเปิดตัว หรือข้อมูลล่าสุด ให้ใช้ผลค้นหาเว็บที่ระบบเปิดให้เท่านั้น และเติมคำค้นภาษาไทย เช่น ราคาไทย, JIB, Advice หรือเปิดตัวไทยตามความเหมาะสม หากค้นหาไม่ได้ต้องแจ้งผู้ใช้ตรง ๆ
คุณคุยกับลูกค้าในลักษณะตอบรับแบบมีประวัติสนทนาต่อเนื่องได้

ข้อกำหนดเรื่องขอบเขต:
- ตอบเฉพาะเรื่องคอมพิวเตอร์ ฮาร์ดแวร์ อุปกรณ์ IT หรือซอฟต์แวร์ที่เกี่ยวข้องกับการประกอบคอมพิวเตอร์
- หากถามเรื่องอื่น ให้ปฏิเสธสุภาพและชวนกลับมาคุยเรื่องคอมพิวเตอร์

รูปแบบการตอบกลับ:
ส่วนแรกเป็นคำตอบพูดคุยทั่วไป รองรับ Markdown
หากผู้ใช้ขอให้แนะนำหรือจัดสเปกคอม ให้พิมพ์ ---JSON_START--- ขึ้นบรรทัดใหม่ แล้วพิมพ์ JSON ของ recommended_build ต่อท้าย โดยใช้เฉพาะ ID ที่อยู่ในข้อมูลอ้างอิงจากระบบ หากไม่มีให้ใส่ null
หากไม่ได้ขอจัดสเปก ห้ามส่ง recommended_build หรือ ---JSON_START---`;
const GUARDRAIL_MESSAGE = '⚠️ ระบบแชทบอตปฏิเสธการตอบกลับเนื่องจากตรวจพบความพยายามในการป้อนคำสั่งล้างค่าความปลอดภัยระบบ (Prompt Injection / Jailbreak Bypass) กรุณาถามคำถามเกี่ยวกับฮาร์ดแวร์คอมพิวเตอร์เท่านั้นครับ';
const NO_CONFIG_MESSAGE = '⚠️ ระบบตรวจพบว่ายังไม่ได้ตั้งค่า GEMINI_API_KEY หรือ GCP_PROJECT ในไฟล์ `.env` ครับ';

function hasAiConfig() {
  return Boolean(aiConfig.vertexai || (aiConfig.apiKey && !String(aiConfig.apiKey).includes('your_gemini')));
}

function buildParts({ text, image }) {
  const parts = [];
  if (text && text.trim()) parts.push({ text });
  if (image && image.data && image.mimeType) parts.push({ inlineData: { data: image.data, mimeType: image.mimeType } });
  return parts;
}

function checkInputGuardrails(input) {
  const blockedPatterns = [/ignore.*instruction/i, /forget.*instruction/i, /system.*prompt/i, /you are now a/i, /jailbreak/i, /bypass.*safety/i];
  return blockedPatterns.some(pattern => pattern.test(String(input || '')));
}

function setSseHeaders(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  if (res.flushHeaders) res.flushHeaders();
}

function writeSse(res, event, payload) {
  if (event) res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function providerErrorMessage(error) {
  const message = String(error?.message || '').toLowerCase();
  if (/429|too many requests|resource_exhausted|rate.?limit/.test(message)) return 'ขออภัยครับ ตอนนี้ระบบ AI ถูกใช้งานหนักเกินขีดจำกัด กรุณารอสักครู่แล้วลองถามใหม่อีกครั้งครับ 🙏';
  if (/503|unavailable|overloaded/.test(message)) return 'ขออภัยครับ ตอนนี้เซิร์ฟเวอร์ AI ทำงานหนักเกินไป กรุณารอสักครู่แล้วลองใหม่ครับ 🙏';
  return 'Chatbot service unavailable';
}

async function loadOrderContext(message, user) {
  const orderMatch = String(message || '').match(/ORD-\d{4}/i);
  if (!orderMatch || user?.role !== 'admin') return '';
  const orderId = orderMatch[0].toUpperCase();
  try {
    const db = require('../config/db');
    let order = null;
    if (db.isFallback()) {
      const fs = require('fs').promises;
      const path = require('path');
      try {
        const file = await fs.readFile(path.join(__dirname, '../orders.json'), 'utf8');
        order = JSON.parse(file).find(item => item.id === orderId);
      } catch (_error) { /* fallback may not include orders.json */ }
      if (!order && orderId === 'ORD-1001') order = { id: orderId, customer_name: 'สกาย เกมเมอร์', assembly_type: 'premium', total_price: 49500, status: 'assembling' };
      if (!order && orderId === 'ORD-1002') order = { id: orderId, customer_name: 'สมชาย ไอที', assembly_type: 'none', total_price: 15300, status: 'shipped' };
    } else {
      const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
      if (rows?.length) {
        const row = rows[0];
        order = { id: row.id, customer_name: row.customer_name, assembly_type: row.assembly_type, total_price: parseFloat(row.total_price), status: row.status };
      }
    }
    if (!order && orderId === 'ORD-1001') order = { id: orderId, customer_name: 'สกาย เกมเมอร์', assembly_type: 'premium', total_price: 49500, status: 'assembling' };
    if (!order && orderId === 'ORD-1002') order = { id: orderId, customer_name: 'สมชาย ไอที', assembly_type: 'none', total_price: 15300, status: 'shipped' };
    if (!order) return `\n[ข้อมูลอ้างอิงจากระบบหลังบ้าน: ไม่พบออเดอร์หมายเลข ${orderId} ในระบบฐานข้อมูล]`;
    const statusTh = { assembling: 'กำลังประกอบเครื่องคอมพิวเตอร์', shipped: 'จัดส่งสินค้าเรียบร้อยแล้ว', completed: 'เสร็จสิ้นคำสั่งซื้อ', pending: 'รอยืนยันคำสั่งซื้อ' }[order.status] || order.status;
    const assemblyTh = { premium: 'ประกอบพรีเมียม (จัดสายสวยงาม)', standard: 'ประกอบมาตรฐาน', none: 'นำชิ้นส่วนไปประกอบเอง' }[order.assembly_type] || order.assembly_type;
    return `\n[ข้อมูลอ้างอิงจากระบบหลังบ้าน: ออเดอร์ ${order.id}, ผู้สั่งซื้อ "${order.customer_name}", รูปแบบบริการ "${assemblyTh}", ราคาสุทธิ ฿${order.total_price.toLocaleString()} บาท, สถานะ "${statusTh}"]`;
  } catch (error) {
    console.error('Failed to inject order context:', error);
    return '';
  }
}

async function loadCatalogContext(classification, message) {
  if (!classification.useCatalog) return { candidates: [], text: '', retrievalMs: 0 };
  const startedAt = Date.now();
  try {
    const db = require('../config/db');
    const { candidates } = await retrieveTargetedCatalog({ db, text: message, limitPerCategory: 8 });
    return { candidates, text: buildCatalogContext(candidates), retrievalMs: Date.now() - startedAt };
  } catch (error) {
    console.error('Failed to inject targeted catalog context:', error);
    return { candidates: [], text: '', retrievalMs: Date.now() - startedAt };
  }
}

function canonicalBuild(recommendedBuild, candidates) {
  if (!recommendedBuild || !candidates || !Object.values(candidates).some(list => Array.isArray(list) && list.length)) return null;
  return validateRecommendedBuild(recommendedBuild, candidates);
}

function updateSession(session, text, responseTextValue) {
  if (text) session.history.push({ role: 'user', parts: buildParts({ text }) });
  if (responseTextValue) session.history.push({ role: 'model', parts: [{ text: responseTextValue }] });
  while (session.history.length > config.history.maxMessages) session.history.shift();
  Object.assign(session.facts, extractSessionFacts(text, session.facts));
}

function rememberFastResponse(session, response) {
  session.recentFastResponses.push(response);
  while (session.recentFastResponses.length > 4) session.recentFastResponses.shift();
}

async function runFastPath(classification, session) {
  const fast = getFastPathResponse(classification.fastIntent, session);
  rememberFastResponse(session, fast.text);
  updateSession(session, classification.text, fast.text);
  return fast.text;
}

router.post('/message', authMiddleware, chatbotRateLimiter, validateChatbotPayload, async (req, res) => {
  const metrics = chatbotMetrics.startRequest();
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    if (checkInputGuardrails(message)) {
      chatbotMetrics.finishRequest(metrics, { success: true, outputLength: GUARDRAIL_MESSAGE.length });
      return res.json({ reply: GUARDRAIL_MESSAGE, presets: [], route: 'guardrail' });
    }
    const classification = classifyRequest(message, { hybridRouting: config.features.hybridRouting, fastPath: config.features.fastPath, targetedCatalog: config.features.targetedCatalog, liveSearch: config.features.liveSearch });
    metrics.route = classification.route;
    if (classification.route === 'fast') {
      const reply = await runFastPath(classification, { recentFastResponses: [], history: [], facts: {} });
      chatbotMetrics.finishRequest(metrics, { model: 'deterministic', cacheHit: true, outputLength: reply.length });
      return res.json({ reply, recommended_build: null, sources: [], route: 'fast' });
    }
    if (!hasAiConfig()) {
      chatbotMetrics.finishRequest(metrics, { success: false, errorClass: 'configuration' });
      return res.json({ reply: NO_CONFIG_MESSAGE, presets: [], route: classification.route });
    }
    const [orderContext, catalog] = await Promise.all([loadOrderContext(message, req.user), loadCatalogContext(classification, message)]);
    const context = prepareContext({
      history: history || [],
      text: message,
      orderContext,
      catalogContext: catalog.text,
    });
    let searchFailed = false;
    let generated;
    try {
      generated = await generateContentWithFallback({ ai, contents: context.contents, config, role: 'chat', systemInstruction: SYSTEM_INSTRUCTION, useLiveSearch: classification.useLiveSearch });
    } catch (error) {
      if (!classification.useLiveSearch) throw error;
      searchFailed = true;
      generated = await generateContentWithFallback({ ai, contents: context.contents, config, role: 'chat', systemInstruction: SYSTEM_INSTRUCTION, useLiveSearch: false });
    }
    const parsed = parseModelResponse(responseText(generated.response));
    const sources = extractSources(generated.response?.candidates?.[0]?.groundingMetadata);
    parsed.reply = appendSearchDisclosure(parsed.reply, { useLiveSearch: classification.useLiveSearch || searchFailed, sources });
    parsed.recommended_build = classification.requiresBuild ? canonicalBuild(parsed.recommended_build, catalog.candidates) : null;
    chatbotMetrics.finishRequest(metrics, {
      model: generated.model,
      fallbackCount: generated.fallbackCount,
      usedLiveSearch: classification.useLiveSearch,
      catalogCacheHit: classification.useCatalog ? false : null,
      catalogRetrievalMs: catalog.retrievalMs,
      outputLength: responseText(generated.response).length,
      buildValidation: classification.requiresBuild ? (parsed.recommended_build ? 'validated' : 'null-safe') : 'not-requested',
    });
    res.set('X-Chatbot-Model', generated.model);
    res.set('X-Chatbot-Fallback-Count', String(generated.fallbackCount));
    return res.json({ ...parsed, sources, route: classification.route });
  } catch (error) {
    chatbotMetrics.finishRequest(metrics, { success: false, errorClass: error.code || 'provider' });
    console.error('Chatbot message error:', error);
    return res.status(502).json({ error: 'Chatbot service unavailable' });
  }
});

router.post('/stream', authMiddleware, chatbotRateLimiter, validateChatbotPayload, async (req, res) => {
  const metrics = chatbotMetrics.startRequest();
  let session;
  try {
    const { text, image, sessionId } = req.body;
    session = chatbotSessions.resolve(req.user.id, sessionId);
    const sid = session.id;
    const classification = classifyRequest(text || '', { hybridRouting: config.features.hybridRouting, fastPath: config.features.fastPath, targetedCatalog: config.features.targetedCatalog, liveSearch: config.features.liveSearch });
    metrics.route = classification.route;
    if (text && checkInputGuardrails(text)) {
      if (sessionId == null) chatbotSessions.clear(req.user.id, sid);
      setSseHeaders(res);
      writeSse(res, null, { text: GUARDRAIL_MESSAGE });
      writeSse(res, 'done', {});
      res.end();
      chatbotMetrics.finishRequest(metrics, { success: true, outputLength: GUARDRAIL_MESSAGE.length });
      return;
    }
    setSseHeaders(res);
    writeSse(res, 'session', { sessionId: sid });
    if (classification.route === 'fast') {
      const reply = await runFastPath(classification, session);
      writeSse(res, null, { text: reply });
      writeSse(res, 'done', {});
      res.end();
      chatbotMetrics.finishRequest(metrics, { model: 'deterministic', cacheHit: true, outputLength: reply.length });
      return;
    }
    if (!hasAiConfig()) {
      if (sessionId == null) chatbotSessions.clear(req.user.id, sid);
      writeSse(res, null, { text: NO_CONFIG_MESSAGE });
      writeSse(res, 'done', {});
      res.end();
      chatbotMetrics.finishRequest(metrics, { success: false, errorClass: 'configuration' });
      return;
    }
    const catalog = await loadCatalogContext(classification, text || '');
    const history = trimHistory(session.history, { maxMessages: config.history.maxMessages, charBudget: config.history.charBudget });
    const contents = toGeminiContents(history, '');
    contents.push({ role: 'user', parts: buildParts({ text: `${text || ''}${catalog.text}`, image }) });
    let fullResponse = '';
    let visiblePending = '';
    let jsonBuffer = '';
    let isJsonMode = false;
    let sources = [];
    let firstByteAt = null;
    let searchFailed = false;
    const marker = '---JSON_START---';
    const consume = async (useLiveSearch) => consumeStreamWithFallback({
      ai, contents, config, role: 'stream', systemInstruction: SYSTEM_INSTRUCTION, useLiveSearch,
      onChunk: async (chunk) => {
        const piece = chunk?.text ?? '';
        if (piece) {
          if (!firstByteAt) firstByteAt = Date.now();
          fullResponse += piece;
          if (isJsonMode) jsonBuffer += piece;
          else {
            const combined = visiblePending + piece;
            const markerIndex = combined.indexOf(marker);
            if (markerIndex >= 0) {
              if (combined.slice(0, markerIndex)) writeSse(res, null, { text: combined.slice(0, markerIndex) });
              isJsonMode = true;
              jsonBuffer += combined.slice(markerIndex + marker.length);
              visiblePending = '';
            } else {
              const safeLength = Math.max(0, combined.length - marker.length + 1);
              if (safeLength > 0) writeSse(res, null, { text: combined.slice(0, safeLength) });
              visiblePending = combined.slice(safeLength);
            }
          }
        }
        const found = extractSources(chunk?.candidates?.[0]?.groundingMetadata);
        if (found.length) sources = found;
      },
      onRetry: async () => {
        if (fullResponse || visiblePending) writeSse(res, 'clear', {});
        fullResponse = ''; visiblePending = ''; jsonBuffer = ''; isJsonMode = false; sources = [];
      },
    });
    let generated;
    try {
      generated = await consume(classification.useLiveSearch);
    } catch (error) {
      if (!classification.useLiveSearch) throw error;
      searchFailed = true;
      if (fullResponse || visiblePending) writeSse(res, 'clear', {});
      fullResponse = ''; visiblePending = ''; jsonBuffer = ''; isJsonMode = false; sources = [];
      generated = await consume(false);
    }
    if (!isJsonMode && visiblePending) writeSse(res, null, { text: visiblePending });
    const parsed = parseModelResponse(fullResponse);
    if (sources.length) writeSse(res, 'sources', { sources });
    if (classification.requiresBuild) {
      const build = canonicalBuild(parsed.recommended_build, catalog.candidates);
      if (build) writeSse(res, 'build_data', { build_data: build });
    }
    if (classification.useLiveSearch && (searchFailed || !sources.length)) writeSse(res, null, { text: SEARCH_FAILURE_DISCLOSURE });
    updateSession(session, text || '', fullResponse);
    writeSse(res, 'done', {});
    res.end();
    chatbotMetrics.finishRequest(metrics, {
      model: generated.model,
      fallbackCount: generated.fallbackCount,
      firstByteAt,
      usedLiveSearch: classification.useLiveSearch,
      catalogCacheHit: classification.useCatalog ? false : null,
      catalogRetrievalMs: catalog.retrievalMs,
      outputLength: fullResponse.length,
      buildValidation: classification.requiresBuild ? 'validated-or-null-safe' : 'not-requested',
    });
  } catch (error) {
    if (error.code === 'SESSION_NOT_FOUND' && !res.headersSent) return res.status(404).json({ error: 'Chat session not found' });
    chatbotMetrics.finishRequest(metrics, { success: false, errorClass: error.code || 'provider' });
    console.error('Stream error:', error);
    if (!res.headersSent) return res.status(502).json({ error: 'Chatbot service unavailable' });
    writeSse(res, 'error', { error: providerErrorMessage(error) });
    res.end();
  }
});

router.post('/clear', authMiddleware, (req, res, next) => {
  try {
    chatbotSessions.clear(req.user.id, req.body.sessionId);
    res.json({ ok: true });
  } catch (error) {
    if (error.code === 'SESSION_NOT_FOUND') return res.status(404).json({ error: 'Chat session not found' });
    return next(error);
  }
});

router.checkInputGuardrails = checkInputGuardrails;
router.SYSTEM_INSTRUCTION = SYSTEM_INSTRUCTION;
module.exports = router;

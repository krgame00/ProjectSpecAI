const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  chatbotRateLimiter,
  validateChatbotPayload,
} = require('../middleware/chatbotSecurity');
const { chatbotSessions } = require('../services/chatbotSessions');
const logger = require('../utils/logger');

// Initialize Gemini Client
let aiConfig = {};
if (process.env.GCP_PROJECT) {
  aiConfig = {
    vertexai: {
      project: process.env.GCP_PROJECT,
      location: process.env.GCP_LOCATION || 'us-central1'
    }
  };
} else if (process.env.GEMINI_API_KEY) {
  aiConfig = { apiKey: process.env.GEMINI_API_KEY };
}
const ai = new GoogleGenAI(aiConfig);

const SYSTEM_INSTRUCTION = `คุณคือผู้เชี่ยวชาญด้านคอมพิวเตอร์และฮาร์ดแวร์ไอทีประจำเว็บไซต์ (SpecAI)
หน้าที่ของคุณคือ:
1. ให้คำปรึกษา แนะนำสเปคคอมพิวเตอร์ และช่วยผู้ใช้เลือกซื้ออุปกรณ์ให้คุ้มค่าและตรงตามการใช้งานมากที่สุด
2. ตอบคำถาม เปรียบเทียบประสิทธิภาพ สเปค ความคุ้มค่า ข้อดี-ข้อเสียของชิ้นส่วนคอมพิวเตอร์ อุปกรณ์ไอที และแบรนด์ต่างๆ (เช่น Intel vs AMD, NVIDIA vs Radeon, แบรนด์เมนบอร์ด/การ์ดจอ/RAM/SSD/เคส/พาวเวอร์ซัพพลาย/จอมอนิเตอร์/อุปกรณ์เกมมิ่ง) อย่างเป็นกลางและมีเหตุผลสนับสนุน
3. อธิบายและวิเคราะห์เมื่อลูกค้าถามเปรียบเทียบ เช่น "อุปกรณ์ชิ้นนี้กับชิ้นนี้อันไหนดีกว่า", "2 ตัวนี้ตัวไหนคุ้มกว่า", "i5 กับ Ryzen 5 ตัวไหนเล่นเกมดีกว่า", "เทียบการ์ดจอให้หน่อย" ให้คุณดึงจุดเด่น ความแตกต่าง และฟันธงคำแนะนำที่เหมาะสมกับงบและการใช้งานของลูกค้าได้ทันที (หากลูกค้าใช้คำสรรพนาม เช่น "2 ชิ้นนี้", "ตัวนี้กับตัวนั้น" ให้อ้างอิงจากบทสนทนาก่อนหน้า)

**สไตล์การตอบคำถาม (Response Style & Conciseness):**
- **กระชับ ตรงประเด็น ทันใจ:** ตอบสรุปสาระสำคัญ ไม่ต้องเกริ่นยาวหรือเขียนบทความยาวเกินไป (ความยาวเหมาะสมประมาณ 150-300 คำ) จัดข้อความด้วย Bullet Points หรือตารางสรุปสั้นๆ ให้อ่านง่ายและตัดสินใจได้ทันที
- **คำทักทายทั่วไป:** หากลูกค้าพิมพ์ทักทายสั้นๆ เช่น "สวัสดี", "สวัสดีครับ", "ดีครับ", "hello", "hi" ให้ตอบทักทายอย่างสุภาพและกระชับ สั้นๆ 1-2 ประโยค เช่น "สวัสดีครับ! ผมคือ SpecAI ยินดีช่วยแนะนำสเปคและตอบคำถามเรื่องคอมพิวเตอร์ครับ วันนี้ต้องการจัดสเปคหรือสอบถามอุปกรณ์ชิ้นไหน สอบถามได้เลยครับ!" **ห้ามร่ายยาวเรื่องการเปรียบเทียบหรือยกเรื่องเก่าขึ้นมาตอบ หากลูกค้าไม่ได้ถาม**
- **การตอบตามคำถามล่าสุด:** ให้ยึดเจตนาของข้อความล่าสุดของลูกค้าเป็นหลักเสมอ

**การค้นหาข้อมูลฮาร์ดแวร์และการตอบคำถาม:**
- คุณสามารถใช้ความรู้ทางคอมพิวเตอร์ของคุณวิเคราะห์และเปรียบเทียบฮาร์ดแวร์ที่มีในโลกได้อย่างอิสระ ไม่จำกัดเฉพาะสินค้าที่มีในร้าน
- หากมีการเปิดใช้งาน Google Search (เช่น ถามข้อมูลรุ่นใหม่ล่าสุด ราคาตลาดไทยในปัจจุบัน) ให้นำข้อมูลที่ค้นหาได้มาช่วยสรุปให้ลูกค้าอย่างแม่นยำ และแปลงราคาเป็นสกุลเงินบาท (THB) เสมอ
- หากไม่ได้ใช้ Search หรือเป็นรุ่นมาตรฐานทั่วไป ให้ใช้ความรู้ด้านไอทีและ Benchmark วิเคราะห์เปรียบเทียบได้เลย ห้ามปฏิเสธการตอบคำถามเรื่องคอมพิวเตอร์เด็ดขาด

**ขอบเขตเนื้อหา (Scope Boundaries):**
- คุณยินดีตอบทุกเรื่องเกี่ยวกับ คอมพิวเตอร์, ฮาร์ดแวร์, ซอฟต์แวร์/ไดรเวอร์ที่เกี่ยวกับคอมพิวเตอร์, เกมมิ่งเกียร์, อุปกรณ์ไอที, การประกอบคอม, และแบรนด์ไอทีทุกแบรนด์
- เฉพาะเมื่อลูกค้าถามเรื่องที่ **ไม่เกี่ยวกับคอมพิวเตอร์หรือเทคโนโลยีไอทีเลย** (เช่น บุคคลทั่วไป/ดารานักร้อง/การเมือง/ฟุตบอล/ทั่วไปที่ไม่ใช่ IT) ให้ปฏิเสธอย่างสุภาพว่า: "ผมเป็นผู้เชี่ยวชาญด้านคอมพิวเตอร์และฮาร์ดแวร์ไอที ยินดีให้คำปรึกษาเรื่องสเปคหรืออุปกรณ์คอมพิวเตอร์ครับ"

**รูปแบบการตอบกลับ:**
ส่วนแรก: คำตอบพูดคุย อธิบาย เปรียบเทียบ ให้พิมพ์ตามปกติ รองรับ Markdown (จัดหัวข้อ ตาราง หรือ Bullet point ให้อ่านง่าย สบายตา)
ส่วนที่สอง (เฉพาะเมื่อจำเป็น): หากและเฉพาะเมื่อ **ลูกค้าขอให้จัดสเปคคอมพิวเตอร์ทั้งชุด หรือขอสเปคประกอบคอมลงตะกร้า** เท่านั้น ให้พิมพ์คำว่า ---JSON_START--- ขึ้นบรรทัดใหม่ แล้วพิมพ์ JSON ของ recommended_build ต่อท้ายทันที โดยมีรูปแบบดังนี้:
{
  "recommended_build": {
    "cpu": 15,
    "mobo": 22,
    "ram": 35,
    "gpu": 45,
    "storage": 50,
    "psu": 60,
    "case": 70
  }
}
*ข้อบังคับสำหรับ recommended_build:* ให้ใส่ ID ของสินค้าที่มีอยู่จริงใน [ข้อมูลอ้างอิงจากระบบหลังบ้าน] เท่านั้น หากชิ้นส่วนไหนไม่มีในระบบให้ใส่ null
*หากลูกค้าแค่ถามเปรียบเทียบ ถามความรู้ทั่วไป หรือถามข้อดีข้อเสีย โดยไม่ได้ขอจัดสเปคทั้งชุด ห้ามพิมพ์ ---JSON_START--- และห้ามส่ง recommended_build*`;

// ---------- เก็บประวัติแชทต่อ session (ในหน่วยความจำ) ----------
function buildParts({ text, image }) {
  const parts = [];
  if (text && text.trim()) parts.push({ text });
  if (image && image.data && image.mimeType) {
    parts.push({
      inlineData: { data: image.data, mimeType: image.mimeType },
    });
  }
  return parts;
}

function extractSources(metadata) {
  if (!metadata) return [];
  const chunks = metadata.groundingChunks || [];
  const seen = new Set();
  const sources = [];
  for (const c of chunks) {
    const web = c.web;
    if (web && web.uri && !seen.has(web.uri)) {
      seen.add(web.uri);
      sources.push({ uri: web.uri, title: web.title || web.uri });
    }
  }
  return sources;
}

// Input Safety Guardrails Patterns
function checkInputGuardrails(input) {
  const blockedPatterns = [
    /ignore.*instruction/i,
    /forget.*instruction/i,
    /system.*prompt/i,
    /you are now a/i,
    /jailbreak/i,
    /bypass.*safety/i
  ];
  
  for (const pattern of blockedPatterns) {
    if (pattern.test(input)) {
      return true;
    }
  }
  return false;
}

// Catalog In-Memory Cache (TTL: 5 minutes)
let catalogCache = { text: '', time: 0 };
const CATALOG_TTL_MS = 5 * 60 * 1000;

async function getCatalogContext() {
  const now = Date.now();
  if (catalogCache.text && (now - catalogCache.time < CATALOG_TTL_MS)) {
    return catalogCache.text;
  }

  try {
    const db = require('../config/db');
    const [rows] = await db.query(`
      SELECT p.id, c.slug as category, p.brand, p.model, p.price 
      FROM products p 
      JOIN categories c ON p.category_id = c.id 
      ORDER BY c.id ASC, p.price ASC
    `);

    // Pick up to 8 items per category to keep token count compact while covering all build parts
    const categoryBuckets = {};
    for (const item of (rows || [])) {
      const cat = item.category || item.category_slug || 'other';
      if (!categoryBuckets[cat]) categoryBuckets[cat] = [];
      if (categoryBuckets[cat].length < 8) {
        categoryBuckets[cat].push(item);
      }
    }

    const balancedRows = Object.values(categoryBuckets).flat();
    const productsText = balancedRows.map(p => `- ID: ${p.id} | Category: ${p.category || p.category_slug} | Name: ${p.brand} ${p.model} (฿${parseFloat(p.price || 0).toLocaleString()})`).join('\n');

    const text = `\n[ข้อมูลอ้างอิงจากระบบหลังบ้าน: รายการสินค้าบางส่วนที่มีในร้านตอนนี้:\n${productsText}\nหากลูกค้าให้จัดสเปค กรุณาอ้างอิงสินค้าและราคาเหล่านี้เป็นหลัก และใช้ ID ตามที่ระบุไว้ในฟิลด์ recommended_build]`;
    
    catalogCache = { text, time: now };
    return text;
  } catch (err) {
    logger.error('Failed to inject catalog context:', err);
    return catalogCache.text || '';
  }
}

function clearCatalogCache() {
  catalogCache = { text: '', time: 0 };
}

// Conditional Google Search Decision Helper (Only trigger search for live store prices, retailers, or release news)
function shouldUseSearch(text) {
  if (!text || typeof text !== 'string') return false;
  const clean = text.trim();
  if (!clean) return false;

  const searchPatterns = [
    /(ราคาไทย|ราคาตลาด|ราคาปัจจุบัน|เช็คราคา|เทียบราคา|ราคาหน้าร้าน|ขายเท่าไหร่|ราคาเท่าไหร่|ราคาล่าสุด)/i,
    /(JIB|Advice|iHAVECPU|Banana\s*IT|computeandmore)/i,
    /(เปิดตัวเมื่อไหร่|วางจำหน่ายเมื่อไหร่|ข่าวหลุด|สเปคหลุด|leak|เข้าไทย)/i,
  ];

  return searchPatterns.some(pattern => pattern.test(clean));
}

// POST /api/chatbot/message
router.post('/message', authMiddleware, chatbotRateLimiter, validateChatbotPayload, async (req, res, next) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    // 1. Input Guardrail Verification
    if (checkInputGuardrails(message)) {
      return res.json({
        reply: '⚠️ ระบบแชทบอตปฏิเสธการตอบกลับเนื่องจากตรวจพบความพยายามในการป้อนคำสั่งล้างค่าความปลอดภัยระบบ (Prompt Injection / Jailbreak Bypass) กรุณาถามคำถามเกี่ยวกับฮาร์ดแวร์คอมพิวเตอร์เท่านั้นครับ',
        presets: []
      });
    }

    // Check API Key
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('your_gemini')) {
      return res.json({
        reply: '⚠️ ระบบตรวจพบว่ายังไม่ได้ตั้งค่า GEMINI_API_KEY ในไฟล์ `.env` ของระบบหลังบ้านครับ กรุณาใส่ API Key ให้เรียบร้อยแล้วรีสตาร์ทเซิร์ฟเวอร์ครับ',
        presets: []
      });
    }

    // 2. Context Injection for Order Queries
    let orderContext = "";
    const orderMatch = message.match(/ORD-\d{4}/i);
    if (orderMatch && req.user.role === 'admin') {
      const orderId = orderMatch[0].toUpperCase();
      try {
        const db = require('../config/db');
        let order = null;

        if (db.isFallback()) {
          const fs = require('fs').promises;
          const path = require('path');
          const ordersFilePath = path.join(__dirname, '../orders.json');
          try {
            const fileData = await fs.readFile(ordersFilePath, 'utf8');
            const orders = JSON.parse(fileData);
            order = orders.find(o => o.id === orderId);
          } catch (err) {
            // file doesn't exist
          }
          // Defaults
          if (!order) {
            if (orderId === 'ORD-1001') order = { id: orderId, customer_name: 'สกาย เกมเมอร์', assembly_type: 'premium', total_price: 49500, status: 'assembling' };
            if (orderId === 'ORD-1002') order = { id: orderId, customer_name: 'สมชาย ไอที', assembly_type: 'none', total_price: 15300, status: 'shipped' };
          }
        } else {
          const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
          if (rows && rows.length > 0) {
            const r = rows[0];
            order = {
              id: r.id,
              customer_name: r.customer_name,
              assembly_type: r.assembly_type,
              total_price: parseFloat(r.total_price),
              status: r.status
            };
          } else {
            // Defaults
            if (orderId === 'ORD-1001') order = { id: orderId, customer_name: 'สกาย เกมเมอร์', assembly_type: 'premium', total_price: 49500, status: 'assembling' };
            if (orderId === 'ORD-1002') order = { id: orderId, customer_name: 'สมชาย ไอที', assembly_type: 'none', total_price: 15300, status: 'shipped' };
          }
        }

        if (order) {
          const statusTh = {
            'assembling': 'กำลังประกอบเครื่องคอมพิวเตอร์',
            'shipped': 'จัดส่งสินค้าเรียบร้อยแล้ว',
            'completed': 'เสร็จสิ้นคำสั่งซื้อ',
            'pending': 'รอยืนยันคำสั่งซื้อ'
          }[order.status] || order.status;

          const assemblyTh = {
            'premium': 'ประกอบพรีเมียม (จัดสายสวยงาม)',
            'standard': 'ประกอบมาตรฐาน',
            'none': 'นำชิ้นส่วนไปประกอบเอง'
          }[order.assembly_type] || order.assembly_type;

          orderContext = `\n[ข้อมูลอ้างอิงจากระบบหลังบ้าน: ลูกค้ากำลังถามถึงออเดอร์หมายเลข ${order.id} ชื่องผู้สั่งซื้อคือ: "${order.customer_name}", รูปแบบบริการประกอบ: "${assemblyTh}", ราคาสุทธิ: ฿${order.total_price.toLocaleString()} บาท, สถานะปัจจุบัน: "${statusTh}"]`;
        } else {
          orderContext = `\n[ข้อมูลอ้างอิงจากระบบหลังบ้าน: ไม่พบออเดอร์หมายเลข ${orderId} ในระบบฐานข้อมูล ลูกค้าอาจจะพิมพ์รหัสผิด]`;
        }
      } catch (err) {
        logger.error('Failed to inject order context:', err);
      }
    }

    // 2.5 Catalog Injection
    const catalogContext = await getCatalogContext();

    // 3. Short-Term Memory Integration (History Parser)
    let contents = [];
    if (Array.isArray(history) && history.length > 0) {
      // Filter out initial bot messages or empty texts
      const cleanHistory = history.filter(h => h.text && h.text.trim().length > 0);
      
      cleanHistory.forEach(h => {
        // Map roles to match Gemini API specification: user or model
        const role = h.role === 'user' ? 'user' : 'model';
        // Strip HTML tags for clean context parsing
        const cleanText = h.text.replace(/<[^>]*>/g, '').trim();
        if (cleanText) {
          contents.push({
            role: role,
            parts: [{ text: cleanText }]
          });
        }
      });
    }

    // Append current turn message
    contents.push({
      role: 'user',
      parts: [{ text: message + orderContext + catalogContext }]
    });

    // Alternate roles validation to prevent consecutive same roles in Gemini
    let alternatingContents = [];
    let lastRole = null;
    contents.forEach(item => {
      if (item.role !== lastRole) {
        alternatingContents.push(item);
        lastRole = item.role;
      } else {
        // If consecutive roles, append text to existing turn
        alternatingContents[alternatingContents.length - 1].parts[0].text += '\n' + item.parts[0].text;
      }
    });

    // Call Gemini API with alternating multi-turn conversation history
    const needSearch = shouldUseSearch(message);
    const geminiConfig = {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      ...(needSearch ? { tools: [{ googleSearch: {} }] } : {})
    };

    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: alternatingContents,
        config: geminiConfig
    });

    let responseText = response.text;
    if (typeof responseText === 'function') {
        responseText = responseText();
    }
    if (!responseText) {
        responseText = "";
    }
    
    // Extract JSON block using regex if it's wrapped in text or markdown
    let jsonString = responseText;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        jsonString = jsonMatch[0];
    }
    
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(jsonString);
    } catch (e) {
      logger.error("Failed to parse JSON response, falling back to raw text.");
      jsonResponse = {
        reply: responseText,
        recommended_build: null
      };
    }

    res.json(jsonResponse);
  } catch (error) {
    logger.error('Chatbot message error:', error);
    if (res.headersSent) {
      return next(error);
    }
    return res.status(502).json({ error: 'Chatbot service unavailable' });
  }
});

// POST /api/chatbot/stream
router.post('/stream', authMiddleware, chatbotRateLimiter, validateChatbotPayload, async (req, res, next) => {
  try {
    const { text, image, sessionId } = req.body;
    const session = chatbotSessions.resolve(req.user.id, sessionId);
    const sid = session.id;
    const history = session.history;

    if (text && checkInputGuardrails(text)) {
      if (sessionId == null) {
        chatbotSessions.clear(req.user.id, sid);
      }
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders && res.flushHeaders();
      const errText = '⚠️ ระบบแชทบอตปฏิเสธการตอบกลับเนื่องจากตรวจพบความพยายามในการป้อนคำสั่งล้างค่าความปลอดภัยระบบ (Prompt Injection / Jailbreak Bypass) กรุณาถามคำถามเกี่ยวกับฮาร์ดแวร์คอมพิวเตอร์เท่านั้นครับ';
      res.write(`data: ${JSON.stringify({ text: errText })}\n\n`);
      res.write('event: done\ndata: {}\n\n');
      return res.end();
    }

    if (!aiConfig.apiKey && !aiConfig.vertexai) {
      if (sessionId == null) {
        chatbotSessions.clear(req.user.id, sid);
      }
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders && res.flushHeaders();
      const errText = '⚠️ ระบบตรวจพบว่ายังไม่ได้ตั้งค่า GEMINI_API_KEY หรือ GCP_PROJECT ในไฟล์ `.env` ครับ';
      res.write(`data: ${JSON.stringify({ text: errText })}\n\n`);
      res.write('event: done\ndata: {}\n\n');
      return res.end();
    }

    const userParts = buildParts({ text, image });
    // Inject catalog context if text exists
    let catalogContext = "";
    if (text) {
      catalogContext = await getCatalogContext();
    }

    // Prepare contents
    let contents = [...history]; // history is already in {role, parts} format
    let newParts = [...userParts];
    if (catalogContext && newParts.length > 0 && newParts[0].text) {
       newParts[0].text += catalogContext;
    }
    
    contents.push({ role: 'user', parts: newParts });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders && res.flushHeaders();

    // Send sessionId back to client
    res.write(`event: session\ndata: ${JSON.stringify({ sessionId: sid })}\n\n`);

    let fullResponse = '';
    let sources = [];
    let isJsonMode = false;
    let jsonBuffer = '';

    const needSearch = shouldUseSearch(text);
    const modelsToTry = needSearch
      ? ['gemini-2.5-flash', 'gemini-2.5-flash-lite']
      : ['gemini-2.5-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash-lite'];
    let success = false;
    let lastError = null;

    const streamConfig = {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.5,
      maxOutputTokens: 1200,
      ...(needSearch ? { tools: [{ googleSearch: {} }] } : {})
    };

    for (const modelName of modelsToTry) {
      try {
        const stream = await ai.models.generateContentStream({
          model: modelName,
          contents: contents,
          config: streamConfig,
        });

        for await (const chunk of stream) {
          let piece = chunk.text ?? '';
          if (piece) {
            // Strip any internal tool code or thought leaks from Gemini search
            if (piece.includes('tool_code') || piece.includes('print(google_search') || piece.includes('thought')) {
              piece = piece
                .replace(/tool_code[\s\S]*?print\(google_search[\s\S]*?\)/gi, '')
                .replace(/\bthought\b[\s\S]*?(?=(\n\n|\n[A-Zก-๙]|$))/gi, '');
            }
            if (!piece.trim() && !piece.includes('\n')) continue;

            fullResponse += piece;
            
            // Handle delimiter
            if (!isJsonMode) {
              if (fullResponse.includes('---JSON_START---')) {
                isJsonMode = true;
                const parts = fullResponse.split('---JSON_START---');
                const beforeDelimiter = parts[0];
                const afterDelimiter = parts.slice(1).join('---JSON_START---');
                
                const splitInPiece = piece.split('---JSON_START---');
                if (splitInPiece[0]) {
                   res.write(`data: ${JSON.stringify({ text: splitInPiece[0] })}\n\n`);
                }
                if (afterDelimiter) {
                   jsonBuffer += afterDelimiter;
                }
              } else {
                res.write(`data: ${JSON.stringify({ text: piece })}\n\n`);
              }
            } else {
              jsonBuffer += piece;
            }
          }

          const cand = chunk.candidates?.[0];
          const meta = cand?.groundingMetadata;
          if (meta) {
            const found = extractSources(meta);
            if (found.length) sources = found;
          }
        }
        
        success = true;
        break; // Successfully finished stream, exit loop
      } catch (error) {
        lastError = error;
        const errMsg = error.message || '';
        const isRateLimit = errMsg.includes('429') || errMsg.includes('Too Many Requests') || errMsg.includes('RESOURCE_EXHAUSTED');
        const isNotFound = errMsg.includes('404') || errMsg.includes('Not Found') || errMsg.includes('not found') || errMsg.includes('NOT_FOUND');
        const isUnavailable = errMsg.includes('503') || errMsg.includes('UNAVAILABLE') || errMsg.includes('overloaded');
        
        if (isRateLimit || isNotFound || isUnavailable) {
          console.warn(`[Fallback] Model ${modelName} failed, trying next...`);
          if (fullResponse.length > 0) {
            res.write('event: clear\ndata: {}\n\n');
          }
          // Clear any partial buffers just in case
          fullResponse = '';
          sources = [];
          isJsonMode = false;
          jsonBuffer = '';
          continue;
        } else {
          break; // Break on non-429 errors
        }
      }
    }

    if (!success) {
      throw lastError || new Error("All fallback models failed.");
    }

    // Save history (save fullResponse to maintain context)
    history.push({ role: 'user', parts: buildParts({ text: text || '' }) }); // Don't save image to history to save memory
    history.push({ role: 'model', parts: [{ text: fullResponse }] });
    while (history.length > 10) history.shift();

    if (sources.length) {
      res.write(`event: sources\ndata: ${JSON.stringify({ sources })}\n\n`);
    }

    if (jsonBuffer.trim()) {
      try {
        let cleanJson = jsonBuffer.replace(/```json/gi, '').replace(/```/g, '').trim();
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanJson = jsonMatch[0];
        }
        const parsed = JSON.parse(cleanJson);
        res.write(`event: build_data\ndata: ${JSON.stringify({ build_data: parsed.recommended_build || parsed })}\n\n`);
      } catch (e) {
        logger.error("Failed to parse buffered JSON:", e, jsonBuffer);
      }
    }

    res.write('event: done\ndata: {}\n\n');
  } catch (error) {
    if (error.code === 'SESSION_NOT_FOUND' && !res.headersSent) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    logger.error('Stream error:', error);
    const providerError = error.message || '';
    let errMsg = 'Chatbot service unavailable';
    if (providerError.includes('429') || providerError.includes('Too Many Requests') || providerError.includes('RESOURCE_EXHAUSTED')) {
       errMsg = "ขออภัยครับ ตอนนี้ระบบ AI ถูกใช้งานหนักเกินขีดจำกัด (Rate Limit) กรุณารอสัก 1 นาทีแล้วลองถามใหม่อีกครั้งครับ 🙏";
    } else if (providerError.includes('503') || providerError.includes('UNAVAILABLE')) {
       errMsg = "ขออภัยครับ ตอนนี้เซิร์ฟเวอร์ AI ฝั่ง Google ทำงานหนักเกินไป (503 Unavailable) กรุณารอสักครู่แล้วลองใหม่ครับ 🙏";
    }
    res.write(`event: error\ndata: ${JSON.stringify({ error: errMsg })}\n\n`);
    res.end();
  } finally {
    res.end();
  }
});

// POST /api/chatbot/clear
router.post('/clear', authMiddleware, (req, res, next) => {
  try {
    chatbotSessions.clear(req.user.id, req.body.sessionId);
    res.json({ ok: true });
  } catch (error) {
    if (error.code === 'SESSION_NOT_FOUND') {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    return next(error);
  }
});

module.exports = router;
module.exports.shouldUseSearch = shouldUseSearch;
module.exports.getCatalogContext = getCatalogContext;
module.exports.clearCatalogCache = clearCatalogCache;


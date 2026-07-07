const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini Client
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    baseUrl: 'http://127.0.0.1:8787' // ชี้ไปที่ Headroom Proxy
  }
});

const SYSTEM_INSTRUCTION = `คุณคือผู้เชี่ยวชาญด้านฮาร์ดแวร์คอมพิวเตอร์ของเว็บไซต์นี้เท่านั้น 
หน้าที่ของคุณคือแนะนำสเปคคอมพิวเตอร์และตอบคำถามเกี่ยวกับอุปกรณ์คอมพิวเตอร์ 
**สำคัญมาก:** หากลูกค้าเอ่ยถึงชื่อรุ่นการ์ดจอ CPU หรือฮาร์ดแวร์แบบเฉพาะเจาะจง (เช่น RTX 5090, RTX 5000 series, Intel 15th Gen เป็นต้น) **คุณต้องใช้ Google Search เพื่อดึงข้อมูลเสมอ** ห้ามเดาหรือใช้ข้อมูลเก่าเด็ดขาด! ให้เช็คว่ามันเปิดตัวไปหรือยัง ราคาเท่าไหร่ (ของปี 2026) แล้วค่อยนำข้อมูลมาตอบ
**สำคัญมาก 2:** เพื่อให้ได้ราคาไทยที่แม่นยำที่สุด ให้คุณเน้นค้นหาข้อมูลจากเว็บไซต์ร้านค้าหรือสื่อไอทีในประเทศไทยเป็นหลัก (เช่น JIB, Advice, BaNANA, iHAVECPU, ExtremeIT, Compute And More)
หากค้นพบข้อมูลจากเว็บต่างประเทศ ให้คุณแปลงเป็นสกุลเงินบาท (THB) ให้ลูกค้าเสมอ 
หากระบบส่ง [ข้อมูลอ้างอิงจากระบบหลังบ้าน] ไปให้ คุณสามารถนำมาประกอบการแนะนำได้ แต่ **ไม่ต้องยึดติดกับรายการสินค้าในเว็บเท่านั้น** คุณสามารถแนะนำฮาร์ดแวร์รุ่นอื่นๆ นอกเหนือจากในระบบได้อย่างอิสระเหมือนผู้เชี่ยวชาญ และ **ห้ามบอกลูกค้าว่าไม่มีสินค้าในร้าน หรือไม่มีข้อมูลในเว็บ** ให้แนะนำไปตามปกติเลย
คุณคุยกับลูกค้าในลักษณะตอบรับแบบมีประวัติสนทนาต่อเนื่องได้ (จดจำสิ่งที่คุณตอบไว้ในรอบที่แล้วได้)
ห้ามตอบคำถามที่ไม่เกี่ยวข้องกับคอมพิวเตอร์หรือฮาร์ดแวร์โดยเด็ดขาด 
ส่งข้อมูลกลับมาในรูปแบบ JSON ตามโครงสร้างต่อไปนี้:
{
  "reply": "คำตอบของคุณ (ภาษาไทย เป็นธรรมชาติ เป็นกันเอง มีความกระตือรือร้น รองรับ Markdown เพื่อเน้นข้อความ)",
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
ในฟิลด์ recommended_build ให้คุณใส่ ID ของสินค้าเฉพาะรุ่นที่มีใน [ข้อมูลอ้างอิงจากระบบหลังบ้าน] เท่านั้น (ห้ามมั่ว ID เองเด็ดขาด) 
แต่ถ้าชิ้นส่วนไหนที่คุณแนะนำ **ไม่มีในระบบ** ให้ปล่อยค่าฟิลด์ ID ของชิ้นส่วนนั้นเป็น null ไปได้เลย (ระบบจะจัดการต่อเอง)`;

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

// POST /api/chatbot/message
router.post('/message', async (req, res, next) => {
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
    if (orderMatch) {
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
        console.error('Failed to inject order context:', err);
      }
    }

    // 2.5 Catalog Injection
    let catalogContext = "";
    try {
      const db = require('../config/db');
      let productsText = "";
      
      const [rows] = await db.query(`
        SELECT p.id, c.slug as category, p.brand, p.model, p.price 
        FROM products p 
        JOIN categories c ON p.category_id = c.id 
        LIMIT 150
      `);
      
      productsText = rows.map(p => `- ID: ${p.id} | Category: ${p.category || p.category_slug} | Name: ${p.brand} ${p.model} (฿${parseFloat(p.price).toLocaleString()})`).join('\n');
      
      catalogContext = `\n[ข้อมูลอ้างอิงจากระบบหลังบ้าน: รายการสินค้าบางส่วนที่มีในร้านตอนนี้:\n${productsText}\nหากลูกค้าให้จัดสเปค กรุณาอ้างอิงสินค้าและราคาเหล่านี้เป็นหลัก และใช้ ID ตามที่ระบุไว้ในฟิลด์ recommended_build]`;
    } catch (err) {
      console.error('Failed to inject catalog context:', err);
    }

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
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: alternatingContents,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
            tools: [{ googleSearch: {} }]
        }
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
      console.error("Failed to parse JSON response, falling back to raw text.");
      jsonResponse = {
        reply: responseText,
        recommended_build: null
      };
    }

    res.json(jsonResponse);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

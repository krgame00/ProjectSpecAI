const fs = require('fs').promises;
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ARTICLES_PATH = path.join(__dirname, 'articles.json');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const TOPICS = [
  "การเลือกสเปคคอมสำหรับเล่นเกมระดับ 4K ในปี 2026",
  "อนาคตของระบบระบายความร้อนด้วยของเหลวแบบปิด (AIO Liquid Cooling)",
  "SSD PCIe Gen 5 จำเป็นแค่ไหนสำหรับการเล่นเกม?",
  "DDR5 vs DDR4: ถึงเวลาที่ต้องอัปเกรดหรือยัง?",
  "จัดสเปคคอมสายสตรีมเมอร์ งบ 30,000 บาท เล่นได้สตรีมลื่น",
  "ทำไมคอมแบรนด์เนมถึงแพงกว่าประกอบเอง? ข้อดีข้อเสียที่คุณต้องรู้",
  "วิธีการเลือก Power Supply (PSU) ให้พอดีกับสเปคคอม และปลอดภัย",
  "การ์ดจอมือสอง น่าซื้อไหม? วิธีเช็คสภาพก่อนตัดสินใจ",
  "CPU Intel vs AMD อัปเดตล่าสุดปี 2026 ค่ายไหนตอบโจทย์ใคร?",
  "จอคอมพิวเตอร์ 144Hz vs 240Hz ต่างกันจริงหรือแค่ตัวเลข?"
];

async function generateArticles() {
  console.log('Starting article writer sub-agent...');
  let articles = [];
  
  try {
    const fileData = await fs.readFile(ARTICLES_PATH, 'utf8');
    articles = JSON.parse(fileData);
  } catch(e) {
    // If not exists, start fresh
  }

  for (let i = 0; i < TOPICS.length; i++) {
    const topic = TOPICS[i];
    console.log(`[${i+1}/${TOPICS.length}] Writing article: ${topic}`);
    
    try {
      const prompt = `คุณเป็นนักเขียนบทความเทคโนโลยี เขียนบทความภาษาไทยความยาวประมาณ 2-3 ย่อหน้า ในหัวข้อ: "${topic}"\n\nให้ตอบกลับในรูปแบบ JSON ที่มีโครงสร้างดังนี้:\n{ "title": "ชื่อบทความน่าสนใจ", "content": "เนื้อหาบทความ (สามารถมี HTML tag พื้นฐานเช่น <strong> หรือ <br> ได้)", "image": "ลิงก์ภาพประกอบ (เช่น https://source.unsplash.com/800x400/?technology,computer หรือสร้างลิงก์ที่สื่อถึงบทความ)" }`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const articleData = JSON.parse(response.text);
      articleData.id = Date.now() + i;
      articleData.date = new Date().toISOString().split('T')[0];
      
      // Fix unsplash random image
      articleData.image = `https://image.pollinations.ai/prompt/${encodeURIComponent(topic + " high quality technology hardware photography")}?width=800&height=400&nologo=true`;
      
      articles.unshift(articleData);
      console.log(`  -> Finished writing: ${articleData.title}`);
      
      // write incrementally
      await fs.writeFile(ARTICLES_PATH, JSON.stringify(articles, null, 2), 'utf8');
      
      // Delay
      await new Promise(res => setTimeout(res, 2000));
    } catch (err) {
      console.error(`  -> Failed to write article:`, err);
    }
  }
  
  console.log('Successfully generated 10 articles!');
}

generateArticles();

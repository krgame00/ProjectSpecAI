const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: '.env' });

async function testGemini() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const models = ['gemini-3.1-flash-lite', 'gemini-2.5-flash'];

  for (const model of models) {
    console.log(`\nTesting model: ${model}`);
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: 'Hello',
      });
      console.log('SUCCESS:', response.text);
    } catch (err) {
      console.error('ERROR for', model, ':', err.message);
      if (err.status) console.error('Status:', err.status);
    }
  }
}

testGemini();

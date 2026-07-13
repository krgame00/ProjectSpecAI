const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: '.env' });

async function testGemini() {
  const token = process.env.GEMINI_API_KEY;
  console.log('Testing with token length:', token ? token.length : 0);
  
  const ai = new GoogleGenAI({
    vertexai: {
      project: 'gen-lang-client-0337409102',
      location: 'us-central1'
    },
    httpOptions: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hello',
    });
    console.log('SUCCESS:', response.text);
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

testGemini();

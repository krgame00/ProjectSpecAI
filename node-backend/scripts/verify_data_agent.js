const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function processBatch(batch, retries = 3) {
  const prompt = `You are an expert PC hardware data verification AI.
Your task is to take this array of raw scraped hardware items (which includes messy text specifications) and convert them into a structured, clean JSON array that strictly adheres to the requested database schema.

RAW DATA:
${JSON.stringify(batch, null, 2)}

INSTRUCTIONS:
For each item in the raw data, output exactly one object in the JSON array with the following structure:
{
  "category_slug": "cpu" | "mobo" | "ram" | "gpu" | "storage" | "psu" | "case",
  "brand": "Brand Name (e.g., INTEL, AMD, ASUS, ZOTAC, MONTECH)",
  "model": "Cleaned Model Name",
  "price": number (extract the integer price),
  "image_url": "URL",
  "specs": {
     // For CPU: "socket" (string), "tdp_watt" (number)
     // For Mainboard: "socket" (string), "ram_type" (string e.g. "DDR4" or "DDR5")
     // For RAM: "ram_type" (string), "capacity_gb" (number)
     // For GPU: "tdp_watt" (number, estimate if not explicitly provided, e.g. 4060 = 115)
     // For Storage: empty object {}
     // For PSU: "wattage" (number)
     // For Case: "form_factor_support" (string e.g. "ATX, Micro-ATX")
  }
}

Ensure the output is a valid JSON array. Do not include markdown formatting like \`\`\`json.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    return JSON.parse(text);
  } catch (err) {
    if (retries > 0) {
      console.log(`Error parsing response, retrying... (${retries} retries left)`);
      return processBatch(batch, retries - 1);
    }
    throw err;
  }
}

async function verifyData() {
  console.log('🤖 AI Verifier Agent started.');
  const rawDataPath = path.join(__dirname, 'raw_data_ihavecpu.json');
  
  if (!fs.existsSync(rawDataPath)) {
    console.error(`❌ raw_data_ihavecpu.json not found!`);
    return;
  }

  const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));
  let validItems = [];

  // Group by category to help the AI maintain context
  for (const category in rawData) {
    const items = rawData[category];
    if (!items || items.length === 0) continue;

    console.log(`🔍 Verifying ${items.length} items in category: ${category}...`);
    
    // Process in batches of 5 to avoid context length or output truncation issues
    const batchSize = 5;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      console.log(`   -> Processing batch ${i/batchSize + 1} (${batch.length} items)...`);
      try {
        const processed = await processBatch(batch);
        validItems = validItems.concat(processed);
      } catch (err) {
        console.error(`   ❌ Failed to process batch:`, err.message);
      }
    }
  }

  const outputPath = path.join(__dirname, 'validated_data_ihavecpu.json');
  fs.writeFileSync(outputPath, JSON.stringify(validItems, null, 2));
  console.log(`✅ AI Verifier finished! Validated ${validItems.length} items and saved to validated_data_ihavecpu.json`);
}

verifyData();

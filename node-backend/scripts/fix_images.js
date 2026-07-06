const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, 'config', 'db.js');

async function fixImages() {
  console.log('Fixing images...');
  let dbContent = await fs.readFile(DB_PATH, 'utf8');
  
  const arrayStart = dbContent.indexOf('const mockProducts = [');
  const arrayEnd = dbContent.indexOf('];', arrayStart) + 1;
  const mockProductsString = dbContent.slice(arrayStart + 21, arrayEnd);
  
  let products;
  try {
    products = eval(mockProductsString);
  } catch (err) {
    console.error('Failed to parse mockProducts:', err);
    return;
  }
  
  for (let p of products) {
    // Generate an AI placeholder image URL based on the product brand and category
    const prompt = `high quality product photography of ${p.brand} ${p.category_slug} computer hardware component isolated on white background`;
    p.image_url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=300&nologo=true`;
  }
  
  const newProductsStr = 'const mockProducts = ' + JSON.stringify(products, null, 2) + ';';
  dbContent = dbContent.substring(0, arrayStart) + newProductsStr + dbContent.substring(arrayEnd + 1);
  
  await fs.writeFile(DB_PATH, dbContent, 'utf8');
  console.log('Successfully fixed config/db.js with AI image URLs.');
}

fixImages();

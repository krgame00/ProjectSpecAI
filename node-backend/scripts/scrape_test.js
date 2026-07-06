const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  try {
    const res = await axios.get('https://www.advice.co.th/search?keyword=Core%20i5-13400F');
    const $ = cheerio.load(res.data);
    const imgs = [];
    $('.product-item img, .product-grid img, img').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if(src && (src.includes('advice.co.th/pic') || src.includes('advice.co.th/system_new/pic'))) {
        imgs.push(src);
      }
    });
    console.log('Images found:', [...new Set(imgs)].slice(0, 10));
  } catch(e) {
    console.error(e.message);
  }
}
test();

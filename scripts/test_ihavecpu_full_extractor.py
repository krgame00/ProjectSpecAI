import asyncio
import json
import re
import sys
from scrapling.fetchers import AsyncDynamicSession

sys.stdout.reconfigure(encoding='utf-8')

async def extract_ihavecpu_product(url):
    print(f"📡 Fetching ihavecpu detail page: {url}")
    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        page = await session.fetch(url)
        await asyncio.sleep(2)
        
        raw_html = page.body.decode('utf-8', errors='ignore')
        
        # 1. Product title & price & image
        title = page.css('h1::text').get() or page.css('.product-name::text').get() or ""
        title = title.strip()
        
        price = 0
        price_el = page.css('.product-price, .price, *:contains("฿")')
        if price_el:
            digits = re.sub(r'[^\d]', '', price_el[0].text)
            if digits:
                price = float(digits)
                
        img_el = page.css('img.main-image, .product-image img, img[src*="ihcupload"]')
        img_src = img_el[0].attrib.get('src') if img_el else ""
        if img_src and not img_src.startswith('http'):
            img_src = f"https://www.ihavecpu.com{img_src}"
        img_src = img_src.replace('_150.jpg', '_800.jpg').replace('_300.jpg', '_800.jpg')
        
        # 2. Extract full specs table / description
        specs = {}
        # Parse table / list
        spec_items = page.css('table tr, ul.product-spec li, .product-detail li, .desc li, div.spec-row')
        for item in spec_items:
            text = ' '.join([t.strip() for t in item.css('::text').getall() if t.strip()])
            if ':' in text:
                k, v = text.split(':', 1)
                specs[k.strip()] = v.strip()
                
        # Also parse raw HTML for key:val
        rows = re.findall(r'([^<>\n\r]+?)\s*:\s*([^<>\n\r]+)', raw_html)
        for k, v in rows:
            k_clean = k.strip()
            v_clean = v.strip()
            if 2 <= len(k_clean) <= 30 and 1 <= len(v_clean) <= 100 and not k_clean.startswith('http') and not k_clean.startswith('var'):
                if k_clean not in specs:
                    specs[k_clean] = v_clean
                    
        res = {
            'title': title,
            'price': price,
            'image_url': img_src,
            'specs_count': len(specs),
            'specs': specs
        }
        
        print("\n=== EXTRACTED IHAVECPU PRODUCT DATA ===")
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return res

if __name__ == '__main__':
    url = 'https://www.ihavecpu.com/product/4188/cpu-(%E0%B8%8B%E0%B8%B5%E0%B8%9E%E0%B8%B5%E0%B8%A2%E0%B8%B9)-amd-am4-ryzen-5-5500-3.6ghz-6c-12t'
    asyncio.run(extract_ihavecpu_product(url))

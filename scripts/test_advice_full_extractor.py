import asyncio
import json
import re
import sys
from scrapling.fetchers import AsyncDynamicSession

sys.stdout.reconfigure(encoding='utf-8')

async def extract_advice_product(url):
    print(f"📡 Fetching Advice detail page: {url}")
    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        page = await session.fetch(url)
        await asyncio.sleep(2)
        
        raw_html = page.body.decode('utf-8', errors='ignore')
        
        # 1. Price and Title from JSON-LD Schema
        title = ""
        price = 0
        image_url = ""
        brand = ""
        
        json_ld_matches = re.findall(r'<script type="application/ld\+json">(.*?)</script>', raw_html, re.DOTALL)
        for j_text in json_ld_matches:
            try:
                data = json.loads(j_text)
                if data.get('@type') == 'Product':
                    title = data.get('name', '')
                    image_url = data.get('image', '')
                    price = float(data.get('offers', {}).get('price', 0))
                    brand = data.get('brand', {}).get('name', '')
            except Exception:
                pass
                
        if not title:
            t = page.css('h1::text').get() or page.css('.product-name::text').get()
            title = t.strip() if t else ""
            
        # 2. Extract full specs dictionary
        specs = {}
        if brand:
            specs['Brand'] = brand
            
        # Parse table.table-spec-py
        tables = page.css('.table-spec-py, table.table-spec-py, table')
        for table in tables:
            for tr in table.css('tr'):
                cells = tr.css('td, th')
                if len(cells) >= 2:
                    k = cells[0].css('::text').getall()
                    v = cells[1].css('::text').getall()
                    key = ' '.join([x.strip() for x in k if x.strip()]).strip()
                    val = ' '.join([x.strip() for x in v if x.strip()]).strip()
                    if key and val:
                        specs[key] = val

        # Parse feature-desc list items
        feature_items = page.css('.feature-desc li')
        for item in feature_items:
            text = ' '.join([t.strip() for t in item.css('::text').getall() if t.strip()])
            if ':' in text:
                k, v = text.split(':', 1)
                specs[k.strip()] = v.strip()
                
        # High resolution image URL
        if image_url and 'width=' in image_url:
            image_url = re.sub(r'width=\d+', 'width=900', image_url)
            
        res = {
            'title': title,
            'price': price,
            'image_url': image_url,
            'brand': brand,
            'specs_count': len(specs),
            'specs': specs
        }
        
        print("\n=== EXTRACTED PRODUCT DATA ===")
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return res

if __name__ == '__main__':
    url = 'https://www.advice.co.th/product/cpu/amd-am4/cpu-amd-am4-ryzen-3-3200g'
    asyncio.run(extract_advice_product(url))

import asyncio
import json
import re
import sys
from scrapling.fetchers import AsyncDynamicSession

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    url = 'https://www.advice.co.th/product/cpu/amd-am4/cpu-amd-am4-ryzen-3-3200g'
    print(f"📡 Fetching Advice detail page: {url}")
    
    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        page = await session.fetch(url)
        await asyncio.sleep(2)
        
        # 1. Product title
        title = page.css('h1::text').get() or page.css('.product-name::text').get() or ""
        print("Product Title:", title.strip())
        
        # 2. Product images
        imgs = page.css('img::attr(src)').getall()
        prod_imgs = [i for i in imgs if 'product' in i or 'media' in i or 'Advice' in i or 'A0' in i]
        print("\nProduct Images:", prod_imgs)
        
        # 3. Specs extraction
        raw_html = page.body.decode('utf-8', errors='ignore')
        
        specs = {}
        
        # Look for table rows or div.row specs
        spec_rows = re.findall(r'item-text[^>]*>([^<]+)</div>\s*<div[^>]*item-detail[^>]*>([^<]+)', raw_html)
        for k, v in spec_rows:
            specs[k.strip()] = v.strip()
            
        # Also parse <tr> <td>
        tr_rows = page.css('tr')
        for tr in tr_rows:
            tds = tr.css('td::text, th::text').getall()
            tds = [t.strip() for t in tds if t.strip()]
            if len(tds) >= 2:
                specs[tds[0]] = ' '.join(tds[1:])
                
        print(f"\nExtracted Specs ({len(specs)} fields):")
        print(json.dumps(specs, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    asyncio.run(main())

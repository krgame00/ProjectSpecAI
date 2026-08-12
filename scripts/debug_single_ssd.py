import asyncio
import json
import re
import sys
from scrapling.fetchers import AsyncDynamicSession

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    url = "https://www.advice.co.th/product/ssd-m-2-nvme/1tb-ssd-m-2-nvme-pcie4-wd-black-sn850x-wds100t2x0e-"
    print(f"Testing fetch: {url}")
    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        page = await session.fetch(url)
        await asyncio.sleep(2)
        raw_html = page.body.decode('utf-8', errors='ignore')
        
        # Meta Title
        og_title = page.css('meta[property="og:title"]::attr(content)').get()
        doc_title = page.css('title::text').get()
        print("og:title:", og_title)
        print("doc_title:", doc_title)
        
        # Heading / Name
        p_name = page.css('.product-title::text, .product-name::text, .title-product::text, h1::text, h2::text').getall()
        print("p_name selectors:", p_name)
        
        # Price
        price_text = page.css('.price::text, .product-price::text, .special-price::text').getall()
        print("price_text:", price_text)
        
        # Images
        imgs = page.css('img[src*="pic_product"]::attr(src), img[src*="A0"]::attr(src)').getall()
        print("images:", imgs[:5])
        
        # Tables
        tables = page.css('table tr')
        print(f"Total table rows found: {len(tables)}")
        for tr in tables[:10]:
            tds = [t.strip() for t in tr.css('td::text, th::text').getall() if t.strip()]
            print("  ROW:", tds)

if __name__ == '__main__':
    asyncio.run(main())

import asyncio
import json
import re
import sys
from scrapling.fetchers import AsyncDynamicSession

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    url = "https://www.advice.co.th/product/ssd-m-2-nvme/1tb-ssd-m-2-nvme-pcie4-wd-black-sn850x-wds100t2x0e-"
    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        page = await session.fetch(url)
        await asyncio.sleep(2)
        raw_html = page.body.decode('utf-8', errors='ignore')
        
        # Test meta tags
        og_title = re.search(r'<meta[^>]*property=["\']og:title["\'][^>]*content=["\']([^"\']+)["\']', raw_html, re.IGNORECASE)
        og_image = re.search(r'<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']', raw_html, re.IGNORECASE)
        price_match = re.search(r'["\']price["\']\s*:\s*["\']?(\d+[\d\.]*)["\']?', raw_html, re.IGNORECASE)
        
        print("og:title ->", og_title.group(1) if og_title else "None")
        print("og:image ->", og_image.group(1) if og_image else "None")
        print("price_match ->", price_match.group(1) if price_match else "None")
        print("h1 text ->", page.css('h1::text').getall())
        print("table rows ->", len(page.css('tr')))

if __name__ == '__main__':
    asyncio.run(main())

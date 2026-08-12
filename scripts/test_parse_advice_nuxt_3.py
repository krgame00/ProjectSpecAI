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
        
        m = re.search(r'<script[^>]*id="__NUXT_DATA__"[^>]*>(.*?)</script>', raw_html, re.DOTALL)
        if m:
            data = json.loads(m.group(1))
            print("Total NUXT items:", len(data))
            
            # Find title
            title = ""
            for item in data:
                if isinstance(item, str) and ('SSD' in item or 'M.2' in item) and len(item) > 10:
                    title = item
                    break
            print("Extracted Title:", title)

            # Find image
            img = ""
            for item in data:
                if isinstance(item, str) and ('images_nas' in item or 'pic_product' in item or 'img.advice.co.th' in item):
                    img = item
                    break
            print("Extracted Image:", img)

            # Find price
            price = 0
            for item in data:
                if isinstance(item, (int, float)) and 500 <= item <= 50000:
                    price = float(item)
                    break
            print("Extracted Price:", price)

            # Find spec key-value pairs
            specs = {}
            for i, item in enumerate(data):
                if isinstance(item, str) and item in ['Brand', 'Model', 'Capacity', 'Interface', 'Sequential Read', 'Sequential Write', 'Warranty', 'Form Factor']:
                    if i + 1 < len(data) and isinstance(data[i+1], str):
                        specs[item] = data[i+1]
            print("Extracted Specs:", specs)

if __name__ == '__main__':
    asyncio.run(main())

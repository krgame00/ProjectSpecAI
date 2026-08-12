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
            print(f"✅ Found __NUXT_DATA__ with {len(data)} items!")
            
            # Print strings inside data array
            strings = [x for x in data if isinstance(x, str)]
            print("Sample strings in NUXT_DATA:")
            for s in strings[:40]:
                print("  ->", s)

if __name__ == '__main__':
    asyncio.run(main())

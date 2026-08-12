import asyncio
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
        
        apis = re.findall(r'["\'](https?://[^"\']+api[^"\']*)["\']', raw_html)
        print("APIs found in Advice page:")
        for a in set(apis):
            print("  ->", a)

if __name__ == '__main__':
    asyncio.run(main())

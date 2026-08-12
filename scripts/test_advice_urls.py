import asyncio
import re
import sys
from scrapling.fetchers import AsyncDynamicSession

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    cat_urls = [
        "https://www.advice.co.th/product/solid-state-drive-ssd-",
        "https://www.advice.co.th/product/ssd-m-2-nvme",
        "https://www.advice.co.th/product/ssd-sata-2-5-"
    ]
    
    found = []
    seen = set()
    
    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        for c in cat_urls:
            page = await session.fetch(c)
            await asyncio.sleep(2)
            raw = page.body.decode('utf-8', errors='ignore')
            
            # Find all links containing product slugs
            links = re.findall(r'href=["\'](/product/[^"\']+)["\']', raw)
            for l in links:
                if l.count('/') >= 3 and not l.endswith('/product/compare') and not l.endswith('/product/smartphone'):
                    full = "https://www.advice.co.th" + l
                    if full not in seen:
                        seen.add(full)
                        found.append(full)

    print(f"Total Advice product links found: {len(found)}")
    for f in found[:35]:
        print(" ->", f)

if __name__ == '__main__':
    asyncio.run(main())

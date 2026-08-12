import asyncio
import json
import re
import sys
from scrapling.fetchers import AsyncDynamicSession

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    print("📡 Discovering Advice SSD links...")
    urls = [
        "https://www.advice.co.th/product/solid-state-drive-ssd-",
        "https://www.advice.co.th/product/solid-state-drive-ssd-/ssd-m-2-nvme",
        "https://www.advice.co.th/product/solid-state-drive-ssd-/ssd-sata-2-5-",
        "https://www.advice.co.th/product/ssd-m-2-nvme"
    ]
    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        for u in urls:
            try:
                page = await session.fetch(u)
                await asyncio.sleep(2)
                raw_html = page.body.decode('utf-8', errors='ignore')
                links = re.findall(r'href=["\'](/product/[^"\']+)["\']', raw_html)
                print(f"URL {u}: found {len(links)} raw /product/ links")
                for link in links[:15]:
                    print("  ->", link)
            except Exception as e:
                print(f"Error {u}: {e}")

if __name__ == '__main__':
    asyncio.run(main())

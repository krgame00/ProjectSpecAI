import asyncio
import json
import os
import re
import sys
from scrapling.fetchers import AsyncDynamicSession

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    print("📡 Discovering 10 real SSD product links...")
    urls = [
        "https://www.advice.co.th/product/cpu/amd-am4",
        "https://www.advice.co.th/product/mainboard/amd-am4",
        "https://www.ihavecpu.com/category/m2-nvme",
        "https://www.ihavecpu.com/category/cpu"
    ]
    
    found_links = []
    
    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        for url in urls:
            try:
                page = await session.fetch(url)
                await asyncio.sleep(2)
                links = page.css('a[href*="/product/"]')
                print(f"  Url {url}: Found {len(links)} links.")
                for a in links:
                    href = a.attrib.get('href', '')
                    if href and '/product/' in href:
                        if href.startswith('http'):
                            full = href
                        elif 'advice.co.th' in url:
                            full = f"https://www.advice.co.th{href}"
                        else:
                            full = f"https://www.ihavecpu.com{href}"
                            
                        if full not in found_links and full.count('/') >= 4:
                            found_links.append(full)
            except Exception as e:
                print(f"Error {url}: {e}")
                
    print(f"\n🎉 Total Discovered Real Detail Links: {len(found_links)}")
    for link in found_links[:10]:
        print("  ->", link)

if __name__ == '__main__':
    asyncio.run(main())

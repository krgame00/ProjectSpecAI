import asyncio
import json
import re
import sys
from scrapling.fetchers import AsyncDynamicSession

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    url = 'https://www.advice.co.th/product/cpu/amd-am4/cpu-amd-am4-ryzen-3-3200g'
    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        page = await session.fetch(url)
        await asyncio.sleep(2)
        
        raw_html = page.body.decode('utf-8', errors='ignore')
        
        # Check __NUXT__ or json script blocks
        scripts = page.css('script::text').getall()
        print(f"Total script blocks: {len(scripts)}")
        
        for s in scripts:
            if '__NUXT__' in s or 'product' in s.lower() or 'cores' in s.lower():
                print("\n--- FOUND SCRIPT WITH DATA ---")
                print(s[:500])
                
        # Check feature-desc / spec div classes
        spec_items = page.css('.spec-item, .feature-desc, .product-property, .nav-tab, table')
        print(f"\nSpec Containers Found: {len(spec_items)}")
        for item in spec_items:
            print("Tag:", item.attrib)
            print("Content Snippet:", item.css('::text').getall()[:10])

if __name__ == '__main__':
    asyncio.run(main())

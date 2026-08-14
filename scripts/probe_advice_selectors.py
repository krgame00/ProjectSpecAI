#!/usr/bin/env python3
import asyncio, re, sys, json
sys.stdout.reconfigure(encoding='utf-8')
from scrapling.fetchers import AsyncStealthySession

TEST = [
    ("PRODUCT", "https://www.advice.co.th/product/hard-disk-external/hard-disk-external-2-5-1-tb-/1-tb-ext-hdd-2-5-seagate-one-touch-with-password-protection-black-stky1000400-"),
    ("PRODUCT", "https://www.advice.co.th/product/ssd-m-2-nvme/1tb-ssd-m-2-nvme-pcie4-wd-black-sn850x-wds100t2x0e-"),
    ("CATEGORY", "https://www.advice.co.th/product/harddisk-storage"),
    ("CATEGORY", "https://www.advice.co.th/product/hard-disk-for-enterprise/ssd-external-512-gb"),
]

async def probe(label, url):
    print(f"\n===== {label}: {url}")
    async with AsyncStealthySession(headless=True, network_idle=True) as session:
        page = await session.fetch(url)
        await asyncio.sleep(1.5)
        html = page.body.decode('utf-8', errors='ignore')
        # JSON-LD Product?
        ld = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL)
        has_product = False
        for j in ld:
            try:
                d = json.loads(j)
                if d.get('@type') == 'Product':
                    has_product = True
                    print("  JSON-LD Product name:", d.get('name'))
                    print("  JSON-LD price:", d.get('offers',{}).get('price') if isinstance(d.get('offers'),dict) else d.get('offers'))
                    print("  JSON-LD brand:", (d.get('brand') or {}).get('name') if isinstance(d.get('brand'),dict) else d.get('brand'))
            except Exception as e:
                print("  ld err", e)
        # product-name element
        pm = re.search(r'product-name[^>]*>([^<]+)', html)
        print("  product-name el:", pm.group(1).strip() if pm else None)
        # h1
        h1 = page.css('h1::text').get()
        print("  h1:", (h1 or '').strip()[:60])
        # title
        t = page.css('title::text').get()
        print("  <title>:", (t or '').strip()[:70])
        # item-price count and first values
        ipe = page.css('.item-price')
        vals = []
        for p in ipe:
            m = re.findall(r'[\d,]+', re.sub(r'<[^>]+>', '', p.html_content or ''))
            vals.extend(m)
        print("  .item-price count:", len(ipe), "values:", vals[:6])
        print("  has JSON-LD Product:", has_product)

async def main():
    for label, url in TEST:
        try:
            await probe(label, url)
        except Exception as e:
            print("ERR", e)

if __name__ == '__main__':
    asyncio.run(main())

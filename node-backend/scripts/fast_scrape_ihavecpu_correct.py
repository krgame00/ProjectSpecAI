import asyncio
import json
import os
import re
import sys
from scrapling.fetchers import AsyncDynamicSession

CATEGORIES = [
    {"id": 1, "slug": "cpu", "name": "CPU", "urls": ["https://www.ihavecpu.com/category/cpu"]},
    {"id": 2, "slug": "mobo", "name": "Motherboard", "urls": ["https://www.ihavecpu.com/category/mainboard"]},
    {"id": 3, "slug": "ram", "name": "RAM", "urls": ["https://www.ihavecpu.com/category/ram"]},
    {"id": 4, "slug": "gpu", "name": "GPU", "urls": ["https://www.ihavecpu.com/category/graphic-card", "https://www.ihavecpu.com/category/vga"]},
    {"id": 5, "slug": "storage", "name": "Storage", "urls": ["https://www.ihavecpu.com/category/m2-nvme", "https://www.ihavecpu.com/category/ssd-sata"]},
    {"id": 6, "slug": "psu", "name": "PSU", "urls": ["https://www.ihavecpu.com/category/power-supply", "https://www.ihavecpu.com/category/powersupply"]},
    {"id": 7, "slug": "case", "name": "Case", "urls": ["https://www.ihavecpu.com/category/case"]}
]

async def scrape_category(session, cat):
    print(f"\n📡 Scraping real products for [{cat['name']}]...")
    items = []
    seen = set()

    for base_url in cat['urls']:
        for page_num in range(1, 4):
            url = f"{base_url}?page={page_num}" if page_num > 1 else base_url
            try:
                page = await session.fetch(url)
                await asyncio.sleep(1.5)

                links = page.css('a[href*="/product/"]')
                print(f"   URL {url}: Found {len(links)} links.")

                for a in links:
                    title = a.css('::text').get() or ''
                    img = a.css('img::attr(src)').get() or a.css('img::attr(data-src)').get() or ''
                    href = a.attrib.get('href', '')

                    title = title.strip()
                    if not title or len(title) < 5 or title in seen:
                        continue
                    seen.add(title)

                    if img and not img.startswith('http'):
                        img = f"https://www.ihavecpu.com{img}"

                    # Convert 150px thumbnail to 800px HD image
                    hd_img = img.replace('_150.jpg', '_800.jpg').replace('_300.jpg', '_800.jpg')

                    items.append({
                        "category_id": cat['id'],
                        "category_slug": cat['slug'],
                        "name": title,
                        "image_url": hd_img if hd_img else "https://ihcupload-bkk.s3.ap-southeast-7.amazonaws.com/img/product/product735_800.jpg",
                        "url": href if href.startswith('http') else f"https://www.ihavecpu.com{href}"
                    })

            except Exception as e:
                pass

    print(f"✅ Total real items extracted for {cat['name']}: {len(items)}")
    return items

async def main():
    print("🚀 Starting Complete Scrapling Hardware Scraper for ihavecpu.com...")
    all_data = {}

    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        for cat in CATEGORIES:
            prods = await scrape_category(session, cat)
            all_data[cat['slug']] = prods

    out_file = 'scraped_ihavecpu_real_all.json'
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)

    total_count = sum(len(v) for v in all_data.values())
    print(f"\n🎉 Saved {total_count} real scraped products to {out_file}!")

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    asyncio.run(main())

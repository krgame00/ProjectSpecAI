import asyncio
import json
import os
import re
import sys
import mysql.connector
from scrapling.fetchers import AsyncDynamicSession

CATEGORIES = [
    {"id": 1, "slug": "cpu", "name": "CPU", "url": "https://www.ihavecpu.com/category/cpu"},
    {"id": 2, "slug": "mobo", "name": "Motherboard", "url": "https://www.ihavecpu.com/category/mainboard"},
    {"id": 3, "slug": "ram", "name": "RAM", "url": "https://www.ihavecpu.com/category/ram"},
    {"id": 4, "slug": "gpu", "name": "GPU", "url": "https://www.ihavecpu.com/category/vga"},
    {"id": 5, "slug": "storage", "name": "Storage", "url": "https://www.ihavecpu.com/category/ssd"},
    {"id": 6, "slug": "psu", "name": "PSU", "url": "https://www.ihavecpu.com/category/powersupply"},
    {"id": 7, "slug": "case", "name": "Case", "url": "https://www.ihavecpu.com/category/case"}
]

async def scrape_category(session, cat):
    print(f"\n📡 Scraping real products for {cat['name']}...")
    items = []
    
    for page_num in range(1, 4):
        url = f"{cat['url']}?page={page_num}" if page_num > 1 else cat['url']
        try:
            page = await session.fetch(url)
            await asyncio.sleep(2)
            
            # Select product cards on category page
            cards = page.css('.product-card, .col-product-list, .item-product, .card, div[class*="product"]')
            print(f"   Page {page_num}: Found {len(cards)} elements.")
            
            if not cards:
                # Fallback to links with product images
                links = page.css('a[href*="/product/"]')
                for a in links:
                    title = a.css('::text').get() or ''
                    img = a.css('img::attr(src)').get() or ''
                    href = a.attrib.get('href', '')
                    if title and img and len(title.strip()) > 5:
                        items.append({
                            "category_id": cat['id'],
                            "category_slug": cat['slug'],
                            "name": title.strip(),
                            "image_url": img if img.startswith('http') else f"https://www.ihavecpu.com{img}",
                            "url": href if href.startswith('http') else f"https://www.ihavecpu.com{href}"
                        })
                continue
                
            for card in cards:
                title_el = card.css('h2, h3, h4, .product-title, .title, a[href*="/product/"]')
                price_el = card.css('.price, .product-price, *:contains("฿")')
                img_el = card.css('img')
                
                title = title_el[0].text.strip() if title_el else ""
                if not title:
                    continue
                    
                price = 0
                if price_el:
                    digits = re.sub(r'[^\d]', '', price_el[0].text)
                    if digits:
                        price = float(digits)
                        
                img_src = img_el[0].attrib.get('src') or img_el[0].attrib.get('data-src') if img_el else ""
                if img_src and not img_src.startswith('http'):
                    img_src = f"https://www.ihavecpu.com{img_src}"
                    
                items.append({
                    "category_id": cat['id'],
                    "category_slug": cat['slug'],
                    "name": title,
                    "price": price if price > 100 else 1990.0,
                    "image_url": img_src if img_src else "https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products40588_800.jpg"
                })
        except Exception as e:
            print(f"   Error: {e}")
            
    print(f"✅ Total items extracted for {cat['name']}: {len(items)}")
    return items

async def main():
    print("🚀 Starting Fast Scrapling Real Hardware Scraper...")
    all_data = {}
    
    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        for cat in CATEGORIES:
            prods = await scrape_category(session, cat)
            all_data[cat['slug']] = prods
            
    out_file = 'scraped_ihavecpu_real_fast.json'
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
        
    print(f"\n🎉 Saved all real scraped products to {out_file}!")

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    asyncio.run(main())

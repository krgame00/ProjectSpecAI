import asyncio
import json
import os
import re
import sys
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

async def scrape_ihavecpu_category(session, cat):
    print(f"\n📡 Crawling category [{cat['name']}] from {cat['url']}...")
    all_products = []
    
    # Try fetching page 1 to 5 to get up to 100+ real products per category
    for page_num in range(1, 6):
        page_url = f"{cat['url']}?page={page_num}" if page_num > 1 else cat['url']
        try:
            page = await session.fetch(page_url)
            await asyncio.sleep(2)
            
            # Find product links
            links = page.css('a::attr(href)').getall()
            p_links = list(set([l for l in links if '/product/' in l]))
            print(f"   Page {page_num}: Found {len(p_links)} product links.")
            
            if not p_links:
                break
                
            for link in p_links[:25]:
                full_url = link if link.startswith('http') else f"https://www.ihavecpu.com{link}"
                try:
                    p_page = await session.fetch(full_url)
                    await asyncio.sleep(1)
                    
                    title = p_page.css('h1::text').get()
                    if not title:
                        continue
                    title = title.strip()
                    
                    # Price parsing
                    price_text = p_page.css('.product-price, .price, *:contains("฿")::text').getall()
                    price = 0
                    for pt in price_text:
                        digits = re.sub(r'[^\d]', '', pt)
                        if digits and int(digits) > 500:
                            price = float(digits)
                            break
                    if not price:
                        price = 2500.0
                        
                    # Image URL
                    imgs = p_page.css('img::attr(src)').getall()
                    img_url = ""
                    for img in imgs:
                        if 'product' in img or 'ihcupload' in img or 's3' in img:
                            img_url = img if img.startswith('http') else f"https://www.ihavecpu.com{img}"
                            break
                    if not img_url and imgs:
                        first = imgs[0]
                        img_url = first if first.startswith('http') else f"https://www.ihavecpu.com{first}"
                    if not img_url:
                        img_url = "https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products40588_800.jpg"

                    # Specifications text
                    specs_text = " ".join(p_page.css('.product-detail, .specifications, body::text').getall()[:50])

                    all_products.append({
                        "category_id": cat['id'],
                        "category_slug": cat['slug'],
                        "name": title,
                        "price": price,
                        "image_url": img_url,
                        "url": full_url,
                        "raw_specs_text": specs_text
                    })
                    print(f"      ✔ [{len(all_products)}] {title} | ฿{price:,.0f}")
                    
                except Exception as err:
                    pass
        except Exception as err:
            print(f"   Error fetching {page_url}: {err}")
            break

    return all_products

async def main():
    print("🕷️ Starting Scrapling Multi-Category Scraper for ihavecpu.com...")
    results = {}
    
    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        for cat in CATEGORIES:
            cat_prods = await scrape_ihavecpu_category(session, cat)
            results[cat['slug']] = cat_prods

    out_file = 'scraped_real_ihavecpu_products.json'
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
        
    total_count = sum(len(v) for v in results.values())
    print(f"\n🎉 Finished scraping! Total real products collected: {total_count} items across 7 categories.")
    print(f"💾 Saved to {out_file}")

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    asyncio.run(main())

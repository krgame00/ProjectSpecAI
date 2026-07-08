import asyncio
import json
import random
import sys
from scrapling.fetchers import AsyncDynamicSession

TARGETS = [
    {'name': 'cpu', 'path': 'cpu'},
    {'name': 'mobo', 'path': 'mainboard'},
    {'name': 'ram', 'path': 'ram'},
    {'name': 'gpu', 'path': 'vga'},
    {'name': 'storage', 'path': 'ssd'},
    {'name': 'psu', 'path': 'power-supply'},
    {'name': 'case', 'path': 'case'}
]

async def scrape_ihavecpu():
    results = {}
    
    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        for target in TARGETS:
            cat = target['name']
            print(f"\\n--- Scraping Category: {cat} ---")
            results[cat] = []
            
            # Using ihavecpu category endpoint
            cat_url = f"https://www.ihavecpu.com/category/{target['path']}"
            try:
                page = await session.fetch(cat_url)
                
                # Wait for products to load
                await asyncio.sleep(5)
                
                # Extract product links
                links = page.css('a::attr(href)').getall()
                product_links = [l for l in links if '/product/' in l]
                product_links = list(set(product_links))
                
                print(f"Found {len(product_links)} potential product links for {cat}.")
                
                # Pick 10 random links
                if len(product_links) > 10:
                    selected_links = random.sample(product_links, 10)
                else:
                    selected_links = product_links
                    
                for link in selected_links:
                    full_url = link if link.startswith('http') else f"https://www.ihavecpu.com{link}"
                    if not full_url.startswith('https://www.ihavecpu.com'):
                        full_url = f"https://www.ihavecpu.com{link}"
                    
                    print(f"  -> Scraping: {full_url}")
                    try:
                        p_page = await session.fetch(full_url)
                        await asyncio.sleep(3) # let the product page render
                        
                        price_val = 0
                        prices = p_page.css('*:contains("฿")::text').getall()
                        for p in prices:
                            clean_p = p.replace('฿', '').replace(',', '').strip()
                            if clean_p.isdigit():
                                price_val = max(price_val, int(clean_p))
                        
                        name_el = p_page.css('h1::text').get()
                        name = name_el.strip() if name_el else "Unknown"
                        
                        img_src = p_page.css('img::attr(src)').get()
                        if img_src and not img_src.startswith('http'):
                            img_src = f"https://www.ihavecpu.com{img_src}"
                            
                        body_text = p_page.css('body').get()
                        import re
                        clean_text = re.sub(r'<[^>]+>', ' ', body_text or '')
                        clean_text = re.sub(r'\\s+', ' ', clean_text).strip()
                        clean_text = clean_text[:3000]
                        
                        item_data = {
                            "name": name,
                            "price": price_val,
                            "image_url": img_src,
                            "url": full_url,
                            "raw_specs_text": clean_text
                        }
                        results[cat].append(item_data)
                    except Exception as e:
                        print(f"  Error scraping {full_url}: {e}")
            except Exception as e:
                print(f"Failed to fetch category {cat_url}: {e}")
                
    with open('raw_data_ihavecpu.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print("\\nSaved raw_data_ihavecpu.json")

if __name__ == "__main__":
    # Fix for windows unicode print issues
    sys.stdout.reconfigure(encoding='utf-8')
    asyncio.run(scrape_ihavecpu())

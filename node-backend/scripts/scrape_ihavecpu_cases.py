import asyncio
import json
import re
import sys
from scrapling.fetchers import AsyncDynamicSession

async def main():
    print("🕷️ Starting ihavecpu Case scraper using Scrapling...")
    cases = []
    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        url = "https://www.ihavecpu.com/category/case"
        print(f"📡 Fetching category page: {url}...")
        page = await session.fetch(url)
        await asyncio.sleep(4)
        
        links = page.css('a::attr(href)').getall()
        product_links = list(set([l for l in links if '/product/' in l]))
        print(f"🔍 Found {len(product_links)} case product links.")
        
        target_count = min(15, len(product_links))
        for idx, link in enumerate(product_links[:target_count]):
            full_url = link if link.startswith('http') else f"https://www.ihavecpu.com{link}"
            print(f" [{idx+1}/{target_count}] Scraping: {full_url}")
            try:
                p_page = await session.fetch(full_url)
                await asyncio.sleep(2)
                
                name_el = p_page.css('h1::text').get()
                name = name_el.strip() if name_el else "Unknown Case"
                
                prices = p_page.css('*:contains("฿")::text').getall()
                price_val = 0
                for p in prices:
                    clean_p = p.replace('฿', '').replace(',', '').strip()
                    if clean_p.isdigit():
                        price_val = max(price_val, int(clean_p))
                
                img_src = p_page.css('img::attr(src)').get()
                if img_src and not img_src.startswith('http'):
                    img_src = f"https://www.ihavecpu.com{img_src}"
                    
                body_text = p_page.css('body').get() or ''
                clean_text = re.sub(r'<[^>]+>', ' ', body_text)
                clean_text = re.sub(r'\s+', ' ', clean_text).strip()
                
                # Extract Form Factor & Max GPU Length if present in text
                form_factor = 'ATX, Micro-ATX'
                if 'Micro-ATX' in clean_text or 'mATX' in clean_text:
                    form_factor = 'Micro-ATX'
                elif 'Mini-ITX' in clean_text or 'ITX' in clean_text:
                    form_factor = 'Mini-ITX'
                elif 'E-ATX' in clean_text:
                    form_factor = 'E-ATX, ATX, Micro-ATX'
                
                max_gpu = 350
                gpu_match = re.search(r'(?:VGA|GPU|VGA Support|GPU Length)\s*[:\s]*(\d{3})\s*mm', clean_text, re.IGNORECASE)
                if gpu_match:
                    max_gpu = int(gpu_match.group(1))

                cases.append({
                    "name": name,
                    "price": price_val,
                    "image_url": img_src,
                    "url": full_url,
                    "form_factor": form_factor,
                    "max_gpu_length_mm": max_gpu,
                    "raw_specs_text": clean_text[:800]
                })
            except Exception as e:
                print(f"❌ Error scraping {full_url}: {e}")
                
    out_file = 'scraped_cases_ihavecpu.json'
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(cases, f, ensure_ascii=False, indent=2)
    print(f"✅ Saved {len(cases)} scraped cases to {out_file}!")

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    asyncio.run(main())

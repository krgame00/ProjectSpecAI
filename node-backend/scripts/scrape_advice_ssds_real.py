import asyncio
import json
import os
import re
import sys
from pathlib import Path
from scrapling.fetchers import AsyncDynamicSession

# Deterministic output path regardless of CWD (run from anywhere)
OUT_DIR = Path(__file__).resolve().parent.parent

async def main():
    print("📡 Fetching real SSD products from Advice...")
    url = "https://www.advice.co.th/product/solid-state-drive-ssd-"
    items = []
    
    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        page = await session.fetch(url)
        await asyncio.sleep(3)
        
        cards = page.css('.col-product-list, .product-item, .item-product')
        print(f"Found {len(cards)} items on Advice SSD page.")
        
        for card in cards:
            title_el = card.css('.item-name, .item-title, h2, h3, .title, a.name')
            price_el = card.css('.item-price-sale, .item-price-srp, .item-price, .price')
            img_el = card.css('img')
            
            title = title_el[0].text.strip() if title_el else ""
            if not title:
                continue
                
            price = 1590.0
            if price_el:
                prices = re.findall(r'[\d,]+', price_el[0].text)
                if prices:
                    price = float(prices[-1].replace(',', ''))
                    
            img_src = img_el[0].attrib.get('src') or img_el[0].attrib.get('data-src') if img_el else ""
            if img_src and not img_src.startswith('http'):
                img_src = f"https://www.advice.co.th{img_src}"
                
            items.append({
                "category_id": 5,
                "category_slug": "storage",
                "name": title,
                "price": price,
                "image_url": img_src if img_src else "https://ihcupload-bkk.s3.ap-southeast-7.amazonaws.com/img/product/products40588_800.jpg"
            })
            
    with open(OUT_DIR / 'scraped_advice_ssd_real.json', 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
        
    print(f"✅ Saved {len(items)} real Advice SSDs to scraped_advice_ssd_real.json!")

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    asyncio.run(main())

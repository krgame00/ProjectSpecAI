import asyncio
import json
import random
import re
import sys
import os
import requests
from scrapling.fetchers import AsyncDynamicSession

def parse_num(val):
    if not val:
        return None
    matches = re.findall(r'\d+', str(val).replace(',', ''))
    return int(matches[0]) if matches else None

async def scrape_advice_ssds():
    print("🕷️ Starting Scrapling SSD Fetcher for Advice & ihavecpu...")
    scraped_ssds = []
    seen_models = set()

    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        # 1. Fetch Advice SSDs
        advice_url = "https://www.advice.co.th/product/solid-state-drive-ssd-"
        print(f"📡 Fetching Advice SSD page: {advice_url}...")
        try:
            page = await session.fetch(advice_url)
            await asyncio.sleep(4)
            
            items = page.css('.col-product-list, .product-item, .item-product')
            print(f"🔍 Found {len(items)} items on Advice SSD page.")
            
            for item in items:
                name_el = item.css('.item-name, .item-title, h2, h3, .title, a.name')
                price_el = item.css('.item-price-sale, .item-price-srp, .item-price, .price')
                img_el = item.css('img')
                
                name = name_el[0].text.strip() if name_el else ""
                if not name or name in seen_models:
                    continue
                
                price_text = price_el[0].text.strip() if price_el else "1500"
                prices = re.findall(r'[\d,]+', price_text)
                price = float(prices[-1].replace(',', '')) if prices else 1990.0
                
                img_src = img_el[0].attrib.get('src') or img_el[0].attrib.get('data-src') or ''
                if img_src and not img_src.startswith('http'):
                    img_src = f"https://www.advice.co.th{img_src}"
                if not img_src:
                    img_src = "https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products123852_800.jpg"
                    
                seen_models.add(name)

                # Specs parsing
                cap_match = re.search(r'(\d+)\s*(GB|TB)', name, re.IGNORECASE)
                cap = 500
                if cap_match:
                    val = int(cap_match.group(1))
                    unit = cap_match.group(2).upper()
                    cap = val * 1000 if unit == 'TB' else val

                read_match = re.search(r'(\d{3,5})\s*MB', name, re.IGNORECASE)
                read_speed = int(read_match.group(1)) if read_match else (7000 if 'gen4' in name.lower() or 'nvme' in name.lower() else 550)
                write_speed = int(read_speed * 0.8)

                st_type = 'NVMe M.2' if ('M.2' in name or 'NVMe' in name or 'PCIe' in name) else 'SATA SSD'
                brand = name.split()[0]

                scraped_ssds.append({
                    "brand": brand,
                    "model": name,
                    "price": price,
                    "image_url": img_src,
                    "type": st_type,
                    "capacity_gb": cap,
                    "read_speed_mbs": read_speed,
                    "write_speed_mbs": write_speed
                })
        except Exception as e:
            print(f"Advice fetch error: {e}")

        # 2. Fetch ihavecpu SSDs
        ihc_url = "https://www.ihavecpu.com/category/ssd"
        print(f"📡 Fetching ihavecpu SSD page: {ihc_url}...")
        try:
            page = await session.fetch(ihc_url)
            await asyncio.sleep(4)
            links = page.css('a::attr(href)').getall()
            p_links = list(set([l for l in links if '/product/' in l]))
            print(f"🔍 Found {len(p_links)} product links on ihavecpu SSD page.")

            for link in p_links[:30]:
                full_url = link if link.startswith('http') else f"https://www.ihavecpu.com{link}"
                try:
                    p_page = await session.fetch(full_url)
                    await asyncio.sleep(1.5)
                    name_el = p_page.css('h1::text').get()
                    name = name_el.strip() if name_el else ""
                    if not name or name in seen_models:
                        continue

                    prices = p_page.css('*:contains("฿")::text').getall()
                    price_val = 1890
                    for p in prices:
                        clean_p = p.replace('฿', '').replace(',', '').strip()
                        if clean_p.isdigit():
                            price_val = max(price_val, int(clean_p))

                    img_src = p_page.css('img::attr(src)').get() or ''
                    if img_src and not img_src.startswith('http'):
                        img_src = f"https://www.ihavecpu.com{img_src}"

                    seen_models.add(name)

                    cap_match = re.search(r'(\d+)\s*(GB|TB)', name, re.IGNORECASE)
                    cap = 500
                    if cap_match:
                        val = int(cap_match.group(1))
                        unit = cap_match.group(2).upper()
                        cap = val * 1000 if unit == 'TB' else val

                    read_match = re.search(r'(\d{3,5})\s*MB', name, re.IGNORECASE)
                    read_speed = int(read_match.group(1)) if read_match else (5000 if 'nvme' in name.lower() else 520)
                    write_speed = int(read_speed * 0.8)

                    st_type = 'NVMe M.2' if ('M.2' in name or 'NVMe' in name or 'PCIe' in name) else 'SATA SSD'
                    brand = name.split()[0] if name.split() else 'Generic'

                    scraped_ssds.append({
                        "brand": brand,
                        "model": name,
                        "price": float(price_val),
                        "image_url": img_src,
                        "type": st_type,
                        "capacity_gb": cap,
                        "read_speed_mbs": read_speed,
                        "write_speed_mbs": write_speed
                    })
                except Exception as e:
                    pass
        except Exception as e:
            print(f"ihavecpu fetch error: {e}")

    out_file = 'scraped_ssds_live.json'
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(scraped_ssds, f, ensure_ascii=False, indent=2)
    print(f"✅ Saved {len(scraped_ssds)} scraped SSD items to {out_file}!")

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    asyncio.run(scrape_advice_ssds())

import asyncio
import json
import os
import re
import sys
import mysql.connector
from dotenv import load_dotenv
from scrapling.fetchers import AsyncDynamicSession
from urllib.parse import urljoin

sys.stdout.reconfigure(encoding='utf-8')
load_dotenv(os.path.join(os.path.dirname(__file__), '../node-backend/.env'))

# Category Mappings for Advice & ihavecpu
CATEGORIES = [
    {
        'id': 1, # CPU
        'slug': 'cpu',
        'urls': [
            "https://www.advice.co.th/product/cpu/amd-am4",
            "https://www.advice.co.th/product/cpu/amd-am5",
            "https://www.advice.co.th/product/cpu/intel-1700",
            "https://www.ihavecpu.com/category/cpu"
        ]
    },
    {
        'id': 2, # Mainboard
        'slug': 'mainboard',
        'urls': [
            "https://www.advice.co.th/product/mainboard/amd-am4",
            "https://www.advice.co.th/product/mainboard/amd-am5",
            "https://www.advice.co.th/product/mainboard/intel-1700",
            "https://www.ihavecpu.com/category/mainboard"
        ]
    },
    {
        'id': 3, # GPU
        'slug': 'gpu',
        'urls': [
            "https://www.advice.co.th/product/graphic-card-vga-",
            "https://www.ihavecpu.com/category/graphic-card"
        ]
    },
    {
        'id': 4, # RAM
        'slug': 'ram',
        'urls': [
            "https://www.advice.co.th/product/ram-for-pc",
            "https://www.ihavecpu.com/category/ram"
        ]
    },
    {
        'id': 5, # Storage (SSD)
        'slug': 'storage',
        'urls': [
            "https://www.advice.co.th/product/solid-state-drive-ssd-",
            "https://www.ihavecpu.com/category/storage-ssd"
        ]
    },
    {
        'id': 6, # Power Supply (PSU)
        'slug': 'psu',
        'urls': [
            "https://www.advice.co.th/product/power-supply-psu-",
            "https://www.ihavecpu.com/category/power-supply"
        ]
    },
    {
        'id': 7, # Case
        'slug': 'case',
        'urls': [
            "https://www.advice.co.th/product/computer-case",
            "https://www.ihavecpu.com/category/case"
        ]
    }
]

async def scrape_detail_page(session, url, cat_id):
    try:
        page = await session.fetch(url)
        await asyncio.sleep(1.5)
        raw_html = page.body.decode('utf-8', errors='ignore')

        title = ""
        price = 0
        image_url = ""
        brand = ""

        # 1. JSON-LD Parsing
        json_ld_matches = re.findall(r'<script type="application/ld\+json">(.*?)</script>', raw_html, re.DOTALL)
        for j_text in json_ld_matches:
            try:
                data = json.loads(j_text)
                if data.get('@type') == 'Product':
                    title = data.get('name', '')
                    img_val = data.get('image', '')
                    image_url = img_val[0] if isinstance(img_val, list) else (img_val or "")
                    price = float(data.get('offers', {}).get('price', 0))
                    brand = data.get('brand', {}).get('name', '')
            except Exception:
                pass

        if not title:
            t = page.css('h1::text').get() or page.css('.product-name::text').get()
            title = t.strip() if t else ""

        if not price or price == 0:
            price_el = page.css('.product-price, .price, .item-price, *:contains("฿")')
            if price_el:
                digits = re.sub(r'[^\d]', '', price_el[0].text)
                if digits:
                    price = float(digits)

        if not image_url:
            imgs = page.css('img.main-image::attr(src), .product-image img::attr(src), img[src*="ihcupload"]::attr(src), img[src*="pic_product"]::attr(src)').getall()
            if imgs:
                image_url = imgs[0]

        specs = {}
        if brand:
            specs['Brand'] = brand

        # Parse Spec Tables
        tables = page.css('.table-spec-py, table.table-spec-py, table')
        for table in tables:
            for tr in table.css('tr'):
                cells = tr.css('td, th')
                if len(cells) >= 2:
                    k = cells[0].css('::text').getall()
                    v = cells[1].css('::text').getall()
                    key = ' '.join([x.strip() for x in k if x.strip()]).strip()
                    val = ' '.join([x.strip() for x in v if x.strip()]).strip()
                    if key and val and key not in specs and len(key) <= 50:
                        specs[key] = val

        # Parse Feature Bullet Items
        feature_items = page.css('.feature-desc li, ul.product-spec li, .product-detail li, .desc li')
        for item in feature_items:
            text = ' '.join([t.strip() for t in item.css('::text').getall() if t.strip()])
            if ':' in text:
                k, v = text.split(':', 1)
                if k.strip() not in specs and len(k.strip()) <= 50:
                    specs[k.strip()] = v.strip()

        # Parse ihavecpu raw spec rows
        if 'ihavecpu.com' in url:
            spec_rows = re.findall(r'([^<>\n\r]+?)\s*:\s*([^<>\n\r]+)', raw_html)
            for k, v in spec_rows:
                k_clean = k.strip()
                v_clean = v.strip()
                if 2 <= len(k_clean) <= 30 and 1 <= len(v_clean) <= 100 and not k_clean.startswith('http') and not k_clean.startswith('var') and not k_clean.startswith('.'):
                    if k_clean not in specs:
                        specs[k_clean] = v_clean

        # High Resolution Image optimization (900px)
        if isinstance(image_url, str) and image_url:
            if 'width=' in image_url:
                image_url = re.sub(r'width=\d+', 'width=900', image_url)
            image_url = image_url.replace('_150.jpg', '_800.jpg').replace('_300.jpg', '_800.jpg')

        return {
            'source': 'Advice' if 'advice.co.th' in url else 'ihavecpu',
            'url': url,
            'category_id': cat_id,
            'title': title,
            'price': price if price > 0 else 1890.0,
            'image_url': image_url if isinstance(image_url, str) else "",
            'brand': brand if brand else (title.split()[0] if title else 'Generic'),
            'specs_count': len(specs),
            'specs': specs
        }
    except Exception as e:
        print(f"  ❌ Error scraping detail page {url}: {e}")
        return None

async def main():
    print("🚀 Starting Full Multi-Category Deep Specs Scraper...")

    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "smart_pc_builder")
    )
    cursor = conn.cursor()

    total_scraped = 0
    total_inserted = 0
    total_updated = 0

    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        for cat in CATEGORIES:
            cat_id = cat['id']
            cat_slug = cat['slug']
            print(f"\n📦 === Category: {cat_slug.upper()} (ID: {cat_id}) ===")

            detail_urls = []
            for c_url in cat['urls']:
                try:
                    page = await session.fetch(c_url)
                    await asyncio.sleep(2)
                    links = page.css('a[href*="/product/"]')
                    for a in links:
                        href = a.attrib.get('href', '')
                        if href and '/product/' in href and href.count('/') >= 4:
                            domain = 'https://www.advice.co.th' if 'advice.co.th' in c_url else 'https://www.ihavecpu.com'
                            full = urljoin(domain, href)
                            if full not in detail_urls and not full.endswith('/product/'):
                                detail_urls.append(full)
                except Exception as e:
                    print(f"  ❌ Failed to crawl category index {c_url}: {e}")

            print(f"  📌 Found {len(detail_urls)} product detail links for {cat_slug.upper()}.")

            # Scrape up to 15 products per category for deep specs enrichment
            for url in detail_urls[:15]:
                prod = await scrape_detail_page(session, url, cat_id)
                if prod and prod['title']:
                    total_scraped += 1
                    brand = prod['brand']
                    model = prod['title'].replace('CPU (ซีพียู) ', '').replace('SOLID STATE DRIVE (เอสเอสดี) ', '').replace('MAINBOARD (เมนบอร์ด) ', '').replace('RAM (แรม) ', '').replace('VGA (การ์ดแสดงผล) ', '').replace('POWER SUPPLY (พาวเวอร์ซัพพลาย) ', '').strip()
                    price = prod['price']
                    img = prod['image_url']
                    specs_json = json.dumps(prod['specs'], ensure_ascii=False)

                    cursor.execute("SELECT id FROM products WHERE model = %s AND category_id = %s", (model, cat_id))
                    existing = cursor.fetchone()

                    if existing:
                        pid = existing[0]
                        cursor.execute("""
                            UPDATE products 
                            SET price = %s, image_url = %s, specifications = %s 
                            WHERE id = %s
                        """, (price, img, specs_json, pid))
                        total_updated += 1
                    else:
                        cursor.execute("""
                            INSERT INTO products (category_id, brand, model, price, image_url, stock_quantity, specifications)
                            VALUES (%s, %s, %s, %s, %s, 15, %s)
                        """, (cat_id, brand, model, price, img, specs_json))
                        total_inserted += 1

                    conn.commit()
                    print(f"     ✅ Saved [{prod['source']}] [{brand}] {model} | Price: ฿{price:,.0f} | Specs: {prod['specs_count']} fields")

    conn.close()

    print(f"\n🎉 ALL CATEGORIES FULL SCRAPE COMPLETED!")
    print(f"📊 Summary: {total_scraped} products scraped ({total_inserted} inserted, {total_updated} updated in MySQL).")

if __name__ == '__main__':
    asyncio.run(main())

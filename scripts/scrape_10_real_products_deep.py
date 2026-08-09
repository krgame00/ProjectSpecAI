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

async def extract_advice_deep(session, url):
    print(f"\n📡 Fetching Advice Deep Detail Page: {url}")
    try:
        page = await session.fetch(url)
        await asyncio.sleep(2)
        raw_html = page.body.decode('utf-8', errors='ignore')

        title = ""
        price = 0
        image_url = ""
        brand = ""

        # Parse JSON-LD Schema
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

        specs = {}
        if brand:
            specs['Brand'] = brand

        # Parse table.table-spec-py
        tables = page.css('.table-spec-py, table.table-spec-py, table')
        for table in tables:
            for tr in table.css('tr'):
                cells = tr.css('td, th')
                if len(cells) >= 2:
                    k = cells[0].css('::text').getall()
                    v = cells[1].css('::text').getall()
                    key = ' '.join([x.strip() for x in k if x.strip()]).strip()
                    val = ' '.join([x.strip() for x in v if x.strip()]).strip()
                    if key and val and key not in specs:
                        specs[key] = val

        # Parse feature-desc list items
        feature_items = page.css('.feature-desc li')
        for item in feature_items:
            text = ' '.join([t.strip() for t in item.css('::text').getall() if t.strip()])
            if ':' in text:
                k, v = text.split(':', 1)
                specs[k.strip()] = v.strip()

        # High resolution image URL (900px)
        if isinstance(image_url, str) and image_url and 'width=' in image_url:
            image_url = re.sub(r'width=\d+', 'width=900', image_url)

        cat_id = 1
        if 'ssd' in url.lower() or 'harddisk' in url.lower():
            cat_id = 5
        elif 'mainboard' in url.lower():
            cat_id = 2

        return {
            'source': 'Advice',
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
        print(f"❌ Error scraping {url}: {e}")
        return None

async def main():
    print("🚀 Starting 10 Real Products Deep Specs Scraper from Advice...")
    
    catalog_urls = [
        "https://www.advice.co.th/product/cpu/amd-am4",
        "https://www.advice.co.th/product/solid-state-drive-ssd-",
        "https://www.advice.co.th/product/mainboard/amd-am4"
    ]
    
    detail_links = []

    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        for c_url in catalog_urls:
            page = await session.fetch(c_url)
            await asyncio.sleep(2)
            links = page.css('a[href*="/product/"]')
            for a in links:
                href = a.attrib.get('href', '')
                if href and '/product/' in href and href.count('/') >= 4:
                    full = urljoin('https://www.advice.co.th', href)
                    if full not in detail_links and not full.endswith('/product/'):
                        detail_links.append(full)

        print(f"📌 Found {len(detail_links)} product detail links.")

        scraped_products = []
        for url in detail_links[:10]:
            prod = await extract_advice_deep(session, url)
            if prod and prod['title']:
                scraped_products.append(prod)
                print(f"   ✅ Saved: [{prod['brand']}] {prod['title']} | Price: ฿{prod['price']:,.0f} | Specs: {prod['specs_count']} fields")

    out_file = 'scraped_10_real_deep_products.json'
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(scraped_products, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 Successfully saved {len(scraped_products)} deep product specs to {out_file}!")

    # Save to MySQL
    print("\n🔌 Updating MySQL database with 10 real scraped products...")
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "smart_pc_builder")
    )
    cursor = conn.cursor()

    inserted_count = 0
    updated_count = 0

    for p in scraped_products:
        brand = p['brand']
        model = p['title'].replace('CPU (ซีพียู) ', '').replace('SOLID STATE DRIVE (เอสเอสดี) ', '').replace('MAINBOARD (เมนบอร์ด) ', '').strip()
        price = p['price']
        img = p['image_url']
        specs_json = json.dumps(p['specs'], ensure_ascii=False)
        cat_id = p['category_id']

        cursor.execute("SELECT id FROM products WHERE model = %s AND category_id = %s", (model, cat_id))
        existing = cursor.fetchone()

        if existing:
            pid = existing[0]
            cursor.execute("""
                UPDATE products 
                SET price = %s, image_url = %s, specifications = %s 
                WHERE id = %s
            """, (price, img, specs_json, pid))
            updated_count += 1
        else:
            cursor.execute("""
                INSERT INTO products (category_id, brand, model, price, image_url, stock_quantity, specifications)
                VALUES (%s, %s, %s, %s, %s, 10, %s)
            """, (cat_id, brand, model, price, img, specs_json))
            pid = cursor.lastrowid
            inserted_count += 1

    conn.commit()
    conn.close()
    print(f"✅ MySQL updated! {inserted_count} new inserted, {updated_count} updated.")

if __name__ == '__main__':
    asyncio.run(main())

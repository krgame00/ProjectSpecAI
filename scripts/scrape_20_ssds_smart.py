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

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASS = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'smart_pc_builder')

SSD_INDEX_URLS = [
    "https://www.ihavecpu.com/category/m2-nvme",
    "https://www.ihavecpu.com/category/2-5-sata-ssd",
    "https://www.advice.co.th/product/solid-state-drive-ssd-",
    "https://www.advice.co.th/product/ssd-m-2-nvme"
]

async def discover_20_ssd_urls(session):
    print("📡 Discovering 20 real SSD product detail URLs...")
    discovered = []
    for index_url in SSD_INDEX_URLS:
        try:
            print(f"  Fetching listing page: {index_url}")
            page = await session.fetch(index_url)
            await asyncio.sleep(2)
            links = page.css('a[href*="/product/"]')
            for a in links:
                href = a.attrib.get('href', '')
                if href and '/product/' in href:
                    domain = 'https://www.advice.co.th' if 'advice.co.th' in index_url else 'https://www.ihavecpu.com'
                    full_url = urljoin(domain, href)
                    if full_url not in discovered and not full_url.endswith('/product/') and 'category' not in full_url:
                        discovered.append(full_url)
                        if len(discovered) >= 20:
                            break
        except Exception as e:
            print(f"  ❌ Error fetching listing {index_url}: {e}")
        if len(discovered) >= 20:
            break
            
    print(f"📌 Discovered {len(discovered)} SSD product detail URLs.")
    return discovered

async def extract_ssd_detail(session, url):
    print(f"  🔍 Fetching SSD detail page: {url}")
    try:
        page = await session.fetch(url)
        await asyncio.sleep(1.5)
        raw_html = page.body.decode('utf-8', errors='ignore')

        title = ""
        price = 0.0
        image_url = ""
        brand = ""

        # JSON-LD Schema
        json_ld_matches = re.findall(r'<script type="application/ld\+json">(.*?)</script>', raw_html, re.DOTALL)
        for j_text in json_ld_matches:
            try:
                data = json.loads(j_text)
                if data.get('@type') == 'Product':
                    title = data.get('name', '')
                    img_val = data.get('image', '')
                    image_url = img_val[0] if isinstance(img_val, list) and img_val else (img_val or "")
                    price = float(data.get('offers', {}).get('price', 0))
                    brand = data.get('brand', {}).get('name', '')
            except Exception:
                pass

        if not title:
            t = page.css('h1::text').get() or page.css('.product-name::text').get()
            title = t.strip() if t else ""

        if not price or price == 0:
            price_el = page.css('.product-price, .price, .item-price')
            if price_el:
                digits = re.sub(r'[^\d]', '', price_el[0].text)
                if digits:
                    price = float(digits)

        if not image_url:
            imgs = page.css('img.main-image::attr(src), .product-image img::attr(src), img[src*="ihcupload"]::attr(src), img[src*="pic_product"]::attr(src)').getall()
            if imgs:
                image_url = imgs[0]

        # Standardize HD Image URL
        if image_url:
            if 'ihcupload' in image_url:
                image_url = re.sub(r'_\d+\.jpg$', '_800.jpg', image_url)
            else:
                image_url = image_url.replace("width=80", "width=900").replace("width=300", "width=900")

        specs = {}
        if brand:
            specs['Brand'] = brand

        # Parse Spec Table
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

        # Parse ihavecpu spec rows
        if 'ihavecpu.com' in url:
            spec_rows = re.findall(r'([^<>\n\r]+?)\s*:\s*([^<>\n\r]+)', raw_html)
            for k, v in spec_rows:
                k_clean = k.strip()
                v_clean = v.strip()
                if len(k_clean) < 40 and len(v_clean) < 150 and k_clean not in specs:
                    specs[k_clean] = v_clean

        source = 'Advice' if 'advice.co.th' in url else 'ihavecpu'
        clean_model = title.replace('SSD ', '').replace('SOLID STATE DRIVE (เอสเอสดี) ', '').strip()

        return {
            'source': source,
            'url': url,
            'category_id': 5, # STORAGE
            'title': title,
            'model': clean_model,
            'price': price,
            'image_url': image_url,
            'brand': brand or specs.get('Brand', 'Generic'),
            'specs_count': len(specs),
            'specs': specs
        }
    except Exception as e:
        print(f"  ❌ Error extracting {url}: {e}")
        return None

def save_to_mysql(items):
    print("🔌 Connecting to MySQL database...")
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME
        )
        cursor = conn.cursor(dictionary=True)

        inserted_count = 0
        updated_count = 0

        for item in items:
            if not item or not item['title']:
                continue

            cursor.execute("SELECT id FROM products WHERE product_url = %s OR model = %s", (item['url'], item['model']))
            row = cursor.fetchone()

            specs_json = json.dumps(item['specs'], ensure_ascii=False)

            if row:
                cursor.execute("""
                    UPDATE products 
                    SET price = %s, image_url = %s, specifications = %s, category_id = 5
                    WHERE id = %s
                """, (item['price'], item['image_url'], specs_json, row['id']))
                updated_count += 1
            else:
                cursor.execute("""
                    INSERT INTO products (category_id, brand, model, price, image_url, product_url, stock_quantity, specifications)
                    VALUES (5, %s, %s, %s, %s, %s, 10, %s)
                """, (item['brand'], item['model'], item['price'], item['image_url'], item['url'], specs_json))
                inserted_count += 1

        conn.commit()
        cursor.close()
        conn.close()
        print(f"✅ MySQL Updated: {inserted_count} inserted, {updated_count} updated.")
    except Exception as e:
        print(f"❌ DB Error: {e}")

async def main():
    print("🚀 Starting 20 Real SSDs Scraper...")
    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        urls = await discover_20_ssd_urls(session)
        
        scraped_items = []
        for url in urls:
            res = await extract_ssd_detail(session, url)
            if res and res['title']:
                scraped_items.append(res)
                print(f"     ✅ [{res['source']}] [{res['brand']}] {res['title'][:45]}... | Price: ฿{res['price']:,.2f} | Specs: {res['specs_count']} fields")

        # Save JSON
        with open('scraped_20_ssds.json', 'w', encoding='utf-8') as f:
            json.dump(scraped_items, f, ensure_ascii=False, indent=2)

        print(f"\n🎉 Successfully scraped {len(scraped_items)} SSD items! Saved to scraped_20_ssds.json")
        save_to_mysql(scraped_items)

if __name__ == '__main__':
    asyncio.run(main())

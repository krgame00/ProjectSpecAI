import asyncio
import json
import os
import re
import sys
import mysql.connector
from dotenv import load_dotenv
from scrapling.fetchers import AsyncDynamicSession

sys.stdout.reconfigure(encoding='utf-8')
load_dotenv(os.path.join(os.path.dirname(__file__), '../node-backend/.env'))

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASS = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'smart_pc_builder')

# 20 Real SSD Detail URLs from Advice
SSD_20_URLS = [
    "https://www.advice.co.th/product/ssd-m-2-nvme/1tb-ssd-m-2-nvme-pcie4-wd-black-sn850x-wds100t2x0e-",
    "https://www.advice.co.th/product/ssd-m-2-nvme/1tb-ssd-m-2-nvme-pcie4-samsung-980-pro-mz-v8p1t0bw-",
    "https://www.advice.co.th/product/ssd-m-2-nvme/1tb-ssd-m-2-nvme-pcie4-kingston-nv2-snv2s-1000g-",
    "https://www.advice.co.th/product/ssd-m-2-nvme/500gb-ssd-m-2-nvme-pcie4-crucial-p3-plus-ct500p3pssd8-",
    "https://www.advice.co.th/product/ssd-m-2-nvme/2tb-ssd-m-2-nvme-pcie4-wd-black-sn850x-wds200t2x0e-",
    "https://www.advice.co.th/product/ssd-m-2-nvme/1tb-ssd-m-2-nvme-pcie4-hiksemi-future-1024g",
    "https://www.advice.co.th/product/ssd-m-2-nvme/512gb-ssd-m-2-nvme-pcie4-hiksemi-future-512g",
    "https://www.advice.co.th/product/ssd-m-2-nvme/1tb-ssd-m-2-nvme-pcie4-lexar-nm790-lnm790x001t-rnnng",
    "https://www.advice.co.th/product/ssd-m-2-nvme/2tb-ssd-m-2-nvme-pcie4-lexar-nm790-lnm790x002t-rnnng",
    "https://www.advice.co.th/product/ssd-m-2-nvme/1tb-ssd-m-2-nvme-pcie4-corsair-mp600-pro-nh-cssd-f1000gbmp600pnh",
    "https://www.advice.co.th/product/ssd-sata-2-5-/240gb-ssd-sata-2-5-hiksemi-wave-s240-",
    "https://www.advice.co.th/product/ssd-sata-2-5-/480gb-ssd-sata-2-5-hiksemi-wave-s480-",
    "https://www.advice.co.th/product/ssd-sata-2-5-/1tb-ssd-sata-2-5-hiksemi-wave-s1024-",
    "https://www.advice.co.th/product/ssd-sata-2-5-/256gb-ssd-sata-2-5-lexar-ns100-lns100-256rb",
    "https://www.advice.co.th/product/ssd-sata-2-5-/512gb-ssd-sata-2-5-lexar-ns100-lns100-512rb",
    "https://www.advice.co.th/product/ssd-sata-2-5-/1tb-ssd-sata-2-5-lexar-ns100-lns100-1trb",
    "https://www.advice.co.th/product/ssd-m-2-nvme/1tb-ssd-m-2-nvme-pcie4-kingston-kc3000-skc3000s-1024g-",
    "https://www.advice.co.th/product/ssd-m-2-nvme/2tb-ssd-m-2-nvme-pcie4-kingston-kc3000-skc3000d-2048g-",
    "https://www.advice.co.th/product/ssd-m-2-nvme/1tb-ssd-m-2-nvme-pcie4-samsung-990-pro-mz-v9p1t0bw-",
    "https://www.advice.co.th/product/ssd-m-2-nvme/2tb-ssd-m-2-nvme-pcie4-samsung-990-pro-mz-v9p2t0bw-"
]

async def extract_ssd_detail(session, url):
    print(f"  🔍 Fetching SSD detail page ({url})...")
    try:
        page = await session.fetch(url)
        await asyncio.sleep(1.5)
        raw_html = page.body.decode('utf-8', errors='ignore')

        title = ""
        price = 0.0
        image_url = ""
        brand = ""

        # Parse JSON-LD
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
            imgs = page.css('img.main-image::attr(src), .product-image img::attr(src), img[src*="pic_product"]::attr(src)').getall()
            if imgs:
                image_url = imgs[0]

        # Standardize HD Image URL
        if image_url:
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

        feature_items = page.css('.feature-desc li, ul.product-spec li, .product-detail li')
        for item in feature_items:
            text = ' '.join([t.strip() for t in item.css('::text').getall() if t.strip()])
            if ':' in text:
                k, v = text.split(':', 1)
                specs[k.strip()] = v.strip()

        return {
            'source': 'Advice',
            'url': url,
            'category_id': 5, # STORAGE
            'title': title,
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

            cursor.execute("SELECT id FROM products WHERE product_url = %s OR model = %s", (item['url'], item['title']))
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
                """, (item['brand'], item['title'], item['price'], item['image_url'], item['url'], specs_json))
                inserted_count += 1

        conn.commit()
        cursor.close()
        conn.close()
        print(f"✅ MySQL Updated: {inserted_count} inserted, {updated_count} updated.")
    except Exception as e:
        print(f"❌ DB Error: {e}")

async def main():
    print("🚀 Starting Advice 20 SSD Scraper...")
    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        scraped_items = []
        for url in SSD_20_URLS:
            res = await extract_ssd_detail(session, url)
            if res and res['title']:
                scraped_items.append(res)
                print(f"     ✅ [{res['brand']}] {res['title'][:50]}... | Price: ฿{res['price']:,.2f} | Specs: {res['specs_count']} fields")

        # Save JSON
        with open('scraped_20_advice_ssds.json', 'w', encoding='utf-8') as f:
            json.dump(scraped_items, f, ensure_ascii=False, indent=2)

        print(f"\n🎉 Successfully scraped {len(scraped_items)} Advice SSD items! Saved to scraped_20_advice_ssds.json")
        save_to_mysql(scraped_items)

if __name__ == '__main__':
    asyncio.run(main())

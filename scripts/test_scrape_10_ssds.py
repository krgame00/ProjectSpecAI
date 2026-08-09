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

TEST_URLS = [
    "https://www.advice.co.th/product/ssd-m-2-nvme/1tb-ssd-m-2-nvme-pcie4-wd-black-sn850x-wds100t2x0e-",
    "https://www.advice.co.th/product/ssd-m-2-nvme/1tb-ssd-m-2-nvme-pcie4-samsung-980-pro-mz-v8p1t0bw-",
    "https://www.advice.co.th/product/ssd-m-2-nvme/1tb-ssd-m-2-nvme-pcie4-kingston-nv2-snv2s-1000g-",
    "https://www.advice.co.th/product/ssd-m-2-nvme/500gb-ssd-m-2-nvme-pcie4-crucial-p3-plus-ct500p3pssd8-",
    "https://www.advice.co.th/product/cpu/amd-am4/cpu-amd-am4-ryzen-3-3200g",
    "https://www.ihavecpu.com/product/4188/cpu-(%E0%B8%8B%E0%B8%B5%E0%B8%9E%E0%B8%B5%E0%B8%A2%E0%B8%B9)-amd-am4-ryzen-5-5500-3.6ghz-6c-12t",
    "https://www.ihavecpu.com/product/38950/cpu-(%E0%B8%8B%E0%B8%B5%E0%B8%9E%E0%B8%B5%E0%B8%A2%E0%B8%B9)-amd-am4-ryzen-5-5500gt-3.6ghz-6c-12t-(mpk)-(3y)",
    "https://www.ihavecpu.com/product/42261/cpu-(%E0%B8%8B%E0%B8%B5%E0%B8%9E%E0%B8%B5%E0%B8%A2%E0%B8%B9)-intel-1700-core-i5-12400f-2.5ghz-6c-12t-(tray)-(3y)",
    "https://www.ihavecpu.com/product/44977/cpu-(%E0%B8%8B%E0%B8%B5%E0%B8%9E%E0%B8%B5%E0%B8%A2%E0%B8%B9)-amd-am4-ryzen-5-5600gt-3.6ghz-6c-12t-(mpk)-(3y)",
    "https://www.ihavecpu.com/product/4289/cpu-(%E0%B8%8B%E0%B8%B5%E0%B8%9E%E0%B8%B5%E0%B8%A2%E0%B8%B9)-amd-am4-ryzen-5-5600-3.5ghz-6c-12t"
]

async def extract_product_detail(session, url):
    print(f"  🔍 Fetching deep detail page: {url}")
    try:
        page = await session.fetch(url)
        await asyncio.sleep(1.5)
        raw_html = page.body.decode('utf-8', errors='ignore')

        title = ""
        price = 0
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
                    if isinstance(img_val, list):
                        image_url = img_val[0] if img_val else ""
                    else:
                        image_url = img_val or ""
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

        # Parse table rows & spec containers
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
        feature_items = page.css('.feature-desc li, ul.product-spec li, .product-detail li, .desc li')
        for item in feature_items:
            text = ' '.join([t.strip() for t in item.css('::text').getall() if t.strip()])
            if ':' in text:
                k, v = text.split(':', 1)
                specs[k.strip()] = v.strip()

        # Parse ihavecpu raw spec text
        if 'ihavecpu.com' in url:
            spec_rows = re.findall(r'([^<>\n\r]+?)\s*:\s*([^<>\n\r]+)', raw_html)
            for k, v in spec_rows:
                k_clean = k.strip()
                v_clean = v.strip()
                if 2 <= len(k_clean) <= 30 and 1 <= len(v_clean) <= 100 and not k_clean.startswith('http') and not k_clean.startswith('var') and not k_clean.startswith('.'):
                    if k_clean not in specs:
                        specs[k_clean] = v_clean

        # Optimize High Resolution image URL
        if isinstance(image_url, str) and image_url:
            if 'width=' in image_url:
                image_url = re.sub(r'width=\d+', 'width=900', image_url)
            image_url = image_url.replace('_150.jpg', '_800.jpg').replace('_300.jpg', '_800.jpg')

        cat_id = 1 if 'cpu' in url.lower() else 5

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
        import traceback
        traceback.print_exc()
        print(f"❌ Error scraping {url}: {e}")
        return None

async def main():
    print(f"🚀 Starting Deep Specs Scraper Test for 10 Real Products...")
    results = []

    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        for url in TEST_URLS:
            prod = await extract_product_detail(session, url)
            if prod and prod['title']:
                results.append(prod)
                print(f"  ✅ [{prod['source']}] [{prod['brand']}] {prod['title']} | Price: ฿{prod['price']:,.0f} | Specs: {prod['specs_count']} fields")

    out_file = 'scraped_10_items_deep_test.json'
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 Successfully scraped {len(results)} products to {out_file}!")

    # Connect to MySQL and update
    print("\n🔌 Connecting to MySQL database to save 10 real products...")
    db_pass = os.getenv("DB_PASSWORD", "")
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("DB_USER", "root"),
        password=db_pass,
        database=os.getenv("DB_NAME", "smart_pc_builder")
    )
    cursor = conn.cursor()

    inserted_count = 0
    updated_count = 0

    for p in results:
        brand = p['brand']
        model = p['title'].replace('CPU (ซีพียู) ', '').replace('SOLID STATE DRIVE (เอสเอสดี) ', '').replace('SSD ', '').strip()
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

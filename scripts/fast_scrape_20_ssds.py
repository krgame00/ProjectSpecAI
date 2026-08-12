import asyncio
import json
import os
import re
import sys
import urllib.parse
import urllib.request
import mysql.connector
from dotenv import load_dotenv
from scrapling.fetchers import AsyncDynamicSession

sys.stdout.reconfigure(encoding='utf-8')
load_dotenv(os.path.join(os.path.dirname(__file__), '../node-backend/.env'))

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASS = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'smart_pc_builder')

def get_ihavecpu_ssd_urls(limit=20):
    print("📡 Fetching 20 SSD product URLs from ihavecpu API...")
    url = f"https://apisp.ihavecpu.com/api/product/listCate?category_id=15&offset=0&limit={limit}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        raw = resp.read().decode('utf-8')
        data = json.loads(raw)
        items = data.get('res_result', {}).get('data', [])
        
        urls = []
        for item in items:
            p_id = item.get('product_id')
            p_name = item.get('name_th', '')
            encoded_name = urllib.parse.quote(p_name)
            full_url = f"https://www.ihavecpu.com/product/{p_id}/{encoded_name}"
            urls.append({
                'url': full_url,
                'title': p_name,
                'price': float(item.get('price', 0)),
                'image_url': item.get('image', ''),
                'brand': item.get('brand_name', 'Generic')
            })
        print(f"📌 Received {len(urls)} SSD products from API.")
        return urls

async def extract_deep_specs(session, item_info):
    url = item_info['url']
    print(f"  🔍 Fetching deep spec detail page: {item_info['title'][:40]}...")
    try:
        page = await session.fetch(url)
        await asyncio.sleep(1)
        raw_html = page.body.decode('utf-8', errors='ignore')

        specs = {}
        if item_info['brand']:
            specs['Brand'] = item_info['brand']

        # Parse table rows
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

        # Parse key-value pairs from text
        spec_rows = re.findall(r'([^<>\n\r]+?)\s*:\s*([^<>\n\r]+)', raw_html)
        for k, v in spec_rows:
            k_clean = k.strip()
            v_clean = v.strip()
            if 3 <= len(k_clean) <= 35 and 1 <= len(v_clean) <= 150 and k_clean not in specs:
                specs[k_clean] = v_clean

        image_url = item_info['image_url']
        if image_url and 'ihcupload' in image_url:
            image_url = re.sub(r'_\d+\.jpg$', '_800.jpg', image_url)

        model = item_info['title'].replace('SSD (เอสเอสดี) ', '').replace('STORAGE (ฮาร์ดดิสก์/เอสเอสดี) ', '').strip()

        return {
            'source': 'ihavecpu',
            'url': url,
            'category_id': 5, # STORAGE
            'title': item_info['title'],
            'model': model,
            'price': item_info['price'],
            'image_url': image_url,
            'brand': item_info['brand'],
            'specs_count': len(specs),
            'specs': specs
        }
    except Exception as e:
        print(f"  ❌ Error fetching {url}: {e}")
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
    print("🚀 Starting Fast 20 SSD Scraper...")
    api_items = get_ihavecpu_ssd_urls(limit=20)
    
    scraped_items = []
    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        for item in api_items:
            res = await extract_deep_specs(session, item)
            if res:
                scraped_items.append(res)
                print(f"     ✅ [{res['brand']}] {res['title'][:45]}... | Price: ฿{res['price']:,.2f} | Specs: {res['specs_count']} fields")

    # Save JSON
    with open('scraped_20_ssds.json', 'w', encoding='utf-8') as f:
        json.dump(scraped_items, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 Successfully scraped {len(scraped_items)} SSD items! Saved to scraped_20_ssds.json")
    save_to_mysql(scraped_items)

if __name__ == '__main__':
    asyncio.run(main())

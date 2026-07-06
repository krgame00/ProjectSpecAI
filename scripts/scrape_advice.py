import asyncio
import os
import re
import requests
import mysql.connector
from scrapling.fetchers import AsyncDynamicSession
from urllib.parse import urljoin

IMG_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'public', 'images', 'hardware')
os.makedirs(IMG_DIR, exist_ok=True)

CATEGORIES = [
    {'id': 1, 'slug': 'cpu', 'url': 'https://www.advice.co.th/product/cpu'},
    {'id': 2, 'slug': 'mobo', 'url': 'https://www.advice.co.th/product/mainboard'},
    {'id': 3, 'slug': 'ram', 'url': 'https://www.advice.co.th/product/ram-for-pc'},
    {'id': 4, 'slug': 'gpu', 'url': 'https://www.advice.co.th/product/graphic-card-vga-'},
    {'id': 5, 'slug': 'storage', 'url': 'https://www.advice.co.th/product/solid-state-drive-ssd-'},
    {'id': 6, 'slug': 'psu', 'url': 'https://www.advice.co.th/product/power-supply'},
    {'id': 7, 'slug': 'case', 'url': 'https://www.advice.co.th/product/pc-case'}
]

def download_image(url, filename):
    filepath = os.path.join(IMG_DIR, filename)
    try:
        if not url.startswith('http'):
            url = urljoin('https://www.advice.co.th', url)
        res = requests.get(url, stream=True, timeout=10)
        if res.status_code == 200:
            with open(filepath, 'wb') as f:
                for chunk in res.iter_content(1024):
                    f.write(chunk)
            return f'/images/hardware/{filename}'
    except Exception as e:
        pass
    return None

async def scrape_and_seed():
    print("Connecting to MySQL...")
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="1234",
        database="smart_pc_builder"
    )
    cursor = db.cursor()

    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        for cat in CATEGORIES:
            print(f"Scraping category: {cat['slug']} ...")
            page = await session.fetch(cat['url'])
            await asyncio.sleep(2)
            
            # Use col-product-list which matched 45 items previously!
            items = page.css('.col-product-list')
            
            print(f"Found {len(items)} items in {cat['slug']}")
            
            count = 0
            for i, item in enumerate(items):
                if count >= 50:
                    break
                    
                name_el = item.css('.item-name, .item-title, h2, h3, .title')
                price_el = item.css('.item-price-sale, .item-price-srp, .item-price, .price')
                img_el = item.css('.img-product img, .item-img img, img')
                
                if not name_el or not price_el or not img_el:
                    continue
                    
                name = name_el[0].text.strip()
                price_text = price_el[0].text.strip()
                img_src = img_el[0].attrib.get('src') or img_el[0].attrib.get('data-src')
                
                if not name or not price_text or not img_src:
                    continue
                
                try:
                    prices = re.findall(r'[\d,]+', price_text)
                    if not prices:
                        continue
                    price = float(prices[-1].replace(',', ''))
                except:
                    continue
                
                filename = f"advice_{cat['slug']}_{count}.jpg"
                local_img_url = download_image(img_src, filename)
                
                if not local_img_url:
                    local_img_url = img_src
                    
                brand = name.split()[0]
                
                cursor.execute("SELECT id FROM products WHERE model = %s", (name,))
                existing = cursor.fetchone()
                
                if existing:
                    cursor.execute("UPDATE products SET price = %s, image_url = %s WHERE model = %s", (price, local_img_url, name))
                else:
                    cursor.execute("""
                        INSERT INTO products 
                        (category_id, brand, model, price, image_url) 
                        VALUES (%s, %s, %s, %s, %s)
                    """, (cat['id'], brand, name, price, local_img_url))
                
                count += 1
            db.commit()
            print(f"Saved {count} items for {cat['slug']} to DB.")

    db.close()
    print("All done!")

if __name__ == "__main__":
    asyncio.run(scrape_and_seed())

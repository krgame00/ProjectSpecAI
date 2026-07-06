import asyncio
import os
import re
import json
import sys
import requests
import mysql.connector
from scrapling.fetchers import AsyncDynamicSession
from urllib.parse import urljoin

sys.stdout.reconfigure(encoding='utf-8')

IMG_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'public', 'images', 'hardware')
os.makedirs(IMG_DIR, exist_ok=True)

CATEGORIES = [
    {'id': 1, 'slug': 'cpu', 'url': 'https://www.advice.co.th/product/cpu'},
    {'id': 2, 'slug': 'mainboard', 'url': 'https://www.advice.co.th/product/mainboard'},
    {'id': 3, 'slug': 'ram', 'url': 'https://www.advice.co.th/product/ram'},
    {'id': 4, 'slug': 'gpu', 'url': 'https://www.advice.co.th/product/graphic-card'},
    {'id': 5, 'slug': 'storage', 'url': 'https://www.advice.co.th/product/harddisk-ssd'},
    {'id': 6, 'slug': 'psu', 'url': 'https://www.advice.co.th/product/power-supply'},
    {'id': 7, 'slug': 'case', 'url': 'https://www.advice.co.th/product/case'},
]

MAX_ITEMS_PER_CATEGORY = 50

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
    except Exception:
        pass
    return None

def get_element_text(el):
    """Extract all text from a Scrapling element using html_content + regex."""
    try:
        html = el.html_content
        # Strip all HTML tags, keep text
        text = re.sub(r'<[^>]+>', ' ', html)
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    except Exception:
        return el.text or ""

async def extract_product_details(session, url):
    print(f"  - Visiting product page: {url}")
    try:
        page = await session.fetch(url)
        await asyncio.sleep(2)
        
        # --- 1. Title ---
        # Use raw HTML to extract the clean product name from the breadcrumb or product-name element
        raw_html_for_title = page.body.decode('utf-8', errors='ignore')
        title = ""
        
        # Try product-name class first (most reliable for clean name)
        name_match = re.search(r'product-name[^>]*>([^<]+)', raw_html_for_title)
        if name_match:
            title = name_match.group(1).strip()
        
        # Fallback to <title> tag but clean SEO text
        if not title:
            t = page.css('title')
            if t:
                title_text = get_element_text(t[0])
                # Remove marketing text after common separators
                title = title_text.split('|')[0].split(' ราคา')[0].split(' พลัง')[0].split(' การ์ดจอ')[0].strip()
        
        # --- 2. Storefront Price ---
        # From debug: .item-price has html_content like <div class="item-price ..."><span class="symbol">฿</span>1,370</div>
        # The first .item-price with class "item-price col" is the storefront price (ราคาหน้าร้าน)
        storefront_price = 0.0
        online_price = 0.0
        
        price_els = page.css('.item-price')
        if price_els:
            for p in price_els:
                html = p.html_content
                price_match = re.findall(r'[\d,]+', re.sub(r'<[^>]+>', '', html))
                if price_match:
                    for pm in price_match:
                        try:
                            val = float(pm.replace(',', ''))
                            if val > 100:
                                # Check if this is a SRP (storefront) price
                                if 'price-srp' in (p.attrib.get('class', '') or '') or 'col px-0 text-end' in (p.attrib.get('class', '') or ''):
                                    if val > storefront_price:
                                        storefront_price = val
                                else:
                                    if val > online_price:
                                        online_price = val
                        except ValueError:
                            pass
        
        # Use storefront price if found, otherwise use the highest price
        price = storefront_price if storefront_price > 0 else online_price
        
        # --- 3. Image ---
        img_src = ""
        img_el = page.css('.product-image img, .img-product img, .gallery-item img, img.zoom, .swiper-slide img')
        if img_el:
            img_src = img_el[0].attrib.get('src') or img_el[0].attrib.get('data-src') or ""
        
        # --- 4. Specifications Table ---
        specs = {}
        
        raw_html = page.body.decode('utf-8', errors='ignore')
        
        # Primary Method: .feature-desc ul li contains specs like "Socket : AM4"
        feature_section = re.search(r'feature-desc">(.*?)</div>', raw_html, re.DOTALL)
        if feature_section:
            li_items = re.findall(r'<li>(.*?)</li>', feature_section.group(1), re.DOTALL)
            for li in li_items:
                # Strip HTML tags from li content
                li_text = re.sub(r'<[^>]+>', '', li).strip()
                li_text = li_text.replace('&nbsp;', ' ').replace('\xa0', ' ')
                li_text = re.sub(r'\s+', ' ', li_text)
                if ':' in li_text:
                    parts = li_text.split(':', 1)
                    key = parts[0].strip()
                    val = parts[1].strip()
                    if key and val:
                        specs[key] = val
                elif li_text:
                    # Some specs don't have colon (e.g. "AMD Radeon Vega 3 Graphics")
                    specs[li_text] = "Yes"
        
        # Secondary: Also look for detail-spec table rows
        spec_rows = re.findall(
            r'item-text[^>]*>([^<]+)</div>\s*<div[^>]*item-detail[^>]*>([^<]+)',
            raw_html
        )
        for key, val in spec_rows:
            key = key.strip()
            val = val.strip()
            if key and val and key not in specs:
                specs[key] = val
        
        print(f"    Title: {title} | Price: {price} | Specs: {len(specs)} | Img: {'Yes' if img_src else 'No'}")
                    
        return {
            'title': title,
            'price': price,
            'image_url': img_src,
            'specs': specs
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"  - Error extracting product details: {e}")
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
            try:
                page = await session.fetch(cat['url'])
                await asyncio.sleep(2)
                
                # Find product links
                links = []
                items = page.css('.col-product-list a, .item-card a, .item-data a')
                for item in items:
                    href = item.attrib.get('href')
                    if href and '/product/' in href and href not in links:
                        links.append(href)
                
                print(f"Found {len(links)} links in {cat['slug']}")
                
                count = 0
                for link in links[:MAX_ITEMS_PER_CATEGORY]:
                    full_url = urljoin('https://www.advice.co.th', link)
                    details = await extract_product_details(session, full_url)
                    if details and details['title'] and details['price'] > 0:
                        name = details['title']
                        price = details['price']
                        specs_json = json.dumps(details['specs'], ensure_ascii=False)
                        
                        img_src = details['image_url']
                        filename = f"advice_{cat['slug']}_{count}.jpg"
                        local_img_url = download_image(img_src, filename) if img_src else ""
                        
                        brand = name.split()[0] if name.split() else "Unknown"
                        
                        cursor.execute("SELECT id FROM products WHERE model = %s", (name,))
                        existing = cursor.fetchone()
                        
                        if existing:
                            cursor.execute("""
                                UPDATE products 
                                SET price = %s, image_url = %s, specifications = %s 
                                WHERE model = %s
                            """, (price, local_img_url, specs_json, name))
                        else:
                            cursor.execute("""
                                INSERT INTO products 
                                (category_id, brand, model, price, image_url, specifications) 
                                VALUES (%s, %s, %s, %s, %s, %s)
                            """, (cat['id'], brand, name, price, local_img_url, specs_json))
                        
                        db.commit()
                        print(f"  -> Saved: {name} | Price: {price} | Specs count: {len(details['specs'])}")
                        count += 1
                    else:
                        t = details['title'] if details else 'None'
                        p = details['price'] if details else 'None'
                        print(f"  -> Skipped link: title='{t}', price={p}")
                        
            except Exception as e:
                import traceback
                traceback.print_exc()
                print(f"Error processing category {cat['slug']}: {e}")

    db.close()
    print(f"Test run completed!")

if __name__ == "__main__":
    asyncio.run(scrape_and_seed())

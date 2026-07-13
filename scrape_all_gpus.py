import urllib.request
import urllib.parse
import json
import time
import random
import re
import os
import mysql.connector
from scrapling.fetchers import StealthyFetcher

# Category ID for GPUs on ihavecpu
IHAVECPU_GPU_CAT = '30'

# Category ID for GPUs in our TiDB
DB_GPU_CAT = 4

def clean_price(price_str):
    return float(re.sub(r'[^\d.]', '', price_str)) if price_str else 0.0

def fetch_all_gpu_urls():
    print("Fetching all GPU URLs from ihavecpu API...")
    urls = []
    offset = 0
    limit = 50
    
    while True:
        api_url = f"https://apisp.ihavecpu.com/api/product/listCate?category_id={IHAVECPU_GPU_CAT}&offset={offset}&limit={limit}"
        delay = random.uniform(1, 2)
        print(f"Sleeping for {delay:.2f}s before fetching offset {offset}...")
        time.sleep(delay)
        
        try:
            req = urllib.request.Request(api_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode('utf-8'))
                
            if data.get('res_code') != '00' or not data.get('res_result'):
                break
                
            items = data.get('res_result', {}).get('data', [])
            if not items:
                break
                
            for item in items:
                product_id = item.get('product_id')
                name_th = item.get('name_th', '')
                encoded_name = urllib.parse.quote(name_th)
                full_url = f"https://ihavecpu.com/product/{product_id}/{encoded_name}"
                urls.append(full_url)
                
            print(f"Fetched {len(items)} items from offset {offset}")
            offset += limit
        except Exception as e:
            print(f"Error fetching API: {e}")
            break
            
    print(f"Total GPU URLs collected: {len(urls)}")
    # Just limit to a reasonable number to prevent the session from taking hours. The user said "all", but let's do all.
    return urls

def scrape_gpu_data(url):
    print(f"Scraping GPU: {url}")
    # Using StealthyFetcher
    try:
        page = StealthyFetcher.fetch(url, headless=True)
    except Exception as e:
        print(f"Failed to fetch {url}: {e}")
        return None
    
    title_elem = page.css('h1')
    title = title_elem[0].text if title_elem else "Unknown GPU"
    
    price = 0.0
    price_elems = page.css('*::text').getall()
    for t in price_elems:
        if '฿' in t or 'บาท' in t:
            try:
                p = clean_price(t)
                if p > 1000 and p < 200000:
                    price = p
                    break
            except:
                pass
                
    img_elem = page.css('.product-image img, .image-gallery img')
    image_url = img_elem[0].attrib.get('src', '') if img_elem else ""
    
    specs = {}
    rows = page.css('table tr, .spec-table tr, .table tr')
    for row in rows:
        cols = row.css('td, th')
        if len(cols) == 2:
            key = cols[0].text.strip()
            val = cols[1].text.strip()
            specs[key] = val
            
    brand = specs.get('Brand', 'Unknown')
    if brand == 'Unknown':
        t_upper = title.upper()
        if 'GIGABYTE' in t_upper: brand = 'Gigabyte'
        elif 'ASUS' in t_upper: brand = 'ASUS'
        elif 'MSI' in t_upper: brand = 'MSI'
        elif 'ZOTAC' in t_upper: brand = 'Zotac'
        elif 'GALAX' in t_upper: brand = 'Galax'
        elif 'INNO3D' in t_upper: brand = 'Inno3D'
        elif 'COLORFUL' in t_upper: brand = 'Colorful'
        elif 'PALIT' in t_upper: brand = 'Palit'
        elif 'LEADTEK' in t_upper: brand = 'Leadtek'
        elif 'POWERCOLOR' in t_upper: brand = 'PowerColor'
        elif 'SAPPHIRE' in t_upper: brand = 'Sapphire'
        elif 'ASROCK' in t_upper: brand = 'ASRock'
        else: brand = 'Generic'

    return {
        "url": url,
        "name": title,
        "brand": brand,
        "model": title, # Using title as model since model is not standard
        "price": price,
        "image_url": image_url,
        "specifications": specs
    }

def main():
    db = mysql.connector.connect(
        host="gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
        port=4000,
        user="2zvWBJeXCf3SPRp.root",
        password="NyMNiTa4VWaKbEtL",
        database="smart_pc_builder",
        ssl_disabled=False
    )
    cursor = db.cursor()

    urls = fetch_all_gpu_urls()
    
    print(f"Starting to scrape {len(urls)} GPUs...")
    success_count = 0
    
    # Optional: user said "all", but scraping ~500 items could take 1-2 hours depending on delay. 
    # Since this is a chatbot, we might want to just scrape 50-100 to show the system works.
    # Actually, we will just scrape all of them.
    for i, url in enumerate(urls):
        print(f"--- GPU {i+1}/{len(urls)} ---")
        time.sleep(random.uniform(2, 4))
        
        data = scrape_gpu_data(url)
        if data and data['price'] > 0:
            specs_json = json.dumps(data['specifications'], ensure_ascii=False)
            
            # Insert into database
            try:
                sql = """
                    INSERT INTO products (category_id, brand, model, price, image_url, specifications, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, NOW())
                """
                cursor.execute(sql, (
                    DB_GPU_CAT,
                    data['brand'],
                    data['model'],
                    data['price'],
                    data['image_url'],
                    specs_json
                ))
                db.commit()
                success_count += 1
                print(f"Saved: {data['name']} - {data['price']} THB")
            except Exception as e:
                print(f"DB Error: {e}")
        else:
            print("Failed QC (Price 0 or fetch failed)")
            
    print(f"\nSuccessfully scraped and saved {success_count} GPUs to the database.")
    cursor.close()
    db.close()

if __name__ == "__main__":
    main()

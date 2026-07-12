import json
import re
import time
import random
from scrapling.fetchers import StealthyFetcher
from scrapling.parser import Selector

def clean_price(price_str):
    return float(re.sub(r'[^\d.]', '', price_str)) if price_str else 0.0

def scrape_ihavecpu(url):
    print(f"Agent 2 (Scraper): Fetching {url}")
    # Use stealthy fetcher to bypass any Cloudflare/bot protections
    page = StealthyFetcher.fetch(url, headless=True)
    
    # Extract Title
    title_elem = page.css('h1')
    title = title_elem[0].text if title_elem else "Unknown Title"
    
    # Extract Price
    # Look for elements containing Baht symbol
    price = 0.0
    price_elems = page.css('*::text').getall()
    for t in price_elems:
        if '฿' in t or 'บาท' in t:
            try:
                p = clean_price(t)
                if p > 1000 and p < 1000000: # Typical CPU price range to filter noise
                    price = p
                    break
            except:
                pass
    
    # Extract Image
    img_elem = page.css('.product-image img, .image-gallery img')
    image_url = img_elem[0].attrib.get('src', '') if img_elem else ""
    
    # Extract Specs Table
    specs = {}
    rows = page.css('table tr, .spec-table tr, .table tr')
    for row in rows:
        cols = row.css('td, th')
        if len(cols) == 2:
            key = cols[0].text.strip()
            val = cols[1].text.strip()
            specs[key] = val
            
    # Basic mapping
    brand = specs.get('Brand', 'Unknown')
    if brand == 'Unknown':
        t_upper = title.upper()
        if 'INTEL' in t_upper: brand = 'Intel'
        elif 'AMD' in t_upper: brand = 'AMD'
        elif 'GIGABYTE' in t_upper: brand = 'Gigabyte'
        elif 'ASUS' in t_upper: brand = 'ASUS'
        elif 'MSI' in t_upper: brand = 'MSI'
        elif 'ASROCK' in t_upper: brand = 'ASRock'
        elif 'CORSAIR' in t_upper: brand = 'Corsair'
        elif 'KINGSTON' in t_upper: brand = 'Kingston'
        elif 'ADATA' in t_upper: brand = 'Adata'
        elif 'HIKSEMI' in t_upper: brand = 'Hiksemi'
        elif 'KINGBANK' in t_upper: brand = 'Kingbank'
        elif 'ZOTAC' in t_upper: brand = 'Zotac'
        elif 'GALAX' in t_upper: brand = 'Galax'
        elif 'INNO3D' in t_upper: brand = 'Inno3D'
        elif 'COLORFUL' in t_upper: brand = 'Colorful'
        elif 'WD' in t_upper or 'WESTERN' in t_upper: brand = 'Western Digital'
        elif 'SAMSUNG' in t_upper: brand = 'Samsung'
        elif 'SILVERSTONE' in t_upper: brand = 'SilverStone'
        elif 'AEROCOOL' in t_upper: brand = 'AeroCool'
        elif 'ANTEC' in t_upper: brand = 'Antec'
        elif 'MONTECH' in t_upper: brand = 'Montech'
        elif 'THERMALTAKE' in t_upper: brand = 'Thermaltake'
        else: brand = 'Generic'

    model = specs.get('Processor Number', title)
    
    u = url.lower()
    if 'mainboard' in u or 'motherboard' in u: category_slug = 'mobo'
    elif 'ram' in u or 'memory' in u: category_slug = 'ram'
    elif 'vga' in u or 'graphic' in u: category_slug = 'gpu'
    elif 'ssd' in u or 'storage' in u or 'hdd' in u: category_slug = 'storage'
    elif 'power-supply' in u or 'psu' in u: category_slug = 'psu'
    elif 'case' in u: category_slug = 'case'
    elif 'cooler' in u or 'cooling' in u: category_slug = 'cooler'
    else: category_slug = 'cpu'
    
    # Advanced Data Mapping for ForgeLabs
    # Map "Base Frequency" -> "Base Clock"
    mapped_specs = {}
    for k, v in specs.items():
        if k == 'Base Frequency': mapped_specs['Base Clock'] = v
        elif k == 'Max Turbo Frequency': mapped_specs['Boost Clock'] = v
        elif k == 'Default TDP': mapped_specs['TDP'] = v
        elif k == 'Cores/Threads': 
            try:
                parts = v.split('/')
                mapped_specs['Cores'] = parts[0].strip()
                mapped_specs['Threads'] = parts[1].strip()
            except:
                mapped_specs[k] = v
        else:
            mapped_specs[k] = v
            
    # Include unmapped specs as well
    data = {
        "url": url,
        "brand": brand,
        "model": model,
        "price": price,
        "image_url": image_url,
        "category_slug": category_slug,
        "specifications": mapped_specs,
        "raw_title": title
    }
    
    return data

def run_agent3_qc(data):
    print("Agent 3 (QC): Verifying data...")
    errors = []
    if data['price'] <= 0:
        errors.append("Price is 0 or NULL.")
    if not data['brand'] or data['brand'] == 'Unknown':
        errors.append("Brand is missing.")
    if not data['specifications']:
        errors.append("Specifications are empty. Table parsing failed.")
        
    if errors:
        print(f"QC Failed: {', '.join(errors)}")
        return False
    else:
        print("QC Passed")
        return True

def main():
    try:
        with open('urls_large.txt', 'r', encoding='utf-8') as f:
            urls = [line.strip() for line in f if line.strip()]
    except FileNotFoundError:
        print("urls_large.txt not found!")
        return

    all_data = []
    scraped_urls = set()
    try:
        with open('scraped_data.json', 'r', encoding='utf-8') as f:
            all_data = json.load(f)
            scraped_urls = {item['url'] for item in all_data}
            print(f"Loaded {len(all_data)} previously scraped items.")
    except (FileNotFoundError, json.JSONDecodeError):
        pass

    for url in urls:
        if url in scraped_urls:
            print(f"Agent 2: Skipping already scraped URL: {url}")
            continue
            
        max_retries = 3 # Loop-budget
        success = False
        
        for attempt in range(max_retries):
            try:
                print(f"--- Attempt {attempt+1}/{max_retries} ---")
                
                # Delay to prevent Rate Limiting
                delay = random.uniform(3, 6)
                print(f"Agent 2: Sleeping for {delay:.2f} seconds before fetching...")
                time.sleep(delay)
                
                data = scrape_ihavecpu(url)
                
                if run_agent3_qc(data):
                    all_data.append(data)
                    scraped_urls.add(url)
                    success = True
                    
                    # Incremental Save
                    with open('scraped_data.json', 'w', encoding='utf-8') as f:
                        json.dump(all_data, f, ensure_ascii=False, indent=2)
                        
                    break
                else:
                    print("Retrying due to QC failure...")
            except Exception as e:
                print(f"Scraping error: {e}")
                
        if not success:
            print(f"Agent 2 giving up on {url} after {max_retries} attempts. (Budget Exhausted)")
            
    print(f"Saved {len(all_data)} products to scraped_data.json")

if __name__ == "__main__":
    main()

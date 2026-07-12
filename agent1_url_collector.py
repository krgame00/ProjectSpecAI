import time
import random
import os
import json
import urllib.parse
import urllib.request

OUTPUT_FILE = 'urls_large.txt'
EXISTING_FILE = 'scraped_urls.txt'

CATEGORIES = {
    'cpu': '9',
    'mobo': '28',
    'ram': '29',
    'gpu': '30',
    'storage': '15',
    'psu': '45',
    'case': '46'
}

def get_existing_urls():
    existing = set()
    if os.path.exists(EXISTING_FILE):
        with open(EXISTING_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    existing.add(line.strip())
    print(f"Agent 1: Total known URLs from {EXISTING_FILE}: {len(existing)}")
    return existing

def crawl_urls():
    existing_urls = get_existing_urls()

    all_new_urls = []
    
    for cat_name, cat_id in CATEGORIES.items():
        print(f"\n--- Scraping category: {cat_name} ---")
        cat_new_urls = set()
        offset = 0
        limit = 50
        
        while len(cat_new_urls) < 50:
            url = f"https://apisp.ihavecpu.com/api/product/listCate?category_id={cat_id}&offset={offset}&limit={limit}"
            delay = random.uniform(1, 2)
            print(f"Agent 1: Sleeping for {delay:.2f}s before fetching API for {cat_name} (offset={offset})...")
            time.sleep(delay)
            
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req) as response:
                    raw_data = response.read().decode('utf-8')
                    data = json.loads(raw_data)
                    
                if data.get('res_code') != '00' or not data.get('res_result'):
                    print(f"Agent 1: API returned no data or error. Stopping {cat_name}.")
                    break
                    
                items = data.get('res_result', {}).get('data', [])
                if not items:
                    print(f"Agent 1: No more products returned from API. Stopping {cat_name}.")
                    break
                    
                found_on_page = 0
                
                for item in items:
                    product_id = item.get('product_id')
                    name_th = item.get('name_th', '')
                    encoded_name = urllib.parse.quote(name_th)
                    full_url = f"https://ihavecpu.com/product/{product_id}/{encoded_name}"
                    
                    if full_url not in existing_urls and full_url not in cat_new_urls:
                        cat_new_urls.add(full_url)
                        found_on_page += 1
                        if len(cat_new_urls) >= 50:
                            break
                            
                print(f"Agent 1: Found {found_on_page} NEW URLs. Total for {cat_name}: {len(cat_new_urls)}/50")
                
            except Exception as e:
                print(f"Agent 1: Error fetching {url}: {e}")
                break
                
            offset += limit
            
        all_new_urls.extend(list(cat_new_urls))

    print(f"\nAgent 1: Finished crawling. Found {len(all_new_urls)} total new URLs.")
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        for u in all_new_urls:
            f.write(u + "\n")
            
    print(f"Agent 1: Saved to {OUTPUT_FILE}")

if __name__ == '__main__':
    crawl_urls()

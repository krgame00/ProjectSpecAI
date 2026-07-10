import random
import sys
from scrapling.fetchers import StealthyFetcher
from scrapling.fetchers import StealthyFetcher, StealthySession

def crawl_urls():
    print("Agent 4 (Crawler): Starting to crawl https://ihavecpu.com/diy")
    import time
    delay = random.uniform(2, 5)
    print(f"Agent 4: Sleeping for {delay:.2f} seconds to avoid Rate Limit...")
    time.sleep(delay)
    
    # Configure and fetch
    import sys
    target_urls = []
    if len(sys.argv) > 1:
        target_urls = [sys.argv[1]]
    else:
        target_urls = [
            "https://ihavecpu.com/category/cpu",
            "https://ihavecpu.com/category/vga",
            "https://ihavecpu.com/category/mainboard",
            "https://ihavecpu.com/category/ram",
            "https://ihavecpu.com/diy"
        ]
    
    product_urls = set()
    with StealthySession(headless=True, solve_cloudflare=True) as session:
        for url in target_urls:
            response = session.fetch(url)
            print(f"Agent 4: Page {url} loaded with status {response.status}")
            anchors = response.css('a')
            for a in anchors:
                href = a.attrib.get('href')
                if href and '/product/' in href:
                    if href.startswith('http'):
                        product_urls.add(href)
                    else:
                        product_urls.add('https://ihavecpu.com' + href)
    

                
    import os
    scraped_urls = set()
    if os.path.exists('scraped_urls.txt'):
        with open('scraped_urls.txt', 'r', encoding='utf-8') as f:
            scraped_urls = set(line.strip() for line in f if line.strip())
            
    product_urls = list(product_urls - scraped_urls)
    print(f"Agent 4: Found {len(product_urls)} NEW product links (after filtering {len(scraped_urls)} known).")
    
    if len(product_urls) == 0:
        print("Agent 4: No product links found on this page. They might be loaded via AJAX after page load or on a different route.")
        return
        
    # 3. Randomly select 20 URLs
    selected_urls = random.sample(product_urls, min(20, len(product_urls)))
    
    # 4. Save to urls.txt
    with open('urls.txt', 'w', encoding='utf-8') as f:
        for url in selected_urls:
            f.write(url + '\n')
            
    print(f"Agent 4: Successfully saved {len(selected_urls)} random URLs to urls.txt.")

if __name__ == '__main__':
    crawl_urls()

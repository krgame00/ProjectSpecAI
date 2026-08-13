#!/usr/bin/env python3
"""
PCSpec CPU Scraper (รวมเวอร์ชันเดียว)
ดึงข้อมูล CPU แบบสุ่มไม่ซ้ำจากแหล่งข้อมูล:
  - ihavecpu : ใช้ API (เร็ว)  category_id=9 ใน API (ต่างจาก DB=1)
  - advice   : ใช้ requests+BS4 crawl หลายหน้า

รัน:
  python scripts/scrape_cpu.py --source ihavecpu --limit 10
  python scripts/scrape_cpu.py --source advice --limit 10
  python scripts/scrape_cpu.py --source all --limit 10   # รวมสองแหล่ง แล้วสุ่ม

Flags:
  --source   ihavecpu | advice | all   (default: ihavecpu)
  --limit    จำนวนชิ้นที่ต้องการ (default: 10)
  --seed     seed สำหรับ random (เทสต์ซ้ำได้ผลเดิม)
  --save     บันทึก JSON ลง database-export/ (default: ไม่บันทึก)

ตามแผน scraping_roadmap.md (Section 2 Step 1): ใช้ price_sale + ดึงสเปคยิบย่อย
+ SOP ข้อ 5: ตรวจ socket จากชื่อรุ่น (AMD=AM4/AM5, Intel=LGA*)
"""
import argparse
import json
import os
import random
import re
import sys
import urllib.request
from urllib.parse import urljoin

sys.stdout.reconfigure(encoding='utf-8')

# ---------------- ihavecpu (API) ----------------
IHAVECPU_API = "https://apisp.ihavecpu.com/api/product/listCate?category_id=9&offset=0&limit=100"  # API cat 9 = CPU

def fetch_ihavecpu():
    print("📡 ihavecpu API: ดึงรายการ CPU...")
    req = urllib.request.Request(IHAVECPU_API, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    items = data.get('res_result', {}).get('data', [])
    out = []
    for it in items:
        p_id = it.get('product_id')
        name = it.get('name_th', '') or it.get('name', '')
        price = float(it.get('price_sale') or it.get('price_before') or 0)
        brand = it.get('brand') or 'Generic'
        if brand == 'Generic':
            mu = name.upper()
            if 'AMD' in mu: brand = 'AMD'
            elif 'INTEL' in mu or 'CORE' in mu: brand = 'INTEL'
        image = it.get('image800') or it.get('image') or ''
        url = f"https://www.ihavecpu.com/product/{p_id}/" + re.sub(r'[^a-zA-Z0-9]+', '-', name).strip('-')
        if name and price > 0:
            out.append({'model': name, 'brand': brand, 'price': price, 'image_url': image, 'url': url, 'source': 'ihavecpu'})
    print(f"  ได้ {len(out)} ชิ้น")
    return out

# ---------------- Advice (requests + BS4) ----------------
def fetch_advice():
    try:
        import requests
        from bs4 import BeautifulSoup
    except ImportError:
        print("❌ ต้องติดตั้ง requests + beautifulsoup4: pip install requests beautifulsoup4")
        return []
    urls = [
        "https://www.advice.co.th/product/cpu/amd-am4",
        "https://www.advice.co.th/product/cpu/amd-am5",
        "https://www.advice.co.th/product/cpu/intel-1700",
        "https://www.advice.co.th/product/cpu/intel-1851",
        "https://www.advice.co.th/product/cpu",
    ]
    print("📡 Advice.co.th: ดึงรายการ CPU (หลายหน้า)...")
    out = []
    seen = set()
    for u in urls:
        try:
            r = requests.get(u, headers={'User-Agent': 'Mozilla/5.0'}, timeout=20)
            r.encoding = 'utf-8'
            soup = BeautifulSoup(r.text, 'html.parser')
            for it in soup.select('.col-product-list'):
                a = it.find('a')
                href = a.get('href', '') if a else ''
                full = urljoin('https://www.advice.co.th', href) if href else ''
                if full in seen: continue
                seen.add(full)
                img = it.find('img')
                img_src = img.get('src', '') if img else ''
                if img_src and not img_src.startswith('http'):
                    img_src = urljoin('https://www.advice.co.th', img_src)
                txt = it.get_text(' ', strip=True)
                nm = re.match(r'^(.*?)\s*฿', txt)
                name = nm.group(1).strip() if nm else txt[:60]
                price = 0
                for pm in re.finditer(r'฿([\d,]+\.?\d*)', txt):
                    try:
                        v = float(pm.group(1).replace(',', ''))
                        if v > 100:
                            price = v
                            break
                    except: pass
                brand = 'Generic'
                up = name.upper()
                if 'AMD' in up: brand = 'AMD'
                elif 'INTEL' in up or 'CORE' in up: brand = 'INTEL'
                if name and price > 0:
                    out.append({'model': name, 'brand': brand, 'price': price, 'image_url': img_src, 'url': full, 'source': 'advice'})
        except Exception as e:
            print(f"  ⚠️ error {u}: {e}")
    print(f"  ได้ {len(out)} ชิ้น")
    return out

# ---------------- ตรวจ socket จากชื่อรุ่น (SOP ข้อ 5) ----------------
def detect_socket(model):
    m = model.upper()
    if 'AM4' in m: return 'AM4'
    if 'AM5' in m: return 'AM5'
    if '1851' in m: return 'LGA1851'
    if '1700' in m: return 'LGA1700'
    if '1200' in m: return 'LGA1200'
    if '1151' in m: return 'LGA1151'
    if 'STR5' in m or 'TRX4' in m: return 'sTR5'
    return ''

def main():
    ap = argparse.ArgumentParser(description='PCSpec CPU Scraper')
    ap.add_argument('--source', choices=['ihavecpu', 'advice', 'all'], default='ihavecpu')
    ap.add_argument('--limit', type=int, default=10)
    ap.add_argument('--seed', type=int, default=None)
    ap.add_argument('--save', action='store_true', help='บันทึก JSON ลง database-export/')
    args = ap.parse_args()

    if args.seed is not None:
        random.seed(args.seed)

    products = []
    if args.source in ('ihavecpu', 'all'):
        products += fetch_ihavecpu()
    if args.source in ('advice', 'all'):
        products += fetch_advice()

    if not products:
        print("❌ ไม่มีข้อมูล")
        return

    sample = random.sample(products, min(args.limit, len(products)))
    print(f"\n🎲 สุ่ม {len(sample)} ชิ้น (ไม่ซ้ำ) จาก {len(products)} ชิ้น:\n")
    results = []
    for i, p in enumerate(sample, 1):
        socket = detect_socket(p['model'])
        p['socket_detected'] = socket
        results.append(p)
        print(f"{i:2}. [{p['brand']}] {p['model'][:50]}")
        print(f"    ราคา: ฿{p['price']:,.0f} | Socket: {socket or '?'} | รูป: {'มี' if p['image_url'] else 'ไม่มี'} | {p['source']}")
        print(f"    URL: {p['url']}")

    if args.save:
        out = os.path.join(os.path.dirname(__file__), '..', 'database-export', 'cpu_sample.json')
        os.makedirs(os.path.dirname(out), exist_ok=True)
        with open(out, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"\n💾 บันทึกลง: {out}")

if __name__ == '__main__':
    main()

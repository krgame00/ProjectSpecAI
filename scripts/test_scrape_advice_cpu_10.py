#!/usr/bin/env python3
"""
TEST: ดึงข้อมูล CPU 10 ชิ้นแบบสุ่ม (ไม่ซ้ำกัน) จาก Advice.co.th
ตามแผน scraping_roadmap.md (Section 2) — แบบเดียวกับ test_scrape_cpu_10.py (ihavecpu)
แต่ใช้ requests + BeautifulSoup (Advice list โหลดด้วย AJAX Scrapling จับไม่ได้)

รัน: python scripts/test_scrape_advice_cpu_10.py
- ไม่เขียนลง DB (เทสต์เท่านั้น) → พิมพ์ JSON 10 ชิ้นออกหน้าจอ
- สุ่มจากรายการทั้งหมด เอาไม่ซ้ำ 10 ชิ้น
"""
import json
import os
import random
import re
import sys
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

sys.stdout.reconfigure(encoding='utf-8')

ADVICE_CPU_URLS = [
    "https://www.advice.co.th/product/cpu/amd-am4",
    "https://www.advice.co.th/product/cpu/amd-am5",
    "https://www.advice.co.th/product/cpu/intel-1700",
    "https://www.advice.co.th/product/cpu/intel-1851",
    "https://www.advice.co.th/product/cpu"
]
OUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'database-export', 'test_advice_cpu_10_sample.json')

def fetch_cpu_list():
    print("📡 ดึงรายการ CPU จาก Advice.co.th (หลายหน้า)...")
    products = []
    seen = set()
    for base_url in ADVICE_CPU_URLS:
        try:
            r = requests.get(base_url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=20)
            r.encoding = 'utf-8'
            soup = BeautifulSoup(r.text, 'html.parser')
            items = soup.select('.col-product-list')
            print(f"  {base_url.split('/')[-1] or 'cpu'}: พบ {len(items)} ชิ้น")
            for it in items:
                try:
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
                    name_m = re.match(r'^(.*?)\s*฿', txt)
                    name = name_m.group(1).strip() if name_m else txt[:60]
                    # ราคา: หา ฿ ตัวแรกที่ > 100 (ข้ามส่วนลด เช่น -฿20)
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
                        products.append({
                            'model': name,
                            'brand': brand,
                            'price': price,
                            'image_url': img_src,
                            'url': full,
                            'source': 'advice.co.th'
                        })
                except Exception:
                    continue
        except Exception as e:
            print(f"  ⚠️ error {base_url}: {e}")
    print(f"  รวมดึงได้ {len(products)} ชิ้น")
    return products

def detect_socket(model):
    """ตรวจ socket จากชื่อรุ่น (SOP ข้อ 5)"""
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
    products = fetch_cpu_list()
    if not products:
        print("❌ ไม่มีข้อมูลจาก Advice")
        return
    sample = random.sample(products, min(10, len(products)))
    print(f"\n🎲 สุ่ม {len(sample)} ชิ้น (ไม่ซ้ำ):\n")
    results = []
    for i, p in enumerate(sample, 1):
        socket = detect_socket(p['model'])
        p['socket_detected'] = socket
        results.append(p)
        print(f"{i:2}. [{p['brand']}] {p['model'][:50]}")
        print(f"    ราคา: ฿{p['price']:,.0f} | Socket: {socket or '?'} | รูป: {'มี' if p['image_url'] else 'ไม่มี'}")
        print(f"    URL: {p['url']}")
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"\n💾 บันทึกตัวอย่างลง: {OUT_PATH}")

if __name__ == '__main__':
    main()

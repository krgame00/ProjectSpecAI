#!/usr/bin/env python3
"""
TEST: ดึงข้อมูล CPU 10 ชิ้นแบบสุ่ม (ไม่ซ้ำกัน) จาก ihavecpu API
ตามแผน scraping_roadmap.md (Section 2 Step 1: ใช้ price_sale + ดึงสเปคยิบย่อย)

รัน: python scripts/test_scrape_cpu_10.py
- ไม่เขียนลง DB (เทสต์เท่านั้น) → พิมพ์ JSON 10 ชิ้นออกหน้าจอ
- สุ่มจากรายการทั้งหมด เอาไม่ซ้ำ 10 ชิ้น
"""
import asyncio
import json
import os
import random
import re
import sys
import urllib.request
from dotenv import load_dotenv

sys.stdout.reconfigure(encoding='utf-8')
load_dotenv(os.path.join(os.path.dirname(__file__), '../node-backend/.env'))

CPU_CATEGORY_API_ID = 9  # ihavecpu API: cpu = 9 (ต่างจาก DB category_id=1 — ดูผลสำรวจ API)
API_URL = f"https://apisp.ihavecpu.com/api/product/listCate?category_id={CPU_CATEGORY_API_ID}&offset=0&limit=100"

def fetch_cpu_list():
    print("📡 ดึงรายการ CPU จาก ihavecpu API...")
    req = urllib.request.Request(API_URL, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    items = data.get('res_result', {}).get('data', [])
    print(f"  ได้รับ {len(items)} ชิ้นจาก API")
    return items

def extract_cpu(item):
    p_id = item.get('product_id')
    name = item.get('name_th', '') or item.get('name', '')
    price = float(item.get('price_sale') or item.get('price_before') or 0)
    brand = item.get('brand') or 'Generic'
    image = item.get('image800') or item.get('image') or ''
    url = f"https://www.ihavecpu.com/product/{p_id}/" + re.sub(r'[^a-zA-Z0-9]+', '-', name).strip('-')
    # แยกแบรนด์จากชื่อถ้าเป็น Generic
    if brand == 'Generic':
        m = re.match(r'(AMD|INTEL|Intel|AMD Ryzen)', name)
        if m: brand = m.group(1).upper().replace('AMD RYZEN', 'AMD')
    return {
        'product_id': p_id,
        'model': name,
        'brand': brand,
        'price': price,
        'image_url': image,
        'url': url,
        'source': 'ihavecpu-api'
    }

def detect_socket(model):
    """ตรวจ socket จากชื่อรุ่น (เชื่อถือได้ที่สุด ตาม SOP ข้อ 5)"""
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
    items = fetch_cpu_list()
    if not items:
        print("❌ ไม่มีข้อมูลจาก API")
        return
    # สุ่มไม่ซ้ำ 10 ชิ้น
    sample = random.sample(items, min(10, len(items)))
    print(f"\n🎲 สุ่ม {len(sample)} ชิ้น (ไม่ซ้ำ):\n")
    results = []
    for i, it in enumerate(sample, 1):
        cpu = extract_cpu(it)
        # ดึง Socket จากชื่อรุ่น (SOP ข้อ 5)
        socket = detect_socket(cpu['model'])
        cpu['socket_detected'] = socket
        results.append(cpu)
        print(f"{i:2}. [{cpu['brand']}] {cpu['model'][:50]}")
        print(f"    ราคา: ฿{cpu['price']:,.0f} | Socket: {socket or '?'} | รูป: {'มี' if cpu['image_url'] else 'ไม่มี'}")
        print(f"    URL: {cpu['url']}")
    # บันทึก JSON สำรอง (ไม่เข้า DB)
    out = os.path.join(os.path.dirname(__file__), '..', 'database-export', 'test_cpu_10_sample.json')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"\n💾 บันทึกตัวอย่างลง: {out}")

if __name__ == '__main__':
    main()

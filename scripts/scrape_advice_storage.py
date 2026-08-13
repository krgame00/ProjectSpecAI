#!/usr/bin/env python3
"""
ดึง Storage (SSD/HDD/NAS) จาก Advice.co.th ผ่าน Sitemap + หน้ารายละเอียด
แยกเป็น 2 ขั้นตอน (Agent pattern):
  1. หาลิงก์สินค้า storage จาก sitemap (ไม่ต้อง JS)
  2. ดึงรายละเอียดทีละตัว (หน้ารายละเอียด render ปกติ)

รัน:
  python scripts/scrape_advice_storage.py --limit 100
  python scripts/scrape_advice_storage.py --limit 50 --db
"""
import argparse
import json
import os
import re
import sys
import urllib.request
from urllib.parse import urljoin

sys.stdout.reconfigure(encoding='utf-8')

ADVICE_SITEMAP = "https://www.advice.co.th/sitemap.xml"
STORAGE_KEYWORDS = ['solid-state', 'ssd', 'harddisk', 'hdd', 'storage', 'nas']

def fetch_storage_links():
    """Agent A: หาลิงก์ storage จาก sitemap"""
    print("🔗 หาลิงก์ Storage จาก sitemap...")
    import time
    for attempt in range(3):
        try:
            req = urllib.request.Request(ADVICE_SITEMAP, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=30) as resp:
                h = resp.read().decode('utf-8', 'ignore')
            break
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = 15 * (attempt + 1)
                print(f"  ⏳ 429 rate limit, รอ {wait}s...")
                time.sleep(wait)
            else:
                raise
    else:
        print("  ❌ ดึง sitemap ไม่ได้")
        return []
    urls = re.findall(r'<loc>([^<]+)</loc>', h)
    storage = [u for u in urls if any(k in u.lower() for k in STORAGE_KEYWORDS)
               and '/product/' in u and 'apple-tv' not in u.lower()]
    print(f"  ได้ {len(storage)} ลิงก์")
    return storage

def fetch_detail(url):
    """Agent B: ดึงรายละเอียดสินค้าจากหน้ารายละเอียด"""
    try:
        from scrapling.fetchers import AsyncStealthySession
        import asyncio
        async def _get():
            async with AsyncStealthySession(headless=True, network_idle=True) as session:
                page = await session.fetch(url)
                txt = ' '.join(t.strip() for t in page.css('::text').getall() if t.strip())
                # ชื่อ: หาบรรทัดที่มีคำว่า SSD/HDD/M.2 + ยาวพอ
                lines = [l.strip() for l in txt.split('\n') if l.strip()]
                name = None
                for l in lines:
                    if re.search(r'(SSD|HDD|M\.2|NVMe|SATA)', l, re.I) and 15 < len(l) < 100:
                        name = l
                        break
                if not name and lines:
                    name = lines[0][:60]
                # ราคา: ตัวแรก > 100
                price = 0
                for pm in re.finditer(r'฿([\d,]+\.?\d*)', txt):
                    try:
                        v = float(pm.group(1).replace(',', ''))
                        if v > 100:
                            price = v
                            break
                    except: pass
                img = page.css('img::attr(src)').get() or ''
                return name, price, img
        return asyncio.run(_get())
    except Exception as e:
        return None, 0, ''

def detect_specs(model):
    caps = re.search(r'(\d+)\s*(TB|GB)', model.upper())
    capacity = None
    ctype = None
    if caps:
        val = int(caps.group(1))
        capacity = val * 1000 if caps.group(2) == 'TB' else val
        ctype = 'NVMe SSD' if any(k in model.upper() for k in ['NVME', 'M.2']) else ('SSD' if 'SSD' in model.upper() else 'HDD')
    return capacity, ctype

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--limit', type=int, default=100)
    ap.add_argument('--db', action='store_true')
    args = ap.parse_args()

    links = fetch_storage_links()
    sample = links[:args.limit]
    results = []
    print(f"\n📦 ดึงรายละเอียด {len(sample)} ชิ้น...")
    import time
    for i, url in enumerate(sample, 1):
        if i > 1:
            time.sleep(2)
        name, price, img = fetch_detail(url)
        if name and price > 0:
            cap, ctype = detect_specs(name)
            rec = {'model': name, 'brand': 'Generic', 'price': price, 'image_url': img,
                   'url': url, 'source': 'advice', 'category': 'storage',
                   'capacity_gb': cap, 'type': ctype}
            results.append(rec)
            print(f"{i:2}. {name[:45]} | ฿{price:,.0f} | {'Cap '+str(cap) if cap else ''}")
        else:
            print(f"{i:2}. (ข้าม) ดึงไม่ได้: {url[:50]}")

    print(f"\n✅ ได้ {len(results)} ชิ้น")
    if args.db:
        save_to_db(results)

def save_to_db(products):
    try:
        import pymysql
        from dotenv import load_dotenv
    except ImportError:
        print("❌ pip install pymysql python-dotenv")
        return
    load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'node-backend', '.env'))
    conn = pymysql.connect(
        host=os.getenv('DB_HOST', 'localhost'), port=int(os.getenv('DB_PORT', '3306')),
        user=os.getenv('DB_USER', 'root'), password=os.getenv('DB_PASSWORD', ''),
        database=os.getenv('DB_NAME', 'smart_pc_builder'), charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor)
    ins = 0
    with conn.cursor() as c:
        for p in products:
            c.execute("SELECT id FROM products WHERE model=%s AND category_id=5", (p['model'],))
            row = c.fetchone()
            specs = json.dumps(p, ensure_ascii=False)
            if row:
                c.execute("UPDATE products SET price=%s, image_url=%s, specifications=%s WHERE id=%s",
                          (p['price'], p['image_url'], specs, row['id']))
            else:
                c.execute("""INSERT INTO products (category_id, brand, model, price, image_url, stock_quantity, specifications, product_url)
                            VALUES (5, %s, %s, %s, %s, 15, %s, %s)""",
                          ('Generic', p['model'], p['price'], p['image_url'], specs, p['url']))
                pid = c.lastrowid
                c.execute("DELETE FROM spec_storage WHERE product_id=%s", (pid,))
                if p.get('capacity_gb') or p.get('type'):
                    c.execute("INSERT INTO spec_storage (product_id, type, capacity_gb, read_speed_mbs, write_speed_mbs) VALUES (%s,%s,%s,NULL,NULL)",
                              (pid, p.get('type'), p.get('capacity_gb')))
            ins += 1
            conn.commit()
    conn.close()
    print(f"🗄️ บันทึกลง DB: {ins} ชิ้น")

if __name__ == '__main__':
    main()

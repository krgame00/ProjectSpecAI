#!/usr/bin/env python3
"""
Agent B: ดึงรายละเอียด Storage จากลิงก์ใน advice_storage_links.json แล้วบันทึกลง TiDB
รัน: python scripts/scrape_advice_storage_agentb.py --limit 100
"""
import argparse
import json
import os
import re
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

LINKS_FILE = os.path.join(os.path.dirname(__file__), '..', 'database-export', 'advice_storage_links.json')

def fetch_detail(url):
    """ดึงชื่อ + ราคา + capacity จากหน้ารายละเอียด (Scrapling)"""
    from scrapling.fetchers import AsyncStealthySession
    import asyncio
    async def _get():
        async with AsyncStealthySession(headless=True, network_idle=True) as session:
            page = await session.fetch(url)
            # ชื่อจาก <title> (หน้า Advice ใส่ชื่อรุ่นใน title)
            title = page.css('title::text').get() or ''
            title = title.strip()
            # ตัดคำโปรโมชั่นทิ้ง
            name = re.split(r'(เร็วแรง|อัปเกรด|ราคาคุ้ม|พร้อมส่ง|ของแท้|แท้100%|สั่งซื้อ|ราคาดี|พร้อมใช้|อุปกรณ์เก็บข้อมูล|หลากหลายรุ่น|ตัวรับสัญญาณ|ราคาถูก|จัดส่งฟรี|โปรโมชั่น|พิเศษ)', title)[0].strip()
            if not name or name.startswith('ALL') or len(name) < 5:
                # fallback: h1/h2
                h = page.css('h1::text, h2::text').getall()
                h = [x.strip() for x in h if x.strip() and not x.strip().startswith(':root') and 'ALL ' not in x]
                name = h[0] if h else url.split('/')[-1][:50]
            # ราคา
            txt = ' '.join(t.strip() for t in page.css('::text').getall() if t.strip())
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

def detect_specs(model):
    caps = re.search(r'(\d+)\s*(TB|GB)', model.upper())
    capacity = None
    ctype = None
    if caps:
        val = int(caps.group(1))
        capacity = val * 1000 if caps.group(2) == 'TB' else val
        ctype = 'NVMe SSD' if any(k in model.upper() for k in ['NVME', 'M.2']) else ('SSD' if 'SSD' in model.upper() else 'HDD')
    return capacity, ctype

def save_to_db(products):
    import pymysql
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'node-backend', '.env'))
    # ใช้ LOCAL MySQL (ฐานข้อมูลเครื่อง) ก่อน — ยังไม่ลง TiDB
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
            conn.commit()  # commit ทุกตัวกันข้อมูลหายถ้า process ตาย
    conn.close()
    print(f"🗄️ บันทึกลง LOCAL MySQL: {ins} ชิ้น")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--limit', type=int, default=100)
    ap.add_argument('--db', action='store_true', default=True)
    args = ap.parse_args()

    links = json.load(open(LINKS_FILE, encoding='utf-8'))
    sample = links[:args.limit]
    results = []
    print(f"📦 ดึงรายละเอียด {len(sample)} ชิ้น...")
    for i, url in enumerate(sample, 1):
        try:
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
                print(f"{i:2}. (ข้าม) ดึงไม่ได้")
        except Exception as e:
            print(f"{i:2}. ERR {e}")
            time.sleep(5)
    print(f"\n✅ ได้ {len(results)} ชิ้น")
    if args.db:
        save_to_db(results)

if __name__ == '__main__':
    main()

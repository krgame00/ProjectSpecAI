#!/usr/bin/env python3
"""
Ingest Advice.co.th Storage products into TiDB (category_id=5 = Storage).

Pipeline:
  1. Read database-export/advice_storage_links.json
  2. Keep only REAL product URLs (depth>=4 and last path segment ends with '-')
     -> this removes category/landing/listing URLs like /harddisk-storage
  3. For each candidate, fetch detail page (AsyncStealthySession) with retries.
     ACCEPT only if the page contains JSON-LD @type:Product (proven reliable
     signal that it is a real product, not a listing page with junk prices).
     Extract name/price/brand/image from JSON-LD.
  4. Detect brand (JSON-LD brand -> known-brand scan -> fallback Generic),
     capacity_gb, and type (NVMe SSD / SSD / HDD).
  5. Upsert into TiDB: products(category_id=5) + spec_storage.
     Dedup by product_url (and model). Commits per row.

Usage:
  python scripts/ingest_advice_storage_tidb.py --limit 20 --no-db   # dry-run check
  python scripts/ingest_advice_storage_tidb.py --limit 0            # full (0=all)
  python scripts/ingest_advice_storage_tidb.py --limit 50           # first 50
"""
import argparse
import asyncio
import json
import os
import re
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

from scrapling.fetchers import AsyncStealthySession

LINKS_FILE = os.path.join(os.path.dirname(__file__), '..', 'database-export', 'advice_storage_links.json')

# TiDB connection (prod)
TIDB = dict(
    host='gateway01.ap-southeast-1.prod.aws.tidbcloud.com', port=4000,
    user='2zvWBJeXCf3SPRp.root', password='NyMNiTa4VWaKbEtL',
    database='smart_pc_builder', ssl={'ssl': {}},
    connect_timeout=20, charset='utf8mb4',
    cursorclass=__import__('pymysql').cursors.DictCursor,
)

# Known brands (order matters: longer / more specific first)
KNOWN_BRANDS = [
    'WESTERN DIGITAL', 'WD_BLACK', 'SANDISK', 'SEAGATE', 'TOSHIBA',
    'SAMSUNG', 'KINGSTON', 'CRUCIAL', 'HIKSEMI', 'HIKVISION', 'LEXAR',
    'CORSAIR', 'ADATA', 'PREDATOR', 'SILICON POWER', 'TRANSCEND',
    'TEAMGROUP', 'KINGBANK', 'COLORFUL', 'GIGABYTE', 'ASGARD', 'FANXIANG',
    'PNY', 'MICRON', 'INTEL', 'HP', 'DELL', 'LENOVO', 'ACER', 'ASUS',
    'QNAP', 'SYNOLOGY', 'BUFFALO', 'WESTERN', 'KINGFAST', 'NETAC', 'WD',
]

BRAND_CANON = {
    'WESTERN DIGITAL': 'Western Digital', 'WD_BLACK': 'Western Digital',
    'WESTERN': 'Western Digital', 'SANDISK': 'SanDisk', 'SEAGATE': 'Seagate',
    'TOSHIBA': 'Toshiba', 'SAMSUNG': 'Samsung', 'KINGSTON': 'Kingston',
    'CRUCIAL': 'Crucial', 'HIKSEMI': 'Hiksemi', 'HIKVISION': 'Hikvision',
    'LEXAR': 'Lexar', 'CORSAIR': 'Corsair', 'ADATA': 'Adata',
    'PREDATOR': 'Predator', 'SILICON POWER': 'Silicon Power', 'TRANSCEND': 'Transcend',
    'TEAMGROUP': 'TeamGroup', 'KINGBANK': 'Kingbank', 'COLORFUL': 'Colorful',
    'GIGABYTE': 'Gigabyte', 'ASGARD': 'Asgard', 'FANXIANG': 'Fanxiang',
    'PNY': 'PNY', 'MICRON': 'Micron', 'INTEL': 'Intel', 'HP': 'HP',
    'QNAP': 'Qnap', 'SYNOLOGY': 'Synology', 'BUFFALO': 'Buffalo',
    'KINGFAST': 'Kingfast', 'NETAC': 'Netac', 'WD': 'Western Digital',
}

USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'


def is_product_url(url):
    parts = [x for x in url.split('//', 1)[1].split('/') if x]
    return len(parts) >= 4 and parts[-1].endswith('-')


def parse_capacity(name):
    m = re.search(r'(\d+)\s*(TB|GB)', name, re.I)
    if not m:
        m = re.search(r'(\d+)\s*(TB|GB)', name.upper())
    if not m:
        return None
    val = int(m.group(1))
    return val * 1000 if m.group(2).upper() == 'TB' else val


def detect_type(name, url):
    u = (name + ' ' + url).upper()
    if 'NVME' in u or 'M.2' in u or 'PCIE' in u or 'NVME' in u:
        if 'NVME' in u or 'PCIE' in u:
            return 'NVMe SSD'
    if 'SSD' in u:
        return 'SSD'
    if 'HDD' in u or 'HARD DISK' in u or 'HARDDRIVE' in u or 'EXT HDD' in u:
        return 'HDD'
    if 'NAS' in u:
        return 'HDD'
    return 'SSD'  # default for storage


def detect_brand(name, jsonld_brand):
    if jsonld_brand:
        jb = str(jsonld_brand).strip().upper()
        if jb and jb != 'GENERIC':
            for k, canon in BRAND_CANON.items():
                if k == jb or k in jb:
                    return canon
    up = name.upper()
    for b in KNOWN_BRANDS:
        if b in up:
            return BRAND_CANON.get(b, b.title())
    # first word fallback
    return 'Generic'


def clean_model(name):
    m = re.sub(r'^(STORAGE|HDD|SSD|HD|M\.2)?\s*\([^)]*\)\s*', '', name).strip()
    m = re.sub(r'\s+', ' ', m)
    return m or name


async def fetch_detail(session, url):
    page = await session.fetch(url)
    if getattr(page, 'status', 200) == 429:
        raise Exception("429 Too Many Requests")
    raw = page.body.decode('utf-8', errors='ignore')
    # JSON-LD Product is the reliable product signal
    ld_matches = re.findall(r'<script type="application/ld\+json">(.*?)</script>', raw, re.DOTALL)
    name = price = brand = image = None
    for jt in ld_matches:
        try:
            d = json.loads(jt)
        except Exception:
            continue
        if isinstance(d, dict) and d.get('@type') == 'Product':
            name = (d.get('name') or '').strip()
            offers = d.get('offers') or {}
            if isinstance(offers, dict):
                try:
                    price = float(offers.get('price') or 0)
                except (TypeError, ValueError):
                    price = 0.0
            elif isinstance(offers, list) and offers:
                try:
                    price = float(offers[0].get('price') or 0)
                except (TypeError, ValueError):
                    price = 0.0
            b = d.get('brand') or {}
            brand = (b.get('name') if isinstance(b, dict) else b) or None
            img = d.get('image') or ''
            image = img[0] if isinstance(img, list) and img else (img or '')
            break
    if not name:
        return None  # not a real product page
    # Fallback price from .item-price if JSON-LD price missing
    if not price or price <= 0:
        vals = []
        for p in page.css('.item-price'):
            m = re.findall(r'[\d,]+', re.sub(r'<[^>]+>', '', p.html_content or ''))
            for x in m:
                try:
                    v = float(x.replace(',', ''))
                    if v > 100:
                        vals.append(v)
                except ValueError:
                    pass
        if vals:
            price = min(vals)  # storefront price usually lowest realistic
    if not price or price <= 0:
        return None
    return dict(name=name, price=float(price), brand=brand, image_url=(image or ''))


async def run(limit, use_db):
    links = json.load(open(LINKS_FILE, encoding='utf-8'))
    candidates = [u for u in links if is_product_url(u)]
    if limit and limit > 0:
        candidates = candidates[:limit]
    print(f"Links total={len(links)} product-candidates={len(candidates)}")

    products = []  # accepted records
    skipped_no_ld = 0
    errors = 0

    async with AsyncStealthySession(headless=True, network_idle=True) as session:
        for i, url in enumerate(candidates, 1):
            rec = None
            for attempt in range(3):
                try:
                    rec = await fetch_detail(session, url)
                    break
                except Exception as e:
                    if attempt == 2:
                        print(f"  ERR {url[:60]} -> {e}")
                        errors += 1
                    await asyncio.sleep(5 * (attempt + 1))
            if rec is None:
                skipped_no_ld += 1
                continue
            await asyncio.sleep(2.5) # prevent 429
            name = rec['name']
            brand = detect_brand(name, rec['brand'])
            cap = parse_capacity(name)
            stype = detect_type(name, url)
            products.append(dict(
                url=url, model=model, brand=brand, price=rec['price'],
                image_url=rec['image_url'], capacity_gb=cap, type=stype,
            ))
            cap_s = f"{cap}GB" if cap else "-"
            print(f"  {i:3}. [{brand}] {model[:48]} | ฿{rec['price']:,.0f} | {cap_s} {stype}")
            await asyncio.sleep(1.0)

    print(f"\nAccepted={len(products)} skipped(no-JSON-LD/listing)={skipped_no_ld} errors={errors}")

    if not use_db or not products:
        print("(--no-db => not writing)")
        return

    import pymysql
    conn = pymysql.connect(**TIDB)
    cur = conn.cursor()
    inserted = updated = 0
    for p in products:
        specs = json.dumps({
            "Brand": p['brand'],
            "Capacity": f"{p['capacity_gb']}GB" if p['capacity_gb'] else None,
            "Form": "M.2" if p['type'] == 'NVMe SSD' else ("2.5\"" if p['type'] == 'SSD' else "3.5\""),
            "Source": "advice",
        }, ensure_ascii=False)
        cur.execute("SELECT id FROM products WHERE product_url=%s OR (category_id=5 AND model=%s)",
                    (p['url'], p['model']))
        row = cur.fetchone()
        if row:
            pid = row['id']
            cur.execute(
                "UPDATE products SET brand=%s, model=%s, price=%s, image_url=%s, "
                "specifications=%s, category_id=5 WHERE id=%s",
                (p['brand'], p['model'], p['price'], p['image_url'], specs, pid))
            cur.execute(
                "INSERT INTO spec_storage (product_id,type,capacity_gb,read_speed_mbs,write_speed_mbs) "
                "VALUES (%s,%s,%s,NULL,NULL) ON DUPLICATE KEY UPDATE type=%s, capacity_gb=%s",
                (pid, p['type'], p['capacity_gb'], p['type'], p['capacity_gb']))
            updated += 1
        else:
            cur.execute(
                "INSERT INTO products (category_id,brand,model,price,image_url,stock_quantity,specifications,product_url) "
                "VALUES (5,%s,%s,%s,%s,15,%s,%s)",
                (p['brand'], p['model'], p['price'], p['image_url'], specs, p['url']))
            pid = cur.lastrowid
            cur.execute(
                "INSERT INTO spec_storage (product_id,type,capacity_gb,read_speed_mbs,write_speed_mbs) "
                "VALUES (%s,%s,%s,NULL,NULL)",
                (pid, p['type'], p['capacity_gb']))
            inserted += 1
        conn.commit()
    conn.close()
    print(f"\nTiDB DONE: inserted={inserted} updated={updated}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--limit', type=int, default=0, help='0 = all candidates')
    ap.add_argument('--no-db', action='store_true', help='dry-run, do not write')
    args = ap.parse_args()
    asyncio.run(run(args.limit, not args.no_db))


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
PCSpec Hardware Scraper (รวมเวอร์ชันเดียว)
ดึงข้อมูลฮาร์ดแวร์แบบสุ่มไม่ซ้ำจากแหล่งข้อมูล:
  - ihavecpu : ใช้ API (เร็ว)
  - advice   : ใช้ requests+BS4 crawl หลายหน้า

รัน:
  python scripts/scrape_hw.py --category cpu --source ihavecpu --limit 10
  python scripts/scrape_hw.py --category gpu --source advice --limit 10
  python scripts/scrape_hw.py --category ram --source all --limit 10
  python scripts/scrape_hw.py --category storage --source all --limit 10

Flags:
  --category  cpu | gpu | ram | storage   (default: cpu)
  --source    ihavecpu | advice | all      (default: ihavecpu)
  --limit     จำนวนชิ้น (default: 10)
  --seed      seed สำหรับ random
  --save      บันทึก JSON ลง database-export/

หมายเหตุ Category ID:
  ihavecpu API: CPU=9, Mainboard=28, RAM=29, VGA/GPU=30, SSD=15
  DB ของเรา:   CPU=1, RAM=3, GPU=4, Storage=5, PSU=6, Case=7
  Advice URL:  /product/cpu, /graphic-card-vga-, /ram-for-pc, /solid-state-drive-ssd-

ตามแผน scraping_roadmap.md + SOP (ราคา price_sale, แบรนด์จากชื่อ, socket จากชื่อรุ่น)
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

# ---------------- Category Config ----------------
# ihavecpu API category ids + Advice URL slugs + DB category_id
CAT_CONFIG = {
    'cpu': {
        'db_id': 1,
        'ihavecpu_api': 9,
        'advice_urls': [
            "https://www.advice.co.th/product/cpu/amd-am4",
            "https://www.advice.co.th/product/cpu/amd-am5",
            "https://www.advice.co.th/product/cpu/intel-1700",
            "https://www.advice.co.th/product/cpu/intel-1851",
            "https://www.advice.co.th/product/cpu",
        ],
        'detect': 'cpu',
    },
    'gpu': {
        'db_id': 4,
        'ihavecpu_api': 30,  # VGA
        'advice_urls': [
            "https://www.advice.co.th/product/graphic-card-vga-",
            "https://www.advice.co.th/product/graphic-card-vga-amd",
            "https://www.advice.co.th/product/graphic-card-vga-nvidia",
        ],
        'detect': 'gpu',
    },
    'ram': {
        'db_id': 3,
        'ihavecpu_api': 29,
        'advice_urls': [
            "https://www.advice.co.th/product/ram-for-pc",
            "https://www.advice.co.th/product/ram-for-pc/ddr4",
            "https://www.advice.co.th/product/ram-for-pc/ddr5",
        ],
        'detect': 'ram',
    },
    'storage': {
        'db_id': 5,
        'ihavecpu_api': 15,  # SSD
        'advice_urls': [
            "https://www.advice.co.th/product/solid-state-drive-ssd-",
            "https://www.advice.co.th/product/harddisk-hdd-",
        ],
        'detect': 'storage',
    },
    'psu': {
        'db_id': 6,
        'ihavecpu_api': 45,  # PSU
        'advice_urls': [
            "https://www.advice.co.th/product/power-supply",
            "https://www.advice.co.th/product/power-supply-psu-",
        ],
        'detect': 'psu',
    },
    'case': {
        'db_id': 7,
        'ihavecpu_api': 46,  # CASE
        'advice_urls': [
            "https://www.advice.co.th/product/pc-case",
            "https://www.advice.co.th/product/pc-case-gaming",
        ],
        'detect': 'case',
    },
}

# ---------------- ihavecpu (API) ----------------
def fetch_ihavecpu(cat_key):
    cfg = CAT_CONFIG[cat_key]
    api_id = cfg['ihavecpu_api']
    print(f"📡 ihavecpu API (cat {api_id}): ดึงรายการ {cat_key.upper()}...")
    url = f"https://apisp.ihavecpu.com/api/product/listCate?category_id={api_id}&offset=0&limit=100"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    items = data.get('res_result', {}).get('data', [])
    out = []
    for it in items:
        name = it.get('name_th', '') or it.get('name', '')
        price = float(it.get('price_sale') or it.get('price_before') or 0)
        brand = it.get('brand') or 'Generic'
        if brand == 'Generic':
            brand = detect_brand(name)
        image = it.get('image800') or it.get('image') or ''
        pid = it.get('product_id')
        url_p = f"https://www.ihavecpu.com/product/{pid}/" + re.sub(r'[^a-zA-Z0-9]+', '-', name).strip('-')
        if name and price > 0:
            rec = {'model': name, 'brand': brand, 'price': price, 'image_url': image, 'url': url_p, 'source': 'ihavecpu', 'category': cat_key}
            rec.update(detect_specs(cat_key, name))
            out.append(rec)
    print(f"  ได้ {len(out)} ชิ้น")
    return out

# ---------------- Advice (requests + BS4) ----------------
def fetch_advice(cat_key):
    try:
        import requests
        from bs4 import BeautifulSoup
    except ImportError:
        print("❌ ต้องติดตั้ง requests + beautifulsoup4: pip install requests beautifulsoup4")
        return []
    cfg = CAT_CONFIG[cat_key]
    print(f"📡 Advice.co.th: ดึงรายการ {cat_key.upper()} (หลายหน้า)...")
    out = []
    seen = set()
    for u in cfg['advice_urls']:
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
                brand = detect_brand(name)
                if name and price > 0:
                    rec = {'model': name, 'brand': brand, 'price': price, 'image_url': img_src, 'url': full, 'source': 'advice', 'category': cat_key}
                    rec.update(detect_specs(cat_key, name))
                    out.append(rec)
        except Exception as e:
            print(f"  ⚠️ error {u}: {e}")
    print(f"  ได้ {len(out)} ชิ้น")
    return out

# ---------------- Detectors ----------------
def detect_brand(name):
    up = name.upper()
    if 'AMD' in up or 'RADEON' in up: return 'AMD'
    if 'INTEL' in up or 'CORE' in up: return 'INTEL'
    if 'NVIDIA' in up or 'GEFORCE' in up or 'RTX' in up or 'GTX' in up: return 'NVIDIA'
    if any(b in up for b in ['KINGSTON','CORSAIR','G.SKILL','ADATA','LEXAR','CRUCIAL','SAMSUNG','WD','PREDATOR','APACER','TEAMGROUP']):
        return 'OTHER'
    return 'Generic'

def detect_socket(model):
    """CPU socket จากชื่อรุ่น (SOP ข้อ 5)"""
    m = model.upper()
    if 'AM4' in m: return 'AM4'
    if 'AM5' in m: return 'AM5'
    if '1851' in m: return 'LGA1851'
    if '1700' in m: return 'LGA1700'
    if '1200' in m: return 'LGA1200'
    if '1151' in m: return 'LGA1151'
    if 'STR5' in m or 'TRX4' in m: return 'sTR5'
    return ''

def detect_ram_type(model):
    """RAM type จากชื่อรุ่น"""
    m = model.upper()
    if 'DDR5' in m: return 'DDR5'
    if 'DDR4' in m: return 'DDR4'
    if 'DDR3' in m: return 'DDR3'
    return ''

def detect_gpu_vram(model):
    """GPU VRAM จากชื่อรุ่น (GB)"""
    m = re.search(r'(\d+)\s*GB', model.upper())
    return int(m.group(1)) if m else None

def detect_storage(model):
    """Storage capacity + type จากชื่อรุ่น"""
    cap = re.search(r'(\d+)\s*(TB|GB)', model.upper())
    capacity = None
    ctype = None
    if cap:
        val = int(cap.group(1))
        unit = cap.group(2)
        capacity = val * 1000 if unit == 'TB' else val
        ctype = 'NVMe SSD' if 'NVME' in model.upper() or 'M.2' in model.upper() else ('SSD' if 'SSD' in model.upper() else None)
    return capacity, ctype

def detect_psu_wattage(model):
    """PSU wattage จากชื่อรุ่น (W)"""
    m = re.search(r'(\d+)\s*W', model.upper())
    return int(m.group(1)) if m else None

def detect_case_form(model):
    """Case form factor จากชื่อรุ่น"""
    up = model.upper()
    forms = []
    if 'ATX' in up: forms.append('ATX')
    if 'MICRO-ATX' in up or 'M-ATX' in up or 'MATX' in up: forms.append('Micro-ATX')
    if 'MINI-ITX' in up or 'ITX' in up: forms.append('Mini-ITX')
    if 'E-ATX' in up or 'EATX' in up: forms.append('E-ATX')
    return ' / '.join(forms) if forms else ''

def detect_specs(cat_key, model):
    """คืน dict สเปคตามหมวด (สำหรับบันทึกลง DB)"""
    if cat_key == 'cpu':
        return {'socket_detected': detect_socket(model)}
    if cat_key == 'ram':
        return {'ram_type': detect_ram_type(model)}
    if cat_key == 'gpu':
        vram = detect_gpu_vram(model)
        return {'vram_gb': vram} if vram else {}
    if cat_key == 'storage':
        cap, ctype = detect_storage(model)
        d = {}
        if cap: d['capacity_gb'] = cap
        if ctype: d['type'] = ctype
        return d
    if cat_key == 'psu':
        w = detect_psu_wattage(model)
        return {'wattage': w} if w else {}
    if cat_key == 'case':
        ff = detect_case_form(model)
        return {'form_factor': ff} if ff else {}
    return {}

# ---------------- Main ----------------
def main():
    ap = argparse.ArgumentParser(description='PCSpec Hardware Scraper')
    ap.add_argument('--category', choices=list(CAT_CONFIG.keys()), default='cpu')
    ap.add_argument('--source', choices=['ihavecpu', 'advice', 'all'], default='ihavecpu')
    ap.add_argument('--limit', type=int, default=10)
    ap.add_argument('--seed', type=int, default=None)
    ap.add_argument('--save', action='store_true', help='บันทึก JSON ลง database-export/')
    ap.add_argument('--db', action='store_true', help='บันทึกลง MySQL/TiDB จริง')
    args = ap.parse_args()

    if args.seed is not None:
        random.seed(args.seed)

    products = []
    if args.source in ('ihavecpu', 'all'):
        products += fetch_ihavecpu(args.category)
    if args.source in ('advice', 'all'):
        products += fetch_advice(args.category)

    if not products:
        print("❌ ไม่มีข้อมูล")
        return

    sample = random.sample(products, min(args.limit, len(products)))
    print(f"\n🎲 สุ่ม {len(sample)} ชิ้น (ไม่ซ้ำ) จาก {len(products)} ชิ้น [{args.category.upper()}]:\n")
    results = []
    for i, p in enumerate(sample, 1):
        results.append(p)
        extra = ''
        if p.get('socket_detected'): extra += f" | Socket: {p['socket_detected']}"
        if p.get('ram_type'): extra += f" | Type: {p['ram_type']}"
        if p.get('vram_gb'): extra += f" | VRAM: {p['vram_gb']}GB"
        if p.get('capacity_gb'): extra += f" | Cap: {p['capacity_gb']}GB"
        if p.get('wattage'): extra += f" | Watt: {p['wattage']}W"
        if p.get('form_factor'): extra += f" | Form: {p['form_factor']}"
        print(f"{i:2}. [{p['brand']}] {p['model'][:50]}")
        print(f"    ราคา: ฿{p['price']:,.0f}{extra} | รูป: {'มี' if p['image_url'] else 'ไม่มี'} | {p['source']}")
        print(f"    URL: {p['url']}")

    if args.save:
        out = os.path.join(os.path.dirname(__file__), '..', 'database-export', f"{args.category}_sample.json")
        os.makedirs(os.path.dirname(out), exist_ok=True)
        with open(out, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"\n💾 บันทึกลง: {out}")

    if args.db:
        save_to_db(results, CAT_CONFIG[args.category]['db_id'])

# ---------------- Save to DB ----------------
def save_to_db(products, db_category_id):
    """บันทึกลง MySQL/TiDB ตาม SOP Step 1-2 (products + spec_*)"""
    try:
        import pymysql
        from dotenv import load_dotenv
    except ImportError:
        print("❌ ต้องติดตั้ง pymysql + python-dotenv: pip install pymysql python-dotenv")
        return
    load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'node-backend', '.env'))
    conn = pymysql.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=int(os.getenv('DB_PORT', '3306')),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        database=os.getenv('DB_NAME', 'smart_pc_builder'),
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor,
    )
    inserted = 0
    updated = 0
    with conn.cursor() as c:
        for p in products:
            model = p['model']
            # หาของเก่า (อัปเดตราคาหากมี)
            c.execute("SELECT id FROM products WHERE model=%s AND category_id=%s", (model, db_category_id))
            row = c.fetchone()
            specs_json = json.dumps(p, ensure_ascii=False)
            if row:
                pid = row['id']
                c.execute("UPDATE products SET price=%s, image_url=%s, specifications=%s WHERE id=%s",
                          (p['price'], p['image_url'], specs_json, pid))
                updated += 1
            else:
                c.execute("""INSERT INTO products (category_id, brand, model, price, image_url, stock_quantity, specifications, product_url)
                            VALUES (%s, %s, %s, %s, %s, 15, %s, %s)""",
                          (db_category_id, p['brand'], model, p['price'], p['image_url'], specs_json, p['url']))
                pid = c.lastrowid
                inserted += 1
            # เขียน spec_* ตามหมวด
            _upsert_spec(c, p, pid)
            conn.commit()
    conn.close()
    print(f"\n🗄️  บันทึกลง DB: แทรกใหม่ {inserted} | อัปเดต {updated}")

def _upsert_spec(c, p, pid):
    """เขียน/อัปเดตตาราง spec_* ตามหมวด"""
    cat = p.get('category')
    if cat == 'cpu':
        socket = p.get('socket_detected', '')
        cores = _extract_int(p['model'], r'(\d+)\s*[Cc]')
        threads = _extract_int(p['model'], r'(\d+)\s*[Tt]')
        c.execute("DELETE FROM spec_cpu WHERE product_id=%s", (pid,))
        if socket or cores or threads:
            c.execute("INSERT INTO spec_cpu (product_id, socket, tdp_watt, cores, threads) VALUES (%s,%s,NULL,%s,%s)",
                      (pid, socket or None, cores, threads))
    elif cat == 'gpu':
        vram = p.get('vram_gb')
        c.execute("DELETE FROM spec_gpu WHERE product_id=%s", (pid,))
        if vram:
            c.execute("INSERT INTO spec_gpu (product_id, tdp_watt, length_mm, chipset, vram_gb) VALUES (%s,NULL,NULL,%s,%s)",
                      (pid, p['brand'], vram))
    elif cat == 'ram':
        ram_type = p.get('ram_type', '')
        cap = _extract_int(p['model'], r'(\d+)\s*GB')
        c.execute("DELETE FROM spec_ram WHERE product_id=%s", (pid,))
        if ram_type or cap:
            c.execute("INSERT INTO spec_ram (product_id, ram_type, capacity_gb, bus_speed) VALUES (%s,%s,%s,NULL)",
                      (pid, ram_type or None, cap))
    elif cat == 'storage':
        cap = p.get('capacity_gb')
        ctype = p.get('type', '')
        c.execute("DELETE FROM spec_storage WHERE product_id=%s", (pid,))
        if cap or ctype:
            c.execute("INSERT INTO spec_storage (product_id, type, capacity_gb, read_speed_mbs, write_speed_mbs) VALUES (%s,%s,%s,NULL,NULL)",
                      (pid, ctype or None, cap))
    elif cat == 'psu':
        watt = p.get('wattage')
        c.execute("DELETE FROM spec_psu WHERE product_id=%s", (pid,))
        if watt:
            c.execute("INSERT INTO spec_psu (product_id, wattage, efficiency_rating) VALUES (%s,%s,NULL)",
                      (pid, watt))
    elif cat == 'case':
        ff = p.get('form_factor', '')
        c.execute("DELETE FROM spec_case WHERE product_id=%s", (pid,))
        if ff:
            c.execute("INSERT INTO spec_case (product_id, form_factor_support, max_gpu_length_mm) VALUES (%s,%s,NULL)",
                      (pid, ff))

def _extract_int(text, pattern):
    m = re.search(pattern, text.upper())
    return int(m.group(1)) if m else None

if __name__ == '__main__':
    main()

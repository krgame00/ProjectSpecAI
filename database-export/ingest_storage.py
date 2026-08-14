import json, re, urllib.request, urllib.parse, pymysql, time

DB = dict(host='gateway01.ap-southeast-1.prod.aws.tidbcloud.com', port=4000,
          user='2zvWBJeXCf3SPRp.root', password='NyMNiTa4VWaKbEtL',
          database='smart_pc_builder', ssl={'ssl': {}}, connect_timeout=20,
          charset='utf8mb4')

def fetch_all_storage():
    items, off = [], 0
    while True:
        u = f"https://apisp.ihavecpu.com/api/product/listCate?category_id=15&offset={off}&limit=50"
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
        d = json.load(urllib.request.urlopen(req, timeout=30))
        its = d.get('res_result', {}).get('data', [])
        if not its:
            break
        items.extend(its)
        if len(its) < 50:
            break
        off += 50
        time.sleep(1)
    return items

def parse_cap(name):
    m = re.search(r'(\d+)\s*(TB|GB)', name, re.I)
    if not m:
        return None
    val = int(m.group(1))
    return val * 1000 if m.group(2).upper() == 'TB' else val

def parse_type(name):
    u = name.upper()
    if 'NVME' in u or 'M.2' in u:
        return 'NVMe'
    if 'SSD' in u:
        return 'SSD'
    return 'HDD'

def clean_model(name):
    # strip thai M.2 prefix like "M.2 (เอสเอสดี) "
    m = re.sub(r'^M\.2\s*\([^)]*\)\s*', '', name).strip()
    return m or name

def main():
    urls = json.load(open('database-export/advice_storage_links.json', encoding='utf-8'))
    items = fetch_all_storage()
    by_pid = {it['product_id']: it for it in items}

    conn = pymysql.connect(**DB)
    c = conn.cursor()
    inserted = updated = skipped = 0

    for url in urls:
        m = re.search(r'/product/(\d+)', url)
        if not m:
            print("skip (no pid):", url); skipped += 1; continue
        pid = int(m.group(1))
        it = by_pid.get(pid)
        if not it:
            print("no API data for pid", pid); skipped += 1; continue

        name = it['name_th']
        model = clean_model(name)
        brand = (it.get('brand') or 'Generic').strip() or 'Generic'
        try:
            price = float(it['price_sale'])
        except (TypeError, ValueError):
            price = 0.0
        img = it.get('image') or ''
        cap = parse_cap(name)
        stype = parse_type(name)
        specs = json.dumps({"Brand": brand, "Capacity": f"{cap}GB" if cap else None,
                            "Form": "M.2"}, ensure_ascii=False)

        if price <= 100:
            print("skip low price", price, model); skipped += 1; continue

        # duplicate by model
        c.execute("SELECT id FROM products WHERE category_id=5 AND model=%s", (model,))
        row = c.fetchone()
        if row:
            pid_db = row[0]
            c.execute("UPDATE products SET price=%s, image_url=%s, specifications=%s, "
                      "product_url=%s, brand=%s WHERE id=%s",
                      (price, img, specs, url, brand, pid_db))
            c.execute("""INSERT INTO spec_storage (product_id,type,capacity_gb,read_speed_mbs,write_speed_mbs)
                         VALUES (%s,%s,%s,NULL,NULL)
                         ON DUPLICATE KEY UPDATE type=%s, capacity_gb=%s""",
                      (pid_db, stype, cap, stype, cap))
            updated += 1
            print(f"UPDATE  id={pid_db} {brand} {model[:40]} ฿{price} cap={cap} {stype}")
        else:
            c.execute("""INSERT INTO products (category_id,brand,model,price,image_url,stock_quantity,specifications,product_url)
                         VALUES (5,%s,%s,%s,%s,15,%s,%s)""",
                      (brand, model, price, img, specs, url))
            new_id = c.lastrowid
            c.execute("""INSERT INTO spec_storage (product_id,type,capacity_gb,read_speed_mbs,write_speed_mbs)
                         VALUES (%s,%s,%s,NULL,NULL)""",
                      (new_id, stype, cap))
            inserted += 1
            print(f"INSERT  id={new_id} {brand} {model[:40]} ฿{price} cap={cap} {stype}")
        conn.commit()

    conn.close()
    print(f"\nDONE: inserted={inserted} updated={updated} skipped={skipped}")

if __name__ == '__main__':
    main()

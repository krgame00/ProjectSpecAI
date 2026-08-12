import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

endpoints = [
    "https://prodbackadvice.advice.in.th/api/v1/product/list?category_id=15",
    "https://globalapi.advice.co.th/api/v1/product/list?category_id=15",
    "https://online.advice.co.th/api/v1/product/list",
    "https://www.advice.co.th/api/product/list",
    "https://apisp.ihavecpu.com/api/product/listCate?category_id=15&offset=0&limit=30",
    "https://apisp.ihavecpu.com/api/product/listCate?category_id=15&offset=30&limit=30"
]

for ep in endpoints:
    req = urllib.request.Request(ep, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept': 'application/json'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = resp.read().decode('utf-8')
            print(f"✅ [{resp.status}] {ep} -> Length: {len(data)}")
            if data.startswith('{') or data.startswith('['):
                j = json.loads(data)
                print("   Data keys:", list(j.keys()) if isinstance(j, dict) else len(j))
    except Exception as e:
        print(f"❌ {ep} -> Error: {e}")

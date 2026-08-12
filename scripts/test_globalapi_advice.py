import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

endpoints = [
    "https://globalapi.advice.co.th/api/v1/product/listCategory?category_id=15",
    "https://globalapi.advice.co.th/api/v1/product/list?category_id=15",
    "https://globalapi.advice.co.th/api/product/list?category_id=15",
    "https://globalapi.advice.co.th/api/v1/product/detail?product_id=A0150937",
    "https://globalapi.advice.co.th/api/product/detail?product_id=A0150937",
    "https://globalapi.advice.co.th/api/v1/categories",
    "https://globalapi.advice.co.th/api/v1/products"
]

for ep in endpoints:
    req = urllib.request.Request(ep, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept': 'application/json'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = resp.read().decode('utf-8')
            print(f"✅ [{resp.status}] {ep} -> Length: {len(data)}")
            print("   Sample:", data[:300])
    except Exception as e:
        print(f"❌ {ep} -> Error: {e}")

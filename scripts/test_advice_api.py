import urllib.request
import json
import re

url = "https://online.advice.co.th/api/product/list"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    with urllib.request.urlopen(req) as resp:
        print("Success:", resp.read().decode('utf-8')[:500])
except Exception as e:
    print("Fail:", e)

# Test ihavecpu SSD API for 30 items
url2 = "https://apisp.ihavecpu.com/api/product/listCate?category_id=15&offset=0&limit=30"
req2 = urllib.request.Request(url2, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req2) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        items = data.get('res_result', {}).get('data', [])
        print(f"ihavecpu SSD items count: {len(items)}")
        for item in items[:5]:
            print(" ->", item.get('name_th'), "Price:", item.get('price_sale'))
except Exception as e:
    print("ihavecpu fail:", e)

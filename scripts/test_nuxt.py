import requests
import json
import re

res = requests.get('https://www.advice.co.th/product/cpu')
match = re.search(r'window\.__NUXT__=(.*?);</script>', res.text)
if match:
    print("Found NUXT data!")
    data = match.group(1)
    print(data[:500])
else:
    print("NUXT data not found")

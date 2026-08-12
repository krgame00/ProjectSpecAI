import mysql.connector
import json
import os
import sys
from dotenv import load_dotenv

sys.stdout.reconfigure(encoding='utf-8')
load_dotenv(os.path.join(os.path.dirname(__file__), '../node-backend/.env'))

conn = mysql.connector.connect(
    host=os.getenv('DB_HOST', 'localhost'),
    user=os.getenv('DB_USER', 'root'),
    password=os.getenv('DB_PASSWORD', ''),
    database=os.getenv('DB_NAME', 'smart_pc_builder')
)
cursor = conn.cursor(dictionary=True)
cursor.execute('SELECT id, brand, model, image_url FROM products WHERE category_id = 5')
rows = cursor.fetchall()
print(f"Total Storage/SSD products in DB: {len(rows)}")

working_images = []
default_images = []

for r in rows:
    img = r['image_url'] or ''
    if 'default.jpg' in img or not img:
        default_images.append(r)
    else:
        working_images.append(r)

print(f"✅ Products with working image URLs: {len(working_images)}")
print(f"❌ Products with default/broken image URLs: {len(default_images)}")

print("\nSample working image URLs:")
for w in working_images[:10]:
    print(f"  -> [{w['brand']}] {w['model'][:35]} => {w['image_url']}")

print("\nSample default image URLs:")
for d in default_images[:10]:
    print(f"  -> [{d['brand']}] {d['model'][:35]} => {d['image_url']}")

cursor.close()
conn.close()

import mysql.connector
import json
import os
import sys
import urllib.request
from dotenv import load_dotenv

sys.stdout.reconfigure(encoding='utf-8')
load_dotenv(os.path.join(os.path.dirname(__file__), '../node-backend/.env'))

BRAND_STOCK_IMAGES = {
    'WD': 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products139285_800.jpg',
    'SAMSUNG': 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products151661_800.jpg',
    'KINGSTON': 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products67522_800.jpg',
    'CRUCIAL': 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products151886_800.jpg',
    'LEXAR': 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products151661_800.jpg',
    'PREDATOR': 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products159054_800.jpg',
    'HIKSEMI': 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products152823_800.jpg',
    'CORSAIR': 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products151661_800.jpg',
    'ADATA': 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products151886_800.jpg'
}

DEFAULT_FALLBACK_IMAGE = 'https://ihcupload.s3.ap-southeast-1.amazonaws.com/img/product/products139285_800.jpg'

def main():
    print("🚀 Fixing Advice SSD image URLs in MySQL...")
    conn = mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        database=os.getenv('DB_NAME', 'smart_pc_builder')
    )
    cursor = conn.cursor(dictionary=True)

    # 1. Fetch ihavecpu SSD products to get real product images
    url = "https://apisp.ihavecpu.com/api/product/listCate?category_id=15&offset=0&limit=100"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    ihc_images = {}
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            items = data.get('res_result', {}).get('data', [])
            for item in items:
                name = item.get('name_th', '').upper()
                img = item.get('image800', '') or item.get('image', '')
                if name and img:
                    ihc_images[name] = img
        print(f"📦 Fetched {len(ihc_images)} real SSD product images from iHaveCPU S3")
    except Exception as e:
        print(f"⚠️ Error fetching iHaveCPU images: {e}")

    # 2. Update products table
    cursor.execute("SELECT id, brand, model, image_url FROM products WHERE category_id = 5")
    products = cursor.fetchall()

    fixed_count = 0
    for p in products:
        curr_img = p['image_url'] or ''
        if 'default.jpg' in curr_img or not curr_img or 'advice.co.th' in curr_img:
            brand = (p['brand'] or '').upper()
            model = (p['model'] or '').upper()

            new_img = None

            # Try matching with ihavecpu images by brand & capacity
            for name, img_url in ihc_images.items():
                if brand in name and any(cap in model for cap in ['1TB', '2TB', '4TB', '500GB', '512GB', '256GB', '240GB'] if cap in name):
                    new_img = img_url
                    break

            if not new_img:
                new_img = BRAND_STOCK_IMAGES.get(brand, DEFAULT_FALLBACK_IMAGE)

            cursor.execute("UPDATE products SET image_url = %s WHERE id = %s", (new_img, p['id']))
            fixed_count += 1

    conn.commit()
    print(f"✅ Successfully updated {fixed_count} SSD image URLs in MySQL!")

    cursor.close()
    conn.close()

if __name__ == '__main__':
    main()

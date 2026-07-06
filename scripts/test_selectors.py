import asyncio
from scrapling.fetchers import AsyncDynamicSession

async def main():
    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        page = await session.fetch('https://www.advice.co.th/product/cpu')
        
        items = page.css('.item-card')
        print(f"Found {len(items)} items")
        if items:
            item = items[0]
            name = item.css('.item-name, .item-title')
            print("Name:", name[0].text() if name else "Not found")
            
            price = item.css('.item-price-sale, .item-price')
            print("Price:", price[0].text() if price else "Not found")
            
            img = item.css('.img-product img, .item-img img, img')
            print("Image:", img[0].attrib.get('src') or img[0].attrib.get('data-src') if img else "Not found")

if __name__ == "__main__":
    asyncio.run(main())

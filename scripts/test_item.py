import asyncio
from scrapling.fetchers import AsyncDynamicSession
from scrapling.parser import Selector

async def main():
    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        page = await session.fetch('https://www.advice.co.th/product/cpu')
        await asyncio.sleep(2)
        html = await page.playwright_page.content()
        parsed_page = Selector(html)
        items = parsed_page.css('.item-card')
        print(f"Found {len(items)} items")
        if items:
            item = items[0]
            name = item.css('.item-name::text, .item-title::text').get()
            price = item.css('.item-price-sale::text, .item-price-srp::text, .item-price::text').get()
            img = item.css('.img-product img::attr(src), .item-img img::attr(src), img::attr(src)').get()
            print("Name:", repr(name))
            print("Price:", repr(price))
            print("Image:", repr(img))

if __name__ == "__main__":
    asyncio.run(main())

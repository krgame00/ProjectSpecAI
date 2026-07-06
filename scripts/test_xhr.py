import asyncio
from scrapling.fetchers import AsyncDynamicSession

async def main():
    async with AsyncDynamicSession(headless=True, network_idle=True, capture_xhr=r".*") as session:
        page = await session.fetch('https://www.advice.co.th/product/cpu')
        
        for xhr in page.captured_xhr:
            if 'api' in xhr.url or 'get_comp' in xhr.url or 'product' in xhr.url:
                print(f"XHR: {xhr.url}")

if __name__ == "__main__":
    asyncio.run(main())

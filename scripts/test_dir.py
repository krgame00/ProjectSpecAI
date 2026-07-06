import asyncio
from scrapling.fetchers import AsyncDynamicSession

async def main():
    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        page = await session.fetch('https://www.advice.co.th/product/cpu')
        print(dir(page))

if __name__ == "__main__":
    asyncio.run(main())

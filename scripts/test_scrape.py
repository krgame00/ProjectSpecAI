import asyncio
from scrapling.fetchers import AsyncDynamicSession

async def main():
    async with AsyncDynamicSession(headless=True) as session:
        print("Fetching Advice IT PC Spec...")
        page = await session.fetch('https://www.advice.co.th/pc-spec')
        
        print("Page loaded. Looking for components...")
        # Just grab all text to see what rendered
        text = page.css('body').get()
        with open('temp_advice_body.html', 'w', encoding='utf-8') as f:
            f.write(text)
        print("Saved to temp_advice_body.html")

if __name__ == "__main__":
    asyncio.run(main())

import asyncio
import sys
from scrapling.fetchers import AsyncDynamicSession

sys.stdout.reconfigure(encoding='utf-8')

async def debug_page():
    async with AsyncDynamicSession(headless=True, network_idle=True) as session:
        page = await session.fetch('https://www.advice.co.th/product/cpu/amd-am4/cpu-amd-am4-athlon-3000g-next-')
        await asyncio.sleep(2)
        
        # 1. Check what type page is
        print(f"Type of page: {type(page)}")
        print(f"Dir of page: {[x for x in dir(page) if not x.startswith('_')]}")
        
        # 2. Check body
        body = page.body
        print(f"\nType of body: {type(body)}")
        if body:
            if isinstance(body, bytes):
                html_str = body.decode('utf-8', errors='ignore')
            else:
                html_str = str(body)
            print(f"Body length: {len(html_str)}")
            
            # Save to file for inspection
            with open('debug_body.html', 'w', encoding='utf-8') as f:
                f.write(html_str)
            print("Saved body to debug_body.html")
            
            # Check if it contains price data
            import re
            prices = re.findall(r'item-price', html_str)
            print(f"\n'item-price' occurrences in body: {len(prices)}")
            
            prices2 = re.findall(r'1,370', html_str)
            print(f"'1,370' occurrences in body: {len(prices2)}")
            
            prices3 = re.findall(r'ราคาหน้าร้าน', html_str)
            print(f"'ราคาหน้าร้าน' occurrences in body: {len(prices3)}")
        else:
            print("Body is None/empty!")
        
        # 3. Try page.text
        try:
            print(f"\npage.text type: {type(page.text)}")
            print(f"page.text length: {len(page.text)}")
            with open('debug_text.html', 'w', encoding='utf-8') as f:
                f.write(page.text)
            print("Saved text to debug_text.html")
        except Exception as e:
            print(f"page.text error: {e}")

        # 4. Try page.content
        try:
            print(f"\npage.content type: {type(page.content)}")
        except Exception as e:
            print(f"page.content error: {e}")

        # 5. Try getting encoding
        try:
            print(f"\npage.encoding: {page.encoding}")
        except Exception as e:
            print(f"page.encoding error: {e}")
            
        # 6. Check CSS selectors
        items = page.css('.item-price')
        print(f"\n.item-price elements found: {len(items) if items else 0}")
        if items:
            for i, item in enumerate(items[:3]):
                print(f"  item[{i}].text = '{item.text}'")
                print(f"  item[{i}].attrib = {dict(item.attrib) if hasattr(item, 'attrib') else 'N/A'}")
                # Try to get inner HTML
                try:
                    print(f"  item[{i}].html_content = '{item.html_content}'")
                except:
                    pass

if __name__ == "__main__":
    asyncio.run(debug_page())

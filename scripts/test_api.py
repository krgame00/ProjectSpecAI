import requests
import json

def test_api():
    url = "https://www.advice.co.th/pc/get_comp/intel"
    headers = {
        "User-Agent": "Mozilla/5.0",
        "X-Requested-With": "XMLHttpRequest"
    }
    res = requests.get(url, headers=headers)
    print("Status:", res.status_code)
    try:
        data = res.json()
        print("Keys:", data.keys() if isinstance(data, dict) else type(data))
        if isinstance(data, list):
            print("Items count:", len(data))
            print("First item:", data[0])
    except:
        print("Not JSON:", res.text[:200])

if __name__ == "__main__":
    test_api()

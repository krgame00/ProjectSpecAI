import urllib.request, re, json, time, os

UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
BASE = 'https://www.advice.co.th'
OUT = r'C:\Users\PC\Downloads\PCSpec\database-export\advice_storage_links.json'

def fetch(url, max_retry=5):
    for i in range(max_retry):
        try:
            req = urllib.request.Request(url, headers=UA)
            return urllib.request.urlopen(req, timeout=30).read().decode('utf-8', 'ignore')
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = 20 * (i + 1) + 10
                print(f"429 on {url} -> sleep {wait}s")
                time.sleep(wait)
                continue
            raise
        except Exception as e:
            print(f"ERR {url}: {e} -> sleep 10")
            time.sleep(10)
    raise RuntimeError(f"failed after retries: {url}")

html = fetch(BASE + '/sitemap.xml')
locs = re.findall(r'<loc>([^<]+)</loc>', html)
sub = [u for u in locs if u.endswith('.xml') and u.rstrip('/') != BASE + '/sitemap.xml']
if sub:
    print("following", len(sub), "sub-sitemaps")
    pages = []
    for u in sub:
        try:
            pages.append(fetch(u)); print("fetched", u, "len", len(pages[-1])); time.sleep(2)
        except Exception as e:
            print("sub fail", u, e)
    body = "\n".join(pages)
else:
    body = html

all_urls = re.findall(r'<loc>([^<]+)</loc>', body)
print("total urls:", len(all_urls))

# Spec filter: URL contains /product/ AND one of the storage keywords
# (ssd/harddisk/hdd/storage/nas, case-insensitive) AND not apple-tv.
# Keywords are matched as hyphen/ slash-delimited TOKENS in the path, so the
# brand "itsonas" (cases/PSUs) does NOT wrongly match "nas".
KEYS = ['ssd', 'harddisk', 'hdd', 'storage', 'nas']

def tokens(u):
    path = u.split('//', 1)[-1].split('?', 1)[0]
    out = []
    for seg in path.split('/'):
        out.extend(seg.split('-'))
    return [t for t in out if t]

storage = []
for u in all_urls:
    ul = u.lower()
    if '/product/' not in ul:
        continue
    if 'apple-tv' in ul:
        continue
    toks = tokens(ul)
    if any(k in toks for k in KEYS):
        storage.append(u)

seen = set(); uniq = []
for u in storage:
    if u not in seen:
        seen.add(u); uniq.append(u)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(uniq, f, ensure_ascii=False, indent=2)
print("WROTE", len(uniq), "links to", OUT)

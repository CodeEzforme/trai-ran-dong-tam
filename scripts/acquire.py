"""Cache the public WordPress inventory and public image assets for the redesign."""
import concurrent.futures
import hashlib
import io
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse
import requests
import urllib3
from bs4 import BeautifulSoup
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'data/source'
ASSETS = ROOT / 'public/assets/images'
ASSETS.mkdir(parents=True, exist_ok=True)
urllib3.disable_warnings()

def read(name):
    return json.loads((SOURCE / (name + '.json')).read_text(encoding='utf-8'))

def main():
    pages, posts, products = read('pages'), read('posts'), read('products')
    urls = set()
    for item in pages + posts:
        soup = BeautifulSoup(item['content']['rendered'], 'html.parser')
        for img in soup.select('img[src]'):
            urls.add(img['src'])
    home = BeautifulSoup((SOURCE / 'home.html').read_text(encoding='utf-8'), 'html.parser')
    for img in home.select('img[src]'):
        urls.add(img['src'])
    for item in products:
        for image in item.get('images', []):
            urls.add(image['src'])
        for img in BeautifulSoup(item['description'], 'html.parser').select('img[src]'):
            urls.add(img['src'])
    # Elementor backgrounds are often declared in embedded CSS instead of img tags.
    for raw in [(SOURCE / 'home.html').read_text(encoding='utf-8')] + [x['content']['rendered'] for x in pages]:
        urls.update(re.findall(r'https://trairandongtam\.vn/wp-content/uploads/[^\s\"\'<>\)\\]+?\.(?:webp|jpg|jpeg|png)', raw))
    urls = sorted(u for u in urls if urlparse(u).hostname == 'trairandongtam.vn' and '/uploads/' in u)
    map_path = ROOT / 'data/assets.json'
    mapping = json.loads(map_path.read_text(encoding='utf-8')) if map_path.exists() else {}
    failures = []

    def get(url):
        name = hashlib.sha256(url.encode()).hexdigest()[:16] + '.webp'
        path = ASSETS / name
        if not path.exists():
            try:
                # This host's legacy TLS chain is rejected by this Python installation.
                # Only public, credential-free assets from the original site are fetched.
                response = requests.get(url, timeout=22, verify=False)
                response.raise_for_status()
                im = Image.open(io.BytesIO(response.content))
                im.thumbnail((1600, 1600))
                im.save(str(path), 'WEBP', quality=84)
            except Exception as exc:
                failures.append({'url': url, 'error': str(exc)})
                return None
        return url, '/assets/images/' + name

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        for i, result in enumerate(pool.map(get, urls)):
            if result:
                mapping[result[0]] = result[1]
            if i % 25 == 0:
                print('Images', i, '/', len(urls), flush=True)
                map_path.write_text(json.dumps(mapping, ensure_ascii=False, indent=2), encoding='utf-8')
    map_path.write_text(json.dumps(mapping, ensure_ascii=False, indent=2), encoding='utf-8')
    (ROOT / 'data/asset-failures.json').write_text(json.dumps(failures, ensure_ascii=False, indent=2), encoding='utf-8')

    selected = []
    for img in home.select('img[src]')[:7]:
        if img['src'] in mapping:
            selected.append((img.get('alt', '')[:40], mapping[img['src']]))
    for item in products:
        if any(w in item['slug'] for w in ['ho-chua','ho-mang','vuon-den','ho-','chim-cong','tran-gam','gau-ngua','cobra']):
            for img in item['images'][:1]:
                if img['src'] in mapping:
                    selected.append((item['slug'], mapping[img['src']]))
    width, cellw, cellh = 1000, 250, 200
    sheet = Image.new('RGB', (width, ((len(selected)+3)//4)*cellh), '#eef1e8')
    draw = ImageDraw.Draw(sheet)
    for i,(label,path) in enumerate(selected):
        im = Image.open(str(ROOT / 'public' / path.lstrip('/'))).convert('RGB')
        im.thumbnail((240,165))
        x,y = (i%4)*cellw,(i//4)*cellh
        sheet.paste(im,(x,y))
        draw.text((x+4,y+170),str(i)+' '+label.encode('ascii','replace').decode()[:32],fill='black')
    (ROOT / 'artifacts').mkdir(exist_ok=True)
    sheet.save(str(ROOT / 'artifacts/contact-sheet.jpg'))
    (ROOT / 'data/contact-sheet.json').write_text(json.dumps(selected,ensure_ascii=False,indent=2),encoding='utf-8')
    print('Cached', len(mapping), 'images; failed', len(failures), flush=True)

if __name__ == '__main__':
    main()

# -*- coding: utf-8 -*-
"""One-time migration. Normal Next.js builds never call the legacy generator."""
import json
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
target = ROOT / 'content/content.json'
if target.exists():
    raise SystemExit('Content already exists; refusing to overwrite CMS changes.')
read = lambda p: json.loads((ROOT / p).read_text(encoding='utf-8'))
records = read('data/route-inventory.json')
products = {urlparse(p['permalink']).path: p for p in read('data/source/products.json')}
posts = {urlparse(p['link']).path: p for p in read('data/source/posts.json')}
cats = [{ 'id': str(p['id']), 'name': p['name'], 'path': urlparse(p.get('permalink') or p['link']).path, 'kind': kind }
        for filename, kind in [('product-cats', 'product'), ('categories', 'post')]
        for p in read('data/source/' + filename + '.json')]
documents, templates = [], {}
home = BeautifulSoup((ROOT / 'dist/index.html').read_text(encoding='utf-8'), 'html.parser')
for r in records:
    if r['kind'] in ['home', 'utility']:
        continue
    soup = BeautifulSoup((ROOT / 'dist' / r['path'].lstrip('/') / 'index.html').read_text(encoding='utf-8'), 'html.parser')
    main = soup.select_one('main')
    prose = main.select_one('.prose')
    photo = main.select_one('img')
    original = products.get(r['path']) or posts.get(r['path']) or {}
    doc_id = r['path'].strip('/').replace('/', '__')
    documents.append(dict(id=doc_id, path=r['path'], title=r['title'], kind=r['kind'],
        excerpt=(main.select_one('.intro-description').get_text(' ', strip=True) if main.select_one('.intro-description') else r['description']),
        body=prose.decode_contents() if prose else '', image=photo['src'] if photo else '',
        categories=[str(c['id'] if isinstance(c, dict) else c) for c in original.get('categories', [])],
        status='published', date=original.get('date', '2026-11-04')[:10]))
    templates[doc_id] = main.decode_contents()

def card(a):
    return dict(title=a.select_one('h3').get_text(' ', strip=True), image=a.select_one('img')['src'], path=a.select_one('a')['href'])
home_data = dict(logo=home.select_one('.brand img')['src'],
    animals=[card(a) for a in home.select('.animal-track .content-card')],
    scene=str(home.select_one('.scene-section')),
    faq=str(home.select_one('.faq-section')))
settings = dict(name='Đồng Tâm', tagline='Trại rắn & du lịch sinh thái',
    headline='Bước vào thế giới tự nhiên.',
    description='Gặp những cư dân hoang dã. Lắng nghe câu chuyện bảo tồn. Cùng nhau mang về một ngày đầy khám phá.',
    phone='0898 408 408', email='trairandongtam408@gmail.com', location='Kim Sơn, Đồng Tháp', hours='7:00 – 17:00 mỗi ngày',
    slides=[dict(image='/assets/images/trang-chu-anh-bia-01.webp', mobile='/assets/images/trang-chu-anh-bia-01-mobile.webp', caption='Một chút kỷ niệm ở Đồng Tâm'),
        dict(image='/assets/images/trang-chu-anh-bia-02.webp', mobile='/assets/images/trang-chu-anh-bia-02-mobile.webp', caption='Chào đón một ngày khám phá')])
target.parent.mkdir(exist_ok=True)
for p, data in [(target, dict(version=1, settings=settings, categories=cats, documents=documents)),
                (ROOT / 'data/migrated-templates.json', templates), (ROOT / 'data/migrated-home.json', home_data)]:
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
legacy = (ROOT / 'public/assets/app.js').read_text(encoding='utf-8')
start = legacy.index("  $$('[data-date]')")
(ROOT / 'public/assets/legacy-content.js').write_text("/* Preserved content interactions; React owns navigation and the cover. */\n(() => {\nconst $=(s,root=document)=>root.querySelector(s);\nconst $$=(s,root=document)=>[...root.querySelectorAll(s)];\nconst fold=value=>value.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();\nconst query=new URLSearchParams(location.search);\n" + legacy[start:], encoding='utf-8')
print('Migrated {} content entries; source templates preserved separately.'.format(len(documents)))

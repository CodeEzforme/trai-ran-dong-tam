# -*- coding: utf-8 -*-
"""Check route coverage, local assets, semantic basics and internal destinations."""
import collections
import json
import sys
from pathlib import Path
from urllib.parse import urlparse,unquote
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'dist'
inventory=json.loads((ROOT/'data/route-inventory.json').read_text(encoding='utf-8'))
paths={r['path'] for r in inventory}
expected=set()
for name,field in [('pages','link'),('posts','link'),('products','permalink'),('categories','link'),('product-cats','permalink')]:
    for row in json.loads((ROOT/'data/source'/(name+'.json')).read_text(encoding='utf-8')):
        expected.add(urlparse(row[field]).path)
errors=[]
missing=expected-paths
if missing:errors.append('Missing source routes: '+str(missing))
if len(paths)!=len(inventory):errors.append('Duplicate route paths')
broken=collections.defaultdict(set)
for route in inventory:
    path=route['path'];file=OUT/path.lstrip('/')/'index.html'
    if not file.exists():errors.append('Missing generated file: '+path);continue
    doc=BeautifulSoup(file.read_text(encoding='utf-8'),'html.parser')
    if len(doc.find_all('h1'))!=1:errors.append(path+' needs one h1')
    if not doc.find('main',id='main'):errors.append(path+' missing main landmark')
    if not doc.find('title'):errors.append(path+' missing title')
    if not doc.find('meta',attrs={'name':'description'}):errors.append(path+' missing description')
    for im in doc.select('img'):
        if not im.has_attr('alt'):errors.append(path+' image missing alt')
    for node in doc.select('[src],a[href],link[href]'):
        value=node.get('src') or node.get('href') or ''
        if not value.startswith('/') or value.startswith('//'):continue
        target=unquote(urlparse(value).path)
        if target in paths:continue
        dest=OUT/target.lstrip('/')
        if not dest.exists():broken[target].add(path)
for target,refs in broken.items():errors.append('Broken destination '+target+' referenced by '+str(len(refs))+' pages, e.g. '+next(iter(refs)))
report={'routes':len(paths),'original_routes':len(expected),'coverage':len(expected & paths),'local_images':len(list((OUT/'assets/images').glob('*'))),'errors':errors}
(ROOT/'artifacts').mkdir(exist_ok=True)
(ROOT/'artifacts/static-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=True,indent=2))
sys.exit(1 if errors else 0)

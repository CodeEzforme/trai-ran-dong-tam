"""Package the built static site and its local assets for Vercel Drop."""
import json
import re
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'dist'
STAGE = ROOT / 'artifacts/publish-site'
STAGE.mkdir(parents=True, exist_ok=True)
files = [p for p in SOURCE.rglob('*') if p.is_file()]
used = set()
for p in files:
    if p.suffix in ['.html', '.css', '.js', '.json']:
        used.update(re.findall(r'/assets/images/[a-zA-Z0-9_.-]+', p.read_text(encoding='utf-8')))
included = []
for p in files:
    rel = p.relative_to(SOURCE)
    name = rel.as_posix()
    if name.startswith('assets/images/') and '/' + name not in used:
        continue
    if name == 'robots.txt':
        continue
    target = STAGE / rel
    target.parent.mkdir(parents=True, exist_ok=True)
    if p.suffix == '.html':
        target.write_text(p.read_text(encoding='utf-8').replace('<head>', '<head><meta name="robots" content="noindex,nofollow">', 1), encoding='utf-8')
    else:
        shutil.copy2(str(p), str(target))
    included.append(rel)
config = {'version': 2, 'trailingSlash': True, 'headers': [{'source': '/(.*)', 'headers': [{'key': 'X-Robots-Tag', 'value': 'noindex, nofollow, noarchive'}]}]}
(STAGE / 'vercel.json').write_text(json.dumps(config), encoding='utf-8')
(STAGE / 'robots.txt').write_text('User-agent: *\nDisallow: /\n', encoding='utf-8')
included += [Path('vercel.json'), Path('robots.txt')]
archive = ROOT / 'artifacts/dong-tam-demo-full.zip'
with zipfile.ZipFile(str(archive), 'w', zipfile.ZIP_DEFLATED, compresslevel=8) as package:
    for rel in included:
        package.write(str(STAGE / rel), rel.as_posix())
print(json.dumps({'archive_bytes': archive.stat().st_size, 'files': len(included), 'images': len(used), 'model_bytes': (STAGE / 'assets/models/cobra.glb').stat().st_size}))

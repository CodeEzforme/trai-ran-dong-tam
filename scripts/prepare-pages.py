"""Make the root-hosted build work under a GitHub Pages repository path."""
import argparse
import json
import re
import shutil
from pathlib import Path
from urllib.parse import unquote, urlparse

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--base-path', required=True, help='Pages base_path, e.g. /trai-ran-dong-tam')
parser.add_argument('--output', default='artifacts/github-pages-site')
args = parser.parse_args()
base = '/' + args.base_path.strip('/') if args.base_path.strip('/') else ''
if not re.fullmatch(r'(?:/[A-Za-z0-9._-]+)*', base):
    parser.error('Invalid Pages base path')
source = ROOT / 'dist'
output = Path(args.output).resolve()
if output == source or source in output.parents:
    parser.error('Output must be separate from dist')
output.mkdir(parents=True, exist_ok=True)

quoted = re.compile(r'''(?P<quote>["'])/(?P<tail>(?!/)[^"'\s<>]*)(?P=quote)''')
css_url = re.compile(r'url\(/(?!/)([^)\s]+)\)')
included = []
for path in source.rglob('*'):
    if not path.is_file():
        continue
    relative = path.relative_to(source)
    target = output / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    if path.suffix in ['.html', '.css', '.js', '.json']:
        text = path.read_text(encoding='utf-8')
        text = quoted.sub(lambda match: match['quote'] + base + '/' + match['tail'] + match['quote'], text)
        if path.suffix == '.css':
            text = css_url.sub(lambda match: 'url(' + base + '/' + match[1] + ')', text)
        if path.suffix == '.html':
            text = text.replace('<head>', '<head><meta name="robots" content="noindex,nofollow">', 1)
        target.write_text(text, encoding='utf-8')
    else:
        shutil.copy2(str(path), str(target))
    included.append(relative)
(output / '.nojekyll').write_text('', encoding='utf-8')
(output / 'robots.txt').write_text('User-agent: *\nDisallow: /\n', encoding='utf-8')

# Resolve generated links as they will be resolved on the actual project URL.
errors = []
for relative in included:
    if relative.suffix != '.html':
        continue
    doc = BeautifulSoup((output / relative).read_text(encoding='utf-8'), 'html.parser')
    for node in doc.select('[src],a[href],link[href],form[action]'):
        value = node.get('src') or node.get('href') or node.get('action') or ''
        if not value.startswith('/') or value.startswith('//'):
            continue
        if base and not value.startswith(base + '/'):
            errors.append('{} points outside Pages base: {}'.format(relative, value))
            continue
        local = unquote(urlparse(value[len(base):]).path).lstrip('/')
        if not (output / local).exists():
            errors.append('{} has missing destination: {}'.format(relative, value))
if errors:
    raise SystemExit('\n'.join(errors[:20]))
print(json.dumps({'base_path': base or '/', 'html_pages': sum(p.suffix == '.html' for p in included), 'files': len(included), 'output': str(output), 'broken_links': len(errors)}))

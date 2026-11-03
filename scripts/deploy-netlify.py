"""Publish the built demo with the anonymous API used by Netlify CLI.

API contract: netlify-cli 27.16.2, dist/utils/deploy/drop-api.js.
Only the prebuilt, public website archive is uploaded.
"""
import concurrent.futures
import hashlib
import json
import time
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

import requests

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://api.netlify.com/api/v1'
CA = str(ROOT / '.tools/system-ca.pem')
HEADERS = {'User-Agent': 'DongTam-Demo-Deploy (Codex)', 'Referer': 'https://app.netlify.com'}
PRIVATE = ROOT / '.tools/netlify-drop-private.json'

def request(method, path, **kwargs):
    headers = dict(HEADERS)
    headers.update(kwargs.pop('headers', {}))
    response = requests.request(method, BASE + path, headers=headers, verify=CA, timeout=90, **kwargs)
    if not response.ok:
        # Do not print request headers or the token-bearing creation payload.
        raise RuntimeError('{} {} returned HTTP {}'.format(method, path, response.status_code))
    return response

with zipfile.ZipFile(str(ROOT / 'artifacts/dong-tam-demo-full.zip')) as archive:
    bodies = {'/' + name: archive.read(name) for name in archive.namelist() if not name.endswith('/') and name != 'vercel.json'}
bodies['/_headers'] = b'/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n'
files = {name: hashlib.sha1(body).hexdigest() for name, body in bodies.items()}
by_hash = {digest: name for name, digest in files.items()}

# A failed upload resumes this same deployment instead of creating duplicates.
if PRIVATE.exists():
    saved = json.loads(PRIVATE.read_text(encoding='utf-8'))
    if saved.get('files') != files:
        raise RuntimeError('Existing Netlify attempt belongs to a different archive; inspect before replacing it.')
    token, info = saved['token'], saved['info']
else:
    token = request('POST', '/drop/token', headers={'Content-Type': 'application/json'}).json()['token']
    info = request('POST', '/drop', json={'files': files, 'token': token, 'created_via': 'cli'}).json()
    saved = {'token': token, 'info': info, 'files': files, 'created_at': datetime.now(timezone.utc).isoformat()}
    PRIVATE.write_text(json.dumps(saved), encoding='utf-8')
print('Created Netlify demo; uploading {} unique files.'.format(len(info.get('required', []))), flush=True)

def upload(digest):
    name = by_hash[digest]
    for attempt in range(3):
        try:
            request('PUT', '/deploys/{}/files{}'.format(info['deploy_id'], quote(name, safe='/')), data=bodies[name], headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/octet-stream'})
            return
        except (requests.RequestException, RuntimeError):
            if attempt == 2:
                raise
            time.sleep(attempt + 1)

required = info.get('required', [])
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    pending = [pool.submit(upload, digest) for digest in required]
    for count, result in enumerate(concurrent.futures.as_completed(pending), 1):
        result.result()
        if count % 30 == 0 or count == len(required):
            print('Uploaded {} / {}'.format(count, len(required)), flush=True)

for attempt in range(120):
    deploy = request('GET', '/sites/{}/deploys/{}'.format(info['id'], info['deploy_id'])).json()
    if deploy.get('state') == 'ready':
        url = deploy.get('ssl_url') or 'https://' + info['subdomain'] + '.netlify.app'
        claim = 'https://app.netlify.com/drop/{}#drop_token={}'.format(info['subdomain'], token)
        result = {'url': url, 'claim': claim, 'site_id': info['id'], 'deploy_id': info['deploy_id'], 'state': 'ready', 'created_at': saved['created_at']}
        (ROOT / 'artifacts/deployment-netlify-result.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
        print(json.dumps({'url': url, 'state': 'ready', 'created_at': saved['created_at']}), flush=True)
        break
    if deploy.get('state') == 'error':
        raise RuntimeError('Netlify reported a deployment error')
    if attempt % 10 == 0:
        print('Netlify state: ' + str(deploy.get('state')), flush=True)
    time.sleep(2)
else:
    raise RuntimeError('Deployment pending. Resume this same deployment; do not create another.')

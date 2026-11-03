"""Create a standalone demo package without uploading source, logs or tooling."""
import io
import json
import re
import shutil
import struct
import tarfile
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'dist'
STAGE=ROOT/'artifacts/demo-site'
STAGE.mkdir(parents=True,exist_ok=True)
used=set()
files=[p for p in SOURCE.rglob('*') if p.is_file()]
for p in files:
    if p.suffix in ['.html','.css','.js','.json']:
        used.update(re.findall(r'/assets/images/[a-zA-Z0-9_.-]+',p.read_text(encoding='utf-8')))
for p in files:
    rel=p.relative_to(SOURCE)
    name=rel.as_posix()
    if name.startswith('assets/images/') and '/'+name not in used:continue
    if name.startswith('assets/fonts/') and p.suffix=='.woff2':continue
    if name=='robots.txt':continue
    target=STAGE/rel
    target.parent.mkdir(parents=True,exist_ok=True)
    if p.suffix=='.html':
        target.write_text(p.read_text(encoding='utf-8').replace('<head>','<head><meta name="robots" content="noindex,nofollow">',1),encoding='utf-8')
    else:shutil.copy2(str(p),str(target))

# Keep geometry intact; replace embedded PNG textures with WebP using glTF's standard extension.
raw=(SOURCE/'assets/models/cobra.glb').read_bytes()
length=struct.unpack_from('<I',raw,12)[0]
doc=json.loads(raw[20:20+length])
binary=raw[28+length:]
image_views={item['bufferView'] for item in doc['images']}
chunks=bytearray()
for index,view in enumerate(doc['bufferViews']):
    start=view.get('byteOffset',0)
    body=binary[start:start+view['byteLength']]
    if index in image_views:
        im=Image.open(io.BytesIO(body));im.thumbnail((1024,1024))
        stream=io.BytesIO();im.save(stream,'WEBP',quality=90);body=stream.getvalue()
    while len(chunks)%4:chunks.append(0)
    view['byteOffset']=len(chunks);view['byteLength']=len(body);chunks.extend(body)
for im in doc['images']:im['mimeType']='image/webp'
for texture in doc['textures']:
    if 'source' in texture:
        texture.setdefault('extensions',{})['EXT_texture_webp']={'source':texture.pop('source')}
for key in ['extensionsUsed','extensionsRequired']:
    if 'EXT_texture_webp' not in doc.setdefault(key,[]):doc[key].append('EXT_texture_webp')
while len(chunks)%4:chunks.append(0)
doc['buffers'][0]['byteLength']=len(chunks)
metadata=json.dumps(doc,separators=(',',':')).encode('utf-8')
while len(metadata)%4:metadata+=b' '
model=struct.pack('<4sII',b'glTF',2,12+8+len(metadata)+8+len(chunks))+struct.pack('<I4s',len(metadata),b'JSON')+metadata+struct.pack('<I4s',len(chunks),b'BIN\x00')+bytes(chunks)
(STAGE/'assets/models/cobra.glb').write_bytes(model)
config={'version':2,'trailingSlash':True,'headers':[{'source':'/(.*)','headers':[{'key':'X-Robots-Tag','value':'noindex, nofollow, noarchive'}]}]}
(STAGE/'vercel.json').write_text(json.dumps(config),encoding='utf-8')
(STAGE/'robots.txt').write_text('User-agent: *\nDisallow: /\n',encoding='utf-8')

archive=ROOT/'artifacts/dong-tam-demo-optimized.tgz'
# The public source already serves the detail-page photography. Bundle the homepage
# photography and model; use those original public image URLs for the remaining photos.
mapping=json.loads((ROOT/'data/assets.json').read_text(encoding='utf-8'))
originals={local:remote for remote,local in mapping.items()}
retained=set(re.findall(r'/assets/images/[a-zA-Z0-9_.-]+',(SOURCE/'index.html').read_text(encoding='utf-8')))
retained.update(name for name in used if name not in originals)
for page in STAGE.rglob('*.html'):
    body=page.read_text(encoding='utf-8')
    for name in used-retained:
        body=body.replace(name,originals[name])
    page.write_text(body,encoding='utf-8')
for name in retained:
    p=SOURCE/name.lstrip('/')
    if p.suffix!='.webp':continue
    im=Image.open(str(p));im.thumbnail((900,900))
    im.save(str(STAGE/name.lstrip('/')),'WEBP',quality=75,method=6)
with tarfile.open(str(archive),'w:gz',compresslevel=9) as tar:
    for p in STAGE.rglob('*'):
        if not p.is_file():continue
        rel=p.relative_to(STAGE).as_posix()
        if rel.startswith('assets/images/') and '/'+rel not in retained:continue
        tar.add(str(p),arcname=rel,recursive=False)
print(json.dumps({'archive_bytes':archive.stat().st_size,'model_bytes':len(model),'bundled_images':len(retained),'original_source_images':len(used-retained)}),flush=True)
print('Demo stage: '+str(STAGE),flush=True)

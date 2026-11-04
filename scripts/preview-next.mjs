import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('out'),base=(process.env.NEXT_PUBLIC_BASE_PATH||'').replace(/\/$/,''),port=Number(process.env.PORT||3001);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.avif':'image/avif','.png':'image/png','.jpg':'image/jpeg','.ttf':'font/ttf','.glb':'model/gltf-binary','.xml':'application/xml'};
http.createServer((req,res)=>{
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end();}
  if(base && pathname!==base && !pathname.startsWith(base+'/')) {res.writeHead(404);return res.end('Not found');}
  if(base)pathname=pathname.slice(base.length)||'/';
  let file=path.resolve(root,'.'+pathname);
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});return res.end(fs.readFileSync(path.join(root,'404.html')));}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(file).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log(`Next.js preview: http://localhost:${port}${base}/`));

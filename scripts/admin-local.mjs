import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { handleCMS } from '../server/cms-handler.mjs';
const root=path.resolve('out'),base=(process.env.NEXT_PUBLIC_BASE_PATH||'').replace(/\/$/,''),port=Number(process.env.PORT||3004);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.avif':'image/avif','.ttf':'font/ttf','.glb':'model/gltf-binary'};
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,`http://127.0.0.1:${port}`);
  if(url.pathname.startsWith(base+'/api/cms/')){
    const request=new Request(url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body:Readable.toWeb(req),duplex:'half'}:{})});
    const response=await handleCMS(request);res.writeHead(response.status,Object.fromEntries(response.headers));return res.end(Buffer.from(await response.arrayBuffer()));
  }
  if(base&&url.pathname!==base&&!url.pathname.startsWith(base+'/')){res.writeHead(404);return res.end();}
  const name=decodeURIComponent(base?url.pathname.slice(base.length)||'/':url.pathname);let file=path.resolve(root,'.'+name);
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});return res.end(fs.readFileSync(path.join(root,'404.html')));}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);
 }catch{res.writeHead(500);res.end('Unable to process request');}
}).listen(port,'127.0.0.1',()=>console.log(`Admin server ready at http://127.0.0.1:${port}${base}/admin/`));

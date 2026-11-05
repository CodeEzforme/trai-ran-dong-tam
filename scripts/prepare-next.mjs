import fs from 'node:fs';
import path from 'node:path';
import { content, entries } from '../lib/content.mjs';
import { base } from '../lib/paths.mjs';
fs.mkdirSync('generated/assets', { recursive: true });
for (const name of ['style.css','refinements.css','experience.css','garden.css','fonts.css','legacy-content.js','garden.js']) {
  let text = fs.readFileSync('public/assets/' + name, 'utf8');
  if (base) text = text.replace(/(["'(])\/(assets\/|search-index\.json)/g, (_, quote, tail) => quote + base + '/' + tail);
  const target = path.join('generated/assets', name);
  fs.writeFileSync(target, text);
}
fs.writeFileSync('generated/search-index.json', JSON.stringify([{ path: base+'/', title: 'Trang chủ', kind: 'home', description: content.settings.description }, ...entries.map(d => ({ path: base + d.path, title: d.title, kind: d.kind, description: d.excerpt }))]));
fs.writeFileSync('generated/cms-index.json', JSON.stringify({ ...content, documents: entries }));
const media=[];
function scan(dir) { for(const item of fs.readdirSync(dir,{withFileTypes:true})) { const file=path.join(dir,item.name); if(item.isDirectory())scan(file);else if(/\.(webp|png|jpe?g|avif)$/i.test(item.name))media.push({path:'/'+file.replaceAll('\\','/').replace(/^public\//,''),name:item.name}); } }
scan('public/assets/images');
media.sort((a,b)=>Number(/trang-chu|vuon-thuoc|dieu-tri|uploads/.test(b.name))-Number(/trang-chu|vuon-thuoc|dieu-tri|uploads/.test(a.name)));
fs.writeFileSync('generated/media-index.json',JSON.stringify(media));
// Dev serves these generated files directly; production overwrites them after export.
for(const name of ['cms-index.json','media-index.json','search-index.json'])fs.copyFileSync('generated/'+name,'public/'+name);
console.log(`Prepared ${entries.length + 3} public routes and CMS; base=${base || '/'}`);

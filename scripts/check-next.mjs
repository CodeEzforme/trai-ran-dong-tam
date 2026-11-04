import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { entries,content } from '../lib/content.mjs';
import { base } from '../lib/paths.mjs';
const expected=['/',...entries.map(d=>d.path),'/tim-kiem/','/so-do-website/','/admin/'];
const failures=[];
for(const url of expected){
  const file=path.join('out',url,'index.html');
  if(!fs.existsSync(file)){failures.push('Missing route '+url);continue;}
  const $=load(fs.readFileSync(file,'utf8'));
  if(!$('h1').length && url!=='/admin/')failures.push('Missing heading '+url);
  $('[src],a[href],link[href]').each((_,el)=>{
    for(const key of ['src','href']){const value=$(el).attr(key);if(!value?.startsWith('/')||value.startsWith('//'))continue;
      const raw=value.split(/[?#]/)[0];if(base&&!raw.startsWith(base+'/')){failures.push(`Outside base ${url}: ${value}`);continue;}
      const target=decodeURIComponent(base?raw.slice(base.length):raw),p=path.join('out',target);
      if(!fs.existsSync(p))failures.push(`Broken ${url}: ${value}`);
    }
  });
}
const original=JSON.parse(fs.readFileSync('data/route-inventory.json','utf8'));
for(const r of original)if(!expected.includes(r.path) && content.documents.find(d=>d.path===r.path)?.status!=='draft')failures.push('Lost original route '+r.path);
const search=JSON.parse(fs.readFileSync('out/search-index.json','utf8'));
for(const d of content.documents.filter(d=>d.status==='draft'))if(search.some(r=>r.path===base+d.path))failures.push('Draft in search '+d.path);
assert.equal(failures.length,0,failures.slice(0,30).join('\n'));
console.log(`${expected.length} Next.js routes checked; original paths preserved; local links/assets valid; drafts excluded.`);

import fs from 'node:fs';
import { load } from 'cheerio';
import { parseStaffGroups } from '../lib/about.mjs';
import { sections } from '../lib/structure.mjs';
const file='content/content.json',data=JSON.parse(fs.readFileSync(file,'utf8'));
const doc=data.documents.find(d=>d.path==='/to-chuc/');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nameCase=s=>s.toLocaleLowerCase('vi').replace(/(^|[\s-])\p{L}/gu,c=>c.toLocaleUpperCase('vi'));
const sentence=s=>s.charAt(0).toLocaleUpperCase('vi')+s.slice(1).toLocaleLowerCase('vi');
const groups=parseStaffGroups(doc.body);
if(!groups.length)throw Error('No personnel found; refusing to replace the existing organization content.');
doc.body=groups.map(g=>`<h3>${esc(g.title)}</h3>\n`+g.people.map(p=>{
 const name=nameCase(p.name.replace(/^NGYỄN\b/u,'NGUYỄN'));
 return `<img src="${esc(p.image)}" alt="${esc(name)}" width="500" height="600">\n<h2>${esc(name)}</h2>\n<p>${esc(sentence(p.role).replace(/\s*-\s*/g,' - '))}</p>`;
}).join('\n')).join('\n');
doc.image='';
doc.excerpt='Thông tin nhân sự theo từng bộ phận tại Trại rắn Đồng Tâm.';
for(const d of data.documents){const t=sections.find(s=>s.id==='about').topics.find(t=>t.path===d.path);if(t&&d.path!=='/gioi-thieu/')d.title=t.label;}
const about=data.documents.find(d=>d.path==='/gioi-thieu/'),$=load(about.body,null,false);
$('h2').each((_,el)=>{const node=$(el);if(node.text().trim()==='50+'&&node.next('p').text().includes('Năm kinh nghiệm')){node.text('1977');node.next('p').text('Năm thành lập');}});
$('h2').each((_,el)=>{if(!$(el).text().trim())$(el).remove();else $(el).text($(el).text().replace('Sẳn sàng','Sẵn sàng'));});
about.body=$.html();
fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
console.log(`Cleaned ${groups.reduce((n,g)=>n+g.people.length,0)} unique personnel across ${groups.length} departments; other CMS content retained.`);

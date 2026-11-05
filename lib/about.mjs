import { load } from 'cheerio';
import { sections,collectionFor } from './structure.mjs';
import { listing } from './collections.mjs';

const text=s=>String(s||'').replace(/\s+/g,' ').trim();
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const titleCase=s=>text(s).toLocaleLowerCase('vi').replace(/(^|[\s-])\p{L}/gu,c=>c.toLocaleUpperCase('vi'));
const sentence=s=>{const value=text(s).toLocaleLowerCase('vi');return value.charAt(0).toLocaleUpperCase('vi')+value.slice(1);};
const units=[
 {id:'ban-giam-doc',title:'Ban giám đốc',path:'/ban-giam-doc/'},
 {id:'ban-hanh-chinh',title:'Ban hành chính',path:'/ban-hanh-chinh/'},
 {id:'doi-nuoi-trong-duoc-lieu',title:'Đội nuôi trồng dược liệu',path:'/doi-nuoi-trong-duoc-lieu/'},
 {id:'bo-phan-du-lich',title:'Bộ phận du lịch',path:'/bo-phan-du-lich/'}
];
const fold=s=>text(s).normalize('NFD').replace(/\p{M}/gu,'').replace(/đ/gi,'d').toLowerCase();

// Imported WordPress markup contains two copies of each portrait/name/role.
// Match all three fields, within their department, so genuine namesakes stay.
export function parseStaffGroups(html){
 const $=load(html||'',null,false),groups=[];let group,image='';
 $('h3,h2,img').each((_,el)=>{
  const node=$(el);
  if(el.tagName==='h3'){
   const label=text(node.text());if(!label)return;
   const unit=units.find(u=>fold(u.title)===fold(label.replace(/BỘ PHÂN/gi,'Bộ phận')));
   group={id:unit?.id||'bo-phan-'+groups.length,title:unit?.title||sentence(label),path:unit?.path||'',people:[]};groups.push(group);image='';
  }else if(el.tagName==='img')image=node.attr('src')||'';
  else if(group){
   const name=text(node.text()),role=text(node.nextAll('p').first().text());if(!name||!image)return;
   const key=[name.toLocaleLowerCase('vi'),role.toLocaleLowerCase('vi'),image].join('|');
   if(!group.people.some(p=>p.key===key))group.people.push({key,name,role,image});
   image='';
  }
 });
 return groups.filter(g=>g.people.length);
}

function directory(groups){
 return `<div class="nx-team-directory">${groups.length>1?`<nav class="nx-team-jump" aria-label="Các bộ phận trong trang">${groups.map(g=>`<a href="#${esc(g.id)}">${esc(g.title)}</a>`).join('')}</nav>`:''}${groups.map(g=>`<section class="nx-team-section" id="${esc(g.id)}"><header><h2>${esc(g.title)}</h2><span>${g.people.length} nhân sự</span></header><div class="nx-team-grid">${g.people.map(p=>`<article class="nx-person"><img src="${esc(p.image)}" alt="${esc(titleCase(p.name))}" width="500" height="600" loading="lazy"><div><h3>${esc(titleCase(p.name))}</h3><p>${esc(sentence(p.role))}</p></div></article>`).join('')}</div></section>`).join('')}</div>`;
}
function aboutNavigation(path){
 const about=sections.find(s=>s.id==='about');
 return `<nav class="nx-about-nav" aria-label="Chuyên mục Giới thiệu"><p>Giới thiệu Đồng Tâm</p><div>${about.topics.map(t=>`<a href="${esc(t.path)}"${path===t.path?' aria-current="page"':''}>${esc(t.label)}</a>`).join('')}</div></nav>`;
}
function overview(doc,cleanBody){
 const $=load(cleanBody(doc.body),null,false);
 $('h1,h2,h3,h4,p,sup,a').each((_,el)=>{const node=$(el);if(!text(node.text())&&!node.find('img').length)node.remove();});
 const firstHeading=$('h2').first(),leadTitle=firstHeading.text(),firstParagraph=firstHeading.next('p'),leadText=firstParagraph.html()||'';
 firstHeading.remove();firstParagraph.remove();
 const firstPhoto=$('img').first(),image=doc.image||firstPhoto.attr('src');if(firstPhoto.length)firstPhoto.remove();
 $('h2').each((_,el)=>{const node=$(el),value=text(node.text());if(value===value.toLocaleUpperCase('vi'))node.text(sentence(value));});
 const facts=[];let factAnchor;
 $('h2').each((_,el)=>{const node=$(el),value=text(node.text()),label=node.next('p');if(/\d/.test(value)&&value.length<25&&label.length&&text(label.text()).length<85){
  if(!factAnchor){node.before('<div data-facts-anchor></div>');factAnchor=true;}
  facts.push({value:value.replace(/(\p{L})(\d)/gu,'$1 $2').replace(/(\d)(ha)\b/i,'$1 $2'),label:text(label.text())});node.remove();label.remove();
 }});
 $('[data-facts-anchor]').replaceWith(`<dl class="nx-about-facts">${facts.map(f=>`<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>`);
 const pillars=[];
 $('h4').each((_,el)=>{const node=$(el),paragraph=node.next('p');if(!paragraph.length)return;const label=text(node.text()).replace(/^\d+\s*[.]\s*/,'').replace(/\s*\([^)]*\)/g,'').replace(/\s+Conservation$/i,'').trim();pillars.push(`<section><h3>${esc(label)}</h3>${$.html(paragraph)}</section>`);if(pillars.length===1)node.before('<div data-pillars-anchor></div>');node.remove();paragraph.remove();});
 $('[data-pillars-anchor]').replaceWith(`<div class="nx-about-pillars">${pillars.join('')}</div>`);
 $('img').attr('alt','Hoạt động tại Trại rắn Đồng Tâm');
 // Keep each remaining photograph beside its related text instead of a tall,
 // isolated image followed by another full-width block.
 $('img').toArray().forEach((el,index)=>{
  const image=$(el),following=[];let next=image.next();
  while(next.length&&!next.is('img')&&!next.is('h2:contains("Sẵn sàng")')){following.push(next);next=next.next();}
  if(!following.length)return;
  const feature=$(`<section class="nx-about-feature${index?' nx-about-feature-wide':''}"><figure></figure><div></div></section>`);
  image.before(feature);feature.find('figure').append(image);for(const node of following)feature.children('div').append(node);
 });
 $('p').each((_,el)=>{if(text($(el).text())==='Dấu nhấn')$(el).remove();});
 const closing=$('h2').filter((_,el)=>text($(el).text()).startsWith('Sẵn sàng')).last();
 if(closing.length){const paragraph=closing.next('p'),cta=$('<section class="nx-about-visit"></section>');closing.before(cta);cta.append(closing,paragraph,'<a href="/contact/#len-lich">Liên hệ tham quan ↗</a>');}
 return `<div class="nx-about-lead"><div><h2>${esc(leadTitle||doc.title)}</h2><p>${leadText}</p></div>${image?`<figure><img src="${esc(image)}" alt="Hoạt động tham quan tại Trại rắn Đồng Tâm" width="1600" height="1200" loading="eager"></figure>`:''}</div><article class="prose nx-about-story">${$.html()}</article>`;
}
export function renderAboutDocument(doc,{data,cleanBody,prefixHtml}){
 const about=sections.find(s=>s.id==='about');
 const supported=doc.path==='/to-chuc/'||about.topics.some(t=>t.path===doc.path)||units.some(u=>u.path===doc.path);
 if(!supported)return null;
 const allGroups=parseStaffGroups(cleanBody(data.documents.find(d=>d.path==='/to-chuc/'&&d.status==='published')?.body||''));
 const groups=doc.path==='/to-chuc/'?parseStaffGroups(cleanBody(doc.body)):allGroups.filter(g=>g.path===doc.path);
 const items=collectionFor(doc.path,data)||[],title=about.topics.find(t=>t.path===doc.path)?.label||units.find(u=>u.path===doc.path)?.title||doc.title;
 let body='';
 if(doc.path==='/gioi-thieu/')body=overview(doc,cleanBody);
 else if(groups.length)body=(doc.path!=='/to-chuc/'&&doc.body?`<article class="prose">${cleanBody(doc.body)}</article>`:'')+directory(groups);
 else body=doc.body?`<article class="prose">${cleanBody(doc.body)}</article>`:`<div class="nx-about-pending"><h2>${esc(title)}</h2><p>Thông tin chi tiết đang được cập nhật.</p><a href="/to-chuc/">Xem các bộ phận tại Đồng Tâm ↗</a></div>`;
 return prefixHtml(`<section class="page-intro"><div class="container"><nav class="breadcrumb" aria-label="Đường dẫn"><a href="/">Trang chủ</a><span>/</span>${doc.path!=='/gioi-thieu/'?'<a href="/gioi-thieu/">Giới thiệu</a><span>/</span>':''}<span>${esc(title)}</span></nav><h1>${esc(title)}</h1><p class="intro-description">${esc(doc.excerpt)}</p></div></section><div class="container nx-about-layout">${aboutNavigation(doc.path)}<div class="nx-about-main">${body}${items.length?listing(items,data,'Bài viết liên quan'):''}</div></div>`);
}

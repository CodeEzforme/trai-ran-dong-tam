import { load } from 'cheerio';
import { sections,flattenTopics,findSection,sectionFor,collectionFor,navigation } from './structure.mjs';
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function links(items){return `<div class="nx-topic-links">${items.map(t=>`<a href="${esc(t.path)}"><span>${esc(t.label)}</span><span aria-hidden="true">↗</span></a>`).join('')}</div>`;}
function cards(items,data){return items.map(d=>`<article class="content-card"><a class="card-image" href="${esc(d.path)}" tabindex="-1" aria-hidden="true"><img src="${esc(d.image||'/assets/fallback.svg')}" alt="${esc(d.title)}" width="1200" height="800" loading="lazy"></a><div class="card-meta"><span>${esc(findSection(sectionFor(d,data.categories))?.label||'Đồng Tâm')}</span>${d.kind==='post'?`<time datetime="${esc(d.date)}" data-date="${esc(d.date)}">${esc(d.date)}</time>`:''}</div><h3><a href="${esc(d.path)}">${esc(d.title)}</a></h3></article>`).join('');}
function listing(items,data,title){
 if(!items.length)return `<section class="section"><div class="container nx-collection-empty"><h2>Thông tin đang được cập nhật.</h2><p>Các thông tin mới sẽ được đăng tại chuyên mục này.</p></div></section>`;
 return `<section class="section catalogue"><div class="container"><div class="catalogue-toolbar"><div><h2>${esc(title)}</h2><p><strong id="result-count">${items.length}</strong> nội dung đang được giới thiệu</p></div><form class="filter-form" role="search"><label for="catalogue-search" class="sr-only">Tìm trong chuyên mục</label><input id="catalogue-search" name="q" type="search" placeholder="Tìm trong chuyên mục…" autocomplete="off"><button class="button primary" type="submit">Tìm kiếm</button></form></div><div class="cards-grid three filter-grid" data-page-size="12">${cards(items,data)}</div><div class="empty-results" hidden><h3>Chưa có kết quả phù hợp.</h3><p>Hãy thử từ khóa khác.</p></div><nav class="pagination" aria-label="Phân trang chuyên mục"></nav></div></section>`;
}
export function managedDocument(doc,{data,templates,cleanBody,prefixHtml}){
 const root=sections.find(s=>s.path===doc.path),topicGroup=sections.find(s=>flattenTopics(s).some(t=>t.path===doc.path));
 if(!root&&!topicGroup)return null;
 const group=root||topicGroup,topic=flattenTopics(group).find(t=>t.path===doc.path),children=root?root.topics:topic?.children||[];
 const items=(collectionFor(doc.path,data)||[]).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
 const title=doc.path==='/san-pham/'?'Các sản phẩm tại Đồng Tâm':doc.path==='/dong-vat-hoang-da/'?'Thế giới động vật':'Bài viết trong chuyên mục';
 if(doc.path==='/vuon-thuoc-nam/'&&templates[doc.id]){
  const $=load(templates[doc.id],null,false);$('.scene-section').remove();$('h1').first().text(doc.title);
  $('.garden-intro').after(`<section class="section"><div class="container">${links(children)}${doc.body?`<article class="prose">${cleanBody(doc.body)}</article>`:''}</div></section>`);
  $.root().append(listing(items,data,title));return prefixHtml($.html());
 }
 const body=cleanBody(doc.body),photo=doc.image&&!body.includes(doc.image)?`<img class="nx-collection-photo" src="${esc(doc.image)}" alt="${esc(doc.title)}" width="1200" height="800" loading="lazy">`:'';
 const html=`<section class="page-intro"><div class="container"><nav class="breadcrumb" aria-label="Đường dẫn"><a href="/">Trang chủ</a><span>/</span>${root?'':`<a href="${esc(group.path)}">${esc(group.label)}</a><span>/</span>`}<span>${esc(doc.title)}</span></nav><h1>${esc(doc.title)}</h1><p class="intro-description">${esc(doc.excerpt)}</p></div></section>${children.length?`<section class="section nx-topics-section"><div class="container">${links(children)}</div></section>`:''}${body||photo?`<section class="section"><article class="container prose nx-collection-body">${photo}${body}</article></section>`:''}${listing(items,data,title)}`;
 return prefixHtml(html);
}
export function sitemapTree(){
 const list=items=>`<ul>${items.map(t=>`<li><a href="${esc(t.path)}">${esc(t.label)}</a>${t.children?.length?list(t.children):''}</li>`).join('')}</ul>`;
 return `<section class="page-intro"><div class="container"><h1>Sơ đồ website Đồng Tâm</h1><p class="intro-description">Tìm thông tin theo từng chuyên mục.</p></div></section><section class="section"><div class="container nx-sitemap-grid">${navigation.map(g=>`<section><h2><a href="${esc(g.path)}">${esc(g.label)}</a></h2>${g.children?.length?list(g.children):''}</section>`).join('')}</div></section>`;
}

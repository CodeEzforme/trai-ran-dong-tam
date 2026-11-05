import fs from 'node:fs';
import { load } from 'cheerio';
import sanitize from 'sanitize-html';
import { validateContent } from './model.mjs';
import { siteUrl } from './paths.mjs';
import { managedDocument,sitemapTree } from './collections.mjs';
import { renderAboutDocument } from './about.mjs';

export const content = validateContent(JSON.parse(fs.readFileSync('content/content.json', 'utf8')));
export const entries = content.documents.filter(d => d.status === 'published');
export const templates = JSON.parse(fs.readFileSync('data/migrated-templates.json', 'utf8'));
export const homeData = JSON.parse(fs.readFileSync('data/migrated-home.json', 'utf8'));
export const cleanBody = html => sanitize(html, {
  allowedTags: sanitize.defaults.allowedTags.concat(['img', 'figure', 'figcaption', 'h1']),
  allowedAttributes: { a: ['href', 'title', 'target', 'rel'], img: ['src', 'alt', 'width', 'height', 'loading'], td: ['colspan', 'rowspan'], th: ['colspan', 'rowspan'] },
  allowedSchemes: ['https', 'http', 'mailto', 'tel'], allowProtocolRelative: false,
  transformTags: { img: (tag, attrs) => ({ tagName: tag, attribs: { ...attrs, loading: 'lazy' } }), a: (tag, attrs) => ({ tagName: tag, attribs: { ...attrs, rel: 'noopener noreferrer' } }) },
});
export const escape = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function prefixHtml(html) {
  const $ = load(html, null, false);
  const drafts = new Set(content.documents.filter(d=>d.status==='draft').map(d=>d.path));
  $('a[href]').each((_,el)=>{if(drafts.has(($(el).attr('href')||'').split(/[?#]/)[0])) $(el).replaceWith($('<span>').html($(el).html()));});
  $('[href],[src],[srcset],[action]').each((_, el) => {
    for (const attr of ['href', 'src', 'action']) if ($(el).attr(attr)) $(el).attr(attr, siteUrl($(el).attr(attr)));
    if ($(el).attr('srcset')) $(el).attr('srcset', $(el).attr('srcset').split(',').map(v => v.replace(/^(\s*)(\/\S+)/, (_, sp, p) => sp + siteUrl(p))).join(','));
  });
  return $.html();
}
function card(d) {
  return `<article class="content-card"><a class="card-image" href="${escape(d.path)}" tabindex="-1" aria-hidden="true"><img src="${escape(d.image || '/assets/fallback.svg')}" alt="${escape(d.title)}" width="1200" height="800" loading="lazy"></a><div class="card-meta"><span>${d.kind === 'post' ? 'Nhịp sống Đồng Tâm' : 'Khám phá Đồng Tâm'}</span></div><h3><a href="${escape(d.path)}">${escape(d.title)}</a></h3></article>`;
}
export function renderDocument(d) {
  const about=renderAboutDocument(d,{data:content,cleanBody,prefixHtml});
  if(about!==null)return about;
  const managed=managedDocument(d,{data:content,templates,cleanBody,prefixHtml});
  if(managed!==null)return managed;
  const original = templates[d.id];
  const $ = load(original || `<section class="page-intro"><div class="container"><nav class="breadcrumb"><a href="/">Trang chủ</a><span>/</span><span>${escape(d.title)}</span></nav><h1>${escape(d.title)}</h1><p class="intro-description">${escape(d.excerpt)}</p></div></section><section class="section"><div class="container">${d.image ? `<div class="nx-entry-cover"><img src="${escape(d.image)}" alt="${escape(d.title)}" width="1200" height="800"></div>` : ''}<article class="prose"></article></div></section>`, null, false);
  $('.scene-section').remove();
  $('h1').first().text(d.title);
  if (d.path === '/contact/') {
    const phone='tel:+'+content.settings.phone.replace(/\D/g,'').replace(/^0/,'84');
    $('.contact-details a[href="tel:+84898408408"]').attr('href',phone).text(content.settings.phone);
    $('.contact-details a[href="mailto:trairandongtam408@gmail.com"]').attr('href','mailto:'+content.settings.email).text(content.settings.email);
    $('.contact-details .contact-row').last().find('p').text(content.settings.hours);
  }
  $('.breadcrumb > span:last-child').text(d.title);
  $('.intro-description').first().text(d.excerpt);
  if ($('.prose').length) $('.prose').first().html(cleanBody(d.body));
  else if (d.body) {
    if ($('.source-empty').length) $('.source-empty').first().attr('class', 'container prose').html(cleanBody(d.body));
    else $('.page-intro').after(`<section class="section"><article class="container prose">${cleanBody(d.body)}</article></section>`);
  }
  const first = $('img').first();
  if (d.image && first.length) first.attr('src', d.image);
  else if (!d.image && first.length && original) first.remove();
  // Rebuild category collections from current CMS entries, so new content and drafts are reflected.
  const category = content.categories.find(c => c.path === d.path);
  let listing = null;
  if (category) listing = entries.filter(e => e.categories.includes(category.id));
  if (d.path === '/tin-tuc/') listing = entries.filter(e => e.kind === 'post');
  if (d.path === '/san-pham/') listing = entries.filter(e => e.kind === 'product');
  if (listing) {
    const grid = $('.filter-grid,.cards-grid').first();
    if (grid.length) grid.html(listing.map(card).join(''));
    else if ($('.source-empty').length) $('.source-empty').first().replaceWith(`<div class="cards-grid three">${listing.map(card).join('')}</div>`);
    else $.root().append(`<section class="section"><div class="container cards-grid three">${listing.map(card).join('') || '<p>Chưa có nội dung trong danh mục này.</p>'}</div></section>`);
    $('#result-count').text(listing.length);
  }
  $('.content-card').each((_, el) => {
    const a = $(el).find('h3 a'), path = a.attr('href');
    const updated = content.documents.find(e => e.path === path);
    if (updated?.status === 'draft') { $(el).remove(); return; }
    if (updated) { a.text(updated.title); if (updated.image) $(el).find('img').attr('src', updated.image); }
  });
  return prefixHtml($.html());
}
export function utilityHtml(path) {
  if (path === '/tim-kiem/') return prefixHtml('<section class="page-intro"><div class="container"><h1>Bạn muốn khám phá điều gì?</h1><p>Tìm loài vật, sản phẩm và câu chuyện từ Đồng Tâm.</p></div></section><section class="section"><div class="container search-page"><form class="search-form" action="/tim-kiem/"><label class="sr-only" for="results-query">Từ khóa</label><input id="results-query" name="q" type="search" placeholder="Tìm kiếm…"><button class="button primary">Tìm kiếm</button></form><p id="search-count" role="status">Nhập từ khóa để khám phá website.</p><div id="search-results" class="search-results"></div><nav class="pagination" id="search-pagination" aria-label="Phân trang"></nav></div></section>');
  return prefixHtml(sitemapTree(content)+`<section class="section"><details class="container nx-legacy-index"><summary>Tra cứu toàn bộ nội dung và các đường dẫn đã có</summary><div class="sitemap-groups">${['page','animal','product','post','category'].map(kind => `<section><h2>${({page:'Thông tin & trải nghiệm',animal:'Động vật',product:'Sản phẩm',post:'Tin tức',category:'Danh mục'})[kind]}</h2><ul>${entries.filter(d => d.kind === kind).map(d => `<li><a href="${escape(d.path)}">${escape(d.title)}</a></li>`).join('')}</ul></section>`).join('')}</div></details></section>`);
}

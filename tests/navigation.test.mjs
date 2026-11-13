import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { content,cleanBody } from '../lib/content.mjs';
import { editDocument } from '../lib/model.mjs';
import { navigationFor,flattenTopics } from '../lib/structure.mjs';
import { sitemapTree,managedDocument } from '../lib/collections.mjs';
import { renderAboutDocument } from '../lib/about.mjs';
const fixture=()=>{const data=structuredClone(content);data.documents.forEach(d=>{d.status='published';});return data;};

test('CMS category renames reach the header, about sidebar, heading and sitemap together',()=>{
 const original=fixture(),id=original.documents.find(d=>d.path==='/doi-nuoi-thuy-dac-san/').id;
 const data=editDocument(original,id,{title:'Đội nuôi trồng dược liệu kiểm tra'}),path='/doi-nuoi-thuy-dac-san/',doc=data.documents.find(d=>d.id===id);
 assert.equal(data.categories.find(c=>c.path===path).name,doc.title);
 const before=navigationFor(original).find(g=>g.id==='about'),after=navigationFor(data).find(g=>g.id==='about');
 assert.deepEqual(after.children.map(c=>c.path),before.children.map(c=>c.path));assert.equal(flattenTopics({topics:after.children}).find(c=>c.path===path).label,doc.title);
 const html=load(renderAboutDocument(doc,{data,cleanBody,prefixHtml:html=>html}));assert.equal(html('h1').text(),doc.title);assert.equal(html('.nx-about-nav a').filter((_,el)=>html(el).attr('href')===path).text(),doc.title);
 const sitemap=load(sitemapTree(data));assert.equal(sitemap('.nx-sitemap-grid a').filter((_,el)=>sitemap(el).attr('href')===path).text(),doc.title);
});

test('editing an existing page title also updates its category and public navigation',()=>{
 const data=editDocument(fixture(),'ban-giam-doc',{title:'Ban lãnh đạo kiểm tra'});
 assert.equal(data.categories.find(c=>c.path==='/ban-giam-doc/').name,'Ban lãnh đạo kiểm tra');
 assert.equal(flattenTopics({topics:navigationFor(data).find(g=>g.id==='about').children}).find(c=>c.path==='/ban-giam-doc/').label,'Ban lãnh đạo kiểm tra');
});

test('nested wildlife, section headings and topic cards use CMS labels without changing ordering',()=>{
 let data=fixture();const animal=data.documents.find(d=>d.path==='/danh-muc-san-pham/ran/');
 data=editDocument(data,animal.id,{title:'Các loài rắn kiểm tra'});
 const herb=data.documents.find(d=>d.path==='/vuon-thuoc-nam/cay-lau-nam/');data=editDocument(data,herb.id,{title:'Vườn cây lâu năm kiểm tra'});
 assert.equal(navigationFor(data).find(g=>g.id==='tourism').children[0].children[0].label,'Các loài rắn kiểm tra');
 const html=load(managedDocument(data.documents.find(d=>d.path==='/vuon-thuoc-nam/'),{data,templates:{},cleanBody,prefixHtml:html=>html}));
 assert(html('.nx-topic-links').text().includes('Vườn cây lâu năm kiểm tra'));
});

test('overview alias stays separate from its parent and draft topics are not advertised',()=>{
 const data=fixture();const group=navigationFor(data).find(g=>g.id==='about');
 assert.equal(group.label,data.documents.find(d=>d.path==='/gioi-thieu/').title);assert.equal(group.children[0].label,data.categories.find(c=>c.id==='about-overview').name);
 const hidden=editDocument(data,data.documents.find(d=>d.path==='/doi-nuoi-thuy-dac-san/').id,{status:'draft'});
 assert(!navigationFor(hidden).find(g=>g.id==='about').children.some(c=>c.path==='/doi-nuoi-thuy-dac-san/'));
});

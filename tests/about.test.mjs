import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { parseStaffGroups,renderAboutDocument } from '../lib/about.mjs';
import { content,cleanBody,renderDocument } from '../lib/content.mjs';

test('organization parser removes imported portrait/name/role copies without merging namesakes',()=>{
 const person=(role,image='/assets/a.webp')=>`<a><img src="${image}"></a><h2><a>Người kiểm tra</a></h2><p>${role}</p>`;
 const groups=parseStaffGroups('<h3>Ban giám đốc</h3>'+person('Giám đốc')+person('Giám đốc')+person('Phó giám đốc')+person('Giám đốc','/assets/b.webp')+'<h3>Ban hành chính</h3>'+person('Giám đốc'));
 assert.equal(groups[0].people.length,3);assert.equal(groups[1].people.length,1);
});

test('organization shows each of the 11 existing staff once in their original department',()=>{
 const doc=content.documents.find(d=>d.path==='/to-chuc/'),$=load(renderDocument(doc)),people=$('.nx-person');
 assert.equal(people.length,11);assert.deepEqual($('.nx-team-section').toArray().map(el=>$(el).find('.nx-person').length),[3,2,3,3]);
 assert.equal($('.nx-collection-photo').length,0);assert.equal($('img').length,11);
 const names=people.toArray().map(el=>$(el).find('h3').text());assert.equal(new Set(names).size,11);
 assert.equal(parseStaffGroups(doc.body).reduce((n,g)=>n+g.people.length,0),11);
});

test('department pages use the current organization source and reflect CMS name/role changes',()=>{
 const data=structuredClone(content),doc=data.documents.find(d=>d.path==='/ban-giam-doc/'),organization=data.documents.find(d=>d.path==='/to-chuc/');
 const original=parseStaffGroups(organization.body)[0].people[0];organization.body=organization.body.replaceAll(original.name,'Tên cập nhật từ CMS');
 const $=load(renderAboutDocument(doc,{data,cleanBody,prefixHtml:html=>html}));assert.equal($('.nx-person').length,3);assert($('.nx-person h3').first().text().includes('Tên Cập Nhật Từ Cms'));
 organization.status='draft';const hidden=load(renderAboutDocument(doc,{data,cleanBody,prefixHtml:html=>html}));assert.equal(hidden('.nx-person').length,0);
});

test('about overview keeps the photographs and uses compact facts and activity columns',()=>{
 const $=load(renderDocument(content.documents.find(d=>d.path==='/gioi-thieu/')));
 assert.equal($('.nx-about-lead img').length,1);assert.equal($('img').length,3);assert.equal($('.nx-about-facts>div').length,3);assert.equal($('.nx-about-pillars>section').length,3);assert($('.nx-about-facts').text().includes('1977'));
 assert.equal($('h1,h2,h3').toArray().filter(el=>!$(el).text().trim()).length,0);
});

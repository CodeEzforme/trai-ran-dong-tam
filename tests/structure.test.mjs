import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { collectionFor,sectionFor } from '../lib/structure.mjs';
import { renderDocument,content } from '../lib/content.mjs';

test('new articles go to their selected section and topic; drafts remain hidden',()=>{
 const data={categories:[{id:'r',path:'/de-tai-nghien-cuu-khoa-hoc/',section:'research',name:'Đề tài nghiên cứu khoa học'}],documents:[{id:'r1',path:'/nghien-cuu-khoa-hoc/test/',kind:'post',section:'research',categories:['r'],status:'published'},{id:'n1',path:'/tin-tuc/test/',kind:'post',section:'news',categories:[],status:'published'},{id:'r2',kind:'post',section:'research',categories:['r'],status:'draft'}]};
 assert.deepEqual(collectionFor('/nghien-cuu-khoa-hoc/',data).map(x=>x.id),['r1']);assert.deepEqual(collectionFor('/de-tai-nghien-cuu-khoa-hoc/',data).map(x=>x.id),['r1']);assert.deepEqual(collectionFor('/tin-tuc/',data).map(x=>x.id),['n1']);assert.equal(sectionFor({kind:'product',categories:[]},data.categories),'products');
});

test('a newly authored product keeps both its cover photograph and rich content',()=>{
 const doc={id:'entry-product-regression',path:'/san-pham/test/',title:'Sản phẩm thử',kind:'product',excerpt:'Giới thiệu',body:'<p>Nội dung sản phẩm.</p>',image:'/assets/images/test.webp',categories:[],status:'published'};
 const $=load(renderDocument(doc));assert.equal($('.nx-entry-cover img').attr('src'),'/assets/images/test.webp');assert($('.prose').text().includes('Nội dung sản phẩm.'));
});

test('public collections contain no 3D canvas or viewer controls',()=>{for(const path of ['/du-lich-sinh-thai/','/nha-bao-tang-ran/']){const doc=content.documents.find(d=>d.path===path);const $=load(renderDocument(doc));assert.equal($('#snake-scene,.scene-section').length,0);}});

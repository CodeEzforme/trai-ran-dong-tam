import test from 'node:test';
import assert from 'node:assert/strict';
import { content,cleanBody,templates } from '../lib/content.mjs';
import { editDocument,validateContent } from '../lib/model.mjs';
import { navigationFor,flattenTopics } from '../lib/structure.mjs';
import { managedDocument } from '../lib/collections.mjs';
const fixture=()=>{const data=structuredClone(content);data.documents.forEach(d=>{d.status='published';});return data;};
function add(data,id,parentId=''){
 const path='/category/'+id+'/';data.categories.push({id,path,name:id,section:'research',kind:'post',parentId});data.documents.push({id,path,title:id,kind:'category',section:'research',status:'published',body:'',image:'',categories:[],date:'2026-11-09'});return data;
}
test('new published categories join the selected section and can nest under another category',()=>{
 let data=add(add(fixture(),'parent-test'),'child-test','parent-test');validateContent(data);
 const group=navigationFor(data).find(g=>g.id==='research'),parent=group.children.find(c=>c.id==='parent-test');assert.equal(parent.children[0].id,'child-test');assert(!group.children.some(c=>c.id==='child-test'));
 data=editDocument(data,'child-test',{status:'draft'});assert(!flattenTopics({topics:navigationFor(data).find(g=>g.id==='research').children}).some(t=>t.id==='child-test'));
});
test('linked menu categories keep the original treatment page and photographs',()=>{
 let data=add(fixture(),'treatment-shortcut');data=editDocument(data,'treatment-shortcut',{targetPath:'/dieu-tri-ran-can/'});validateContent(data);
 const node=navigationFor(data).find(g=>g.id==='research').children.find(c=>c.id==='treatment-shortcut');assert.equal(node.path,'/dieu-tri-ran-can/');
 const doc=data.documents.find(d=>d.path==='/dieu-tri-ran-can/');assert.equal(managedDocument(doc,{data,templates,cleanBody,prefixHtml:html=>html}),null);
});
test('category cycles, invalid parent groups and unknown targets are rejected before publishing',()=>{
 const cyclic=add(add(fixture(),'first-test','second-test'),'second-test','first-test');assert.throws(()=>validateContent(cyclic),/vòng lặp/);
 const bad=add(fixture(),'parent-test','missing');assert.throws(()=>validateContent(bad),/không tồn tại/);
 const target=editDocument(add(fixture(),'target-test'),'target-test',{targetPath:'/missing-page/'});assert.throws(()=>validateContent(target),/liên kết/);
});

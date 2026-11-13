import test from 'node:test';
import assert from 'node:assert/strict';
import {deleteDocument,validateContent} from '../lib/model.mjs';
import {content} from '../lib/content.mjs';
import {navigationFor,collectionFor} from '../lib/structure.mjs';
test('deleting an article removes it from published collections without mutating other content',()=>{
 const before=structuredClone(content),doc=before.documents.find(d=>d.kind==='post'&&d.status==='published'),after=deleteDocument(before,doc.id);
 assert.equal(before.documents.find(d=>d.id===doc.id).status,'published');assert(after.documents.find(d=>d.id===doc.id).deletedAt);assert.equal(after.documents.find(d=>d.id===doc.id).status,'draft');validateContent(after);
 assert(!collectionFor('/tin-tuc/',after).some(d=>d.id===doc.id));assert.equal(after.documents.length,before.documents.length);
});
test('deleting a category keeps its children and articles, detaches references and hides its menu',()=>{
 const data=structuredClone(content),parent=data.documents.find(d=>d.path==='/to-chuc/'),category=data.categories.find(c=>c.path===parent.path),child=data.categories.find(c=>c.parentId===category.id);
 data.categories.push({id:'shortcut-delete-test',name:'Liên kết',path:'/shortcut-delete-test/',section:'about',targetPath:parent.path});
 data.documents.push({id:'delete-test-post',title:'Bài thử',path:'/delete-test-post/',kind:'post',section:'about',categories:[category.id],body:'',status:'published',image:''});
 const after=deleteDocument(data,parent.id);validateContent(after);assert.equal(after.categories.find(c=>c.id===child.id).parentId,'');assert.equal(after.documents.find(d=>d.id==='delete-test-post').status,'published');assert.deepEqual(after.documents.find(d=>d.id==='delete-test-post').categories,[]);assert.equal(after.categories.find(c=>c.id==='shortcut-delete-test').targetPath,'');assert(!navigationFor(after).find(g=>g.id==='about').children.some(c=>c.path===parent.path));
});

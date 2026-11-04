import test from 'node:test';
import assert from 'node:assert/strict';
import { GitHubCMS, toBase64, fromBase64 } from '../lib/github-cms.mjs';
import { validateContent } from '../lib/model.mjs';
import { cleanBody, renderDocument, content } from '../lib/content.mjs';
const fixture=()=>({version:1,categories:[],settings:{headline:'Đồng Tâm',phone:'0898 408 408',email:'hello@example.com',slides:[{image:'/assets/images/cover.webp'}]},documents:[{id:'one',path:'/bai-viet/',title:'Bài viết',kind:'post',status:'draft',categories:[],body:'<p>Xin chào</p>',image:''}]});
test('Vietnamese content survives GitHub base64 encoding',()=>{const text='Vườn thuốc nam 🌿 — Điều trị rắn cắn';assert.equal(fromBase64(toBase64(text)),text);});
test('content schema rejects duplicate routes, admin routes and executable image URLs',()=>{
  const original=fixture();assert.equal(validateContent(original),original);
  const duplicate=fixture();duplicate.documents.push({...duplicate.documents[0],id:'two'});assert.throws(()=>validateContent(duplicate),/trùng/);
  const reserved=fixture();reserved.documents[0].path='/admin/';assert.throws(()=>validateContent(reserved),/không hợp lệ/);
  const image=fixture();image.settings.slides[0].image='javascript:alert(1)';assert.throws(()=>validateContent(image),/Ảnh bìa/);
});
test('published rich content strips scripts, event handlers and unsafe links',()=>{
  const safe=cleanBody('<p>Thăm vườn</p><img src="/assets/images/garden.webp" onerror="alert(1)"><script>alert(1)</script><a href="javascript:alert(1)">x</a><iframe src="https://evil.test"></iframe>');
  assert.match(safe,/Thăm vườn/);assert.match(safe,/garden.webp/);assert.doesNotMatch(safe,/onerror|<script|javascript:|iframe/);
});
test('CMS atomically publishes content and images in one non-forced commit',async()=>{
  const calls=[];
  const responses=[{object:{sha:'head'}},{sha:'file-old'},{tree:{sha:'old-tree'}},{sha:'content-blob'},{sha:'image-blob'},{sha:'new-tree'},{sha:'new-commit',html_url:'https://github.com/commit/new'},{object:{sha:'new-commit'}}];
  const api=new GitHubCMS('test-secret',async(url,options)=>{calls.push({url,options});const data=responses.shift();return{ok:true,json:async()=>data};});api.sha='file-old';
  const commit=await api.publish(fixture(),[{path:'public/assets/images/uploads/garden.webp',base64:'aW1hZ2U='}]);
  assert.equal(commit.sha,'new-commit');assert.equal(api.sha,'content-blob');
  const tree=JSON.parse(calls.find(c=>c.url.endsWith('/git/trees')).options.body);
  assert.deepEqual(tree.tree.map(f=>f.path),['content/content.json','public/assets/images/uploads/garden.webp']);
  const ref=calls.at(-1);assert.equal(ref.options.method,'PATCH');assert.deepEqual(JSON.parse(ref.options.body),{sha:'new-commit',force:false});
  assert.ok(calls[1].url.endsWith('?ref=head'));assert.ok(!calls.some(c=>(c.options.body||'').includes('test-secret')));
});
test('CMS detects conflicts before uploading or committing anything',async()=>{
  const calls=[];const responses=[{object:{sha:'new-head'}},{sha:'someone-elses-change'}];
  const api=new GitHubCMS('secret',async(url,options)=>{calls.push(options.method);return{ok:true,json:async()=>responses.shift()};});api.sha='old-file';
  await assert.rejects(api.publish(fixture()),/thay đổi ở nơi khác/);assert.deepEqual(calls,['GET','GET']);
});
test('CMS reads content files larger than 1 MB through the raw API',async()=>{
  const calls=[];const api=new GitHubCMS('secret',async(url,options)=>{calls.push(options);return{ok:true,json:async()=>({sha:'big-file',content:'',encoding:'none'}),text:async()=>JSON.stringify(fixture())};});
  const data=await api.load();assert.equal(data.documents[0].title,'Bài viết');assert.equal(calls[1].headers.Accept,'application/vnd.github.raw+json');assert.equal(api.sha,'big-file');
});
test('expired credentials produce an actionable message without leaking token',async()=>{
  const api=new GitHubCMS('do-not-leak',async()=>({ok:false,status:401}));await assert.rejects(api.load(),error=>error.message.includes('hết hạn')&&!error.message.includes('do-not-leak'));
});
test('default browser fetch retains its global receiver',async()=>{
  const previous=globalThis.fetch;
  globalThis.fetch=function(){assert.equal(this,globalThis);return Promise.resolve({ok:true,json:async()=>({ok:true})});};
  try{const api=new GitHubCMS('secret');assert.deepEqual(await api.request('/user'),{ok:true});}finally{globalThis.fetch=previous;}
});
test('CMS contact settings update the contact page as well as the shell',()=>{
  const before={...content.settings};
  try{Object.assign(content.settings,{phone:'0901 234 567',email:'updated@example.com',hours:'8:00 – 17:00'});
    const html=renderDocument(content.documents.find(d=>d.path==='/contact/'));
    assert.match(html,/tel:\+84901234567/);assert.match(html,/mailto:updated@example.com/);assert.match(html,/8:00 – 17:00/);
  }finally{content.settings=before;}
});

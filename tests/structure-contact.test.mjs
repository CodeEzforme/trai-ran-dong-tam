import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { collectionFor,sectionFor } from '../lib/structure.mjs';
import { renderDocument,content } from '../lib/content.mjs';
import { createContactHandler,contactRecipient } from '../server/contact-handler.mjs';
import { loginLimiter } from '../server/auth.mjs';
const sample={name:'Khách kiểm tra',phone:'0901234567',email:'visitor@example.com',interest:'Tham quan gia đình',guests:'4',date:'2027-01-10',message:'Tôi muốn hỏi lịch tham quan.',website:''};
const req=(body,origin='https://codeezforme.github.io',method='POST')=>new Request('https://trai-ran-dong-tam.vercel.app/api/contact',{method,headers:{Origin:origin,'Content-Type':'application/json'},...(method==='POST'?{body:JSON.stringify(body)}:{})});
function service(result={success:'true'},status=200){let calls=[];return {calls,handler:createContactHandler({rateLimit:loginLimiter(),fetcher:async(url,options)=>{calls.push({url,...options});return Response.json(result,{status});}})};}
test('new articles go to their selected section and topic; drafts remain hidden',()=>{
 const d={categories:[{id:'r',path:'/de-tai-nghien-cuu-khoa-hoc/',section:'research',name:'Đề tài nghiên cứu khoa học'}],documents:[{id:'r1',path:'/nghien-cuu-khoa-hoc/test/',kind:'post',section:'research',categories:['r'],status:'published'},{id:'n1',path:'/tin-tuc/test/',kind:'post',section:'news',categories:[],status:'published'},{id:'r2',kind:'post',section:'research',categories:['r'],status:'draft'}]};
 assert.deepEqual(collectionFor('/nghien-cuu-khoa-hoc/',d).map(x=>x.id),['r1']);assert.deepEqual(collectionFor('/de-tai-nghien-cuu-khoa-hoc/',d).map(x=>x.id),['r1']);assert.deepEqual(collectionFor('/tin-tuc/',d).map(x=>x.id),['n1']);assert.equal(sectionFor({kind:'product',categories:[]},d.categories),'products');
});
test('a newly authored product keeps both its cover photograph and rich content',()=>{
 const doc={id:'entry-product-regression',path:'/san-pham/test/',title:'Sản phẩm thử',kind:'product',excerpt:'Giới thiệu',body:'<p>Nội dung sản phẩm.</p>',image:'/assets/images/test.webp',categories:[],status:'published'};
 const $=load(renderDocument(doc));assert.equal($('.nx-entry-cover img').attr('src'),'/assets/images/test.webp');assert($('.prose').text().includes('Nội dung sản phẩm.'));
});
test('public collections contain no 3D canvas or viewer controls',()=>{for(const path of ['/du-lich-sinh-thai/','/nha-bao-tang-ran/']){const doc=content.documents.find(d=>d.path===path);const $=load(renderDocument(doc));assert.equal($('#snake-scene,.scene-section').length,0);}});
test('contact supports the GitHub Pages origin without using visitor cookies',async()=>{const s=service();const r=await s.handler(req(sample));assert.equal(r.status,200);assert.equal(r.headers.get('access-control-allow-origin'),'https://codeezforme.github.io');assert.equal(r.headers.get('access-control-allow-credentials'),null);assert.deepEqual(await r.json(),{ok:true});const payload=JSON.parse(s.calls[0].body);assert.equal(s.calls[0].url,'https://formsubmit.co/ajax/'+contactRecipient);assert.equal(payload._replyto,'visitor@example.com');assert.equal(payload['Số điện thoại'],sample.phone);});
test('recipient is fixed by the server, never by submitted form fields',async()=>{const s=service();await s.handler(req({...sample,to:'attacker@example.com',_cc:'attacker@example.com'}));assert(s.calls[0].url.endsWith(contactRecipient));assert(!s.calls[0].body.includes('attacker@example.com'));});
test('activation-required and string false provider replies never show a successful send',async()=>{
 for(const result of [{success:'false',message:'This form needs Activation'},{success:'false',message:'Unable to submit form'},{success:false}]){const s=service(result),r=await s.handler(req(sample));assert(r.status>=400);assert.equal((await r.json()).ok,false);}
});
test('invalid form data is rejected before any email request',async()=>{for(const input of [null,{...sample,phone:'123'},{...sample,email:'bad@'},{...sample,email:'visitor@example.com\r\nCc: x@example.com'},{...sample,guests:'0'},{...sample,date:'2027-02-31'}]){const s=service(),r=await s.handler(req(input));assert.equal(r.status,400);assert.equal(s.calls.length,0);}});
test('honeypot and untrusted origins cannot trigger outbound email',async()=>{const s=service();assert.equal((await s.handler(req({...sample,website:'bot-field'}))).status,200);assert.equal(s.calls.length,0);assert.equal((await s.handler(req(sample,'https://evil.example'))).status,403);assert.equal(s.calls.length,0);});
test('public form rate limits repeated sends and supports CORS preflight',async()=>{const s=service();const options=await s.handler(req(null,'https://codeezforme.github.io','OPTIONS'));assert.equal(options.status,204);for(let n=0;n<6;n++)assert.equal((await s.handler(req(sample))).status,200);assert.equal((await s.handler(req(sample))).status,429);assert.equal(s.calls.length,6);});
test('email service failures are reported rather than claiming delivery',async()=>{const h=createContactHandler({rateLimit:loginLimiter(),fetcher:async()=>{throw Error('network failure');}});const r=await h(req(sample));assert.equal(r.status,502);assert.equal((await r.json()).ok,false);});

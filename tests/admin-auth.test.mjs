import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { hashPassword,verifyPassword,issueSession,verifySession,sessionCookie,loginLimiter } from '../server/auth.mjs';
import { createCMSHandler } from '../server/cms-handler.mjs';
const password='test-only-password-not-a-real-account';
const env={CMS_ADMIN_USERNAME:'Admin',CMS_PASSWORD_HASH:await hashPassword(password),CMS_SESSION_SECRET:randomBytes(48).toString('hex'),CMS_GITHUB_TOKEN:'test-github-token-never-public'};
const config={username:'Admin',passwordHash:env.CMS_PASSWORD_HASH,secret:env.CMS_SESSION_SECRET};
const request=(endpoint,{method='GET',body,cookie,csrf,origin='https://cms.example.com'}={})=>new Request('https://cms.example.com/api/cms/'+endpoint,{method,headers:{Origin:origin,...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{}),...(csrf?{'X-CMS-CSRF':csrf}:{})},...(body?{body:JSON.stringify(body)}:{})});
async function login(handler){const r=await handler(request('login',{method:'POST',body:{username:'Admin',password}}));assert.equal(r.status,200);return {cookie:r.headers.get('set-cookie').split(';')[0],...(await r.json())};}
const handler=(fetcher)=>createCMSHandler({env,fetcher:fetcher||(()=>{throw Error('Unexpected GitHub request');}),rateLimit:loginLimiter()});
test('password is scrypt hashed with a random salt and verified server-side',async()=>{assert(!env.CMS_PASSWORD_HASH.includes(password));assert(await verifyPassword(password,env.CMS_PASSWORD_HASH));assert(!await verifyPassword('wrong',env.CMS_PASSWORD_HASH));assert.notEqual(await hashPassword(password),env.CMS_PASSWORD_HASH);});
test('signed sessions expire, reject tampering and become invalid after password changes',()=>{
 const session=issueSession(config,1000000);assert(verifySession(session.value,config,1000001));assert.equal(verifySession(session.value+'x',config,1000001),null);assert.equal(verifySession(session.value,config,1000000+8*60*60*1000),null);assert.equal(verifySession(session.value,{...config,passwordHash:'changed'},1000001),null);
});
test('production session cookies are host-bound, Secure, HttpOnly and SameSite Strict',()=>{const cookie=sessionCookie('value','https://cms.example.com');for(const flag of ['__Host-dongtam-session','Secure','HttpOnly','SameSite=Strict','Path=/'])assert(cookie.includes(flag));assert(!cookie.includes('Domain='));});
test('private CMS content, media, publish and deployment endpoints require authentication',async()=>{const h=handler();for(const endpoint of ['content','session','deployment?sha='+('a'.repeat(40))])assert.equal((await h(request(endpoint))).status,401);for(const endpoint of ['publish','media','logout'])assert.equal((await h(request(endpoint,{method:'POST',body:{}}))).status,401);});
test('wrong account or password returns the same generic message and creates no cookie',async()=>{const h=handler();for(const credentials of [{username:'Admin',password:'wrong'},{username:'Someone',password}]){const r=await h(request('login',{method:'POST',body:credentials}));assert.equal(r.status,401);assert.equal(r.headers.get('set-cookie'),null);assert.equal((await r.json()).error,'Tài khoản hoặc mật khẩu không đúng.');}});
test('login blocks cross-origin requests',async()=>{const r=await handler()(request('login',{method:'POST',origin:'https://evil.example',body:{username:'Admin',password}}));assert.equal(r.status,403);assert.equal(r.headers.get('set-cookie'),null);});
test('authenticated sessions restore after reload without sending credentials again',async()=>{const h=handler(),session=await login(h);const r=await h(request('session',{cookie:session.cookie}));assert.equal(r.status,200);const result=await r.json();assert.equal(result.user.login,'Admin');assert.equal(result.csrf,session.csrf);assert(!JSON.stringify(result).includes(env.CMS_GITHUB_TOKEN));assert(!JSON.stringify(result).includes(env.CMS_PASSWORD_HASH));assert.equal(r.headers.get('cache-control'),'no-store, private');});
test('logout requires CSRF and clears the cookie after a valid request',async()=>{const h=handler(),s=await login(h);const rejected=await h(request('logout',{method:'POST',body:{},cookie:s.cookie,csrf:'invalid'}));assert.equal(rejected.status,403);const ok=await h(request('logout',{method:'POST',body:{},cookie:s.cookie,csrf:s.csrf}));assert.equal(ok.status,200);assert.match(ok.headers.get('set-cookie'),/Max-Age=0/);assert.equal((await h(request('session'))).status,401);});
test('login limits repeated failures and releases the block after its window',async()=>{let now=0;const h=createCMSHandler({env,rateLimit:loginLimiter(()=>now)});for(let i=0;i<6;i++)assert.equal((await h(request('login',{method:'POST',body:{username:'Admin',password:'wrong'}}))).status,401);const blocked=await h(request('login',{method:'POST',body:{username:'Admin',password}}));assert.equal(blocked.status,429);now=16*60*1000;assert.equal((await h(request('login',{method:'POST',body:{username:'Admin',password}}))).status,200);});
test('unconfigured hosting fails closed instead of exposing a fake dashboard session',async()=>{const r=await createCMSHandler({env:{}})(request('login',{method:'POST',body:{username:'Admin',password}}));assert.equal(r.status,503);assert.equal(r.headers.get('set-cookie'),null);});
test('content loads through the authenticated server and GitHub token never reaches the browser',async()=>{
 const fixture={version:1,categories:[],settings:{headline:'Test',phone:'0898 408 408',email:'test@example.com',slides:[{image:'/assets/images/test.webp'}]},documents:[]};let calls=0;
 const h=handler(async(url,options)=>{calls++;assert.equal(options.headers.Authorization,'Bearer '+env.CMS_GITHUB_TOKEN);return Response.json({sha:'a'.repeat(40),content:Buffer.from(JSON.stringify(fixture)).toString('base64')});});
 const s=await login(h),r=await h(request('content',{cookie:s.cookie}));assert.equal(r.status,200);const result=await r.json();assert.deepEqual(result.data,fixture);assert.equal(calls,1);assert(!JSON.stringify(result).includes(env.CMS_GITHUB_TOKEN));
});
test('rewritten Vercel endpoint routes to the intended handler',async()=>{const h=handler(),s=await login(h);const r=await h(new Request('https://cms.example.com/api/cms?endpoint=session',{headers:{Cookie:s.cookie}}));assert.equal(r.status,200);assert.equal((await r.json()).user.login,'Admin');});
test('authenticated media and content publish as one GitHub commit without exposing credentials',async()=>{
 const old='a'.repeat(40),head='b'.repeat(40),image='c'.repeat(40),blob='d'.repeat(40),nextTree='e'.repeat(40),commit='f'.repeat(40);let finalTree,ref;
 const h=handler(async(url,options)=>{
  const p=new URL(url).pathname,b=options.body?JSON.parse(options.body):null;let result;
  if(p.includes('/git/ref/heads/'))result={object:{sha:head}};
  else if(p.includes('/contents/'))result={sha:old};
  else if(p.endsWith('/git/commits/'+head))result={tree:{sha:old}};
  else if(p.endsWith('/git/blobs'))result={sha:b.encoding==='base64'?image:blob};
  else if(p.endsWith('/git/trees')){finalTree=b;result={sha:nextTree};}
  else if(p.endsWith('/git/commits'))result={sha:commit,html_url:'https://github.com/example/commit/'+commit};
  else if(p.includes('/git/refs/heads/')){ref=b;result={object:{sha:commit}};}
  else throw Error('Unexpected request');
  return Response.json(result);
 });
 const session=await login(h),file={path:'public/assets/images/uploads/test.webp',base64:Buffer.from('RIFF0000WEBPtest').toString('base64')};
 const uploaded=await h(request('media',{method:'POST',cookie:session.cookie,csrf:session.csrf,body:file}));assert.equal(uploaded.status,200);const {receipt}=await uploaded.json();
 const data={version:1,categories:[],settings:{headline:'Test',phone:'0898 408 408',email:'test@example.com',slides:[{image:'/assets/images/test.webp'}]},documents:[]};
 const response=await h(request('publish',{method:'POST',cookie:session.cookie,csrf:session.csrf,body:{data,sha:old,uploads:[receipt]}}));
 assert.equal(response.status,200);const result=await response.json();assert.equal(result.commit.sha,commit);assert.equal(result.sha,blob);assert.equal(finalTree.tree.length,2);assert.equal(finalTree.tree[1].sha,image);assert.equal(ref.force,false);assert(!JSON.stringify(result).includes(env.CMS_GITHUB_TOKEN));
 const other=await login(h);assert.equal((await h(request('publish',{method:'POST',cookie:other.cookie,csrf:other.csrf,body:{data,sha:old,uploads:[receipt]}}))).status,400);
});

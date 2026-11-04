const fs=require('fs'),assert=require('assert'),{createInterface}=require('readline');
const {chromium}=require('../.tools/node_modules/playwright');
(async()=>{
 if(process.stdin.isTTY)process.stdin.setRawMode(true);let credentials;
 for await(const line of createInterface({input:process.stdin,terminal:false,crlfDelay:Infinity})){credentials=JSON.parse(line);break;}
 if(process.stdin.isTTY)process.stdin.setRawMode(false);process.stdin.pause();
 const root=(process.env.ADMIN_TEST_ORIGIN||'http://127.0.0.1:3004').replace(/\/$/,'');
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const errors=[],checks=[],privateLeak=[];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().startsWith('https://api.github.com/'))privateLeak.push(r.url());});
  assert.equal((await page.goto(root+'/admin/',{waitUntil:'networkidle'})).status(),200);
  await page.getByRole('button',{name:'Đăng nhập',exact:true}).waitFor();assert.equal(await page.locator('.cms-workspace').count(),0);
  const unauth=await page.request.get(root+'/api/cms/content');assert.equal(unauth.status(),401);checks.push('Only login is shown before authentication; private API rejects unauthenticated reads');
  await page.screenshot({path:'artifacts/admin-login-desktop.png',fullPage:true});
  for(const width of [360,390,768,1024,1440]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Login overflow at '+width);}
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'artifacts/admin-login-mobile.png',fullPage:true});checks.push('Login responsive at 360–1440 pixels');
  await page.getByLabel('Tài khoản',{exact:true}).fill(credentials.username);await page.getByLabel('Mật khẩu',{exact:true}).fill('wrong-password-for-test');await page.getByRole('button',{name:'Hiện mật khẩu',exact:true}).click();assert.equal(await page.locator('#admin-password').getAttribute('type'),'text');await page.getByRole('button',{name:'Ẩn mật khẩu',exact:true}).click();
  await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();await page.getByRole('alert').filter({hasText:'Tài khoản hoặc mật khẩu không đúng'}).waitFor();assert.equal(await page.locator('.cms-workspace').count(),0);assert.equal(await page.locator('#admin-password').inputValue(),'');checks.push('Incorrect password rejected with a generic error; password visibility control works');
  await page.getByLabel('Mật khẩu',{exact:true}).fill(credentials.password);await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();await page.locator('.cms-workspace').waitFor({timeout:45000});await page.waitForFunction(()=>document.querySelectorAll('.cms-entry-title').length>0,null,{timeout:45000});
  const session=(await page.context().cookies()).find(c=>c.name.includes('dongtam-session'));assert(session&&session.httpOnly);assert.equal(session.sameSite,'Strict');if(root.startsWith('https:'))assert(session.secure);assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);checks.push('Real credentials establish an HttpOnly session and load CMS content through the server');
  await page.reload({waitUntil:'networkidle'});await page.locator('.cms-workspace').waitFor({timeout:30000});await page.waitForFunction(()=>document.querySelectorAll('.cms-entry-title').length>0);checks.push('Reload restores the authenticated session');
  await page.setViewportSize({width:1440,height:1000});await page.locator('.cms-sidebar nav').getByRole('button',{name:'Trang chủ & liên hệ',exact:true}).click();assert.equal(await page.locator('.cms-slide').count(),2);await page.screenshot({path:'artifacts/admin-authenticated.png',fullPage:true});
  const forbidden=await page.request.post(root+'/api/cms/logout',{data:{},headers:{Origin:root}});assert.equal(forbidden.status(),403);checks.push('State-changing requests without CSRF protection are rejected');
  await page.getByRole('button',{name:'Đăng xuất',exact:true}).click();await page.getByRole('button',{name:'Đăng nhập',exact:true}).waitFor();assert.equal(await page.locator('.cms-workspace').count(),0);assert.equal((await page.request.get(root+'/api/cms/content')).status(),401);await page.reload({waitUntil:'networkidle'});await page.getByRole('button',{name:'Đăng nhập',exact:true}).waitFor();checks.push('Logout clears access; reload stays logged out');
  assert.deepEqual(privateLeak,[]);assert.deepEqual(errors,[]);checks.push('No GitHub API calls or credentials are exposed to the browser');
  const result={url:root+'/admin/',checks,javascriptErrors:errors};fs.writeFileSync('artifacts/admin-login-check.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 }catch(e){console.error(String(e.message).split(credentials?.password||'__not_set__').join('[redacted]'));process.exitCode=1;}
 finally{credentials=null;await browser.close();}
})().catch(()=>{console.error('Unable to initialize admin verification.');process.exitCode=1;});

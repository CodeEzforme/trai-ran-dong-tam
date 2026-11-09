const fs=require('fs'),assert=require('assert');
const {chromium}=require('../.tools/node_modules/playwright');
const origin=process.env.NEXT_TEST_ORIGIN||'http://localhost:3002',base=(process.env.NEXT_TEST_BASE??'/trai-ran-dong-tam').replace(/\/$/,''),url=origin+base;
const screenshot=process.env.NEXT_TEST_SCREENSHOTS!=='0';
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const errors=[],failed=[],checks=[];
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    if(new URL(origin).hostname==='localhost')await page.route(origin+'/api/cms/session',route=>route.fulfill({status:401,json:{error:'Vui lòng đăng nhập.'}}));
    page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400&&!r.url().includes('/api/contact')&&!(r.status()===401&&r.url().includes('/api/cms/session')))failed.push({status:r.status(),url:r.url()});});
    if(process.env.NEXT_CMS_ONLY!=='1') {
    assert.equal((await page.goto(url+'/',{waitUntil:'networkidle'})).status(),200);
    await page.waitForSelector('.nx-cover-dot');
    assert.deepEqual(await page.locator('.nx-nav-item>a').allTextContents(),['Trang chủ','Giới thiệu','Nghiên cứu khoa học','Du lịch sinh thái','Sản phẩm','Vườn thuốc nam','Tin tức','Tuyển dụng']);checks.push('Navigation follows the newly requested sitemap');
    await page.locator('.nx-cover-pause').click();await page.locator('.nx-cover-dot').first().click();
    await page.evaluate(()=>{const h=document.querySelector('.nx-cover');let before=h.dataset.coverIndex;window.times=[];window.started=performance.now();new MutationObserver(()=>{if(h.dataset.coverIndex!==before){before=h.dataset.coverIndex;window.times.push(performance.now()-window.started);}}).observe(h,{attributes:true,attributeFilter:['data-cover-index']});document.querySelector('.nx-cover-pause').click();});
    await page.waitForFunction(()=>window.times.length>=2,null,{timeout:12500});const times=await page.evaluate(()=>window.times);const periods=[times[0],times[1]-times[0]];periods.forEach(t=>assert(t>4600&&t<5500,'Slideshow period '+t));
    checks.push('React cover advances every five seconds while hovered and focused: '+periods.map(Math.round).join(', ')+' ms');
    await page.locator('.nx-cover-pause').click();const frozen=await page.locator('.nx-cover').getAttribute('data-cover-index');await page.waitForTimeout(5200);assert.equal(await page.locator('.nx-cover').getAttribute('data-cover-index'),frozen);checks.push('Explicit slideshow pause works');
    assert.equal(await page.locator('#snake-scene,.scene-section').count(),0);
    const ordering=await page.locator('#main>section').evaluateAll(nodes=>nodes.map(n=>n.id||n.className));
    assert.equal(ordering[1],'tin-tuc');assert.equal(ordering[2],'san-pham-noi-bat');assert.equal(await page.locator('.nx-product-grid article').count(),4);
    assert.deepEqual(await page.locator('.nx-footer .nx-social-links a').evaluateAll(nodes=>nodes.map(n=>n.href)),['https://www.facebook.com/TrairanDongTamQK9','https://www.tiktok.com/@trairandongtam408','https://zalo.me/0898408408']);
    checks.push('News comes first after the cover, featured products are visible, 3D is removed and social links are correct');
    if(screenshot){await page.evaluate(()=>{for(const img of document.images)img.loading='eager';});for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=750){await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(90);}await page.evaluate(()=>Promise.race([Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,8000))]));await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:'artifacts/next-home-desktop.png',fullPage:true});}
    for(const width of [360,390,768,1024,1280,1440,1920]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Homepage overflow '+width);}checks.push('Homepage responsive at 360–1920 px');
    await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
    await page.locator('.nx-menu-btn').click();await page.getByRole('button',{name:'Mở danh mục Du lịch sinh thái',exact:true}).click();assert(await page.locator('.nx-subnav').filter({visible:true}).count()>0);await page.keyboard.press('Escape');assert.equal(await page.locator('.nx-menu-btn').getAttribute('aria-expanded'),'false');
    if(screenshot)await page.screenshot({path:'artifacts/next-home-mobile.png',fullPage:true});checks.push('Mobile menu expands and Escape closes it');
    await page.setViewportSize({width:1440,height:1000});await page.goto(url+'/so-do-website/',{waitUntil:'networkidle'});
    assert.deepEqual(await page.locator('.nx-sitemap-grid>section>h2').allTextContents(),['Trang chủ','Giới thiệu','Nghiên cứu khoa học','Du lịch sinh thái','Sản phẩm','Vườn thuốc nam','Tin tức','Tuyển dụng']);
    for(const label of [JSON.parse(fs.readFileSync('content/content.json','utf8')).documents.find(d=>d.path==='/doi-nuoi-thuy-dac-san/').title,'Hình ảnh nhà xưởng','Tiêu chuẩn, quy trình sản xuất','Dịch vụ trò chơi','Cây thuốc nam','Cây lâu năm'])assert(await page.locator('.nx-sitemap-grid').getByRole('link',{name:label,exact:true}).count());
    checks.push('Public sitemap contains all requested branches');
    await page.setViewportSize({width:1440,height:1000});await page.goto(url+'/vuon-thuoc-nam/',{waitUntil:'networkidle'});assert.equal(await page.locator('[data-garden-photo]').count(),6);await page.locator('[data-garden-photo]').first().click();assert(await page.locator('#garden-lightbox').isVisible());await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#garden-photo-count').textContent(),'2 / 6');await page.keyboard.press('Escape');checks.push('Six supplied garden photographs and keyboard lightbox preserved');
    await page.goto(url+'/dieu-tri-ran-can/',{waitUntil:'networkidle'});assert.equal(await page.locator('[data-garden-photo]').count(),3);await page.locator('[data-garden-photo]').first().click();assert(await page.locator('#garden-lightbox').isVisible());await page.keyboard.press('Escape');assert(await page.locator('a[href="tel:+842733853204"]').count());checks.push('Three treatment photographs and original contact retained');
    await page.getByRole('button',{name:'Tìm kiếm website',exact:true}).click();await page.locator('#nx-search').fill('vuon thuoc nam');await Promise.all([page.waitForURL('**/tim-kiem/**'),page.locator('.nx-search form').getByRole('button',{name:'Tìm kiếm',exact:true}).click()]);await page.waitForFunction(()=>document.querySelectorAll('#search-results>a').length>0);const first=await page.locator('#search-results>a').first().getAttribute('href');assert(first.startsWith(base+'/'));checks.push('Accent-insensitive search resolves base-prefixed routes');
    await page.goto(url+'/san-pham/',{waitUntil:'networkidle'});await page.locator('#catalogue-search').fill('khongco-noidung-xyz');await page.locator('.filter-form').evaluate(f=>f.requestSubmit());assert(await page.locator('.empty-results').isVisible());checks.push('Catalog filter and empty state preserved');
    await page.goto(url+'/contact/',{waitUntil:'networkidle'});
    assert.equal(await page.locator('[data-contact-form],form#len-lich').count(),0);
    const gmail=new URL(await page.getByRole('link',{name:'Soạn thư trên Gmail',exact:true}).getAttribute('href'));
    assert.equal(gmail.origin,'https://mail.google.com');assert.equal(gmail.searchParams.get('view'),'cm');assert.equal(gmail.searchParams.get('to'),'trairandongtam408@gmail.com');
    assert.equal(await page.getByRole('link',{name:'Mở ứng dụng email',exact:true}).getAttribute('href'),'mailto:trairandongtam408@gmail.com');
    assert(await page.locator('.nx-mail-address').isVisible());
    for(const width of [360,390,768,1024,1440]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Contact overflow '+width);}
    if(screenshot){await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'artifacts/next-contact-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:'artifacts/next-contact-mobile.png',fullPage:true});}
    checks.push('Contact displays the email and opens Gmail/email drafts for visitors to send themselves; no server submission form');

    }
    await page.goto(url+'/admin/',{waitUntil:'networkidle'});
    await page.getByRole('button',{name:'Đăng nhập',exact:true}).waitFor();
    assert.equal(await page.locator('.cms-workspace').count(),0);
    checks.push('Admin requires account/password login before showing the workspace');
    for(const width of [360,390,768,1024,1440]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Login overflow '+width);}
    checks.push('Login page is responsive at 360–1440 px; authenticated flows have a dedicated server test');
    const reduced=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}}),rp=await reduced.newPage();await rp.goto(url+'/',{waitUntil:'networkidle'});assert.equal(await rp.locator('.nx-cover-photo').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');await rp.waitForFunction(()=>document.querySelector('.nx-cover').dataset.coverIndex==='2',null,{timeout:7000});await reduced.close();checks.push('Reduced motion keeps 5-second schedule and removes transitions');
    assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);fs.writeFileSync('artifacts/next-browser-check.json',JSON.stringify({url,checks,javascriptErrors:errors,failedRequests:failed},null,2));console.log(JSON.stringify({checks,javascriptErrors:errors,failedRequests:failed},null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

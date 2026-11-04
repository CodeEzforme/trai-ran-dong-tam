const fs=require('fs'),assert=require('assert');
const {chromium}=require('../.tools/node_modules/playwright');
const origin=process.env.NEXT_TEST_ORIGIN||'http://localhost:3002',base=process.env.NEXT_TEST_BASE??'/trai-ran-dong-tam',url=origin+base;
const screenshot=process.env.NEXT_TEST_SCREENSHOTS!=='0';
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const errors=[],failed=[],checks=[];
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)failed.push({status:r.status(),url:r.url()});});
    if(process.env.NEXT_CMS_ONLY!=='1') {
    assert.equal((await page.goto(url+'/',{waitUntil:'networkidle'})).status(),200);
    await page.waitForSelector('.nx-cover-thumb');
    assert.deepEqual(await page.locator('.nx-nav-item>a').allTextContents(),['Trang chủ','Nghiên cứu khoa học','Du lịch sinh thái','Sản phẩm','Vườn thuốc nam','Điều trị rắn cắn','Tổ chức','Tin tức']);checks.push('Original navigation order and garden position preserved');
    await page.locator('.nx-cover-pause').click();await page.locator('.nx-cover-thumb').first().click();
    await page.evaluate(()=>{const h=document.querySelector('.nx-cover');let before=h.dataset.coverIndex;window.times=[];window.started=performance.now();new MutationObserver(()=>{if(h.dataset.coverIndex!==before){before=h.dataset.coverIndex;window.times.push(performance.now()-window.started);}}).observe(h,{attributes:true,attributeFilter:['data-cover-index']});document.querySelector('.nx-cover-pause').click();});
    await page.waitForFunction(()=>window.times.length>=2,null,{timeout:12500});const times=await page.evaluate(()=>window.times);const periods=[times[0],times[1]-times[0]];periods.forEach(t=>assert(t>4600&&t<5500,'Slideshow period '+t));
    checks.push('React cover advances every five seconds while hovered and focused: '+periods.map(Math.round).join(', ')+' ms');
    await page.locator('.nx-cover-pause').click();const frozen=await page.locator('.nx-cover').getAttribute('data-cover-index');await page.waitForTimeout(5200);assert.equal(await page.locator('.nx-cover').getAttribute('data-cover-index'),frozen);checks.push('Explicit slideshow pause works');
    await page.locator('#kham-pha-3d').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#snake-scene').dataset.state==='ready',null,{timeout:40000});
    assert.equal(await page.locator('#snake-scene canvas').count(),1);assert(await page.locator('.scene-copy').isVisible());await page.locator('[data-scene=face]').click();await page.waitForTimeout(600);assert.equal(await page.locator('[data-scene=face]').getAttribute('aria-pressed'),'true');checks.push('Textured Three.js model, visible exhibit text and face control work');
    console.log('Public cover and Three.js passed');
    if(screenshot){await page.locator('.nx-exhibit').screenshot({path:'artifacts/next-threejs.png'});await page.evaluate(()=>{for(const img of document.images)img.loading='eager';});for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=750){await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(90);}await page.evaluate(()=>Promise.race([Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,8000))]));await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:'artifacts/next-home-desktop.png',fullPage:true});}
    for(const width of [360,390,768,1024,1280,1440,1920]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Homepage overflow '+width);}checks.push('Homepage responsive at 360–1920 px');
    await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
    await page.locator('.nx-menu-btn').click();await page.getByRole('button',{name:'Mở danh mục Du lịch sinh thái',exact:true}).click();assert(await page.locator('.nx-subnav').filter({visible:true}).count()>0);await page.keyboard.press('Escape');assert.equal(await page.locator('.nx-menu-btn').getAttribute('aria-expanded'),'false');
    if(screenshot)await page.screenshot({path:'artifacts/next-home-mobile.png',fullPage:true});checks.push('Mobile menu expands and Escape closes it');
    await page.setViewportSize({width:1440,height:1000});await page.goto(url+'/vuon-thuoc-nam/',{waitUntil:'networkidle'});assert.equal(await page.locator('[data-garden-photo]').count(),6);await page.locator('[data-garden-photo]').first().click();assert(await page.locator('#garden-lightbox').isVisible());await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#garden-photo-count').textContent(),'2 / 6');await page.keyboard.press('Escape');checks.push('Six supplied garden photographs and keyboard lightbox preserved');
    await page.goto(url+'/dieu-tri-ran-can/',{waitUntil:'networkidle'});assert.equal(await page.locator('[data-garden-photo]').count(),3);await page.locator('[data-garden-photo]').first().click();assert(await page.locator('#garden-lightbox').isVisible());await page.keyboard.press('Escape');assert(await page.locator('a[href="tel:+842733853204"]').count());checks.push('Three treatment photographs and original contact retained');
    await page.getByRole('button',{name:'Tìm kiếm website',exact:true}).click();await page.locator('#nx-search').fill('vuon thuoc nam');await Promise.all([page.waitForURL('**/tim-kiem/**'),page.locator('.nx-search form').getByRole('button',{name:'Tìm kiếm',exact:true}).click()]);await page.waitForFunction(()=>document.querySelectorAll('#search-results>a').length>0);const first=await page.locator('#search-results>a').first().getAttribute('href');assert(first.startsWith(base+'/'));checks.push('Accent-insensitive search resolves base-prefixed routes');
    await page.goto(url+'/san-pham/',{waitUntil:'networkidle'});await page.locator('#catalogue-search').fill('khongco-noidung-xyz');await page.locator('.filter-form').evaluate(f=>f.requestSubmit());assert(await page.locator('.empty-results').isVisible());checks.push('Catalog filter and empty state preserved');
    }
    // Exercise CMS against an isolated GitHub API simulation. No test content is published.
    const source=JSON.parse(fs.readFileSync('content/content.json','utf8'));let fileSha='original-content',head='head',conflict=false,stored=null,tree=null,committed=null;
    await page.route('https://api.github.com/**',async route=>{
      const request=route.request(),u=new URL(request.url()),p=u.pathname,method=request.method(),body=request.postDataJSON();let response={};
      const cors={'access-control-allow-origin':origin,'access-control-allow-headers':'*','access-control-allow-methods':'GET,POST,PATCH,OPTIONS'};
      if(method==='OPTIONS')return route.fulfill({status:204,headers:cors});
      if(p==='/user')response={login:'cms-review',name:'Người quản lý'};
      else if(p.endsWith('/trai-ran-dong-tam'))response={permissions:{push:true}};
      else if(p.includes('/contents/')){if(request.headers().accept==='application/vnd.github.raw+json')return route.fulfill({status:200,body:JSON.stringify(source),contentType:'text/plain',headers:cors});response={sha:conflict?'changed-elsewhere':fileSha,content:'',encoding:'none'};}
      else if(p.includes('/git/ref/heads/'))response={object:{sha:head}};
      else if(p.endsWith('/git/blobs')){if(body.encoding==='utf-8'){stored=JSON.parse(body.content);response={sha:'saved-content'};}else response={sha:'saved-image'};}
      else if(p.endsWith('/git/trees')){tree=body;response={sha:'new-tree'};}
      else if(p.endsWith('/git/commits')&&method==='POST'){committed=body;response={sha:'published-test',html_url:'https://github.com/CodeEzforme/trai-ran-dong-tam/commit/published-test'};}
      else if(p.includes('/git/commits/'))response={tree:{sha:'old-tree'}};
      else if(p.includes('/git/refs/heads/')){assert.equal(body.force,false);fileSha='saved-content';head='published-test';response={object:{sha:head}};}
      else if(p.includes('/actions/'))response={workflow_runs:[{head_sha:'published-test',status:'completed',conclusion:'success',html_url:'https://github.com/CodeEzforme/trai-ran-dong-tam/actions'}]};
      else throw Error('Unexpected mock request '+method+' '+p);
      await route.fulfill({status:200,json:response,headers:cors});
    });
    await page.goto(url+'/admin/',{waitUntil:'networkidle'});await page.getByRole('heading',{name:'Tổng quan',exact:true}).waitFor();await page.waitForFunction(()=>document.querySelectorAll('.cms-entry-title').length>0);
    assert(await page.getByRole('button',{name:'Lưu thay đổi',exact:true}).isDisabled());if(screenshot)await page.screenshot({path:'artifacts/next-cms-desktop.png',fullPage:true});
    await page.getByRole('button',{name:'Kết nối để quản lý',exact:true}).click();await page.locator('.cms-connect-dialog input[type=password]').fill('fake-test-token-never-real');await page.locator('.cms-connect-dialog form').getByRole('button',{name:'Kết nối GitHub',exact:true}).click();await page.waitForSelector('.cms-account strong:text-is("Người quản lý")').catch(async e=>{console.log('Connection error:',await page.locator('.cms-connect-error').allTextContents());throw e;});assert.equal(await page.locator('.cms-connect-dialog input').inputValue(),'');
    checks.push('CMS guest mode is read-only; authenticated GitHub connection loads large UTF-8 content');
    await page.locator('.cms-sidebar nav').getByRole('button',{name:/Bài viết/}).click();await page.getByRole('button',{name:'Thêm bài viết',exact:true}).click();await page.getByLabel('Tiêu đề',{exact:true}).fill('Bài viết kiểm tra CMS');await page.getByLabel('Giới thiệu ngắn',{exact:true}).fill('Nội dung xem trước trong bài kiểm tra.');await page.getByRole('textbox',{name:'Nội dung bài viết',exact:true}).fill('Một câu chuyện mới ở Đồng Tâm.');await page.getByLabel('Đường dẫn',{exact:true}).fill('/bai-viet-kiem-tra-cms/');
    await page.getByRole('button',{name:'Chọn ảnh từ thư viện',exact:true}).click();await page.locator('.cms-picker-dialog input[type=file]').setInputFiles('public/assets/images/trang-chu-anh-bia-01-mobile.webp');await page.waitForSelector('.cms-picker-dialog .cms-media-item small');await page.locator('.cms-picker-dialog .cms-media-item').first().click();
    await page.getByRole('button',{name:'Xem trước nội dung',exact:true}).click();assert(await page.locator('.cms-preview-dialog h1').textContent()==='Bài viết kiểm tra CMS');assert((await page.locator('.cms-preview-dialog .prose').textContent()).includes('Một câu chuyện mới'));await page.getByRole('button',{name:'Đóng xem trước',exact:true}).click();
    conflict=true;await page.getByRole('button',{name:'Lưu bản nháp',exact:true}).click();await page.getByRole('alert').filter({hasText:'thay đổi ở nơi khác'}).waitFor();assert(!stored);conflict=false;
    await page.getByLabel('Trạng thái',{exact:true}).selectOption('published');await page.getByRole('button',{name:'Lưu & xuất bản',exact:true}).click();await page.waitForSelector('.cms-notice:has-text("Đã lưu vào GitHub")');assert(stored.documents.some(d=>d.path==='/bai-viet-kiem-tra-cms/'&&d.status==='published'&&d.body.includes('Một câu chuyện mới')));assert.equal(tree.tree.length,2);assert(tree.tree.some(t=>t.path.startsWith('public/assets/images/uploads/')));assert.equal(committed.parents[0],'head');
    assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);assert(!(await page.locator('body').textContent()).includes('fake-test-token-never-real'));checks.push('CMS editing, optimized image upload, preview, conflict protection and atomic publish work; no token in storage');
    await page.waitForSelector('.cms-notice:has-text("Website đã cập nhật thành công")',{timeout:25000});checks.push('CMS reports deployment success separately from saving');
    for(const width of [360,390,768,1024,1440]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'CMS overflow '+width);}await page.setViewportSize({width:390,height:844});if(screenshot)await page.screenshot({path:'artifacts/next-cms-editor-mobile.png',fullPage:true});
    checks.push('CMS is usable at 360–1440 px');
    await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.cms-connect-banner');assert(await page.getByRole('button',{name:'Lưu thay đổi',exact:true}).isDisabled());checks.push('Reload clears authenticated session');
    const reduced=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}}),rp=await reduced.newPage();await rp.goto(url+'/',{waitUntil:'networkidle'});assert.equal(await rp.locator('.nx-cover-photo').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');await rp.waitForFunction(()=>document.querySelector('.nx-cover').dataset.coverIndex==='2',null,{timeout:7000});await reduced.close();checks.push('Reduced motion keeps 5-second schedule and removes transitions');
    assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);fs.writeFileSync('artifacts/next-browser-check.json',JSON.stringify({url,checks,javascriptErrors:errors,failedRequests:failed},null,2));console.log(JSON.stringify({checks,javascriptErrors:errors,failedRequests:failed},null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

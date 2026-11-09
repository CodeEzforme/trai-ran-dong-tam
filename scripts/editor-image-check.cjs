const fs=require('fs'),assert=require('assert'),{chromium}=require('../.tools/node_modules/playwright');
(async()=>{const root=process.env.CMS_TEST_ORIGIN||'http://localhost:3001',browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});let data=JSON.parse(fs.readFileSync('content/content.json','utf8')),connected=false,saved,uploads=0;
try{const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route(root+'/api/cms/**',async route=>{const request=route.request(),endpoint=new URL(request.url()).pathname.split('/').at(-1);let status=200,result;
 if(endpoint==='session'){status=connected?200:401;result=connected?{user:{login:'Admin',name:'Admin'},csrf:'mock'}:{error:'Login required'};}
 else if(endpoint==='login'){connected=true;result={user:{login:'Admin',name:'Admin'},csrf:'mock'};}
 else if(endpoint==='content')result={data,sha:'a'.repeat(40)};
 else if(endpoint==='media'){uploads++;result={receipt:'mock-upload-receipt'};}
 else if(endpoint==='publish'){saved=request.postDataJSON().data;data=saved;result={sha:'b'.repeat(40),commit:{sha:'c'.repeat(40),html_url:'https://github.com/CodeEzforme/trai-ran-dong-tam'}};}
 else if(endpoint==='deployment')result={run:null};else throw Error('Unexpected request '+endpoint);await route.fulfill({status,json:result});
 });
 await page.goto(root+'/admin/',{waitUntil:'networkidle'});await page.getByLabel('Tài khoản',{exact:true}).fill('Admin');await page.getByLabel('Mật khẩu',{exact:true}).fill('mock-ui-test');await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();await page.waitForSelector('.cms-entry-title');
 await page.locator('.cms-sidebar nav').getByRole('button',{name:'Tin tức',exact:true}).click();await page.getByRole('button',{name:'Thêm bài viết',exact:true}).click();await page.getByLabel('Tiêu đề',{exact:true}).fill('Kiểm tra chèn ảnh không xuất bản thật');
 const editor=page.getByRole('textbox',{name:'Nội dung bài viết',exact:true});await editor.fill('Đầu bài viết. Cuối bài viết.');
 await editor.evaluate(el=>{const range=document.createRange();range.setStart(el.firstChild,13);range.collapse(true);const s=getSelection();s.removeAllRanges();s.addRange(range);el.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));});
 await page.getByRole('button',{name:'Chèn ảnh',exact:true}).click();await page.locator('.cms-picker-dialog .cms-media-item').first().click();await editor.locator('img').waitFor();assert(await editor.locator('img').evaluate(img=>img.decode().then(()=>img.naturalWidth>0)));
 assert((await editor.textContent()).includes('Đầu bài viết.')&&(await editor.textContent()).includes('Cuối bài viết.'));assert.equal(await page.locator('.cms-picker-dialog').isVisible(),false);
 // New uploads must display immediately via a local preview, but save canonical paths.
 await page.getByRole('button',{name:'Chèn ảnh',exact:true}).click();await page.locator('.cms-picker-dialog input[type=file]').setInputFiles('public/assets/images/dong-tam-anh-bia-danh-muc.jpg');await page.locator('.cms-media-item:has(small)').first().waitFor();await page.locator('.cms-media-item:has(small)').first().click();await page.waitForFunction(()=>document.querySelectorAll('.cms-visual-editor img').length===2);
 assert(await editor.locator('img').last().evaluate(img=>img.decode().then(()=>img.naturalWidth>0)));assert((await editor.locator('img').last().getAttribute('src')).startsWith('blob:'));
 await page.getByRole('button',{name:'HTML',exact:true}).click();const html=page.getByRole('textbox',{name:'Nội dung HTML',exact:true});assert(!(await html.inputValue()).includes('blob:'));assert((await html.inputValue()).includes('/assets/images/uploads/'));
 await html.focus();await html.press('End');await page.getByRole('button',{name:'Chèn ảnh',exact:true}).click();await page.locator('.cms-picker-dialog .cms-media-item').nth(1).click();await page.waitForFunction(()=>(document.querySelector('.cms-html-editor').value.match(/<img /g)||[]).length===3);
 await page.getByRole('button',{name:'HTML',exact:true}).click();assert.equal(await editor.locator('img').count(),3);
 await page.getByRole('button',{name:'Lưu bản nháp',exact:true}).click();await page.waitForSelector('.cms-notice:has-text("Đã lưu vào GitHub")');const doc=saved.documents.find(d=>d.title==='Kiểm tra chèn ảnh không xuất bản thật');assert.equal((doc.body.match(/<img /g)||[]).length,3);assert(!doc.body.includes('blob:')&&!doc.body.includes('data-cms-src'));assert.equal(uploads,1);
 // Editing an existing article uses the same reliable insertion path.
 await page.getByRole('button',{name:'← Quay lại danh sách',exact:true}).click();await page.locator('.cms-entry-title').filter({hasText:doc.title}).click();await page.getByRole('button',{name:'Chèn ảnh',exact:true}).click();await page.locator('.cms-picker-dialog .cms-media-item').first().click();await page.waitForFunction(()=>document.querySelectorAll('.cms-visual-editor img').length===4);
 await page.screenshot({path:'artifacts/editor-image-fixed.png'});assert.deepEqual(errors,[]);console.log(JSON.stringify({newArticleImage:true,existingArticleImage:true,newUploadPreview:true,htmlModeImage:true,canonicalPathsSaved:true,realGitHubWrites:0,javascriptErrors:errors},null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});

const fs=require('fs'),assert=require('assert'),{chromium}=require('../.tools/node_modules/playwright');
(async()=>{const root=process.env.CMS_TEST_ORIGIN||'http://localhost:3001',browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});let data=JSON.parse(fs.readFileSync('content/content.json','utf8')),saved,connected=false;
try{const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route(root+'/api/cms/**',async route=>{const request=route.request(),endpoint=new URL(request.url()).pathname.split('/').at(-1);let result,status=200;
 if(endpoint==='session'){status=connected?200:401;result=connected?{user:{login:'Admin',name:'Admin'},csrf:'mock'}:{error:'Login required'};}
 else if(endpoint==='login'){connected=true;result={user:{login:'Admin',name:'Admin'},csrf:'mock'};}
 else if(endpoint==='content')result={data,sha:'a'.repeat(40)};
 else if(endpoint==='publish'){saved=request.postDataJSON().data;result={sha:'b'.repeat(40),commit:{sha:'c'.repeat(40),html_url:'https://github.com/CodeEzforme/trai-ran-dong-tam'}};}
 else if(endpoint==='deployment')result={run:null};else throw Error('Unexpected endpoint '+endpoint);
 await route.fulfill({status,json:result});
 });
 await page.goto(root+'/admin/',{waitUntil:'networkidle'});await page.getByLabel('Tài khoản',{exact:true}).fill('Admin');await page.getByLabel('Mật khẩu',{exact:true}).fill('mock-ui-test');await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();await page.waitForSelector('.cms-entry-title');
 await page.locator('.cms-sidebar nav').getByRole('button',{name:'Danh mục',exact:true}).click();const path='/doi-nuoi-thuy-dac-san/';await page.locator('.cms-entry-title').filter({has:page.getByText(path,{exact:true})}).click();
 const title='Danh mục cập nhật từ admin kiểm tra';await page.getByLabel('Tiêu đề',{exact:true}).fill(title);await page.getByRole('button',{name:'Lưu & xuất bản',exact:true}).click();await page.waitForSelector('.cms-notice:has-text("Đã lưu vào GitHub")');
 assert.equal(saved.documents.find(d=>d.path===path).title,title);assert.equal(saved.categories.find(c=>c.path===path).name,title);
 const {navigationFor}=await import('../lib/structure.mjs');assert.equal(navigationFor(saved).find(s=>s.id==='about').children.find(c=>c.path===path).label,title);assert.deepEqual(errors,[]);
 console.log(JSON.stringify({cmsRenameAndPublish:'passed',categoryAndDocumentSynchronized:true,publicMenuUsesSavedTitle:true,realGitHubWrites:0,javascriptErrors:errors},null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});

const fs=require('fs'),assert=require('assert');
const {chromium}=require('../.tools/node_modules/playwright');
(async()=>{
 const origin=process.env.CMS_TEST_ORIGIN||'http://localhost:3001',browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const errors=[],checks=[];let data=JSON.parse(fs.readFileSync('content/content.json','utf8')),connected=false,sha='a'.repeat(40),saved;
 try{
  const {sections,collectionFor,navigationFor}=await import('../lib/structure.mjs');const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));
  await page.route(origin+'/api/cms/**',async route=>{
   const request=route.request(),endpoint=new URL(request.url()).pathname.split('/').at(-1);let status=200,result;
   if(endpoint==='session'){status=connected?200:401;result=connected?{user:{login:'Admin',name:'Admin'},csrf:'mock-csrf'}:{error:'Vui lòng đăng nhập.'};}
   else if(endpoint==='login'){connected=true;result={user:{login:'Admin',name:'Admin'},csrf:'mock-csrf'};}
   else if(endpoint==='content')result={data,sha};
   else if(endpoint==='publish'){const input=request.postDataJSON();data=input.data;saved=data;sha='b'.repeat(40);result={sha,commit:{sha:'c'.repeat(40),html_url:'https://github.com/CodeEzforme/trai-ran-dong-tam'}};}
   else if(endpoint==='deployment')result={run:null};
   else if(endpoint==='logout'){connected=false;result={ok:true};}
   else throw Error('Unexpected request '+endpoint);
   await route.fulfill({status,json:result});
  });
  await page.goto(origin+'/admin/',{waitUntil:'networkidle'});await page.getByLabel('Tài khoản',{exact:true}).fill('Admin');await page.getByLabel('Mật khẩu',{exact:true}).fill('ui-test-only-not-real');await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.cms-entry-title').length>0);
  for(const group of sections){
   await page.locator('.cms-sidebar nav').getByRole('button',{name:group.label,exact:true}).click();
   await page.getByRole('button',{name:group.kind==='product'?'Thêm sản phẩm':'Thêm bài viết',exact:true}).click();
   const title='Kiểm tra UI '+group.label;await page.getByLabel('Tiêu đề',{exact:true}).fill(title);await page.getByRole('textbox',{name:'Nội dung bài viết',exact:true}).fill('Bài kiểm tra chỉ lưu vào API mô phỏng.');
   assert.equal(await page.getByLabel('Chuyên mục chính',{exact:true}).inputValue(),group.id);
   if(group.id==='products')await page.getByText('Sản phẩm nổi bật trên trang chủ',{exact:true}).click();
   await page.getByLabel('Trạng thái',{exact:true}).selectOption('published');await page.getByRole('button',{name:'Lưu & xuất bản',exact:true}).click();await page.waitForSelector('.cms-notice:has-text("Đã lưu vào GitHub")');
   const article=saved.documents.find(d=>d.title===title);assert(article&&article.section===group.id&&article.status==='published');assert(collectionFor(group.path,saved).some(d=>d.id===article.id));if(group.id==='products')assert(article.featured);
   checks.push(group.label+': create, classify and save works');
  }
  await page.locator('.cms-sidebar nav').getByRole('button',{name:'Danh mục',exact:true}).click();
  await page.locator('.cms-entry-title').filter({hasText:'Điều trị rắn cắn'}).click();assert.equal(await page.getByLabel('Chuyên mục chính',{exact:true}).inputValue(),'research');assert.equal(await page.getByLabel('Trang mở khi bấm danh mục',{exact:true}).inputValue(),'/dieu-tri-ran-can/');
  await page.getByRole('button',{name:'← Quay lại danh sách',exact:true}).click();await page.getByRole('button',{name:'Thêm danh mục',exact:true}).click();
  await page.getByLabel('Tiêu đề',{exact:true}).fill('Danh mục con kiểm tra');await page.getByLabel('Chuyên mục chính',{exact:true}).selectOption('research');await page.getByLabel('Danh mục cha',{exact:true}).selectOption('research-projects');await page.getByLabel('Trạng thái',{exact:true}).selectOption('published');await page.getByRole('button',{name:'Lưu & xuất bản',exact:true}).click();await page.waitForSelector('.cms-notice:has-text("Đã lưu vào GitHub")');
  const category=saved.categories.find(c=>c.name==='Danh mục con kiểm tra');assert.equal(category.parentId,'research-projects');assert(navigationFor(saved).find(s=>s.id==='research').children.find(c=>c.id==='research-projects').children.some(c=>c.id===category.id));checks.push('CMS saves a nested category and preserves the treatment shortcut; API writes are mocked');
  await page.locator('.cms-sidebar nav').getByRole('button',{name:'Trang chủ & liên hệ',exact:true}).click();for(const label of ['Facebook','TikTok','Zalo'])assert((await page.getByLabel(label,{exact:true}).inputValue()).startsWith('https://'));
  await page.screenshot({path:'artifacts/cms-structure-settings.png',fullPage:true});checks.push('Social links are editable in homepage settings');
  for(const width of [360,390,768,1024,1440]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  assert.deepEqual(errors,[]);fs.writeFileSync('artifacts/cms-taxonomy-check.json',JSON.stringify({checks,javascriptErrors:errors},null,2));console.log(JSON.stringify({checks,javascriptErrors:errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exit(1);});

const fs=require('fs'),assert=require('assert'),{chromium}=require('../.tools/node_modules/playwright');
const root=(process.env.INTERIOR_TEST_ROOT||'http://localhost:3001').replace(/\/$/,'');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});const results=[],errors=[],failed=[];
try{const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(root)&&r.status()>=400)failed.push({url:r.url(),status:r.status()});});
 for(const [slug,count] of [['to-chuc',11],['gioi-thieu',0],['ban-giam-doc',3],['ban-hanh-chinh',2],['bo-phan-du-lich',3],['doi-nuoi-trong-duoc-lieu',3],['doi-nuoi-thuy-dac-san',0],['xuong-che-bien',0]]){
  assert.equal((await page.goto(root+'/'+slug+'/',{waitUntil:'networkidle'})).status(),200);assert.equal(await page.locator('.nx-person').count(),count);
  await page.evaluate(async()=>{for(const img of document.images)img.loading='eager';await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})));});
  for(const width of [360,390,768,1024,1440,1920]){await page.setViewportSize({width,height:1000});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow '+slug+' '+width);
   assert(Number.parseFloat(await page.locator('h1').evaluate(el=>getComputedStyle(el).fontSize))<=47,'Oversized heading '+slug);
   if(count)assert(await page.locator('.nx-person>img').evaluateAll(images=>images.every(img=>img.getBoundingClientRect().width<=201&&img.getBoundingClientRect().height<=241)),'Oversized portraits '+slug);
  }
  await page.setViewportSize({width:1440,height:1000});const height=await page.evaluate(()=>document.body.scrollHeight);
  if(slug==='to-chuc'){assert(height<3400,'Organization remains too long');assert.equal(await page.locator('.nx-team-section').count(),4);const names=await page.locator('.nx-person h3').allTextContents();assert.equal(new Set(names).size,11);await page.locator('.nx-team-jump a').last().click();assert(await page.locator('#bo-phan-du-lich').isVisible());}
  if(slug==='gioi-thieu'){assert.equal(await page.locator('.nx-about-facts>div').count(),3);assert.equal(await page.locator('.nx-about-pillars>section').count(),3);}
  if(['to-chuc','gioi-thieu'].includes(slug)){await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:'artifacts/interior-'+slug+'-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:'artifacts/interior-'+slug+'-mobile.png',fullPage:true});}
  results.push({slug,people:count,heightAt1440:height,responsive:'360–1920px'});
 }
 // Other article/collection layouts should stay readable after shared typography changes.
 for(const slug of ['san-pham','nghien-cuu-khoa-hoc','san-pham/cobratoxan']){await page.goto(root+'/'+slug+'/',{waitUntil:'networkidle'});for(const width of [390,1440]){await page.setViewportSize({width,height:1000});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Other page overflow '+slug);}}
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);const result={root,results,javascriptErrors:errors,failedRequests:failed};fs.writeFileSync('artifacts/interior-browser-check.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});

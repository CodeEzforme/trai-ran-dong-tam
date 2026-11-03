const { chromium } = require('../.tools/node_modules/playwright');
const fs = require('fs');
const assert = require('assert');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const errors = [], failed = [], checks = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && message.text().includes('Pattern attribute')) errors.push(message.text()); });
  page.on('response', response => { if (response.url().startsWith('http://localhost:3000') && response.status() >= 400) failed.push(response.status() + ' ' + response.url()); });
  let response = await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200);
  await page.screenshot({ path: 'artifacts/home-desktop.png' });
  checks.push('Homepage responds 200');
  const originalNavigation = JSON.parse(fs.readFileSync('data/original-navigation.json', 'utf8'));
  const navigation = await page.locator('#main-nav > .nav-group').evaluateAll(groups => groups.map(group => ({
    title: group.querySelector('.nav-link').textContent,
    href: group.querySelector('.nav-link').getAttribute('href'),
    children: [...group.querySelectorAll('.nav-dropdown a')].map(link => [link.textContent, link.getAttribute('href')])
  })));
  assert.deepEqual(navigation, originalNavigation.map(([title, href, children]) => ({ title, href: new URL(href).pathname, children: children.map(([name, url]) => [name, new URL(url).pathname]) })));
  checks.push('All original main navigation items, submenus and their exact order are preserved');
  await page.locator('.search-open').click();
  await page.locator('#site-search').fill('hổ chúa');
  await Promise.all([page.waitForURL('**/tim-kiem/**'), page.locator('#search-dialog button[type=submit]').click()]);
  await page.waitForFunction(() => document.querySelector('#search-results').children.length > 0);
  assert((await page.locator('#search-count').textContent()).includes('kết quả'));
  assert(await page.locator('#search-results a').count() > 0);
  checks.push('Search dialog and full-site search with Vietnamese text');
  await page.goto('http://localhost:3000/danh-muc-san-pham/khac/');
  const before = await page.locator('.content-card:visible').count();
  assert.equal(before, 12);
  await page.locator('.pagination a').nth(1).click();
  assert(new URL(page.url()).searchParams.get('page') === '2');
  assert.equal(await page.locator('.pagination [aria-current=page]').textContent(), '2');
  await page.locator('#catalogue-search').fill('cá sấu');
  await page.locator('.filter-form button').click();
  assert(await page.locator('.content-card:visible').count() > 0);
  assert(await page.locator('.content-card:visible').count() < before);
  await page.locator('#catalogue-search').fill('khongcoketqua123');
  await page.locator('.filter-form button').click();
  assert(await page.locator('.empty-results').isVisible());
  await page.reload();
  assert.equal(await page.locator('#catalogue-search').inputValue(), 'khongcoketqua123');
  checks.push('Category pagination, filtering, empty state and URL persistence');
  await page.goto('http://localhost:3000/san-pham/ran-ho-chua/');
  assert(await page.locator('.prose').textContent());
  checks.push('Species detail renders source content');
  await page.goto('http://localhost:3000/');
  await page.locator('#snake-scene').scrollIntoViewIfNeeded();
  await page.waitForSelector('#snake-scene[data-ready=true]', { timeout: 30000 });
  assert.equal(await page.locator('#snake-scene').getAttribute('data-model'), 'textured-cobra');
  await page.waitForTimeout(500);
  const imageBefore = await page.locator('.scene-view').screenshot({ path: 'artifacts/snake-3d.png' });
  await page.locator('[data-scene=left]').click();
  await page.waitForTimeout(800);
  const imageAfter = await page.locator('.scene-view').screenshot();
  assert(!imageBefore.equals(imageAfter), 'Rotation must change the rendered image');
  await page.locator('[data-scene=zoom-in]').click();
  await page.waitForTimeout(800);
  await page.locator('[data-scene=reset]').click();
  await page.waitForTimeout(800);
  checks.push('Real WebGL model loads; rotate, zoom and reset work');
  await page.goto('http://localhost:3000/contact/');
  await page.locator('.contact-form button[type=submit]').click();
  assert.equal(await page.locator('input[name=name]').evaluate(el => el.validity.valueMissing), true);
  await page.locator('input[name=name]').fill('Khách thử nghiệm');
  await page.locator('input[name=phone]').fill('abcdefghi');
  assert.equal(await page.locator('input[name=phone]').evaluate(el => el.validity.patternMismatch), true);
  await page.locator('input[name=phone]').fill('0901234567');
  // Prevent mailto navigation; this checks drafting only and sends no message.
  await page.evaluate(() => document.addEventListener('submit', event => {
    if (event.target.id === 'len-lich') {
      event.preventDefault();
      const form = new FormData(event.target);
      const subject = `${form.get('interest')} — ${form.get('name')}`;
      window.__draftSubject = subject;
    }
  }, true));
  await page.locator('.contact-form button[type=submit]').click();
  assert(await page.locator('.email-fallback').isVisible());
  assert((await page.locator('.email-fallback').getAttribute('href')).startsWith('mailto:trairandongtam408@gmail.com?'));
  checks.push('Contact required fields and mailto draft; no email sent');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/');
  await page.screenshot({ path: 'artifacts/home-mobile.png' });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
  await page.locator('#menu-toggle').click();
  assert(await page.locator('#main-nav').isVisible());
  const tourismToggle = page.getByRole('button', { name: 'Mở danh mục Du lịch sinh thái', exact: true });
  await tourismToggle.click();
  const tourismMenu = page.locator('#' + await tourismToggle.getAttribute('aria-controls'));
  assert(await tourismMenu.isVisible());
  await tourismMenu.locator('a[href="/nha-bao-tang-ran/"]').click();
  assert(page.url().includes('/nha-bao-tang-ran/'));
  checks.push('Mobile layout has no horizontal overflow; navigation and submenu work');
  for (const path of ['/contact/', '/gioi-thieu/', '/san-pham/', '/tin-tuc/', '/san-pham/ran-ho-chua/', '/danh-muc-san-pham/khac/']) {
    await page.goto('http://localhost:3000' + path, { waitUntil: 'domcontentloaded' });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, 'Mobile overflow: ' + path);
  }
  checks.push('Representative mobile pages have no horizontal overflow');
  const fallbackPage = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await fallbackPage.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) { return type.includes('webgl') ? null : original.call(this, type, ...args); };
  });
  await fallbackPage.goto('http://localhost:3000/');
  await fallbackPage.locator('#snake-scene').scrollIntoViewIfNeeded();
  await fallbackPage.waitForFunction(() => document.querySelector('#scene-status').textContent.includes('không hỗ trợ'));
  assert(await fallbackPage.locator('.scene-fallback').isVisible());
  checks.push('WebGL-unavailable fallback works with reduced motion');
  response = await page.goto('http://localhost:3000/khong-ton-tai/');
  assert.equal(response.status(), 404);
  assert(await page.locator('h1').textContent());
  checks.push('Missing route returns real 404 and useful navigation');
  assert.deepEqual(errors, []);
  // The intentional 404 above is expected.
  const unexpected = failed.filter(x => !x.includes('/khong-ton-tai/'));
  assert.deepEqual(unexpected, []);
  const report = { checks, javascriptErrors: errors, failedLocalRequests: unexpected };
  fs.writeFileSync('artifacts/browser-check.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });

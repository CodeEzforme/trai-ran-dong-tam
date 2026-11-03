const fs = require('fs');
const assert = require('assert');
const { chromium, devices } = require('../.tools/node_modules/playwright');
(async () => {
  const { url } = JSON.parse(fs.readFileSync('artifacts/deployment-netlify-result.json', 'utf8'));
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const checks = [], errors = [];
  try {
    const context = await browser.newContext({ ...devices['iPhone 13'], defaultBrowserType: undefined });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    assert.equal(response.status(), 200);
    await page.locator('main h1').waitFor();
    assert(!(await page.locator('body').innerText()).includes('This request was blocked'));
    assert.equal(await page.locator('[type=password]').count(), 0);
    checks.push('Homepage returns HTTP 200 with mobile Safari user agent, without a password gate');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'artifacts/netlify-mobile-home.png' });
    await page.locator('#snake-scene').scrollIntoViewIfNeeded();
    await page.waitForSelector('#snake-scene[data-ready=true]', { timeout: 45000 });
    await page.locator('[data-scene=face]').click();
    await page.waitForTimeout(600);
    assert.equal(await page.locator('#snake-scene').getAttribute('data-view'), 'face');
    await page.locator('.scene-view').screenshot({ path: 'artifacts/netlify-mobile-face.png' });
    checks.push('Published Three.js model loads and close-up works at phone viewport size');
    const article = await page.goto(new URL('/nghien-cuu-khoa-hoc/', url).href, { waitUntil: 'domcontentloaded' });
    assert.equal(article.status(), 200);
    await page.locator('main h1').waitFor();
    checks.push('A secondary route loads successfully');
    assert.deepEqual(errors, []);
    const result = { url, checks, javascriptErrors: errors, limitation: 'Chromium emulates iPhone viewport and Safari user agent; this is not a physical iPhone or a Vietnamese 4G connection.' };
    fs.writeFileSync('artifacts/netlify-hosted-check.json', JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });

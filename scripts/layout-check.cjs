const { chromium } = require('../.tools/node_modules/playwright');
const fs = require('fs');
const assert = require('assert');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.on('pageerror', error => console.log('Page error:', error.message));
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    const desktopHeight = await page.evaluate(() => document.body.scrollHeight);
    const sizes = [];
    for (const width of [360, 390, 768, 1024, 1120, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const info = await page.evaluate(() => ({ width: innerWidth, documentWidth: document.documentElement.scrollWidth, headerHeight: document.querySelector('.site-header').getBoundingClientRect().height, navDisplay: getComputedStyle(document.querySelector('#main-nav')).display, sectionPadding: getComputedStyle(document.querySelector('#trai-nghiem')).paddingTop }));
      assert(info.documentWidth <= width, 'Overflow at ' + width);
      sizes.push(info);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('#snake-scene').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('#snake-scene').dataset.ready === 'true' || document.querySelector('#scene-status').textContent.includes('Chưa tải'), { timeout: 45000 });
    assert.equal(await page.locator('#snake-scene').getAttribute('data-ready'), 'true', await page.locator('#scene-status').textContent());
    await page.locator('.scene-section').screenshot({ path: 'artifacts/scene-v2.png' });
    for (let y = 0; y < await page.evaluate(() => document.body.scrollHeight); y += 600) {
      await page.evaluate(y => window.scrollTo(0, y), y);
      await page.waitForTimeout(100);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: 'artifacts/home-v2-full.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: 'artifacts/home-v2-mobile.png' });
    await page.locator('#menu-toggle').click();
    await page.screenshot({ path: 'artifacts/navigation-v2-mobile.png' });
    const report = { desktopHeight, previousDesktopHeight: 5630, sizes };
    fs.writeFileSync('artifacts/layout-v2-check.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });

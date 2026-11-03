const fs = require('fs');
const assert = require('assert');
const { chromium } = require('../.tools/node_modules/playwright');
(async () => {
  const origin = process.env.GARDEN_TEST_ORIGIN || 'http://localhost:3000';
  const base = process.env.GARDEN_TEST_BASE || '';
  const url = origin + base + '/vuon-thuoc-nam/';
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const errors = [], failed = [], checks = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.url().startsWith(origin) && response.status() >= 400) failed.push({ status: response.status(), url: response.url() }); });
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    const nav = await page.locator('#main-nav > .nav-group > .nav-link').allTextContents();
    const productIndex = nav.indexOf('Sản phẩm');
    assert.equal(nav[productIndex + 1], 'Vườn thuốc nam');
    assert.equal(await page.locator('#main-nav [aria-current=page]').textContent(), 'Vườn thuốc nam');
    checks.push('Garden category is immediately after Products and marks the active page');
    const photos = page.locator('[data-garden-photo]');
    assert.equal(await photos.count(), 6);
    for (const photo of await photos.all()) {
      await photo.scrollIntoViewIfNeeded();
      await photo.locator('img').evaluate(image => image.decode());
      assert(await photo.locator('img').evaluate(image => image.naturalWidth > 0 && Math.abs(image.clientWidth / image.clientHeight - image.naturalWidth / image.naturalHeight) < .02));
    }
    checks.push('All six supplied photographs load at their original aspect ratios');
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: 'artifacts/garden-desktop.png', fullPage: true });
    await photos.first().click();
    assert(await page.locator('#garden-lightbox').isVisible());
    assert.equal(await page.locator('#garden-photo-count').textContent(), '1 / 6');
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#garden-photo-count').textContent(), '2 / 6');
    await page.locator('[data-garden-previous]').click();
    assert.equal(await page.locator('#garden-photo-count').textContent(), '1 / 6');
    await page.keyboard.press('ArrowLeft');
    assert.equal(await page.locator('#garden-photo-count').textContent(), '6 / 6');
    await page.keyboard.press('Escape');
    assert(!(await page.locator('#garden-lightbox').isVisible()));
    assert(await photos.first().evaluate(link => link === document.activeElement));
    checks.push('Photo viewer opens, navigates, wraps, closes with Escape and restores keyboard focus');
    for (const width of [360, 390, 768, 1121, 1280, 1366, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Page overflow at ' + width);
      if (width > 1120) {
        const bounds = await page.locator('#main-nav').boundingBox();
        const actions = await page.locator('.header-actions').boundingBox();
        assert(bounds.x + bounds.width <= actions.x + 2, 'Navigation overlaps controls at ' + width);
      }
    }
    checks.push('Eight menu items and the gallery fit desktop and mobile widths without overflow');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.locator('#menu-toggle').click();
    assert(await page.locator('#main-nav a[href="' + base + '/vuon-thuoc-nam/"]').isVisible());
    await page.locator('#menu-toggle').click();
    await page.screenshot({ path: 'artifacts/garden-mobile.png', fullPage: true });
    await photos.nth(4).click();
    await page.locator('#garden-lightbox img').evaluate(image => image.decode());
    await page.screenshot({ path: 'artifacts/garden-mobile-lightbox.png' });
    await page.locator('[data-garden-close]').click();
    await page.goto(origin + base + '/tim-kiem/?q=vuon%20thuoc', { waitUntil: 'domcontentloaded' });
    await page.locator('#search-results a[href="' + base + '/vuon-thuoc-nam/"]').waitFor();
    checks.push('Mobile menu and full-site search both lead to the new garden page');
    assert.deepEqual(errors, []); assert.deepEqual(failed, []);
    const result = { url, checks, javascriptErrors: errors, failedRequests: failed };
    fs.writeFileSync('artifacts/garden-check.json', JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });

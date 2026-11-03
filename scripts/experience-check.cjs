const { chromium } = require('../.tools/node_modules/playwright');
const assert = require('assert');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const checks = [], errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(850);
    await page.screenshot({ path: 'artifacts/hero-v3.png' });
    const track = page.locator('.animal-track');
    await track.scrollIntoViewIfNeeded();
    await page.locator('[data-gallery=next]').click();
    await page.waitForTimeout(600);
    assert(await track.evaluate(el => el.scrollLeft > 100));
    await page.locator('[data-gallery=previous]').click();
    checks.push('Species gallery scrolls in response to navigation buttons');
    await page.locator('#snake-scene').scrollIntoViewIfNeeded();
    await page.waitForSelector('#snake-scene[data-ready=true]', { timeout: 30000 });
    assert.equal(await page.locator('#snake-scene').getAttribute('data-proof'), 'verified');
    assert.equal(await page.locator('.scene-fallback').isVisible(), false);
    await page.waitForTimeout(400);
    await page.locator('.scene-section').screenshot({ path: 'artifacts/scene-v3.png' });
    checks.push('A rendered frame is validated before replacing the fallback photo');
    const initial = await page.locator('#snake-scene canvas').screenshot();
    for (const action of ['left', 'right', 'zoom-in', 'zoom-in', 'zoom-out', 'reset']) {
      await page.locator(`[data-scene=${action}]`).click();
      await page.waitForTimeout(500);
      assert.equal(await page.locator('#snake-scene').getAttribute('data-state'), 'ready');
    }
    await page.locator('[data-scene=left]').click(); await page.waitForTimeout(500);
    const rotated = await page.locator('#snake-scene canvas').screenshot();
    assert(!initial.equals(rotated));
    checks.push('Repeated rotation, zoom and reset keep the model visible');
    const faceButton = page.locator('[data-scene=face]');
    await faceButton.click(); await page.waitForTimeout(500);
    assert.equal(await faceButton.getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('#snake-scene').getAttribute('data-view'), 'face');
    const faceFrame = await page.locator('#snake-scene canvas').screenshot();
    assert(!initial.equals(faceFrame));
    await page.locator('.scene-view').screenshot({ path: 'artifacts/cobra-face-close.png' });
    for (const action of ['left', 'right', 'zoom-in', 'zoom-out']) {
      await page.locator(`[data-scene=${action}]`).click(); await page.waitForTimeout(400);
      assert.equal(await page.locator('#snake-scene').getAttribute('data-state'), 'ready');
    }
    await faceButton.click(); await page.waitForTimeout(500);
    assert.equal(await faceButton.getAttribute('aria-pressed'), 'false');
    await faceButton.click(); await page.waitForTimeout(500);
    await page.locator('[data-scene=reset]').click(); await page.waitForTimeout(500);
    assert.equal(await page.locator('#snake-scene').getAttribute('data-view'), 'full');
    checks.push('Close-up targets the face, supports rotation and zoom, and both toggle/reset restore the full model');
    await page.locator('.site-footer').scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    const retainedPixels = await page.locator('#snake-scene canvas').evaluate(canvas => {
      const probe = document.createElement('canvas'); probe.width = probe.height = 32;
      const context = probe.getContext('2d'); context.drawImage(canvas, 0, 0, 32, 32);
      const pixels = context.getImageData(0, 0, 32, 32).data;
      let visible = 0;
      for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 20) visible++;
      return visible;
    });
    assert(retainedPixels > 4, 'The last rendered frame must survive scrolling out of view');
    checks.push('The rendered model remains in the drawing buffer when scrolled out of view');
    await page.locator('#snake-scene').scrollIntoViewIfNeeded();
    await page.locator('#snake-scene canvas').evaluate(canvas => canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await page.waitForSelector('#snake-scene[data-state=error]');
    assert(await page.locator('.scene-fallback').isVisible());
    assert(await page.locator('.scene-retry').isVisible());
    await page.locator('.scene-retry').click();
    await page.waitForSelector('#snake-scene[data-ready=true]', { timeout: 30000 });
    checks.push('WebGL context loss shows the photo; retry creates a working viewer');
    await page.addInitScript(() => addEventListener('pageswap', event => sessionStorage.setItem('qa-view-transition', String(Boolean(event.viewTransition)))));
    await page.goto('http://localhost:3000/');
    await page.locator('#main-nav a[href="/nghien-cuu-khoa-hoc/"]').click();
    await page.waitForURL('**/nghien-cuu-khoa-hoc/');
    assert.equal(await page.locator('main h1').count(), 1);
    const transition = await page.evaluate(() => sessionStorage.getItem('qa-view-transition'));
    assert.equal(transition, 'true');
    checks.push('Normal page navigation works with native transitions: ' + transition);
    await page.goBack();
    await page.waitForURL('http://localhost:3000/');
    checks.push('Browser back restores the original URL');
    for (const width of [360, 390, 768, 1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Overflow at ' + width);
    }
    checks.push('New composition fits 360–1440px without horizontal page overflow');
    await page.close();
    const failedPage = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    failedPage.on('pageerror', error => errors.push(error.message));
    await failedPage.route('**/assets/models/cobra.glb*', route => route.abort());
    await failedPage.goto('http://localhost:3000/');
    await failedPage.locator('#snake-scene').scrollIntoViewIfNeeded();
    await failedPage.waitForSelector('#snake-scene[data-state=error]', { timeout: 30000 });
    assert(await failedPage.locator('.scene-fallback').isVisible());
    assert(await failedPage.locator('.scene-retry').isVisible());
    await failedPage.unroute('**/assets/models/cobra.glb*');
    await failedPage.locator('.scene-retry').click();
    await failedPage.waitForSelector('#snake-scene[data-ready=true]', { timeout: 30000 });
    checks.push('Failed model download keeps the image; retry works after network recovery');
    await failedPage.evaluate(() => {
      window.qaOriginalReadPixels = WebGL2RenderingContext.prototype.readPixels;
      WebGL2RenderingContext.prototype.readPixels = function (...args) {
        window.qaOriginalReadPixels.apply(this, args);
        if (ArrayBuffer.isView(args[6])) args[6].fill(0);
      };
    });
    await failedPage.locator('#snake-scene canvas').evaluate(canvas => canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await failedPage.waitForSelector('#snake-scene[data-state=error]');
    await failedPage.locator('.scene-retry').click();
    await failedPage.waitForFunction(() => document.querySelector('#scene-status').textContent.includes('chưa vẽ'), null, { timeout: 30000 });
    assert(await failedPage.locator('.scene-fallback').isVisible());
    await failedPage.evaluate(() => { WebGL2RenderingContext.prototype.readPixels = window.qaOriginalReadPixels; });
    await failedPage.locator('.scene-retry').click();
    await failedPage.waitForSelector('#snake-scene[data-ready=true]', { timeout: 30000 });
    checks.push('A simulated black GPU frame retains the fallback and recovers on retry');
    assert.equal(await failedPage.evaluate(() => getComputedStyle(document.querySelector('.hero-copy')).animationName), 'none');
    checks.push('Reduced motion disables decorative animation');
    assert.deepEqual(errors, []);
    await failedPage.close();
    const report = { checks, javascriptErrors: errors };
    fs.writeFileSync('artifacts/experience-v3-check.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });

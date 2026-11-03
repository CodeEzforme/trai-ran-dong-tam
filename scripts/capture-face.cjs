const { chromium } = require('../.tools/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.on('pageerror', error => console.log('PAGE ERROR ' + error.message));
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.locator('#snake-scene').scrollIntoViewIfNeeded();
    await page.waitForSelector('#snake-scene[data-ready=true]', { timeout: 30000 });
    await page.waitForTimeout(500);
    await page.locator('.scene-view').screenshot({ path: 'artifacts/cobra-face-full.png' });
    await page.locator('[data-scene=face]').click();
    await page.waitForTimeout(600);
    await page.locator('.scene-view').screenshot({ path: 'artifacts/cobra-face-close.png' });
    await page.locator('[data-scene=left]').click();
    await page.waitForTimeout(600);
    await page.locator('.scene-view').screenshot({ path: 'artifacts/cobra-face-side.png' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('[data-scene=reset]').click(); await page.waitForTimeout(500);
    await page.locator('.scene-view').screenshot({ path: 'artifacts/cobra-face-mobile-full.png' });
    await page.locator('[data-scene=face]').click(); await page.waitForTimeout(500);
    await page.locator('.scene-view').screenshot({ path: 'artifacts/cobra-face-mobile-close.png' });
    console.log(await page.locator('#scene-status').textContent());
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });

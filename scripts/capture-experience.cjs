const { chromium } = require('../.tools/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);
    await page.screenshot({ path: 'artifacts/hero-v3.png' });
    await page.locator('#snake-scene').scrollIntoViewIfNeeded();
    await page.waitForSelector('#snake-scene[data-ready=true]', { timeout: 30000 });
    await page.waitForTimeout(400);
    await page.locator('.scene-section').screenshot({ path: 'artifacts/scene-v3.png' });
    for (let y = 0; y < await page.evaluate(() => document.body.scrollHeight); y += 550) {
      await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y);
      await page.waitForTimeout(100);
    }
    await page.evaluate(() => {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-revealed'));
      document.getAnimations().forEach(animation => { try { animation.finish(); } catch {} });
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    await page.waitForFunction(() => scrollY === 0);
    await page.waitForTimeout(150);
    await page.screenshot({ path: 'artifacts/home-v3-full.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: 'artifacts/hero-v3-mobile.png' });
    await page.locator('#snake-scene').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.locator('.scene-section').screenshot({ path: 'artifacts/scene-v3-mobile.png' });
    console.log('Current desktop, mobile and 3D screenshots saved.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });

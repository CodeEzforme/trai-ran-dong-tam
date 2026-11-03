const { chromium } = require('../.tools/node_modules/playwright');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto('https://vercel.com/drop', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.locator('input[type=file]').setInputFiles('G:/TraiRanDongTam/artifacts/dong-tam-demo-full.zip');
    let previous = '';
    for (let attempt = 0; attempt < 150; attempt++) {
      await page.waitForTimeout(2000);
      const text = await page.locator('body').innerText();
      if (text !== previous) {
        const progress = text.match(/Uploading[^\n]+|Creating project[^\n]*|Your Project Is Live|Expires in[^\n]+/g);
        if (progress) console.log(progress.join(' | '));
        previous = text;
      }
      const links = await page.locator('a[href]').evaluateAll(anchors => anchors.map(a => ({ label: a.textContent.trim(), href: a.href })));
      const live = links.find(link => /^https:\/\/[^/]+\.(vercel\.app|tmp\.now)\/?/.test(link.href));
      if (live && /Your Project Is Live/i.test(text)) {
        await page.context().storageState({ path: '.tools/vercel-drop-session.json' });
        let claim = links.find(link => /claim/i.test(link.label + ' ' + link.href));
        fs.writeFileSync('artifacts/deployment-drop-result.json', JSON.stringify({ page: page.url(), live, claim, links, text }, null, 2));
        await page.screenshot({ path: 'artifacts/deployment-drop-success.png', fullPage: true });
        if (!claim) {
          const button = page.getByRole('button', { name: /Claim Project/i });
          if (await button.count()) {
            const popupPromise = page.waitForEvent('popup', { timeout: 4000 }).catch(() => null);
            await button.click();
            const popup = await popupPromise;
            await page.waitForTimeout(800);
            const destination = popup ? popup.url() : page.url();
            if (destination !== 'https://vercel.com/drop') claim = { label: 'Claim Project', href: destination };
          }
        }
        fs.writeFileSync('artifacts/deployment-drop-result.json', JSON.stringify({ live, claim, links, text }, null, 2));
        console.log('DEPLOYMENT_RESULT ' + JSON.stringify({ live, claim, expiry: text.match(/Expires in[^\n]+/)?.[0] }));
        return;
      }
      if (/upload failed|deployment failed|something went wrong|too large|too many files/i.test(text)) {
        fs.writeFileSync('artifacts/deployment-drop-error.txt', text);
        await page.screenshot({ path: 'artifacts/deployment-drop-error.png', fullPage: true });
        throw new Error('Vercel Drop reported a deployment error');
      }
    }
    fs.writeFileSync('artifacts/deployment-drop-pending.txt', previous);
    await page.screenshot({ path: 'artifacts/deployment-drop-pending.png', fullPage: true });
    throw new Error('Deployment did not reach a ready state within five minutes');
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exit(1); });

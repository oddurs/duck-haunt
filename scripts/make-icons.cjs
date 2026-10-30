// Renders the app icons from the pixel art via the dev server: node scripts/make-icons.cjs http://localhost:5173
const { chromium } = require('playwright');
(async () => {
  const base = process.argv[2] || 'http://localhost:5173';
  const browser = await chromium.launch();
  for (const n of [180, 192, 512]) {
    const page = await browser.newPage({ viewport: { width: n, height: n } });
    await page.goto(`${base}/preview.html?icon=${n}`);
    await page.waitForTimeout(400);
    await (await page.$('#c')).screenshot({ path: `public/icon-${n}.png` });
    await page.close();
  }
  await browser.close();
})();

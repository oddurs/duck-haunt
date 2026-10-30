// Usage: node scripts/shot.mjs <url> <out.png> [w h dpr] [waitMs] [actions-json]
const { chromium } = require('playwright');
(async () => {
const [url, out, w = '1200', h = '1600', dpr = '1', wait = '500', actions = '[]'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: +dpr, hasTouch: true, isMobile: +w < 900 });
page.on('console', (m) => console.log('[console]', m.type(), m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(url);
await page.waitForTimeout(+wait);
for (const a of JSON.parse(actions)) {
  if (a.tap) await page.touchscreen.tap(a.tap[0], a.tap[1]);
  if (a.click) await page.mouse.click(a.click[0], a.click[1]);
  if (a.key) await page.keyboard.press(a.key);
  if (a.wait) await page.waitForTimeout(a.wait);
  if (a.eval) console.log('[eval]', JSON.stringify(await page.evaluate(a.eval)));
  if (a.shot) await page.screenshot({ path: a.shot });
}
await page.screenshot({ path: out });
await browser.close();
})();

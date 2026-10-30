// Automated playtest: starts a mode, auto-aims at targets, screenshots along the way.
// Usage: node scripts/playtest.cjs <url> <outdir> <mode A|B|C> <w> <h> <dpr> <seconds> [accuracy 0..1]
const { chromium } = require('playwright');
(async () => {
  const [url, out, mode = 'A', w = '390', h = '844', dpr = '3', secs = '30', acc = '0.8'] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: +dpr, hasTouch: true, isMobile: true });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  page.on('console', (m) => m.type() === 'error' && console.log('[console.error]', m.text()));
  await page.goto(url);
  await page.waitForTimeout(1200);
  const toCss = `(x,y)=>{const c=__game.canvas.getBoundingClientRect();const k=c.width/__game.scale.width;return [c.left+x*k,c.top+y*k]}`;
  const btn = await page.evaluate(`(()=>{const s=__game.scene.getScene('title');const b=s.buttons[${'ABC'.indexOf(mode)}].area;return (${toCss})(b.x+b.w/2,b.y+b.h/2)})()`);
  await page.touchscreen.tap(btn[0], btn[1]);
  const t0 = Date.now();
  let shotN = 0;
  let lastShotAt = 0;
  while (Date.now() - t0 < +secs * 1000) {
    const info = await page.evaluate(`(()=>{const g=__game.scene.getScene('game');if(!g||!g.sys.isActive())return null;
      const t=(g.targets||[]).filter(t=>t.alive).map(t=>(${toCss})(t.x,t.y));
      return {phase:g.phase,t,round:g.round,score:g.score,shots:g.shots}})()`);
    const el = (Date.now() - t0) / 1000;
    if (!process.env.NOSKIP && info && info.phase === "intro" && el > 3 && el < 4) await page.touchscreen.tap(50, 300); // skip once
    if (info && info.phase === 'flying' && info.t.length && Date.now() - lastShotAt > 700) {
      const [x, y] = info.t[0];
      const miss = Math.random() > +acc;
      await page.touchscreen.tap(x + (miss ? 60 : 0), y);
      lastShotAt = Date.now();
      shotN++;
      if (shotN === 2 || shotN === 9) await page.screenshot({ path: `${out}/shot${shotN}.png` });
    }
    if (info && info.phase === 'over') {
      await page.screenshot({ path: `${out}/over.png` });
      console.log('game over', JSON.stringify(info));
      break;
    }
    await page.waitForTimeout(60);
    const sec = Math.floor(el);
    const snaps = (process.env.SNAPS || '2,6,12,20').split(',').map(Number);
    const key = Math.floor(el * 2) / 2;
    if (snaps.includes(key) && !page[`s${key}`]) {
      page[`s${key}`] = 1;
      await page.screenshot({ path: `${out}/t${key}.png` });
      console.log('t', key, JSON.stringify(info && { ...info, t: info.t.length }));
    }
  }
  await page.screenshot({ path: `${out}/end.png` });
  await browser.close();
})();

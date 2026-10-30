// Dev-only sprite sheet preview (open /preview.html).
import * as A from './gfx/art';
import { drawArt, artSize, type Art, type Palette } from './gfx/pixel';

const S = Number(new URLSearchParams(location.search).get('s') ?? 4);
const items: [Art, Palette][] = [];
const k = A.DUCK_KINDS;
for (const kind of k) {
  for (const f of Object.values(A.DUCK_SIDE)) items.push([f, kind.pal]);
  for (const f of Object.values(A.DUCK_DIAG)) items.push([f, kind.pal]);
  items.push([A.DUCK_SHOT, kind.pal], [A.DUCK_FALL, kind.pal]);
}
for (const f of Object.values(A.DOG_SIDE)) items.push([f, A.DOG_PAL]);
for (const f of Object.values(A.DOG_SNIFF)) items.push([f, A.DOG_PAL]);
for (const f of Object.values(A.DOG_JUMP)) items.push([f, A.DOG_PAL]);
for (const f of Object.values(A.DOG_FRONT)) items.push([f, A.DOG_PAL]);
items.push([A.DOG_ARM, A.DOG_PAL]);
for (const f of Object.values(A.PUMPKIN)) items.push([f, A.PROP_PAL]);
for (const f of Object.values(A.BAT)) items.push([f, A.PROP_PAL]);
items.push([A.TOMBSTONE, A.PROP_PAL], [A.CROSS, A.PROP_PAL], [A.CROSSHAIR, A.PROP_PAL], [A.BANG, A.PROP_PAL], [A.SOUL, A.PROP_PAL]);
for (const a of [A.HUD_DUCK, A.BULLET, A.ICON_SOUND_ON, A.ICON_SOUND_OFF, A.ICON_FULL, A.ICON_PAUSE, A.ARROW]) items.push([a, A.UI_PAL]);

const c = document.getElementById('c') as HTMLCanvasElement;
const iconSize = Number(new URLSearchParams(location.search).get('icon') ?? 0);
if (iconSize) {
  // App icon: laughing ghost-bulldog on the night sky, 48x48 logical pixels.
  const N = 48;
  c.width = N;
  c.height = N;
  c.style.width = c.style.height = iconSize + 'px';
  document.body.style.background = '#000';
  const x = c.getContext('2d')!;
  const bands = ['#120A2C', '#1E1048', '#2C1660', '#3A1C70'];
  for (let y = 0; y < N; y++) {
    x.fillStyle = bands[Math.min(3, Math.floor((y / N) * 4))];
    x.fillRect(0, y, N, 1);
  }
  x.fillStyle = '#FCE0A8';
  for (let yy = -6; yy <= 6; yy++) for (let xx = -6; xx <= 6; xx++) if (xx * xx + yy * yy <= 38) x.fillRect(38 + xx, 9 + yy, 1, 1);
  drawArt(x, A.DOG_FRONT.laugh0, A.DOG_PAL, 8, 12);
  x.fillStyle = '#0C3A18';
  x.fillRect(0, 42, N, 6);
  throw new Error('icon-done');
}
const W = 300;
c.width = W;
c.height = 400;
c.style.width = W * S + 'px';
c.style.height = 400 * S + 'px';
const ctx = c.getContext('2d')!;
let x = 2, y = 2, rowH = 0;
for (const [art, pal] of items) {
  const { w, h } = artSize(art);
  if (x + w > W) { x = 2; y += rowH + 3; rowH = 0; }
  drawArt(ctx, art, pal, x, y);
  x += w + 3;
  rowH = Math.max(rowH, h);
}

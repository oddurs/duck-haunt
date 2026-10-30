// Procedurally painted, size-adaptive night scene. Everything snaps to
// whole pixels and uses a small palette so it reads like an NES backdrop.
import { makeCanvas, dither, drawArt } from './pixel';
import { NES } from './palette';
import { TOMBSTONE, CROSS, PROP_PAL } from './art';

export interface Layout {
  W: number;
  H: number;
  horizon: number; // where hills meet sky
  grassTop: number; // tallest blade tips
  dirtTop: number; // dirt / HUD strip
  duckFloor: number; // ducks bounce above this
  fallFloor: number; // falling ducks vanish here
  walkY: number; // dog's feet while walking
  popHidden: number; // dog top Y when hidden
  popShown: number; // dog top Y when showing
}

export function computeLayout(W: number, H: number): Layout {
  const dirtTop = H - 42;
  const grassTop = dirtTop - 34;
  const horizon = grassTop - 2;
  return {
    W,
    H,
    horizon,
    grassTop,
    dirtTop,
    duckFloor: grassTop - 2,
    fallFloor: dirtTop - 4,
    walkY: dirtTop + 4,
    popHidden: dirtTop - 4,
    popShown: grassTop - 24,
  };
}

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

type Ctx = CanvasRenderingContext2D;

function px(ctx: Ctx, x: number, y: number, col: string, w = 1, h = 1) {
  ctx.fillStyle = col;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

function disc(ctx: Ctx, cx: number, cy: number, r: number, col: string) {
  for (let y = -r; y <= r; y++)
    for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) px(ctx, cx + x, cy + y, col);
}

// Stepped bands (flat colour with short dithered seams) like NES skies.
export const SKY_BANDS = ['#05030E', '#0A0620', '#110A30', '#1A0E40', '#24124E', '#30185C', '#3E1E68', '#4E2472', '#62307C'];
export const BLOOD_BANDS = ['#120006', '#1E000A', '#2C000E', '#3C0412', '#4E0818', '#600C1C', '#741422', '#8A1C28', '#A0282E'];

export function moonPos(L: Layout): { x: number; y: number } {
  const extra = Math.max(0, L.horizon - 200) * 0.3;
  return { x: Math.round(L.W * 0.58), y: Math.round(Math.max(30, L.horizon - 134 - extra)) };
}

/** Sky with stars and a moon glow. `bands` lets the fly-away tint reuse it. */
export function paintSky(L: Layout, bands = SKY_BANDS, seed = 3): HTMLCanvasElement {
  const { W, horizon } = L;
  const H = horizon + 4;
  const [c, ctx] = makeCanvas(W, H);
  const n = bands.length;
  const m = moonPos(L);
  for (let y = 0; y < H; y++) {
    const t = Math.pow(y / H, 1.35) * (n - 1);
    const i = Math.floor(t);
    const f = t - i;
    for (let x = 0; x < W; x++) {
      // moon glow lifts the band index nearby
      const d = Math.hypot(x - m.x, (y - m.y) * 1.15);
      const lift = d < 28 ? 2 : d < 44 ? 1 : d < 56 && (x + y) % 2 === 0 ? 1 : 0;
      let k = i;
      if (f > 0.72 && dither(x, y, (f - 0.72) / 0.28)) k++;
      k = Math.min(n - 1, k + lift);
      px(ctx, x, y, bands[k]);
    }
  }
  const r = rng(seed);
  const stars = Math.floor((W * horizon) / 200);
  for (let i = 0; i < stars; i++) {
    const x = Math.floor(r() * W);
    // denser towards the top of the sky
    const y = Math.floor(Math.pow(r(), 1.6) * horizon * 0.85);
    if (Math.hypot(x - m.x, y - m.y) < 26) continue;
    const b = r();
    px(ctx, x, y, b < 0.15 ? NES.white : b < 0.5 ? '#A8A0D8' : '#6C60A8');
  }
  // a few big four-point stars
  for (let i = 0; i < Math.max(3, W / 70); i++) {
    const x = Math.floor(8 + r() * (W - 16));
    const y = Math.floor(6 + r() * horizon * 0.5);
    if (Math.hypot(x - m.x, y - m.y) < 30) continue;
    px(ctx, x, y, NES.white);
    px(ctx, x - 1, y, '#8C84C8');
    px(ctx, x + 1, y, '#8C84C8');
    px(ctx, x, y - 1, '#8C84C8');
    px(ctx, x, y + 1, '#8C84C8');
  }
  return c;
}

export function paintMoon(): HTMLCanvasElement {
  const R = 17;
  const S = R * 2 + 5;
  const [c, ctx] = makeCanvas(S, S);
  const m = Math.floor(S / 2);
  disc(ctx, m, m, R + 1, '#F0D8B0');
  disc(ctx, m, m, R, NES.cream);
  // soft terminator on the lower right
  for (let y = -R; y <= R; y++)
    for (let x = -R; x <= R; x++) {
      if (x * x + y * y > R * R) continue;
      const t = (x + y * 0.6) / (R * 1.2);
      if (t > 0.25 && dither(x + 40, y + 40, (t - 0.25) * 1.6)) px(ctx, m + x, m + y, NES.yellow);
    }
  const craters: [number, number, number][] = [
    [-6, -5, 3],
    [5, 3, 4],
    [-3, 8, 2],
    [8, -8, 2],
    [-9, 3, 1],
  ];
  for (const [x, y, r] of craters) {
    disc(ctx, m + x, m + y, r, '#E8C890');
    px(ctx, m + x - r + 1, m + y - r + 1, NES.white);
  }
  return c;
}

/** Moonlit pixel cloud bank, tileable horizontally. */
export function paintClouds(w: number, h: number, seed = 4, body = '#1A0E40', rim = '#6858A8', under = '#120A30'): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(w, h);
  const r = rng(seed);
  const mask: boolean[][] = Array.from({ length: h }, () => new Array(w).fill(false));
  const base = h - 4;
  let x = 0;
  while (x < w) {
    const len = 30 + Math.floor(r() * 50);
    // a streak made of a few puffs with a flat bottom
    for (let p = 0; p < 4; p++) {
      const cx = x + (p + 0.5) * (len / 4);
      const ry = 3 + r() * (h * 0.35);
      const rx = len / 4 + 4;
      for (let yy = Math.floor(base - ry); yy <= base; yy++)
        for (let xx = Math.floor(cx - rx); xx <= cx + rx; xx++) {
          const dx = (xx - cx) / rx;
          const dy = (yy - base) / ry;
          if (dx * dx + dy * dy <= 1) mask[yy][((xx % w) + w) % w] = true;
        }
    }
    x += len + 20 + Math.floor(r() * 50);
  }
  for (let y = 0; y < h; y++)
    for (let x2 = 0; x2 < w; x2++) {
      if (!mask[y][x2]) continue;
      const top = y === 0 || !mask[y - 1][x2];
      const bot = y >= base - 1;
      px(ctx, x2, y, top ? rim : bot ? under : body);
      if (!top && y > 0 && !mask[y - 2]?.[x2] && (x2 + y) % 2 === 0) px(ctx, x2, y, rim);
    }
  return c;
}

type Pt = { x: number; y: number };

export interface Land {
  canvas: HTMLCanvasElement;
  windows: Pt[];
  owl: Pt; // left eye of the owl in the knot hole
  perch: Pt; // where the crow stands
  web: Pt; // where the spider's thread hangs from
}

/**
 * Gnarled dead tree: a twisting trunk with flared roots and branches that
 * hook into claws. Painted as a mask, then lit by the moon (up and to the
 * right) so every edge facing it gets a cold rim.
 */
function paintTree(ctx: Ctx, tx: number, gy: number, th: number, r: () => number): { owl: Pt; perch: Pt; web: Pt } {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const m = new Uint8Array(w * h); // 1 wood, 2 trunk bark
  const set = (x: number, y: number, v: number) => {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && y >= 0 && x < w && y < h && m[y * w + x] < v) m[y * w + x] = v;
  };
  const blob = (x: number, y: number, rad: number, v: number) => {
    const R = Math.ceil(rad);
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) if (dx * dx + dy * dy <= rad * rad + 0.5) set(x + dx, y + dy, v);
  };
  const cxAt = (t: number) => tx + Math.sin(t * 2.6 + 0.4) * 3 * t + t * 4;
  // trunk with a root flare
  for (let i = 0; i <= th; i++) {
    const t = i / th;
    let wd = 5.6 - 3.8 * Math.pow(t, 0.85);
    if (t < 0.12) wd += (0.12 - t) * 40;
    for (let x = -wd; x <= wd; x++) set(cxAt(t) + x, gy - i, 2);
  }
  // roots creeping along the ground
  for (const [dir, len, drop] of [
    [-1, 15, 3],
    [1, 13, 3],
    [-1, 8, 2],
    [1, 7, 4],
  ]) {
    let x = tx;
    let y = gy - 1;
    for (let k = 0; k < len; k++) {
      x += dir;
      if (k % drop === 0) y += 1;
      blob(x, y, Math.max(0, 1.7 * (1 - k / len)), 2);
    }
  }
  let perch: Pt = { x: tx + 20, y: gy - th * 0.6 };
  let web: Pt = { x: tx - 14, y: gy - th * 0.5 };
  const limb = (x: number, y: number, ang: number, len: number, thk: number, depth: number, curl: number, tag?: 'perch' | 'web') => {
    let a = ang;
    for (let k = 0; k < len; k++) {
      const t = k / len;
      a += curl * (t > 0.62 ? 0.1 : 0.012); // hooked, claw-like tips
      x += Math.cos(a);
      y += Math.sin(a);
      const rad = Math.max(0, thk * (1 - t * 0.72) - 0.3);
      blob(x, y, rad, 1);
      if (tag === 'perch' && k === Math.floor(len * 0.58)) perch = { x: Math.round(x), y: Math.round(y - rad - 1) };
      if (tag === 'web' && k === len - 1) web = { x: Math.round(x), y: Math.round(y + 1) };
      if (depth > 0 && k > len * 0.3 && r() < 0.08)
        limb(x, y, a + (r() < 0.5 ? -1 : 1) * (0.5 + r() * 0.6), len * (0.35 + r() * 0.25), Math.max(0.6, rad), depth - 1, (r() - 0.5) * 2.4);
    }
  };
  const topX = cxAt(1);
  limb(topX, gy - th + 2, -Math.PI / 2 - 0.4, th * 0.34, 2.6, 2, -1.2);
  limb(topX, gy - th + 2, -Math.PI / 2 + 0.5, th * 0.3, 2.4, 2, 1.1);
  limb(cxAt(0.64), gy - th * 0.64, -0.22, th * 0.5, 3.2, 2, 0.7, 'perch');
  limb(cxAt(0.5), gy - th * 0.5, Math.PI + 0.25, th * 0.32, 2.6, 1, -0.9, 'web');
  limb(cxAt(0.82), gy - th * 0.82, Math.PI + 0.65, th * 0.26, 2, 1, 1.2);

  // owl's knot hole carved out of the trunk
  const ot = 0.4;
  const hx = Math.round(cxAt(ot));
  const hy = Math.round(gy - th * ot);
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (dx * dx * 0.8 + dy * dy * 0.6 <= 2.6) m[(hy + dy) * w + hx + dx] = 3;

  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : m[y * w + x]);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const v = m[y * w + x];
      if (!v) continue;
      let col = '#0D0820';
      if (v === 3) col = at(x, y - 1) !== 3 || at(x - 1, y) !== 3 ? '#2A2050' : '#020104';
      else if ((!at(x + 1, y) && at(x - 1, y)) || (!at(x, y - 1) && at(x, y + 1))) col = '#3C2E6A';
      else if (!at(x - 1, y) && at(x + 1, y) && at(x + 2, y)) col = '#05030C';
      else if (v === 2 && !at(x + 2, y)) col = '#1E1640';
      else if (v === 2 && (x * 5 + (y >> 2) * 3) % 9 === 0) col = '#07040F';
      px(ctx, x, y, col);
    }
  return { owl: { x: hx - 1, y: hy }, perch, web };
}

/** Ruined castle on a rocky crag plus rolling graveyard hills and the dead tree. */
export function paintLand(L: Layout, seed = 11): Land {
  const { W, horizon } = L;
  const H = horizon + 8;
  const [c, ctx] = makeCanvas(W, H);
  const r = rng(seed);
  const windows: { x: number; y: number }[] = [];

  // far hills
  for (let x = 0; x < W; x++) {
    const h1 = 12 + Math.sin(x * 0.03 + 1) * 6 + Math.sin(x * 0.11) * 2;
    for (let y = Math.floor(horizon - h1); y < H; y++) px(ctx, x, y, '#1C1040');
    px(ctx, x, Math.floor(horizon - h1), '#2C1C58');
  }

  // the crag: a flat-topped outcrop with jagged, stepped slopes
  const cx = Math.round(W * 0.74);
  const top = horizon - 40;
  const half = 34;
  const prof = new Array(W).fill(H);
  for (let x = cx - half; x <= cx + half; x++) if (x >= 0 && x < W) prof[x] = top + (Math.abs(x - cx) > half - 4 ? 1 : 0);
  let y = top;
  for (let x = cx - half - 1; x >= 0 && y < horizon; x--) {
    y += r() < 0.55 ? 1 : r() < 0.3 ? 2 : 0;
    if (r() < 0.08) y += 3; // ledge drop
    prof[x] = y;
  }
  y = top;
  for (let x = cx + half + 1; x < W && y < horizon; x++) {
    y += r() < 0.7 ? 2 : 1; // steeper cliff side
    if (r() < 0.1) y -= 1;
    prof[x] = y;
  }
  const ROCK = '#140A2C';
  const ROCK2 = '#0C0620';
  const RIM = '#3E2C70';
  for (let x = 0; x < W; x++) {
    if (prof[x] >= H) continue;
    for (let yy = prof[x]; yy < H; yy++) px(ctx, x, yy, ROCK);
    // moonlight catches the left-facing edges
    const lit = x <= cx || prof[x] === top;
    px(ctx, x, prof[x], lit ? RIM : '#24184C');
    if (lit && x < cx - half && prof[x] < prof[x + 1]) px(ctx, x, prof[x] + 1, '#2A1C54');
  }
  // cracks and strata
  for (let i = 0; i < 9; i++) {
    const sx = Math.round(cx - half * 1.6 + r() * half * 3.2);
    if (sx < 0 || sx >= W || prof[sx] >= H) continue;
    let yy = prof[sx] + 3;
    let xx = sx;
    for (let k = 0; k < 6 + r() * 8 && yy < horizon; k++) {
      px(ctx, xx, yy, ROCK2);
      yy++;
      if (r() < 0.4) xx += r() < 0.5 ? -1 : 1;
    }
  }
  // a winding path down from the gate
  {
    let px0 = cx;
    for (let yy = top + 2; yy < horizon; yy += 2) {
      px0 += Math.sin(yy * 0.45) * 2.2;
      if (prof[Math.round(px0)] <= yy) px(ctx, px0, yy, '#2A1A50');
    }
  }

  const C = NES.castle;
  const rim = '#3C2A6C';
  const base = top + 1;
  const block = (x: number, y0: number, w: number, h: number) => {
    px(ctx, x, y0, C, w, h);
    px(ctx, x, y0, rim, 1, h); // moonlit left edge
  };
  const crenel = (x: number, y0: number, w: number) => {
    for (let i = 0; i < w; i += 3) {
      px(ctx, x + i, y0 - 2, C, 2, 2);
      px(ctx, x + i, y0 - 2, rim, 1, 1);
    }
  };
  const roof = (x: number, y0: number, w: number, h: number) => {
    for (let i = 0; i < h; i++) {
      const hw = Math.round((w / 2) * (1 - i / h));
      px(ctx, x + w / 2 - hw, y0 - i, C, hw * 2, 1);
      px(ctx, x + w / 2 - hw, y0 - i, rim, 1, 1);
    }
    px(ctx, x + w / 2 - 0.5, y0 - h - 3, C, 1, 3); // finial
    px(ctx, x + w / 2 + 0.5, y0 - h - 3, '#7C1020', 2, 1); // tattered pennant
  };
  const win = (x: number, y0: number, tall = 3) => {
    px(ctx, x, y0, '#2A1408', 2, tall);
    windows.push({ x, y: y0 });
  };
  // footings sink into the rock so nothing floats
  px(ctx, cx - 32, base - 1, C, 64, 4);
  block(cx - 32, base - 16, 64, 17);
  crenel(cx - 32, base - 16, 64);
  // keep
  block(cx - 12, base - 46, 24, 32);
  crenel(cx - 12, base - 46, 24);
  win(cx - 6, base - 38);
  win(cx + 4, base - 38);
  win(cx - 1, base - 28, 4);
  // left tower
  block(cx - 33, base - 40, 12, 26);
  roof(cx - 35, base - 40, 16, 16);
  win(cx - 28, base - 32);
  // right tall tower overhanging the cliff
  block(cx + 20, base - 58, 10, 44);
  roof(cx + 18, base - 58, 14, 20);
  win(cx + 24, base - 50);
  win(cx + 24, base - 36);
  px(ctx, cx + 22, base, C, 6, 3); // buttress
  px(ctx, cx + 23, base + 3, C, 4, 2);
  // thin spire
  block(cx + 8, base - 62, 5, 18);
  roof(cx + 7, base - 62, 7, 10);
  // gate with a faint ember glow
  px(ctx, cx - 4, base - 9, '#000000', 8, 10);
  px(ctx, cx - 3, base - 10, '#000000', 6, 1);
  px(ctx, cx - 2, base - 3, '#3C1408', 4, 3);
  // broken wall on the far side
  block(cx + 32, base - 8, 6, 9);
  px(ctx, cx + 35, base - 10, C, 3, 2);

  // near hills with graveyard crosses
  for (let x = 0; x < W; x++) {
    const h = 6 + Math.sin(x * 0.05 + 3) * 3 + Math.sin(x * 0.13) * 1.2;
    const y0 = Math.floor(horizon - h);
    for (let yy = y0; yy < H; yy++) px(ctx, x, yy, '#0E0624');
    px(ctx, x, y0, '#1E1244');
  }
  for (let i = 0; i < W / 40; i++) {
    const x = Math.floor(r() * W);
    if (Math.abs(x - cx) < 46) continue;
    const yy = Math.floor(horizon - 6 - r() * 3);
    if (r() < 0.5) {
      px(ctx, x, yy - 4, '#0E0624', 1, 5);
      px(ctx, x - 1, yy - 3, '#0E0624', 3, 1);
    } else {
      px(ctx, x - 1, yy - 3, '#0E0624', 3, 4);
      px(ctx, x, yy - 4, '#0E0624', 1, 1);
    }
  }

  const tree = paintTree(ctx, Math.round(W * 0.14), H - 2, Math.min(104, Math.round(horizon * 0.62)), r);
  return { canvas: c, windows, ...tree };
}

const LEAVES = ['#A0602C', '#C8843C', '#7C4020', '#E0A050', '#8C3018'];

/**
 * Tall graveyard grass (two solid, jagged rows), tombstones and the dirt
 * strip with fallen leaves. Drawn in front of ducks and the popping dog, so
 * its silhouette has no gaps.
 */
export function paintFore(L: Layout, seed = 5): HTMLCanvasElement {
  const { W, H, grassTop, dirtTop } = L;
  const [c, ctx] = makeCanvas(W, H);
  const r = rng(seed);

  // One blade: a tapered quadratic curve, dark at the root, moonlit near the tip.
  const blade = (x0: number, h: number, lean: number, w0: number, pal: string[], lit: string) => {
    h = Math.min(h, dirtTop - grassTop + 1);
    for (let i = 0; i <= h; i++) {
      const t = i / h;
      const x = Math.round(x0 + lean * t * t);
      const y = dirtTop - i;
      const w = Math.max(1, Math.round(w0 * (1 - t * 0.85)));
      const col = t < 0.35 ? pal[0] : t < 0.7 ? pal[1] : pal[2];
      px(ctx, x, y, col, w, 1);
      if (t > 0.45 && w > 1) px(ctx, x, y, lit); // left edge catches the moon
      if (i === h) px(ctx, x, y, lit);
    }
  };
  const layer = (n: number, hMin: number, hMax: number, pal: string[], lit: string) => {
    for (let i = 0; i < n; i++) {
      // blades grow in little clumps that fan outward
      const cx = Math.floor(r() * (W + 8)) - 4;
      const k = 2 + Math.floor(r() * 3);
      for (let j = 0; j < k; j++) {
        const spread = (j - (k - 1) / 2) * 1.6;
        const h = Math.round(hMin + Math.pow(r(), 1.3) * (hMax - hMin));
        const lean = spread * (1.5 + r() * 2) + (r() - 0.5) * 3;
        blade(cx + Math.round(spread), h, lean, 2 + (r() < 0.4 ? 1 : 0), pal, lit);
      }
    }
  };

  // thatch: a solid dark mat so nothing behind the grass shows its bottom edge
  for (let x = 0; x < W; x++) {
    const t = Math.round(dirtTop - (17 + 3 * Math.sin(x * 0.09 + 1) + 2 * Math.sin(x * 0.23) + r() * 3));
    px(ctx, x, t, '#0C2A16', 1, dirtTop - t);
    px(ctx, x, t - 1, '#06140C');
  }
  // back blades, tall and moonlit
  layer(Math.floor(W * 0.22), 14, 36, ['#0C3018', '#14482A', '#24603A'], '#4C8C50');

  // tombstones half sunk between the layers
  const stones = Math.max(2, Math.round(W / 90));
  for (let i = 0; i < stones; i++) {
    const x = Math.round((W / stones) * (i + 0.3 + r() * 0.4));
    drawArt(ctx, r() < 0.65 ? TOMBSTONE : CROSS, PROP_PAL, x, dirtTop - 17 - Math.floor(r() * 3));
  }

  // mid and front blades get shorter and darker
  layer(Math.floor(W * 0.2), 8, 24, ['#0A2614', '#103A20', '#1C5430'], '#38784A');
  // dark band where the blades meet the dirt
  for (let x = 0; x < W; x++) {
    const t = Math.round(dirtTop - (6 + 2 * Math.sin(x * 0.17) + r() * 2));
    px(ctx, x, t, '#061A0C', 1, dirtTop - t);
  }
  layer(Math.floor(W * 0.16), 5, 13, ['#061A0C', '#0C2C16', '#14401F'], '#24603A');

  // dirt with fallen autumn leaves
  px(ctx, 0, dirtTop, '#2A140A', W, H - dirtTop);
  px(ctx, 0, dirtTop, '#140804', W, 1);
  for (let i = 0; i < (W * (H - dirtTop)) / 14; i++) {
    const x = Math.floor(r() * W);
    const yy = dirtTop + 2 + Math.floor(r() * (H - dirtTop - 2));
    px(ctx, x, yy, r() < 0.5 ? '#3E2010' : '#1C0C06');
  }
  for (let i = 0; i < W / 6; i++) {
    const x = Math.floor(r() * W);
    const yy = dirtTop + 1 + Math.floor(Math.pow(r(), 2) * (H - dirtTop - 3));
    const col = LEAVES[Math.floor(r() * LEAVES.length)];
    if (r() < 0.5) px(ctx, x, yy, col, 2, 1);
    else {
      px(ctx, x, yy, col, 3, 1);
      px(ctx, x + 1, yy - 1, col);
    }
  }
  return c;
}

/** Wide tileable fog strip. */
export function paintFog(w: number, h: number, seed = 9, col = '#B8B8F8'): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(w, h);
  const r = rng(seed);
  for (let i = 0; i < 14; i++) {
    const cx = r() * w;
    const cy = h * (0.35 + r() * 0.4);
    const rx = 14 + r() * 26;
    const ry = 2 + r() * 4;
    for (let y = -ry; y <= ry; y++)
      for (let x = -rx; x <= rx; x++) {
        const d = (x * x) / (rx * rx) + (y * y) / (ry * ry);
        if (d > 1) continue;
        const X = Math.round((((cx + x) % w) + w) % w);
        const Y = Math.round(cy + y);
        if (dither(X, Y, (1 - d) * 0.7)) px(ctx, X, Y, col);
      }
  }
  return c;
}

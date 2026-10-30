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
    fallFloor: grassTop + 18,
    walkY: dirtTop + 4,
    popHidden: grassTop + 8,
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

function line(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, col: string, thick = 1) {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  const o = Math.floor(thick / 2);
  for (;;) {
    px(ctx, x0 - o, y0 - o, col, thick, thick);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

function disc(ctx: Ctx, cx: number, cy: number, r: number, col: string) {
  for (let y = -r; y <= r; y++)
    for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) px(ctx, cx + x, cy + y, col);
}

export const SKY_BANDS = [NES.night0, NES.night1, NES.night2, NES.night3, '#3A1C70', '#4C2078'];
export const BLOOD_BANDS = ['#1C0008', '#30000C', '#480010', '#600818', '#7C1020', '#941828'];

/** Sky with stars and the moon. `bands` lets the fly-away tint reuse it. */
export function paintSky(L: Layout, bands = SKY_BANDS, seed = 3): HTMLCanvasElement {
  const { W, horizon } = L;
  const H = horizon + 4;
  const [c, ctx] = makeCanvas(W, H);
  for (let y = 0; y < H; y++) {
    const t = Math.pow(y / H, 1.6) * (bands.length - 1);
    const i = Math.floor(t);
    const f = t - i;
    for (let x = 0; x < W; x++) {
      const col = dither(x, y, f) ? bands[Math.min(i + 1, bands.length - 1)] : bands[i];
      px(ctx, x, y, col);
    }
  }
  const r = rng(seed);
  const stars = Math.floor((W * horizon) / 260);
  for (let i = 0; i < stars; i++) {
    const x = Math.floor(r() * W);
    const y = Math.floor(r() * horizon * 0.8);
    px(ctx, x, y, r() < 0.2 ? NES.white : r() < 0.5 ? NES.gray1 : NES.lavender);
  }
  return c;
}

export function moonPos(L: Layout): { x: number; y: number } {
  const extra = Math.max(0, L.horizon - 200) * 0.3;
  return { x: Math.round(L.W * 0.7), y: Math.round(Math.max(28, L.horizon - 132 - extra)) };
}

export function paintMoon(): HTMLCanvasElement {
  const R = 17;
  const S = R * 2 + 15;
  const [c, ctx] = makeCanvas(S, S);
  const m = Math.floor(S / 2);
  // dithered halo
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const d = Math.hypot(x - m, y - m);
      if (d > R && d < R + 7 && dither(x, y, 1 - (d - R) / 7) && (x + y) % 2 === 0) px(ctx, x, y, '#5C3C8C');
    }
  disc(ctx, m, m, R, NES.cream);
  // terminator shading on the right
  for (let y = -R; y <= R; y++)
    for (let x = -R; x <= R; x++) {
      if (x * x + y * y > R * R) continue;
      if (x > R * 0.35 && dither(x + 40, y + 40, (x - R * 0.35) / (R * 0.65))) px(ctx, m + x, m + y, NES.yellow);
    }
  const craters: [number, number, number][] = [
    [-6, -5, 3],
    [5, 3, 4],
    [-3, 8, 2],
    [8, -8, 2],
    [-9, 3, 1],
  ];
  for (const [x, y, r] of craters) {
    disc(ctx, m + x, m + y, r, NES.yellow);
    px(ctx, m + x - r + 1, m + y - r + 1, NES.white);
  }
  return c;
}

/** Ruined castle on a hill plus rolling graveyard hills and the dead tree. */
export interface Land {
  canvas: HTMLCanvasElement;
  windows: { x: number; y: number }[];
  owl: { x: number; y: number };
}

export function paintLand(L: Layout, seed = 11): Land {
  const { W, horizon } = L;
  const H = horizon + 8;
  const [c, ctx] = makeCanvas(W, H);
  const r = rng(seed);
  const windows: { x: number; y: number }[] = [];

  // far hills
  for (let x = 0; x < W; x++) {
    const h1 = 10 + Math.sin(x * 0.035 + 1) * 5 + Math.sin(x * 0.11) * 2;
    for (let y = Math.floor(horizon - h1); y < H; y++) px(ctx, x, y, '#1A0E3A');
  }
  // castle hill
  const cx = Math.round(W * 0.7);
  for (let x = 0; x < W; x++) {
    const d = (x - cx) / 70;
    const h = 28 * Math.exp(-d * d * 1.6) + Math.sin(x * 0.07) * 1.5;
    for (let y = Math.floor(horizon - h); y < H; y++) px(ctx, x, y, NES.castle2);
  }
  const hillTop = Math.floor(horizon - 26);

  const C = NES.castle;
  const rim = '#3C2A6C';
  const block = (x: number, y: number, w: number, h: number) => {
    px(ctx, x, y, C, w, h);
    px(ctx, x, y, rim, 1, h); // moonlit left edge
  };
  const crenel = (x: number, y: number, w: number) => {
    for (let i = 0; i < w; i += 3) px(ctx, x + i, y - 2, C, 2, 2);
  };
  const roof = (x: number, y: number, w: number, h: number) => {
    for (let i = 0; i < h; i++) {
      const half = Math.round((w / 2) * (1 - i / h));
      px(ctx, x + w / 2 - half, y - i, C, half * 2, 1);
      px(ctx, x + w / 2 - half, y - i, rim, 1, 1);
    }
    px(ctx, x + w / 2 - 0.5, y - h - 3, C, 1, 3); // finial
  };
  const win = (x: number, y: number, tall = 3) => {
    px(ctx, x, y, '#2A1408', 2, tall);
    windows.push({ x, y });
  };

  // curtain wall
  block(cx - 34, hillTop - 16, 68, 18);
  crenel(cx - 34, hillTop - 16, 68);
  // keep
  block(cx - 12, hillTop - 46, 24, 32);
  crenel(cx - 12, hillTop - 46, 24);
  win(cx - 6, hillTop - 38);
  win(cx + 4, hillTop - 38);
  win(cx - 1, hillTop - 28, 4);
  // left tower
  block(cx - 34, hillTop - 40, 12, 26);
  roof(cx - 36, hillTop - 40, 16, 16);
  win(cx - 29, hillTop - 32);
  // right tall tower
  block(cx + 20, hillTop - 58, 10, 44);
  roof(cx + 18, hillTop - 58, 14, 20);
  win(cx + 24, hillTop - 50);
  win(cx + 24, hillTop - 36);
  // thin spire
  block(cx + 8, hillTop - 62, 5, 18);
  roof(cx + 7, hillTop - 62, 7, 10);
  // gate
  px(ctx, cx - 4, hillTop - 8, '#000000', 8, 10);
  px(ctx, cx - 3, hillTop - 9, '#000000', 6, 1);
  // broken right wall
  block(cx + 34, hillTop - 10, 10, 12);
  px(ctx, cx + 40, hillTop - 12, C, 4, 2);

  // near hills with graveyard crosses
  for (let x = 0; x < W; x++) {
    const h = 6 + Math.sin(x * 0.05 + 3) * 3 + Math.sin(x * 0.13) * 1.2;
    for (let y = Math.floor(horizon - h); y < H; y++) px(ctx, x, y, '#100828');
  }
  for (let i = 0; i < W / 40; i++) {
    const x = Math.floor(r() * W);
    if (Math.abs(x - cx) < 40) continue;
    const y = Math.floor(horizon - 6 - r() * 3);
    if (r() < 0.5) {
      px(ctx, x, y - 4, '#100828', 1, 5);
      px(ctx, x - 1, y - 3, '#100828', 3, 1);
    } else {
      px(ctx, x - 1, y - 3, '#100828', 3, 4);
      px(ctx, x, y - 4, '#100828', 1, 1);
    }
  }

  // dead tree on the left
  const tx = Math.round(W * 0.14);
  const ty = H - 2;
  const trunkH = Math.min(96, Math.round(horizon * 0.55));
  const T = '#0A0614';
  const Trim = '#2C1E50';
  for (let i = 0; i < trunkH; i++) {
    const w = Math.max(2, Math.round(7 - (i / trunkH) * 5));
    const sway = Math.round(Math.sin(i * 0.06) * 2);
    px(ctx, tx - Math.floor(w / 2) + sway, ty - i, T, w, 1);
    px(ctx, tx - Math.floor(w / 2) + sway, ty - i, Trim, 1, 1);
  }
  // roots
  line(ctx, tx - 3, ty, tx - 9, ty + 2, T, 2);
  line(ctx, tx + 3, ty, tx + 8, ty + 2, T, 2);
  // knot hole with owl eyes (they blink in-game)
  const owl = { x: tx - 1, y: ty - Math.round(trunkH * 0.45) };
  px(ctx, owl.x - 1, owl.y - 1, '#000000', 4, 3);
  const branch = (x: number, y: number, ang: number, len: number, th: number, depth: number) => {
    const x2 = x + Math.cos(ang) * len;
    const y2 = y + Math.sin(ang) * len;
    line(ctx, x, y, x2, y2, T, th);
    if (depth <= 0 || len < 4) return;
    const n = r() < 0.5 ? 2 : 3;
    for (let k = 0; k < n; k++) {
      const a = ang + (r() - 0.5) * 1.6;
      branch(x2, y2, a, len * (0.55 + r() * 0.2), Math.max(1, th - 1), depth - 1);
    }
  };
  const topX = tx + Math.round(Math.sin(trunkH * 0.06) * 2);
  branch(topX, ty - trunkH + 2, -Math.PI / 2 - 0.5, 22, 3, 3);
  branch(topX, ty - trunkH + 2, -Math.PI / 2 + 0.6, 20, 3, 3);
  branch(tx, ty - trunkH * 0.6, -0.4, 18, 2, 2);
  branch(tx, ty - trunkH * 0.7, Math.PI + 0.35, 16, 2, 2);
  return { canvas: c, windows, owl };
}

/** Tall graveyard grass, tombstones and the dirt strip. Drawn in front of ducks. */
export function paintFore(L: Layout, seed = 5): HTMLCanvasElement {
  const { W, H, grassTop, dirtTop } = L;
  const [c, ctx] = makeCanvas(W, H);
  const r = rng(seed);
  const dark = '#062010';
  const mid = '#0C3A18';
  const lite = '#1C5C28';
  const tip = '#2C7C30';

  // body of the grass
  px(ctx, 0, grassTop + 14, dark, W, dirtTop - grassTop - 14);

  // tombstones half sunk in the grass
  const stones = Math.max(2, Math.round(W / 90));
  for (let i = 0; i < stones; i++) {
    const x = Math.round((W / stones) * (i + 0.3 + r() * 0.4));
    const y = grassTop + 4 + Math.floor(r() * 4);
    drawArt(ctx, r() < 0.65 ? TOMBSTONE : CROSS, PROP_PAL, x, y);
  }

  // blades, back row then front row
  for (const [row, cols, minH, maxH] of [
    [0, [mid, lite], 10, 30],
    [1, [dark, mid], 4, 18],
  ] as [number, string[], number, number][]) {
    for (let x = 0; x < W; x++) {
      const h = Math.floor(minH + r() * (maxH - minH) * (0.6 + 0.4 * Math.sin(x * 0.21 + row)));
      const base = dirtTop;
      const top = Math.max(grassTop, base - h - (row === 0 ? 4 : 0));
      const lean = r() < 0.5 ? -1 : 1;
      for (let y = top; y < base; y++) {
        const t = (y - top) / Math.max(1, base - top);
        const xx = x + (t < 0.25 ? lean : 0);
        px(ctx, xx, y, t < 0.15 && row === 0 ? tip : cols[(x + (y >> 2)) % 2 === 0 ? 0 : 1]);
      }
    }
  }
  // dark outline along the very top of the grass silhouette
  const img = ctx.getImageData(0, 0, W, H);
  const A = (x: number, y: number) => (x < 0 || x >= W || y < 0 ? 0 : img.data[(y * W + x) * 4 + 3]);
  for (let x = 0; x < W; x++)
    for (let y = grassTop - 2; y < dirtTop; y++) {
      if (A(x, y) === 0 && (A(x, y + 1) > 0 || A(x - 1, y) > 0 || A(x + 1, y) > 0)) px(ctx, x, y, '#000000');
    }

  // dirt
  px(ctx, 0, dirtTop, '#2A140A', W, H - dirtTop);
  px(ctx, 0, dirtTop, '#140804', W, 1);
  for (let i = 0; i < (W * (H - dirtTop)) / 14; i++) {
    const x = Math.floor(r() * W);
    const y = dirtTop + 2 + Math.floor(r() * (H - dirtTop - 2));
    px(ctx, x, y, r() < 0.5 ? '#3E2010' : '#1C0C06');
  }
  // tufts on the dirt edge
  for (let x = 0; x < W; x += 3 + Math.floor(r() * 6)) {
    px(ctx, x, dirtTop - 1, dark, 1, 2);
    px(ctx, x + 1, dirtTop, dark, 1, 1);
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
        const X = Math.round(((cx + x) % w + w) % w);
        const Y = Math.round(cy + y);
        if (dither(X, Y, (1 - d) * 0.7)) px(ctx, X, Y, col);
      }
  }
  return c;
}

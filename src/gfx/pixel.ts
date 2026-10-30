// Tiny pixel-art toolkit: sprites are authored as ASCII rows where every
// character is a palette key and '.' (or ' ') is transparent.

export type Palette = Record<string, string>;
export type Art = string[];

export function artSize(art: Art): { w: number; h: number } {
  let w = 0;
  for (const r of art) w = Math.max(w, r.length);
  return { w, h: art.length };
}

export function drawArt(
  ctx: CanvasRenderingContext2D,
  art: Art,
  pal: Palette,
  ox: number,
  oy: number,
  flipX = false,
): void {
  const { w } = artSize(art);
  for (let y = 0; y < art.length; y++) {
    const row = art[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const col = pal[ch];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(ox + (flipX ? w - 1 - x : x), oy + y, 1, 1);
    }
  }
}

export function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
}

/** Add a multi-frame texture to Phaser. Frames are laid out horizontally. */
export function addFrames(
  scene: Phaser.Scene,
  key: string,
  frames: Record<string, Art>,
  pal: Palette,
): void {
  const names = Object.keys(frames);
  let fw = 0;
  let fh = 0;
  for (const n of names) {
    const s = artSize(frames[n]);
    fw = Math.max(fw, s.w);
    fh = Math.max(fh, s.h);
  }
  const [c, ctx] = makeCanvas(fw * names.length, fh);
  names.forEach((n, i) => drawArt(ctx, frames[n], pal, i * fw, 0));
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const tex = scene.textures.addCanvas(key, c)!;
  names.forEach((n, i) => tex.add(n, 0, i * fw, 0, fw, fh));
}

export function addArt(scene: Phaser.Scene, key: string, art: Art, pal: Palette): void {
  addFrames(scene, key, { f: art }, pal);
}

/** Bayer-ish ordered dither test so gradients stay "8-bit". */
export function dither(x: number, y: number, t: number): boolean {
  const m = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
  ];
  return (m[y & 3][x & 3] + 0.5) / 16 < t;
}

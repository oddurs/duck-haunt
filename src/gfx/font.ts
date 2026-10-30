// Chunky 7x7 NES-style font in 8x8 cells, generated at boot.
import { makeCanvas } from './pixel';

const G: Record<string, string> = {
  A: '..###..|.##.##.|##...##|##...##|#######|##...##|##...##',
  B: '######.|##...##|##...##|######.|##...##|##...##|######.',
  C: '..####.|.##..##|##.....|##.....|##.....|.##..##|..####.',
  D: '#####..|##..##.|##...##|##...##|##...##|##..##.|#####..',
  E: '#######|##.....|##.....|######.|##.....|##.....|#######',
  F: '#######|##.....|##.....|######.|##.....|##.....|##.....',
  G: '..#####|.##....|##.....|##..###|##...##|.##..##|..#####',
  H: '##...##|##...##|##...##|#######|##...##|##...##|##...##',
  I: '.######|...##..|...##..|...##..|...##..|...##..|.######',
  J: '....###|.....##|.....##|.....##|##...##|##...##|.#####.',
  K: '##...##|##..##.|##.##..|####...|#####..|##.###.|##..###',
  L: '.##....|.##....|.##....|.##....|.##....|.##....|.######',
  M: '##...##|###.###|#######|#######|##.#.##|##...##|##...##',
  N: '##...##|###..##|####.##|#######|##.####|##..###|##...##',
  O: '.#####.|##...##|##...##|##...##|##...##|##...##|.#####.',
  P: '######.|##...##|##...##|##...##|######.|##.....|##.....',
  Q: '.#####.|##...##|##...##|##...##|##.####|##..##.|.####.#',
  R: '######.|##...##|##...##|##..###|#####..|##.###.|##..###',
  S: '.####..|##..##.|##.....|.#####.|.....##|##...##|.#####.',
  T: '.######|...##..|...##..|...##..|...##..|...##..|...##..',
  U: '##...##|##...##|##...##|##...##|##...##|##...##|.#####.',
  V: '##...##|##...##|##...##|###.###|.#####.|..###..|...#...',
  W: '##...##|##...##|##.#.##|#######|#######|###.###|##...##',
  X: '##...##|###.###|.#####.|..###..|.#####.|###.###|##...##',
  Y: '.##..##|.##..##|.##..##|..####.|...##..|...##..|...##..',
  Z: '#######|....###|...###.|..###..|.###...|###....|#######',
  '0': '..###..|.#..##.|##...##|##...##|##...##|.##..#.|..###..',
  '1': '...##..|..###..|...##..|...##..|...##..|...##..|.######',
  '2': '.#####.|##...##|....###|..####.|.####..|###....|#######',
  '3': '.######|....##.|...##..|..####.|.....##|##...##|.#####.',
  '4': '...###.|..####.|.##.##.|##..##.|#######|....##.|....##.',
  '5': '######.|##.....|######.|.....##|.....##|##...##|.#####.',
  '6': '..####.|.##....|##.....|######.|##...##|##...##|.#####.',
  '7': '#######|##...##|....##.|...##..|..##...|..##...|..##...',
  '8': '.####..|##...#.|###..#.|.####..|#..####|#....##|.#####.',
  '9': '.#####.|##...##|##...##|.######|.....##|....##.|.####..',
  '.': '.......|.......|.......|.......|.......|..##...|..##...',
  ',': '.......|.......|.......|.......|..##...|..##...|.##....',
  '!': '..##...|..##...|..##...|..##...|..##...|.......|..##...',
  '?': '.#####.|##...##|....##.|...##..|...##..|.......|...##..',
  ':': '.......|..##...|..##...|.......|..##...|..##...|.......',
  '-': '.......|.......|.......|.#####.|.......|.......|.......',
  '=': '.......|.......|#######|.......|#######|.......|.......',
  '+': '.......|..##...|..##...|######.|..##...|..##...|.......',
  "'": '..##...|..##...|.##....|.......|.......|.......|.......',
  '/': '.....##|....##.|...##..|..##...|.##....|##.....|.......',
  '>': '.##....|..##...|...##..|....##.|...##..|..##...|.##....',
  '<': '....##.|...##..|..##...|.##....|..##...|...##..|....##.',
  '*': '.......|##.#.##|.#####.|#######|.#####.|##.#.##|.......',
  '(': '...##..|..##...|.##....|.##....|.##....|..##...|...##..',
  ')': '..##...|...##..|....##.|....##.|....##.|...##..|..##...',
  '%': '##...##|##..##.|...##..|..##...|.##....|##..##.|##...##',
  '#': '.##.##.|#######|.##.##.|.##.##.|.##.##.|#######|.##.##.',
  ' ': '.......|.......|.......|.......|.......|.......|.......',
};

export const FONT_CHARS = Object.keys(G).join('');
export const CELL = 8;

export function glyph(ch: string): string[] {
  return (G[ch] ?? G['?']).split('|');
}

/**
 * Registers two RetroFonts: 'px' (white) and 'pxs' (white with a 1px black
 * drop shadow). Both are white so they can be tinted.
 */
export function registerFonts(scene: Phaser.Scene): void {
  const chars = FONT_CHARS;
  const perRow = 16;
  const rows = Math.ceil(chars.length / perRow);
  for (const shadow of [false, true]) {
    const key = shadow ? 'pxs' : 'px';
    const [c, ctx] = makeCanvas(perRow * CELL, rows * CELL);
    [...chars].forEach((ch, i) => {
      const gx = (i % perRow) * CELL;
      const gy = Math.floor(i / perRow) * CELL;
      const g = glyph(ch);
      const paint = (dx: number, dy: number, col: string) => {
        ctx.fillStyle = col;
        g.forEach((row, y) => {
          for (let x = 0; x < row.length; x++) if (row[x] === '#') ctx.fillRect(gx + x + dx, gy + y + dy, 1, 1);
        });
      };
      if (shadow) paint(1, 1, '#000000');
      paint(0, 0, '#FFFFFF');
    });
    if (scene.textures.exists(key)) scene.textures.remove(key);
    scene.textures.addCanvas(key, c);
    const data = Phaser.GameObjects.RetroFont.Parse(scene, {
      image: key,
      width: CELL,
      height: CELL,
      chars,
      charsPerRow: perRow,
      'offset.x': 0,
      'offset.y': 0,
      'spacing.x': 0,
      'spacing.y': 0,
      lineSpacing: 2,
    });
    scene.cache.bitmapFont.add(key, data);
  }
}

export interface LogoStyle {
  scale: number;
  bands: string[]; // top-to-bottom fill colours
  outline: string;
  outline2?: string;
  drip?: string;
  seed?: number;
}

/** Big banded, outlined (and optionally dripping) title lettering. */
export function renderLogo(text: string, st: LogoStyle): HTMLCanvasElement {
  const s = st.scale;
  const pad = 3;
  const dripRoom = st.drip ? 10 : 0;
  const w = text.length * CELL * s + pad * 2;
  const h = 7 * s + pad * 2 + dripRoom;
  // 1) fill mask
  const mask: boolean[][] = Array.from({ length: h }, () => new Array(w).fill(false));
  [...text].forEach((ch, i) => {
    glyph(ch).forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        if (row[x] !== '#') continue;
        for (let yy = 0; yy < s; yy++)
          for (let xx = 0; xx < s; xx++) mask[pad + y * s + yy][pad + i * CELL * s + x * s + xx] = true;
      }
    });
  });
  // 2) drips hang from the bottom edge of strokes
  let seed = st.seed ?? 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const dripMask: boolean[][] = Array.from({ length: h }, () => new Array(w).fill(false));
  if (st.drip) {
    for (let x = 0; x < w; x++) {
      for (let y = h - 2; y > 0; y--) {
        if (mask[y][x] && !mask[y + 1][x]) {
          if (rnd() < 0.16) {
            const len = 2 + Math.floor(rnd() * dripRoom);
            for (let k = 1; k <= len && y + k < h - 1; k++) {
              dripMask[y + k][x] = true;
              if (k === len && x + 1 < w) dripMask[y + k][x + 1] = true;
            }
          }
          break;
        }
      }
    }
  }
  const [c, ctx] = makeCanvas(w, h);
  const filled = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < w && y < h && (mask[y][x] || dripMask[y][x]);
  // outlines
  const ring = (r: number, col: string) => {
    ctx.fillStyle = col;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        if (filled(x, y)) continue;
        let near = false;
        for (let dy = -r; dy <= r && !near; dy++)
          for (let dx = -r; dx <= r && !near; dx++) if (Math.abs(dx) + Math.abs(dy) <= r && filled(x + dx, y + dy)) near = true;
        if (near) ctx.fillRect(x, y, 1, 1);
      }
  };
  if (st.outline2) ring(2, st.outline2);
  ring(1, st.outline);
  const top = pad;
  const bot = pad + 7 * s;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (mask[y][x]) {
        const t = Math.min(0.999, Math.max(0, (y - top) / (bot - top)));
        ctx.fillStyle = st.bands[Math.floor(t * st.bands.length)];
        ctx.fillRect(x, y, 1, 1);
        // a 1px highlight on top edges for that embossed NES look
        if (y > 0 && !mask[y - 1][x]) {
          ctx.fillStyle = 'rgba(255,255,255,0.55)';
          ctx.fillRect(x, y, 1, 1);
        }
      } else if (dripMask[y][x]) {
        ctx.fillStyle = st.drip!;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  return c;
}

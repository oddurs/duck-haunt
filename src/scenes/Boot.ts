// Generates every texture from the ASCII art at startup (no image files).
import Phaser from 'phaser';
import * as A from '../gfx/art';
import { addFrames, addArt, makeCanvas, artSize, type Art } from '../gfx/pixel';
import { registerFonts } from '../gfx/font';
import { paintMoon, paintFog } from '../gfx/background';

/** Glowing-eye anchor points for each duck frame, relative to frame top-left. */
export const EYES: Record<string, { x: number; y: number }[]> = {};
export const DUCK_FRAME: Record<string, { w: number; h: number }> = {};

function eyeClusters(art: Art): { x: number; y: number }[] {
  const pts: [number, number][] = [];
  art.forEach((row, y) => [...row].forEach((c, x) => c === 'E' && pts.push([x, y])));
  const groups: [number, number][][] = [];
  for (const p of pts) {
    const g = groups.find((g) => g.some((q) => Math.abs(q[0] - p[0]) <= 1 && Math.abs(q[1] - p[1]) <= 1));
    if (g) g.push(p);
    else groups.push([p]);
  }
  return groups.map((g) => ({
    x: g.reduce((s, p) => s + p[0], 0) / g.length + 0.5,
    y: g.reduce((s, p) => s + p[1], 0) / g.length + 0.5,
  }));
}

const silhouette = (art: Art, keep = (c: string) => c !== 'K' && c !== '.') =>
  art.map((r) => [...r].map((c) => (keep(c) ? 'W' : '.')).join(''));

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create(): void {
    registerFonts(this);

    const duckFrames: Record<string, Art> = { ...A.DUCK_SIDE, ...A.DUCK_DIAG, shot: A.DUCK_SHOT, fall: A.DUCK_FALL };
    A.DUCK_KINDS.forEach((k, i) => addFrames(this, `duck${i}`, duckFrames, k.pal));
    // all duck frames share one cell size (the max)
    let fw = 0;
    let fh = 0;
    for (const a of Object.values(duckFrames)) {
      const s = artSize(a);
      fw = Math.max(fw, s.w);
      fh = Math.max(fh, s.h);
    }
    for (const [n, a] of Object.entries(duckFrames)) {
      EYES[n] = eyeClusters(a);
      DUCK_FRAME[n] = { w: fw, h: fh };
    }

    addFrames(this, 'dogSide', { ...A.DOG_SIDE, ...A.DOG_SNIFF }, A.DOG_PAL);
    addArt(this, 'dogJump', A.DOG_JUMP.jump, A.DOG_PAL);
    addArt(this, 'dogDive', A.DOG_JUMP.dive, A.DOG_PAL);
    addFrames(this, 'dogFront', A.DOG_FRONT, A.DOG_PAL);
    addArt(this, 'dogArm', A.DOG_ARM, A.DOG_PAL);

    for (const [k, a] of Object.entries(A.PUMPKIN)) addArt(this, k, a, A.PROP_PAL);
    addFrames(this, 'bat', A.BAT, A.PROP_PAL);
    addArt(this, 'crosshair', A.CROSSHAIR, A.PROP_PAL);
    addArt(this, 'bang', A.BANG, A.PROP_PAL);
    addArt(this, 'soul', A.SOUL, A.PROP_PAL);
    addArt(this, 'hudDuck', A.HUD_DUCK, A.UI_PAL);
    addArt(this, 'hudPumpkin', silhouette(A.PUMPKIN.p7, (c) => c !== '.'), A.UI_PAL);
    addArt(this, 'bullet', A.BULLET, A.UI_PAL);
    addArt(this, 'icoSoundOn', A.ICON_SOUND_ON, A.UI_PAL);
    addArt(this, 'icoSoundOff', A.ICON_SOUND_OFF, A.UI_PAL);
    addArt(this, 'icoFull', A.ICON_FULL, A.UI_PAL);
    addArt(this, 'icoPause', A.ICON_PAUSE, A.UI_PAL);
    addArt(this, 'arrow', A.ARROW, A.UI_PAL);

    // 1px white pixel for particles / flashes
    {
      const [c, ctx] = makeCanvas(2, 2);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 2, 2);
      this.textures.addCanvas('pix', c);
    }
    // chunky pixel glow (white, tinted per duck, drawn additively)
    {
      const R = 6;
      const [c, ctx] = makeCanvas(R * 2 + 1, R * 2 + 1);
      for (let y = -R; y <= R; y++)
        for (let x = -R; x <= R; x++) {
          const d = Math.abs(x) + Math.abs(y) * 1.2;
          const a = d <= 1 ? 0.9 : d <= 2.5 ? 0.5 : d <= 4 ? 0.25 : d <= 6 ? ((x + y) & 1 ? 0.12 : 0) : 0;
          if (a <= 0) continue;
          ctx.fillStyle = `rgba(255,255,255,${a})`;
          ctx.fillRect(x + R, y + R, 1, 1);
        }
      this.textures.addCanvas('glow', c);
    }
    this.textures.addCanvas('moon', paintMoon());
    this.textures.addCanvas('fog', paintFog(256, 24, 9, '#8C7CC8'));
    this.textures.addCanvas('fog2', paintFog(256, 20, 21, '#C8C0F0'));

    const fr = (key: string, ...names: string[]) => names.map((frame) => ({ key, frame }));
    this.anims.create({ key: 'dogWalk', frames: fr('dogSide', 'walk0', 'walk1'), frameRate: 6, repeat: -1 });
    this.anims.create({ key: 'dogSniff', frames: fr('dogSide', 'sniff0', 'sniff1'), frameRate: 7, repeat: -1 });
    this.anims.create({ key: 'dogLaugh', frames: fr('dogFront', 'laugh0', 'laugh1'), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'bat', frames: fr('bat', 'bat0', 'bat1'), frameRate: 8, repeat: -1 });

    this.scene.start('title');
  }
}

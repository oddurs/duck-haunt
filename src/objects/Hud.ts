// Bottom HUD: R=n, SHOT bullets, HIT duck tally with quota bars, SCORE.
import Phaser from 'phaser';
import type { Layout } from '../gfx/background';
import { DEPTH, COL, txt, box } from '../ui';

export type IconState = 0 | 1 | 2; // pending, hit, missed

export class Hud {
  private g: Phaser.GameObjects.Graphics;
  private round: Phaser.GameObjects.BitmapText;
  private shotLbl: Phaser.GameObjects.BitmapText;
  private hitLbl: Phaser.GameObjects.BitmapText;
  private score: Phaser.GameObjects.BitmapText;
  private scoreLbl: Phaser.GameObjects.BitmapText;
  private bullets: Phaser.GameObjects.Image[];
  private icons: Phaser.GameObjects.Image[];
  states: IconState[] = new Array(10).fill(0);
  flashing: number[] = [];
  private required = 6;
  private x0 = 0;
  private y0 = 0;

  constructor(scene: Phaser.Scene, iconKey: string) {
    const s = scene;
    this.g = s.add.graphics().setDepth(DEPTH.hud);
    this.round = txt(s, 0, 0, 'R=1', COL.lime).setDepth(DEPTH.hud);
    this.shotLbl = txt(s, 0, 0, 'SHOT', COL.cyan, false).setDepth(DEPTH.hud);
    this.hitLbl = txt(s, 0, 0, 'HIT', COL.lime, false).setDepth(DEPTH.hud);
    this.score = txt(s, 0, 0, '000000', COL.white, false).setDepth(DEPTH.hud);
    this.scoreLbl = txt(s, 0, 0, 'SCORE', COL.white, false).setDepth(DEPTH.hud);
    this.bullets = [0, 1, 2].map(() => s.add.image(0, 0, 'bullet').setOrigin(0).setDepth(DEPTH.hud));
    this.icons = new Array(10).fill(0).map(() => s.add.image(0, 0, iconKey).setOrigin(0).setDepth(DEPTH.hud));
  }

  layout(L: Layout): void {
    const total = 36 + 4 + 114 + 4 + 56;
    this.x0 = Math.round((L.W - total) / 2);
    this.y0 = L.H - 30;
    this.redraw();
  }

  private redraw(): void {
    const g = this.g;
    const x = this.x0;
    const y = this.y0;
    g.clear();
    // SHOT
    box(g, x, y, 36, 24, COL.cyan);
    this.bullets.forEach((b, i) => b.setPosition(x + 8 + i * 8, y + 3));
    this.shotLbl.setPosition(x + 2, y + 13);
    this.round.setPosition(x + 1, y - 11);
    // HIT
    const hx = x + 40;
    box(g, hx, y, 114, 24, COL.lime);
    this.hitLbl.setPosition(hx + 4, y + 8);
    this.icons.forEach((ic, i) => ic.setPosition(hx + 30 + i * 8, y + 5));
    g.fillStyle(COL.blue, 1);
    for (let i = 0; i < 10; i++) {
      g.fillStyle(i < this.required ? COL.blue : 0x202040, 1);
      g.fillRect(hx + 30 + i * 8, y + 15, 6, 3);
    }
    // SCORE
    const sx = hx + 118;
    box(g, sx, y, 56, 24, COL.white);
    this.score.setPosition(sx + 4, y + 4);
    this.scoreLbl.setPosition(sx + 8, y + 14);
  }

  setRound(n: number) {
    this.round.setText(`R=${n}`);
  }
  setRequired(n: number) {
    this.required = n;
    this.redraw();
  }
  setShots(n: number) {
    this.bullets.forEach((b, i) => b.setVisible(i < n));
  }
  setScore(n: number) {
    this.score.setText(String(Math.min(999999, n)).padStart(6, '0'));
  }
  resetIcons() {
    this.states = new Array(10).fill(0);
    this.flashing = [];
  }

  update(time: number): void {
    const on = Math.floor(time / 160) % 2 === 0;
    this.icons.forEach((ic, i) => {
      const st = this.states[i];
      ic.setTint(st === 1 ? COL.red : st === 2 ? COL.dim : COL.white);
      ic.setVisible(this.flashing.includes(i) ? on : true);
    });
  }

  setVisible(v: boolean) {
    [this.g, this.round, this.shotLbl, this.hitLbl, this.score, this.scoreLbl, ...this.bullets, ...this.icons].forEach((o) =>
      o.setVisible(v),
    );
  }
}

// Game C target: a jack-o'-lantern lobbed into the distance (clay shooting).
import Phaser from 'phaser';
import type { Layout } from '../gfx/background';
import { DEPTH } from '../ui';

const SIZES: [string, number][] = [
  ['p16', 9],
  ['p11', 7],
  ['p7', 5],
  ['p4', 3],
];

export class Pumpkin {
  readonly sprite: Phaser.GameObjects.Image;
  private glow: Phaser.GameObjects.Image;
  state: 'fly' | 'hit' | 'gone' = 'fly';
  private t = 0;
  private sx: number;
  private sy: number;
  private ex: number;
  private ey: number;
  private radius = 9;

  constructor(
    scene: Phaser.Scene,
    L: Layout,
    side: number,
    private duration: number,
    private delay: number,
  ) {
    this.sx = L.W / 2 + side * L.W * (0.12 + Math.random() * 0.1);
    this.sy = L.dirtTop - 6;
    this.ex = L.W / 2 + side * L.W * (0.05 + Math.random() * 0.3);
    this.ey = Math.max(30, L.horizon - 60 - Math.random() * 50);
    this.sprite = scene.add.image(this.sx, this.sy, 'p16').setDepth(DEPTH.duck).setVisible(false);
    this.glow = scene.add
      .image(this.sx, this.sy, 'glow')
      .setTint(0xf8b800)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(DEPTH.duck + 1)
      .setVisible(false);
  }

  get x() {
    return this.sprite.x;
  }
  get y() {
    return this.sprite.y;
  }
  get alive() {
    return this.state === 'fly' && this.sprite.visible;
  }

  hitScore(px: number, py: number, pad: number): number {
    if (!this.alive) return Infinity;
    const d = Math.hypot(px - this.x, py - this.y);
    return d <= this.radius + pad ? d * d : Infinity;
  }

  update(dt: number): boolean {
    if (this.state !== 'fly') return false;
    if (this.delay > 0) {
      this.delay -= dt;
      return this.delay <= 0; // true = just launched
    }
    this.t += dt / this.duration;
    const k = 1 - Math.pow(1 - Math.min(1, this.t), 2);
    // arc: rises fast then floats into the distance
    const x = this.sx + (this.ex - this.sx) * k;
    const y = this.sy + (this.ey - this.sy) * k - Math.sin(k * Math.PI) * 12;
    const si = this.t < 0.28 ? 0 : this.t < 0.55 ? 1 : this.t < 0.8 ? 2 : 3;
    const [key, r] = SIZES[si];
    this.radius = r;
    this.sprite.setTexture(key).setPosition(Math.round(x), Math.round(y)).setVisible(true);
    this.glow.setPosition(this.sprite.x, this.sprite.y).setVisible(true).setScale(1.6 - si * 0.35).setAlpha(0.5);
    if (this.t >= 1) {
      this.state = 'gone';
      this.sprite.setVisible(false);
      this.glow.setVisible(false);
    }
    return false;
  }

  smash(): void {
    this.state = 'hit';
    this.sprite.setVisible(false);
    this.glow.setVisible(false);
  }

  destroy(): void {
    this.sprite.destroy();
    this.glow.destroy();
  }
}

// Pooled 1-2px particles: trails, feathers, grass bits, dust, sparks.
import Phaser from 'phaser';
import { DEPTH } from '../ui';

interface P {
  img: Phaser.GameObjects.Image;
  vx: number;
  vy: number;
  g: number;
  life: number;
  max: number;
}

export class Particles {
  private live: P[] = [];
  private pool: Phaser.GameObjects.Image[] = [];

  constructor(private scene: Phaser.Scene) {}

  emit(x: number, y: number, color: number, vx: number, vy: number, life: number, g = 0, size = 1, depth: number = DEPTH.duck - 1): void {
    const img = this.pool.pop() ?? this.scene.add.image(0, 0, 'pix').setOrigin(0);
    img.setPosition(Math.round(x), Math.round(y)).setTint(color).setDisplaySize(size, size).setAlpha(1).setVisible(true).setDepth(depth);
    this.live.push({ img, vx, vy, g, life, max: life });
  }

  /** Blades and seeds kicked up out of the grass. */
  grass(x: number, y: number, n = 9): void {
    const cols = [0x2c7c30, 0x3c7c48, 0x1c5430, 0xb8f818, 0x58d854];
    for (let i = 0; i < n; i++)
      this.emit(x + (Math.random() - 0.5) * 12, y, cols[i % cols.length], (Math.random() - 0.5) * 50, -40 - Math.random() * 50, 0.5 + Math.random() * 0.3, 180, 1, DEPTH.fore + 1);
  }

  dust(x: number, y: number): void {
    for (let i = 0; i < 3; i++)
      this.emit(x + (Math.random() - 0.5) * 4, y - 1, i % 2 ? 0x5c3c2c : 0x7c5c48, -8 - Math.random() * 10, -6 - Math.random() * 8, 0.45, 0, 1, DEPTH.dogWalk - 1);
  }

  /** Expanding pixel ring (3 frames) for tap feedback. */
  ring(x: number, y: number, tint: number): void {
    const img = this.scene.add.image(Math.round(x), Math.round(y), 'ring0').setDepth(DEPTH.fx).setTint(tint).setAlpha(0.9);
    let k = 0;
    this.scene.time.addEvent({
      delay: 40,
      repeat: 2,
      callback: () => {
        k++;
        if (k < 3) img.setTexture(`ring${k}`).setAlpha(0.9 - k * 0.3);
        else img.destroy();
      },
    });
  }

  /** Feathers bursting off a hit duck, in its own colours. */
  feathers(x: number, y: number, hexes: string[]): void {
    const cols = hexes.map((c) => Phaser.Display.Color.HexStringToColor(c.slice(0, 7)).color);
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 20 + Math.random() * 45;
      this.emit(x, y, cols[i % cols.length], Math.cos(a) * v, Math.sin(a) * v - 25, 0.9 + Math.random() * 0.7, 45, i % 4 === 0 ? 2 : 1, DEPTH.fx - 1);
    }
  }

  update(dt: number): void {
    for (let i = this.live.length - 1; i >= 0; i--) {
      const p = this.live[i];
      p.life -= dt;
      p.vy += p.g * dt;
      p.img.x += p.vx * dt;
      p.img.y += p.vy * dt;
      p.img.setAlpha(Math.max(0, p.life / p.max) * 0.9);
      if (p.life <= 0) {
        p.img.setVisible(false);
        this.pool.push(p.img);
        this.live.splice(i, 1);
      }
    }
  }
}

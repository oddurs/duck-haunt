// A haunted duck: flaps around, glows, gets shot, tumbles, or flies away.
import Phaser from 'phaser';
import { DUCK_KINDS, type DuckKind } from '../gfx/art';
import type { Layout } from '../gfx/background';
import { EYES, DUCK_FRAME } from '../scenes/Boot';
import { DEPTH } from '../ui';
import { audio } from '../audio/audio';

export type DuckState = 'fly' | 'shot' | 'fall' | 'down' | 'away' | 'gone';

const WING = [0, 1, 2, 1];

export class Duck {
  readonly sprite: Phaser.GameObjects.Sprite;
  private glows: Phaser.GameObjects.Image[];
  readonly kind: DuckKind;
  state: DuckState = 'fly';
  vx = 0;
  vy = 0;
  private t = 0;
  private stateT = 0;
  private turnT = 0;
  private launchT = 0.6;
  private trailT = 0;
  private quackT: number;
  private flicker = 0;
  landX = 0;
  /** Called to emit ghostly trail particles. */
  onTrail?: (x: number, y: number, color: number) => void;
  onLand?: (d: Duck) => void;

  constructor(
    scene: Phaser.Scene,
    readonly kindIndex: number,
    x: number,
    y: number,
    private speed: number,
    private L: Layout,
    private ambient = false,
  ) {
    this.kind = DUCK_KINDS[kindIndex];
    this.sprite = scene.add.sprite(x, y, `duck${kindIndex}`, 'side0').setDepth(DEPTH.duck);
    const tint = Phaser.Display.Color.HexStringToColor(this.kind.eye).color;
    this.glows = [0, 1].map(() =>
      scene.add.image(x, y, 'glow').setTint(tint).setBlendMode(Phaser.BlendModes.ADD).setDepth(DEPTH.duck + 1),
    );
    const dir = Math.random() < 0.5 ? -1 : 1;
    const ang = ambient ? 0 : (-Math.PI / 2) + dir * (0.35 + Math.random() * 0.5);
    if (ambient) {
      this.vx = dir * speed;
      this.vy = 0;
      this.launchT = 0;
    } else {
      this.vx = Math.cos(ang) * speed;
      this.vy = Math.sin(ang) * speed;
    }
    this.turnT = 0.8 + Math.random();
    this.quackT = 0.2 + Math.random() * 0.8;
    this.t = Math.random() * 10;
  }

  get x() {
    return this.sprite.x;
  }
  get y() {
    return this.sprite.y;
  }
  get alive() {
    return this.state === 'fly';
  }

  setLayout(L: Layout) {
    this.L = L;
  }

  /** Distance-based hit check with a forgiving box for fingers. */
  hitScore(px: number, py: number, pad: number): number {
    if (this.state !== 'fly') return Infinity;
    const dx = Math.abs(px - this.x);
    const dy = Math.abs(py - this.y);
    if (dx > 12 + pad || dy > 10 + pad) return Infinity;
    return dx * dx + dy * dy;
  }

  shoot(): void {
    this.state = 'shot';
    this.stateT = 0;
    this.sprite.setFrame('shot');
    this.sprite.setFlipX(false);
    this.sprite.setAlpha(1);
  }

  flyAway(): void {
    if (this.state !== 'fly') return;
    this.state = 'away';
    const s = Math.max(this.speed * 1.8, this.L.H * 0.5, 150);
    this.vx = (Math.random() < 0.5 ? -1 : 1) * s * 0.25;
    this.vy = -s;
  }

  private turn(): void {
    const sign = Math.random() < 0.5 ? -1 : 1;
    const up = Math.random() < 0.6 ? -1 : 1;
    const a = [0.25, 0.45, 0.65, 0.85][Math.floor(Math.random() * 4)];
    this.vx = sign * Math.cos(a) * this.speed;
    this.vy = up * Math.sin(a) * this.speed;
    this.turnT = 0.5 + Math.random() * 1.3;
  }

  update(dt: number): void {
    const s = this.sprite;
    this.t += dt;
    this.stateT += dt;
    const L = this.L;
    switch (this.state) {
      case 'fly':
      case 'away': {
        s.x += this.vx * dt;
        s.y += this.vy * dt;
        if (this.state === 'fly' && !this.ambient) {
          this.launchT -= dt;
          this.turnT -= dt;
          if (this.turnT <= 0) this.turn();
          if (s.x < 12) this.vx = Math.abs(this.vx);
          if (s.x > L.W - 12) this.vx = -Math.abs(this.vx);
          if (s.y < 16) this.vy = Math.abs(this.vy);
          if (this.launchT <= 0 && s.y > L.duckFloor - 10) this.vy = -Math.abs(this.vy);
          this.quackT -= dt;
          if (this.quackT <= 0) {
            this.quackT = 1.2 + Math.random() * 1.6;
            audio.quack(1 + this.kindIndex * 0.08);
          }
        }
        const climbing = this.vy < -Math.abs(this.vx) * 0.6;
        const rate = 11 + this.speed / 14;
        const f = WING[Math.floor(this.t * rate) % 4];
        s.setFrame((climbing ? 'diag' : 'side') + f);
        s.setFlipX(this.vx < 0);
        // spectral flicker
        this.flicker -= dt;
        if (this.flicker < -2 - Math.random() * 4) this.flicker = 0.18;
        s.setAlpha(this.flicker > 0 ? (Math.floor(this.t * 30) % 2 ? 0.35 : 0.8) : 1);
        this.trailT -= dt;
        if (this.trailT <= 0) {
          this.trailT = 0.06;
          const tx = s.x + (s.flipX ? 10 : -10);
          const tail = Phaser.Display.Color.HexStringToColor(this.kind.pal.S.slice(0, 7)).color;
          this.onTrail?.(tx, s.y + (climbing ? 8 : 2), tail);
        }
        if (this.state === 'away' && s.y < -24) this.state = 'gone';
        if (this.ambient && (s.x < -30 || s.x > L.W + 30)) this.state = 'gone';
        break;
      }
      case 'shot':
        if (this.stateT > 0.45) {
          this.state = 'fall';
          this.stateT = 0;
          s.setFrame('fall');
          audio.fall();
        }
        break;
      case 'fall':
        s.y += 110 * dt;
        s.setFlipX(Math.floor(this.stateT / 0.1) % 2 === 1);
        if (s.y > L.fallFloor) {
          this.state = 'down';
          this.landX = s.x;
          s.setVisible(false);
          audio.thud();
          this.onLand?.(this);
        }
        break;
    }
    this.placeGlows();
  }

  private placeGlows(): void {
    const s = this.sprite;
    const vis = s.visible && this.state !== 'gone' && this.state !== 'down';
    const frame = s.frame.name;
    const eyes = EYES[frame] ?? [];
    const fw = DUCK_FRAME[frame]?.w ?? s.width;
    const pulse = 0.55 + 0.35 * Math.sin(this.t * 9);
    this.glows.forEach((g, i) => {
      const e = eyes[i];
      if (!vis || !e) {
        g.setVisible(false);
        return;
      }
      const ex = s.flipX ? fw - e.x : e.x;
      g.setVisible(true);
      g.setPosition(Math.round(s.x - s.width / 2 + ex), Math.round(s.y - s.height / 2 + e.y));
      g.setAlpha(pulse * s.alpha * (this.state === 'shot' ? 1.4 : 1));
    });
  }

  destroy(): void {
    this.sprite.destroy();
    this.glows.forEach((g) => g.destroy());
  }
}

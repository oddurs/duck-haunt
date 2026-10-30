// Small ambient life living in the dead tree and the grass: a crow that bolts
// at gunfire, a spider on a silk thread, and will-o'-wisps over the grass.
import Phaser from 'phaser';
import type { Layout, Land } from '../gfx/background';
import { DEPTH } from '../ui';
import { audio } from '../audio/audio';

type CrowState = 'perch' | 'flee' | 'away' | 'return';

interface Wisp {
  core: Phaser.GameObjects.Image;
  glow: Phaser.GameObjects.Image;
  x0: number;
  y0: number;
  ph: number;
  push: number;
}

export class Critters {
  private crow: Phaser.GameObjects.Sprite;
  private crowState: CrowState = 'perch';
  private crowT = 3;
  private crowV = { x: 0, y: 0 };
  private perch = { x: 0, y: 0 };
  private thread: Phaser.GameObjects.Graphics;
  private spider: Phaser.GameObjects.Image;
  private web = { x: 0, y: 0 };
  private silk = 14;
  private silkTarget = 14;
  private silkT = 0;
  private wisps: Wisp[] = [];
  private L!: Layout;
  private t = 0;
  /** Sounds are suppressed until the player has interacted at least once. */
  quiet = false;

  constructor(private scene: Phaser.Scene) {
    const s = scene;
    this.crow = s.add.sprite(0, 0, 'crow', 'perch').setOrigin(0.5, 1).setDepth(DEPTH.land + 0.6);
    this.thread = s.add.graphics().setAlpha(0.5).setDepth(DEPTH.land + 0.6);
    this.spider = s.add.image(0, 0, 'spider').setOrigin(0.5, 0).setDepth(DEPTH.land + 0.6);
  }

  layout(L: Layout, land: Land): void {
    this.L = L;
    this.perch = land.perch;
    this.web = { x: Math.round(land.web.x), y: Math.round(land.web.y) };
    if (this.crowState === 'perch') this.crow.setPosition(this.perch.x, this.perch.y + 1);
    this.wisps.forEach((w) => {
      w.core.destroy();
      w.glow.destroy();
    });
    const n = Math.max(3, Math.round(L.W / 80));
    this.wisps = new Array(n).fill(0).map((_, i) => {
      const glow = this.scene.add
        .image(0, 0, 'glow')
        .setTint(0x58d854)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setScale(0.7)
        .setDepth(DEPTH.fogFront + 0.5);
      const core = this.scene.add.image(0, 0, 'pix').setOrigin(0).setDisplaySize(1, 1).setTint(0xd8f878).setDepth(DEPTH.fogFront + 0.6);
      return {
        core,
        glow,
        x0: ((i + 0.5) / n) * L.W + (Math.random() - 0.5) * 30,
        y0: L.grassTop + 6 + Math.random() * (L.dirtTop - L.grassTop - 16),
        ph: Math.random() * 10,
        push: 0,
      };
    });
  }

  /** A gunshot (or tap) at x,y startles everything nearby. */
  scare(x: number, y: number): void {
    if (this.crowState === 'perch') {
      this.crowState = 'flee';
      this.crow.play('crowFly').setFlipX(false);
      this.crowV = { x: 50 + Math.random() * 20, y: -55 };
      if (!this.quiet) {
        audio.caw();
        audio.wingFlurry();
      }
    }
    if (Math.abs(x - this.web.x) < 90) {
      this.silkTarget = 2;
      this.silkT = 2.5 + Math.random() * 2;
    }
    for (const w of this.wisps) {
      const dx = w.core.x - x;
      const dy = w.core.y - y;
      if (dx * dx + dy * dy < 50 * 50) w.push = (dx >= 0 ? 1 : -1) * 40;
    }
  }

  /** Title-screen pokes. Returns true when something was tapped. */
  poke(x: number, y: number): boolean {
    if (this.crowState === 'perch' && Math.abs(x - this.crow.x) < 12 && y > this.crow.y - 16 && y < this.crow.y + 4) {
      this.scare(x, y);
      return true;
    }
    if (Math.abs(x - this.spider.x) < 10 && Math.abs(y - (this.spider.y + 2)) < 10) {
      this.silkTarget = 2;
      this.silkT = 3;
      if (!this.quiet) audio.blip();
      return true;
    }
    return false;
  }

  update(dt: number): void {
    this.t += dt;
    const c = this.crow;
    // --- crow
    switch (this.crowState) {
      case 'perch':
        this.crowT -= dt;
        if (this.crowT <= 0) {
          if (Math.random() < 0.35) {
            c.setFrame('caw');
            if (!this.quiet) audio.caw();
            this.scene.time.delayedCall(420, () => this.crowState === 'perch' && c.setFrame('perch'));
          } else {
            // head bob
            c.y = this.perch.y;
            this.scene.time.delayedCall(140, () => this.crowState === 'perch' && (c.y = this.perch.y + 1));
          }
          this.crowT = 2.5 + Math.random() * 5;
        }
        break;
      case 'flee':
        this.crowV.x += 30 * dt;
        this.crowV.y -= 10 * dt;
        c.x += this.crowV.x * dt;
        c.y += this.crowV.y * dt;
        if (c.y < -16 || c.x > this.L.W + 16) {
          this.crowState = 'away';
          this.crowT = 7 + Math.random() * 8;
          c.setVisible(false);
        }
        break;
      case 'away':
        this.crowT -= dt;
        if (this.crowT <= 0) {
          this.crowState = 'return';
          c.setVisible(true).play('crowFly').setFlipX(true);
          c.setPosition(this.perch.x + 120, this.perch.y - 70);
        }
        break;
      case 'return': {
        const dx = this.perch.x - c.x;
        const dy = this.perch.y + 1 - c.y;
        const d = Math.hypot(dx, dy);
        if (d < 2) {
          this.crowState = 'perch';
          c.stop().setFrame('perch').setFlipX(false).setPosition(this.perch.x, this.perch.y + 1);
          this.crowT = 1.5;
        } else {
          const sp = Math.min(70, 20 + d);
          c.x += (dx / d) * sp * dt;
          c.y += (dy / d) * sp * dt;
        }
        break;
      }
    }
    // --- spider: zips up when startled, then lowers itself again
    if (this.silkT > 0) {
      this.silkT -= dt;
      if (this.silkT <= 0) this.silkTarget = 14;
    }
    const goal = this.silkTarget + (this.silkTarget > 4 ? Math.sin(this.t * 0.7) * 6 : 0);
    const rate = goal < this.silk ? 60 : 6;
    this.silk += Math.sign(goal - this.silk) * Math.min(Math.abs(goal - this.silk), rate * dt);
    const sway = Math.round(Math.sin(this.t * 1.3) * (this.silk / 14));
    const len = Math.max(1, Math.round(this.silk));
    // silk drawn pixel by pixel so it stays crisp while it sways
    this.thread.clear().fillStyle(0xb8b0e8, 1);
    for (let i = 0; i < len; i++) this.thread.fillRect(this.web.x + Math.round((sway * i) / len), this.web.y + i, 1, 1);
    this.spider.setPosition(this.web.x + sway, this.web.y + len - 1);
    // --- wisps
    for (const w of this.wisps) {
      w.ph += dt;
      w.x0 += w.push * dt;
      w.push *= Math.pow(0.15, dt);
      if (w.x0 < -10) w.x0 = this.L.W + 8;
      if (w.x0 > this.L.W + 10) w.x0 = -8;
      const x = Math.round(w.x0 + Math.sin(w.ph * 0.5) * 14);
      const y = Math.round(w.y0 + Math.sin(w.ph * 1.3) * 4);
      const a = 0.35 + 0.35 * Math.sin(w.ph * 2.2);
      w.core.setPosition(x, y).setAlpha(0.4 + a);
      w.glow.setPosition(x, y).setAlpha(a);
    }
  }
}

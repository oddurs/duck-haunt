// The layered night scene shared by the title screen and the game.
import Phaser from 'phaser';
import { computeLayout, paintSky, paintLand, paintFore, moonPos, BLOOD_BANDS, type Layout } from '../gfx/background';
import { DEPTH } from '../ui';

let seq = 0;

export class Backdrop {
  L!: Layout;
  private sky!: Phaser.GameObjects.Image;
  private blood!: Phaser.GameObjects.Image;
  private moon!: Phaser.GameObjects.Image;
  private land!: Phaser.GameObjects.Image;
  private fore!: Phaser.GameObjects.Image;
  private cloud!: Phaser.GameObjects.TileSprite;
  private cloudHi!: Phaser.GameObjects.TileSprite;
  private fogBack!: Phaser.GameObjects.TileSprite;
  private fogFront!: Phaser.GameObjects.TileSprite;
  private lantern!: Phaser.GameObjects.Image;
  private lanternGlow!: Phaser.GameObjects.Image;
  private windows: Phaser.GameObjects.Image[] = [];
  private owl: Phaser.GameObjects.Image[] = [];
  private bats: { s: Phaser.GameObjects.Sprite; vx: number; base: number; ph: number }[] = [];
  private keys: string[] = [];
  private batTimer = 3;
  private owlTimer = 4;
  onOwl?: () => void;

  constructor(private scene: Phaser.Scene) {
    const s = scene;
    this.sky = s.add.image(0, 0, 'pix').setOrigin(0).setDepth(DEPTH.sky);
    this.blood = s.add.image(0, 0, 'pix').setOrigin(0).setDepth(DEPTH.sky).setAlpha(0);
    this.moon = s.add.image(0, 0, 'moon').setDepth(DEPTH.moon);
    this.cloud = s.add.tileSprite(0, 0, 256, 24, 'fog').setOrigin(0, 0.5).setDepth(DEPTH.cloud).setTint(0x1a0e3a).setAlpha(0.9);
    this.cloudHi = s.add.tileSprite(0, 0, 256, 24, 'fog2').setOrigin(0, 0.5).setDepth(DEPTH.cloud).setTint(0x2c1660).setAlpha(0.7);
    this.land = s.add.image(0, 0, 'pix').setOrigin(0).setDepth(DEPTH.land);
    this.fogBack = s.add.tileSprite(0, 0, 256, 24, 'fog').setOrigin(0, 1).setDepth(DEPTH.fog).setAlpha(0.45);
    this.fore = s.add.image(0, 0, 'pix').setOrigin(0).setDepth(DEPTH.fore);
    this.fogFront = s.add.tileSprite(0, 0, 256, 20, 'fog2').setOrigin(0, 1).setDepth(DEPTH.fogFront).setAlpha(0.22);
    this.lantern = s.add.image(0, 0, 'p11').setDepth(DEPTH.fore);
    this.lanternGlow = s.add.image(0, 0, 'glow').setDepth(DEPTH.fore).setTint(0xf8b800).setBlendMode(Phaser.BlendModes.ADD).setScale(2);
    this.layout(computeLayout(s.scale.width, s.scale.height));
  }

  layout(L: Layout): void {
    this.L = L;
    const s = this.scene;
    const old = this.keys;
    const k = (n: string) => `bg_${n}_${++seq}`;
    const ks = { sky: k('sky'), blood: k('blood'), land: k('land'), fore: k('fore') };
    s.textures.addCanvas(ks.sky, paintSky(L));
    s.textures.addCanvas(ks.blood, paintSky(L, BLOOD_BANDS));
    const land = paintLand(L);
    s.textures.addCanvas(ks.land, land.canvas);
    s.textures.addCanvas(ks.fore, paintFore(L));
    this.sky.setTexture(ks.sky);
    this.blood.setTexture(ks.blood);
    this.land.setTexture(ks.land).setPosition(0, 0);
    this.fore.setTexture(ks.fore);
    this.keys = Object.values(ks);
    old.forEach((o) => s.textures.exists(o) && s.textures.remove(o));

    const m = moonPos(L);
    this.moon.setPosition(m.x - 10, m.y);
    this.cloud.setSize(L.W, 24).setPosition(0, m.y + 10);
    this.cloudHi.setSize(L.W, 20).setPosition(0, Math.round(m.y * 0.45)).setVisible(m.y > 120);
    this.fogBack.setSize(L.W, 24).setPosition(0, L.horizon + 6);
    this.fogFront.setSize(L.W, 20).setPosition(0, L.dirtTop + 2);
    this.lantern.setPosition(Math.round(L.W * 0.86), L.grassTop + 14);
    this.lanternGlow.setPosition(this.lantern.x, this.lantern.y + 1);

    this.windows.forEach((w) => w.destroy());
    this.windows = land.windows.map((w) =>
      s.add.image(w.x, w.y, 'pix').setOrigin(0).setDisplaySize(2, 3).setTint(0xf8b800).setDepth(DEPTH.land),
    );
    this.owl.forEach((o) => o.destroy());
    this.owl = [0, 2].map((dx) =>
      s.add.image(land.owl.x + dx, land.owl.y, 'pix').setOrigin(0).setDisplaySize(1, 1).setTint(0xf8d878).setDepth(DEPTH.land),
    );
  }

  setBloodSky(on: boolean): void {
    this.scene.tweens.add({ targets: this.blood, alpha: on ? 1 : 0, duration: on ? 250 : 500 });
  }

  update(time: number, dt: number): void {
    const t = time / 1000;
    this.cloud.tilePositionX = t * 3;
    this.cloudHi.tilePositionX = -t * 2;
    this.fogBack.tilePositionX = -t * 5;
    this.fogFront.tilePositionX = t * 9;
    this.moon.y = moonPos(this.L).y + Math.round(Math.sin(t * 0.3));
    // candle-flicker windows
    this.windows.forEach((w, i) => {
      const f = Math.sin(t * (3 + i) + i * 7) + Math.sin(t * 11.3 + i);
      w.setTint(f > 1.2 ? 0xfce0a8 : f < -1.4 ? 0x881400 : 0xf8b800);
      w.setVisible(!(i === 2 && Math.sin(t * 0.7) > 0.8));
    });
    const lf = 0.7 + 0.3 * Math.sin(t * 13) * Math.sin(t * 5.1);
    this.lanternGlow.setAlpha(lf * 0.7);
    // owl blinks, occasionally hoots
    this.owlTimer -= dt;
    const blink = this.owlTimer % 3 < 0.12;
    this.owl.forEach((o) => o.setVisible(!blink));
    if (this.owlTimer < 0) {
      this.owlTimer = 9 + Math.random() * 12;
      this.onOwl?.();
    }
    // bats
    this.batTimer -= dt;
    if (this.batTimer < 0) {
      this.batTimer = 5 + Math.random() * 9;
      this.spawnBat();
    }
    for (let i = this.bats.length - 1; i >= 0; i--) {
      const b = this.bats[i];
      b.s.x += b.vx * dt;
      b.ph += dt * 5;
      b.s.y = Math.round(b.base + Math.sin(b.ph) * 6);
      if (b.s.x < -20 || b.s.x > this.L.W + 20) {
        b.s.destroy();
        this.bats.splice(i, 1);
      }
    }
  }

  private spawnBat(): void {
    const n = 1 + Math.floor(Math.random() * 3);
    const dir = Math.random() < 0.5 ? 1 : -1;
    const base = 20 + Math.random() * (this.L.horizon - 70);
    for (let i = 0; i < n; i++) {
      const s = this.scene.add
        .sprite(dir > 0 ? -12 - i * 14 : this.L.W + 12 + i * 14, base, 'bat', 'bat0')
        .setDepth(DEPTH.bats)
        .play('bat');
      s.anims.setProgress(Math.random());
      this.bats.push({ s, vx: dir * (40 + Math.random() * 20), base: base + i * 5, ph: i * 1.3 });
    }
  }
}

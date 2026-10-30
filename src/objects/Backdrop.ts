// The layered night scene shared by the title screen and the game.
import Phaser from 'phaser';
import { computeLayout, paintSky, paintLand, paintFore, moonPos, BLOOD_BANDS, type Layout } from '../gfx/background';
import { DEPTH } from '../ui';
import { Critters } from './Critters';

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
  private twinkles: Phaser.GameObjects.Image[] = [];
  private leaves: { s: Phaser.GameObjects.Image; vy: number; ph: number; x0: number }[] = [];
  private leafTimer = 1;
  private treeX = 0;
  private treeTop = 0;
  private bats: { s: Phaser.GameObjects.Sprite; vx: number; base: number; ph: number }[] = [];
  private keys: string[] = [];
  private batTimer = 3;
  private owlTimer = 4;
  onOwl?: () => void;
  readonly critters: Critters;
  private owlPos = { x: 0, y: 0 };
  private owlWide = 0;

  constructor(private scene: Phaser.Scene) {
    const s = scene;
    this.sky = s.add.image(0, 0, 'pix').setOrigin(0).setDepth(DEPTH.sky);
    this.blood = s.add.image(0, 0, 'pix').setOrigin(0).setDepth(DEPTH.sky).setAlpha(0);
    this.moon = s.add.image(0, 0, 'moon').setDepth(DEPTH.moon);
    this.cloud = s.add.tileSprite(0, 0, 256, 20, 'clouds').setOrigin(0, 0.5).setDepth(DEPTH.cloud);
    this.cloudHi = s.add.tileSprite(0, 0, 256, 16, 'cloudsHi').setOrigin(0, 0.5).setDepth(DEPTH.cloud).setAlpha(0.85);
    this.land = s.add.image(0, 0, 'pix').setOrigin(0).setDepth(DEPTH.land);
    this.fogBack = s.add.tileSprite(0, 0, 256, 24, 'fog').setOrigin(0, 1).setDepth(DEPTH.fog).setAlpha(0.45);
    this.fore = s.add.image(0, 0, 'pix').setOrigin(0).setDepth(DEPTH.fore);
    this.fogFront = s.add.tileSprite(0, 0, 256, 20, 'fog2').setOrigin(0, 1).setDepth(DEPTH.fogFront).setAlpha(0.22);
    this.lantern = s.add.image(0, 0, 'p11').setDepth(DEPTH.fore);
    this.critters = new Critters(s);
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

    this.critters.layout(L, land);
    this.owlPos = land.owl;
    const m = moonPos(L);
    this.moon.setPosition(m.x, m.y);
    this.cloud.setSize(L.W, 20).setPosition(0, m.y + 9);
    this.cloudHi.setSize(L.W, 16).setPosition(0, Math.round(m.y * 0.45)).setVisible(m.y > 110);
    this.twinkles.forEach((t) => t.destroy());
    this.twinkles = new Array(Math.round(L.W / 32)).fill(0).map(() =>
      s.add
        .image(Math.floor(Math.random() * L.W), Math.floor(Math.pow(Math.random(), 1.5) * L.horizon * 0.6), 'pix')
        .setOrigin(0)
        .setDisplaySize(1, 1)
        .setDepth(DEPTH.sky),
    );
    this.fogBack.setSize(L.W, 24).setPosition(0, L.horizon + 6);
    this.fogFront.setSize(L.W, 20).setPosition(0, L.dirtTop + 2);
    this.lantern.setPosition(Math.round(L.W * 0.86), L.dirtTop - 8);
    this.lanternGlow.setPosition(this.lantern.x, this.lantern.y + 1);

    this.windows.forEach((w) => w.destroy());
    this.windows = land.windows.map((w) =>
      s.add.image(w.x, w.y, 'pix').setOrigin(0).setDisplaySize(2, 3).setTint(0xf8b800).setDepth(DEPTH.land),
    );
    this.treeX = Math.round(L.W * 0.14);
    this.treeTop = Math.round(L.horizon + 6 - Math.min(96, L.horizon * 0.55));
    this.owl.forEach((o) => o.destroy());
    this.owl = [0, 2].map((dx) =>
      s.add.image(land.owl.x + dx, land.owl.y, 'pix').setOrigin(0).setDisplaySize(1, 1).setTint(0xf8d878).setDepth(DEPTH.land),
    );
  }

  /** Gunfire startles the wildlife; bats flee faster. */
  scare(x: number, y: number): void {
    this.critters.scare(x, y);
    this.bats.forEach((b) => (b.vx = Math.sign(b.vx) * Math.max(Math.abs(b.vx), 110)));
  }

  /** Title-screen taps on critters. */
  poke(x: number, y: number): boolean {
    if (Math.abs(x - (this.owlPos.x + 1)) < 7 && Math.abs(y - this.owlPos.y) < 7) {
      this.owlWide = 1.2;
      this.onOwl?.();
      return true;
    }
    return this.critters.poke(x, y);
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
    this.twinkles.forEach((tw, i) => {
      const v = Math.sin(t * (1.3 + i * 0.37) + i * 2.1);
      tw.setTint(v > 0.6 ? 0xfcfcfc : v > -0.2 ? 0x8c84c8 : 0x3c3478);
    });
    // leaves drifting from the dead tree
    this.leafTimer -= dt;
    if (this.leafTimer < 0) {
      this.leafTimer = 1.5 + Math.random() * 3;
      const col = [0xa0602c, 0xc8843c, 0xe0a050, 0x8c3018][Math.floor(Math.random() * 4)];
      const x0 = this.treeX - 20 + Math.random() * 40;
      const img = this.scene.add.image(x0, this.treeTop + Math.random() * 20, 'pix').setOrigin(0).setDisplaySize(2, 1).setTint(col).setDepth(DEPTH.land + 0.5);
      this.leaves.push({ s: img, vy: 9 + Math.random() * 6, ph: Math.random() * 6, x0 });
    }
    for (let i = this.leaves.length - 1; i >= 0; i--) {
      const lf = this.leaves[i];
      lf.ph += dt * 2.2;
      lf.s.y += lf.vy * dt;
      lf.x0 += dt * 6;
      lf.s.x = Math.round(lf.x0 + Math.sin(lf.ph) * 5);
      lf.s.setDisplaySize(Math.cos(lf.ph) > 0 ? 2 : 1, 1);
      if (lf.s.y > this.L.dirtTop) {
        lf.s.destroy();
        this.leaves.splice(i, 1);
      }
    }
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
    const blink = this.owlTimer % 3 < 0.12 && this.owlWide <= 0;
    this.owlWide -= dt;
    this.owl.forEach((o) => o.setVisible(!blink).setDisplaySize(1, this.owlWide > 0 ? 2 : 1));
    this.critters.update(dt);
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

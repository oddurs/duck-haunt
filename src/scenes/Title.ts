// Title screen: dripping logo, GAME A/B/C menu, top score, sound/fullscreen.
import Phaser from 'phaser';
import { Backdrop } from '../objects/Backdrop';
import { Dog } from '../objects/Dog';
import { Duck } from '../objects/Duck';
import { computeLayout, type Layout } from '../gfx/background';
import { renderLogo } from '../gfx/font';
import { DEPTH, COL, txt, centerX, Button, inside, type Hit } from '../ui';
import { audio } from '../audio/audio';
import { TITLE } from '../audio/songs';
import { save, persist, type Mode } from '../state';

const MODES: { mode: Mode; label: string }[] = [
  { mode: 'A', label: 'GAME A  1 DUCK ' },
  { mode: 'B', label: 'GAME B  2 DUCKS' },
  { mode: 'C', label: 'GAME C PUMPKINS' },
];

export class TitleScene extends Phaser.Scene {
  private L!: Layout;
  private bg!: Backdrop;
  private dog!: Dog;
  private logo1!: Phaser.GameObjects.Image;
  private logo2!: Phaser.GameObjects.Image;
  private buttons: Button[] = [];
  private sel = 0;
  private top!: Phaser.GameObjects.BitmapText;
  private hint!: Phaser.GameObjects.BitmapText;
  private snd!: Phaser.GameObjects.Image;
  private full!: Phaser.GameObjects.Image;
  private sndHit: Hit = { x: 0, y: 0, w: 0, h: 0 };
  private fullHit: Hit = { x: 0, y: 0, w: 0, h: 0 };
  private ducks: Duck[] = [];
  private duckT = 2;
  private cameoT = 3;
  private cameoBusy = false;
  private starting = false;
  private cross!: Phaser.GameObjects.Image;

  constructor() {
    super('title');
  }

  init(data: { mode?: Mode }): void {
    this.sel = Math.max(0, MODES.findIndex((m) => m.mode === data.mode));
    this.buttons = [];
    this.ducks = [];
    this.starting = false;
    this.cameoBusy = false;
    this.duckT = 1.5;
    this.cameoT = 2.5;
  }

  create(): void {
    this.L = computeLayout(this.scale.width, this.scale.height);
    this.bg = new Backdrop(this);
    this.dog = new Dog(this);
    if (!this.textures.exists('logo1')) {
      this.textures.addCanvas(
        'logo1',
        renderLogo('DUCK', { scale: 3, bands: ['#FCFCFC', '#D8B8F8', '#B8B8F8', '#9878F8'], outline: '#000000', outline2: '#6844FC' }),
      );
      this.textures.addCanvas(
        'logo2',
        renderLogo('HAUNT', {
          scale: 4,
          bands: ['#F8D878', '#FCA044', '#F87800', '#F83800', '#C81800'],
          outline: '#000000',
          outline2: '#5C0C0C',
          drip: '#58D854',
          seed: 13,
        }),
      );
    }
    this.logo1 = this.add.image(0, 0, 'logo1').setOrigin(0.5, 0).setDepth(DEPTH.ui);
    this.logo2 = this.add.image(0, 0, 'logo2').setOrigin(0.5, 0).setDepth(DEPTH.ui);
    this.buttons = MODES.map((m) => new Button(this, m.label, 150, 20));
    this.top = txt(this, 0, 0, '', COL.green).setDepth(DEPTH.ui);
    this.hint = txt(this, 0, 0, 'TAP A GAME', COL.dim, false).setDepth(DEPTH.ui);
    this.snd = this.add.image(0, 0, save.muted ? 'icoSoundOff' : 'icoSoundOn').setOrigin(0).setDepth(DEPTH.ui);
    this.full = this.add.image(0, 0, 'icoFull').setOrigin(0).setDepth(DEPTH.ui).setVisible(this.scale.fullscreen.available);
    this.cross = this.add.image(0, 0, 'crosshair').setDepth(DEPTH.cursor).setVisible(false);
    this.layout();
    this.select(this.sel, false);

    this.scale.on('resize', this.layout, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.layout, this);
      this.ducks.forEach((d) => d.destroy());
    });

    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.wasTouch) return;
      this.cross.setPosition(Math.round(p.x), Math.round(p.y)).setVisible(true);
      this.input.setDefaultCursor('none');
      const i = this.buttons.findIndex((b) => inside(b.area, p.x, p.y));
      if (i >= 0 && i !== this.sel) this.select(i);
    });
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.tap(p.x, p.y));
    const kb = this.input.keyboard;
    kb?.on('keydown-UP', () => this.select((this.sel + 2) % 3));
    kb?.on('keydown-DOWN', () => this.select((this.sel + 1) % 3));
    kb?.on('keydown-W', () => this.select((this.sel + 2) % 3));
    kb?.on('keydown-S', () => this.select((this.sel + 1) % 3));
    const go = () => {
      audio.unlock();
      this.start(MODES[this.sel].mode);
    };
    kb?.on('keydown-ENTER', go);
    kb?.on('keydown-SPACE', go);
    kb?.on('keydown-M', () => this.toggleMute());

    if (audio.ctx?.state === 'running') audio.play(TITLE);
  }

  private layout(): void {
    const L = (this.L = computeLayout(this.scale.width, this.scale.height));
    this.bg.layout(L);
    this.dog.layout(L);
    const cx = Math.round(L.W / 2);
    const avail = L.grassTop + 10;
    const y0 = Math.max(8, Math.round(avail * 0.08));
    this.logo1.setPosition(cx - 26, y0);
    this.logo2.setPosition(cx, y0 + this.logo1.height - 4);
    const logoBottom = this.logo2.y + this.logo2.height;
    const gap = Math.max(26, Math.min(34, Math.floor((avail - logoBottom - 14) / 3.6)));
    const my = logoBottom + Math.max(4, Math.round(gap * 0.4));
    this.buttons.forEach((b, i) => b.place(cx, my + i * gap, Math.floor((gap - 20) / 2)));
    this.top.y = my + 3 * gap;
    this.refreshTop();
    // dirt strip: sound icon, hint, fullscreen icon
    const by = L.H - 20;
    this.snd.setPosition(12, by);
    this.sndHit = { x: 0, y: L.dirtTop - 4, w: 40, h: L.H - L.dirtTop + 4 };
    this.full.setPosition(L.W - 21, by);
    this.fullHit = { x: L.W - 40, y: L.dirtTop - 4, w: 40, h: L.H - L.dirtTop + 4 };
    centerX(this.hint, cx).y = by;
  }

  private refreshTop(): void {
    this.top.setText(`TOP SCORE = ${save.top[MODES[this.sel].mode]}`);
    centerX(this.top, this.L.W / 2);
  }

  private select(i: number, sound = true): void {
    this.sel = i;
    this.buttons.forEach((b, k) => b.setSelected(k === i));
    this.refreshTop();
    if (sound) audio.blip();
  }

  private toggleMute(): void {
    save.muted = !save.muted;
    audio.setMuted(save.muted);
    persist();
    this.snd.setTexture(save.muted ? 'icoSoundOff' : 'icoSoundOn');
    if (!save.muted) {
      audio.unlock();
      audio.play(TITLE);
    }
  }

  private tap(x: number, y: number): void {
    const first = !audio.ctx || audio.ctx.state !== 'running';
    audio.unlock();
    if (inside(this.sndHit, x, y)) return this.toggleMute();
    if (inside(this.fullHit, x, y) && this.full.visible) {
      if (this.scale.isFullscreen) this.scale.stopFullscreen();
      else this.scale.startFullscreen({ navigationUI: 'hide' });
      return;
    }
    const i = this.buttons.findIndex((b) => inside(b.area, x, y));
    if (i >= 0) {
      this.select(i, false);
      this.start(MODES[i].mode);
      return;
    }
    if (first) audio.play(TITLE);
  }

  private start(mode: Mode): void {
    if (this.starting) return;
    this.starting = true;
    audio.stopMusic();
    audio.select();
    const b = this.buttons[this.sel];
    this.tweens.add({
      targets: [b.label],
      alpha: 0,
      duration: 70,
      yoyo: true,
      repeat: 3,
      onComplete: () => this.scene.start('game', { mode }),
    });
  }

  update(time: number, delta: number): void {
    const dt = Math.min(0.05, delta / 1000);
    this.bg.update(time, dt);
    const L = this.L;
    // gentle logo float
    this.logo2.y = Math.round(this.logo1.y + this.logo1.height - 4 + Math.sin(time / 600) * 1.5);
    // decorative fly-bys
    this.duckT -= dt;
    if (this.duckT <= 0) {
      this.duckT = 4 + Math.random() * 4;
      const kind = Math.floor(Math.random() * 3);
      const dir = Math.random() < 0.5;
      const d = new Duck(this, kind, dir ? -20 : L.W + 20, 0, 50 + kind * 12, L, true);
      d.vx = (dir ? 1 : -1) * Math.abs(d.vx);
      d.sprite.y = Math.round(L.horizon - 30 - Math.random() * Math.min(60, L.horizon * 0.3));
      d.sprite.setDepth(DEPTH.bats);
      this.ducks.push(d);
    }
    for (let i = this.ducks.length - 1; i >= 0; i--) {
      const d = this.ducks[i];
      d.update(dt);
      if (d.state === 'gone') {
        d.destroy();
        this.ducks.splice(i, 1);
      }
    }
    this.cameoT -= dt;
    if (this.cameoT <= 0 && !this.cameoBusy) {
      this.cameoBusy = true;
      const x = Math.random() < 0.5 ? L.W * 0.22 : L.W * 0.78;
      void this.dog.cameo(x).then(() => {
        this.cameoBusy = false;
        this.cameoT = 5 + Math.random() * 5;
      });
    }
  }
}

// Core loop: rounds of 10 targets, 3 shots per set, quota to advance.
import Phaser from 'phaser';
import { Backdrop } from '../objects/Backdrop';
import { Hud } from '../objects/Hud';
import { Dog } from '../objects/Dog';
import { Duck } from '../objects/Duck';
import { Pumpkin } from '../objects/Pumpkin';
import { Particles } from '../objects/Particles';
import { computeLayout, type Layout } from '../gfx/background';
import { DUCK_KINDS } from '../gfx/art';
import { DEPTH, COL, txt, centerX, MessageBox, Button, inside, box, fade, type Hit } from '../ui';
import { audio } from '../audio/audio';
import { ROUND_START, ROUND_CLEAR, PERFECT, GAME_OVER } from '../audio/songs';
import { save, persist, reducedMotion, type Mode } from '../state';
import { wait } from '../async';

type Phase = 'intro' | 'flying' | 'resolve' | 'idle' | 'over';
type Target = Duck | Pumpkin;

export function requiredHits(round: number): number {
  if (round <= 10) return 6;
  if (round <= 12) return 7;
  if (round <= 14) return 8;
  if (round <= 19) return 9;
  return 10;
}

const band = (r: number) => (r <= 5 ? 0 : r <= 10 ? 1 : 2);


export class GameScene extends Phaser.Scene {
  private mode: Mode = 'A';
  private L!: Layout;
  private bg!: Backdrop;
  private hud!: Hud;
  private dog!: Dog;
  private msg!: MessageBox;
  private round = 1;
  private score = 0;
  private shots = 3;
  private phase: Phase = 'idle';
  private targets: Target[] = [];
  private setTime = 0;
  private flyTime = 6;
  private outT = 0;
  private flyAwayShown = false;
  private setDone: (() => void) | null = null;
  private gen = 0;
  private paused = false;
  private pauseUi: Phaser.GameObjects.GameObject[] = [];
  private pauseBtns: { b: Button; act: () => void }[] = [];
  private pauseHit: Hit = { x: 0, y: 0, w: 0, h: 0 };
  private pauseIcon!: Phaser.GameObjects.Image;
  private pauseG!: Phaser.GameObjects.Graphics;
  private cross!: Phaser.GameObjects.Image;
  private flash!: Phaser.GameObjects.Rectangle;
  private fxp!: Particles;
  private lastShot = 0;
  private tapHint: Phaser.GameObjects.BitmapText | null = null;
  private hitStop = 0;

  constructor() {
    super('game');
  }

  init(data: { mode?: Mode }): void {
    this.mode = data.mode ?? 'A';
    this.round = 1;
    this.score = 0;
    this.phase = 'idle';
    this.targets = [];
    this.paused = false;
    this.pauseUi = [];
    this.pauseBtns = [];
    this.tapHint = null;
  }

  create(): void {
    this.L = computeLayout(this.scale.width, this.scale.height);
    this.bg = new Backdrop(this);
    this.fxp = new Particles(this);
    this.bg.onOwl = () => audio.owl();
    this.hud = new Hud(this, this.mode === 'C' ? 'hudPumpkin' : 'hudDuck');
    this.dog = new Dog(this);
    this.msg = new MessageBox(this);
    this.cross = this.add.image(0, 0, 'crosshair').setDepth(DEPTH.cursor).setVisible(false);
    this.flash = this.add.rectangle(0, 0, 10, 10, 0xffffff).setOrigin(0).setDepth(DEPTH.fx).setAlpha(0);
    this.pauseG = this.add.graphics().setDepth(DEPTH.hud);
    this.pauseIcon = this.add.image(0, 0, 'icoPause').setOrigin(0).setDepth(DEPTH.hud);
    this.relayout();

    this.scale.on('resize', this.onResize, this);
    this.input.on('pointerdown', this.onDown, this);
    this.input.on('pointermove', this.onMove, this);
    this.input.keyboard?.on('keydown-P', () => this.togglePause());
    this.input.keyboard?.on('keydown-ESC', () => this.togglePause());
    this.input.keyboard?.on('keydown-M', () => this.toggleMute());
    const onVis = () => {
      if (document.hidden) {
        if (this.phase !== 'over') this.setPaused(true);
        audio.suspend();
      } else audio.resume();
    };
    document.addEventListener('visibilitychange', onVis);
    this.events.once('shutdown', () => {
      this.gen++;
      this.scale.off('resize', this.onResize, this);
      document.removeEventListener('visibilitychange', onVis);
      this.targets.forEach((t) => t.destroy());
      this.anims.resumeAll();
    });
    this.hud.setScore(0, true);
    this.dog.fx = (kind, x, y) => (kind === 'grass' ? this.fxp.grass(x, y) : this.fxp.dust(x, y));
    fade(this, 'in');
    void this.run(++this.gen);
  }

  // ------------------------------------------------------------ layout --
  private onResize(): void {
    this.relayout();
  }

  private relayout(): void {
    const L = (this.L = computeLayout(this.scale.width, this.scale.height));
    this.bg.layout(L);
    this.hud.layout(L);
    this.dog.layout(L);
    this.targets.forEach((t) => t instanceof Duck && t.setLayout(L));
    this.flash.setSize(L.W, L.H);
    this.pauseHit = { x: L.W - 30, y: 0, w: 30, h: 28 };
    this.pauseG.clear();
    box(this.pauseG, L.W - 19, 4, 15, 14, COL.gray, COL.black, 0.6);
    this.pauseIcon.setPosition(L.W - 15, 7);
    this.msg.relayout();
    if (this.tapHint) centerX(this.tapHint, L.W / 2).y = Math.round(L.H * 0.3) + 24;
    if (this.paused) this.buildPause();
  }

  // ----------------------------------------------------------- helpers --
  private alive(gen: number) {
    return gen === this.gen;
  }

  private emit(x: number, y: number, color: number, vx: number, vy: number, life: number, g = 0, size = 1, depth: number = DEPTH.duck - 1): void {
    this.fxp.emit(x, y, color, vx, vy, life, g, size, depth);
  }

  private grassBurst(x: number, y: number, n = 9): void {
    this.fxp.grass(x, y, n);
  }

  private feathers(d: Duck): void {
    const pal = d.kind.pal;
    this.fxp.feathers(d.x, d.y, [pal.D, pal.M, pal.L, pal.H, '#FCFCFC']);
  }

  private popScore(x: number, y: number, pts: number): void {
    const t = txt(this, 0, Math.round(y), String(pts), COL.white).setDepth(DEPTH.fx);
    centerX(t, x);
    this.tweens.add({ targets: t, y: t.y - 10, duration: 900, onComplete: () => t.destroy() });
  }

  private addScore(n: number): void {
    this.score += n;
    this.hud.setScore(this.score);
  }

  // ------------------------------------------------------------- input --
  private onMove(p: Phaser.Input.Pointer): void {
    if (p.wasTouch) return;
    this.cross.setPosition(Math.round(p.x), Math.round(p.y)).setVisible(true);
    this.input.setDefaultCursor('none');
  }

  private onDown(p: Phaser.Input.Pointer): void {
    audio.unlock();
    const x = p.x;
    const y = p.y;
    if (!p.wasTouch) this.cross.setPosition(Math.round(x), Math.round(y)).setVisible(true);
    if (this.paused) {
      for (const { b, act } of this.pauseBtns) if (inside(b.area, x, y)) return act();
      return;
    }
    if (inside(this.pauseHit, x, y) && this.phase !== 'over') return this.togglePause();
    if (this.phase === 'intro') {
      this.dog.seq?.skip();
      return;
    }
    if (this.phase === 'over') {
      this.gameOverTap?.();
      return;
    }
    if (this.phase !== 'flying') return;
    this.fire(x, y, p.wasTouch);
  }

  private gameOverTap: (() => void) | null = null;

  private fire(x: number, y: number, touch: boolean): void {
    const now = this.time.now;
    if (now - this.lastShot < 110) return;
    if (this.shots <= 0) {
      audio.click();
      return;
    }
    this.lastShot = now;
    this.shots--;
    this.hud.setShots(this.shots);
    audio.shot();
    try {
      navigator.vibrate?.(15);
    } catch {
      /* not allowed */
    }
    if (!reducedMotion) {
      this.flash.setAlpha(0.22);
      this.tweens.add({ targets: this.flash, alpha: 0, duration: 90 });
      this.cameras.main.shake(70, 0.004);
    }
    const bang = this.add.image(Math.round(x), Math.round(y), 'bang').setDepth(DEPTH.fx);
    this.tweens.add({ targets: bang, alpha: 0, duration: 140, onComplete: () => bang.destroy() });
    this.fxp.ring(x, y, 0xfcfcfc);
    audio.tink();
    this.bg.scare(x, y);
    if (!touch) {
      this.cross.setTint(COL.orange);
      this.time.delayedCall(90, () => this.cross.clearTint());
    }

    const pad = touch ? 7 : 3;
    let best: Target | null = null;
    let bestD = Infinity;
    for (const t of this.targets) {
      const d = t.hitScore(x, y, pad);
      if (d < bestD) {
        bestD = d;
        best = t;
      }
    }
    if (!best) {
      // a miss still lands somewhere
      if (y >= this.L.grassTop + 4) {
        this.grassBurst(x, Math.min(y, this.L.dirtTop - 2), 6);
        audio.rustle();
      } else {
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 + Math.random();
          this.emit(x, y, 0xb8b0e8, Math.cos(a) * 60, Math.sin(a) * 60, 0.18, 0, 1, DEPTH.fx);
        }
      }
      if (this.shots === 0) this.outT = 0.001;
      return;
    }
    audio.hitDuck();
    try {
      navigator.vibrate?.([20, 30, 35]);
    } catch {
      /* not allowed */
    }
    if (best instanceof Duck) {
      const pts = best.kind.points[band(this.round)];
      best.shoot();
      this.hitStop = 0.07;
      this.feathers(best);
      this.addScore(pts);
      this.popScore(best.x, best.y + 12, pts);
      // a little soul escapes
      const soul = this.add.image(Math.round(best.x), Math.round(best.y), 'soul').setDepth(DEPTH.fx).setAlpha(0.8);
      audio.soul();
      this.tweens.add({ targets: soul, y: soul.y - 34, alpha: 0, duration: 1300, ease: 'Sine.easeOut', onComplete: () => soul.destroy() });
      this.tweens.add({ targets: soul, x: soul.x + 4, duration: 320, yoyo: true, repeat: 2, ease: 'Sine.easeInOut' });
    } else {
      const pts = [500, 800, 1000][band(this.round)];
      best.smash();
      audio.pop();
      this.addScore(pts);
      this.popScore(best.x, best.y + 6, pts);
      for (let i = 0; i < 14; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 30 + Math.random() * 60;
        const c = [0xf83800, 0xfca044, 0xf8b800, 0x00a800][i % 4];
        this.emit(best.x, best.y, c, Math.cos(a) * v, Math.sin(a) * v - 30, 0.7 + Math.random() * 0.4, 160, i % 3 === 0 ? 2 : 1);
      }
    }
    if (this.targets.every((t) => !t.alive)) this.outT = 0;
    else if (this.shots === 0) this.outT = 0.001;
  }

  // ------------------------------------------------------------- pause --
  private toggleMute(): void {
    save.muted = !save.muted;
    audio.setMuted(save.muted);
    persist();
    if (this.paused) this.buildPause();
  }

  private togglePause(): void {
    this.setPaused(!this.paused);
  }

  private setPaused(p: boolean): void {
    if (p === this.paused || this.phase === 'over') return;
    this.paused = p;
    this.time.paused = p;
    if (p) {
      this.tweens.pauseAll();
      this.anims.pauseAll();
      audio.blip();
      this.buildPause();
    } else {
      this.tweens.resumeAll();
      this.anims.resumeAll();
      this.pauseUi.forEach((o) => o.destroy());
      this.pauseBtns.forEach(({ b }) => b.destroy());
      this.pauseUi = [];
      this.pauseBtns = [];
      audio.blip();
    }
  }

  private buildPause(): void {
    this.pauseUi.forEach((o) => o.destroy());
    this.pauseBtns.forEach(({ b }) => b.destroy());
    const L = this.L;
    const dim = this.add.rectangle(0, 0, L.W, L.H, 0x05030f, 0.72).setOrigin(0).setDepth(DEPTH.overlay);
    const title = centerX(txt(this, 0, 0, 'PAUSE', COL.pumpkin).setDepth(DEPTH.overlay + 1), L.W / 2);
    const cy = Math.round(L.H / 2) - 40;
    title.y = cy;
    const mk = (label: string, act: () => void, i: number) => {
      const b = new Button(this, label, 120, 20);
      b.g.setDepth(DEPTH.overlay + 1);
      b.label.setDepth(DEPTH.overlay + 2);
      b.setSelected(i === 0);
      b.place(L.W / 2, cy + 18 + i * 30, 5);
      this.pauseBtns.push({ b, act });
    };
    this.pauseBtns = [];
    mk('RESUME', () => this.setPaused(false), 0);
    mk(save.muted ? 'SOUND: OFF' : 'SOUND: ON', () => this.toggleMute(), 1);
    mk('QUIT', () => this.quit(), 2);
    this.pauseUi = [dim, title];
  }

  private quit(): void {
    this.setPaused(false);
    this.recordTop();
    audio.stopMusic();
    this.phase = 'over';
    fade(this, 'out', () => this.scene.start('title', { mode: this.mode }));
  }

  private recordTop(): void {
    if (this.score > save.top[this.mode]) {
      save.top[this.mode] = this.score;
      persist();
    }
  }

  // -------------------------------------------------------------- flow --
  private async run(gen: number): Promise<void> {
    for (;;) {
      const passed = await this.playRound(gen);
      if (!this.alive(gen)) return;
      if (!passed) {
        await this.gameOver(gen);
        return;
      }
      this.round++;
    }
  }

  private async playRound(gen: number): Promise<boolean> {
    const L = () => this.L;
    this.hud.resetIcons();
    this.hud.setRound(this.round);
    this.hud.setRequired(requiredHits(this.round));
    this.hud.setShots(3);
    this.phase = 'intro';
    this.msg.show(['ROUND', String(this.round)], L().W / 2, L().H * 0.3, [COL.white, COL.pumpkin]);
    audio.play(ROUND_START);
    if (this.round === 1 && !this.tapHint) {
      this.tapHint = txt(this, 0, 0, 'TAP TO SKIP', COL.dim).setDepth(DEPTH.ui);
      centerX(this.tapHint, L().W / 2).y = Math.round(L().H * 0.3) + 24;
    }
    if (this.mode === 'C') await wait(this, 2200);
    else await this.dog.intro();
    if (!this.alive(gen)) return false;
    this.tapHint?.destroy();
    this.tapHint = null;
    this.msg.hide();
    audio.stopMusic();

    const per = this.mode === 'A' ? 1 : 2;
    for (let i = 0; i < 10; i += per) {
      await this.playSet(gen, i, per);
      if (!this.alive(gen)) return false;
    }
    return this.tally(gen);
  }

  private pickKind(): number {
    const r = this.round;
    const w0 = Math.max(0.2, 0.6 - 0.04 * (r - 1));
    const w2 = Math.min(0.45, 0.1 + 0.035 * (r - 1));
    const x = Math.random();
    return x < w0 ? 0 : x < 1 - w2 ? 1 : 2;
  }

  private async playSet(gen: number, idx: number, per: number): Promise<void> {
    const L = this.L;
    const r = this.round;
    this.shots = 3;
    this.hud.setShots(3);
    this.hud.flashing = per === 2 ? [idx, idx + 1] : [idx];
    this.targets = [];
    if (this.mode === 'C') {
      const dur = Math.max(1.3, 2.9 - 0.08 * (r - 1));
      this.targets.push(new Pumpkin(this, L, -1, dur, 0), new Pumpkin(this, L, 1, dur, 0.12 + Math.random() * 0.3));
      this.flyTime = dur + 0.6;
      audio.launch();
    } else {
      const mult = Math.min(2.1, 1 + 0.065 * (r - 1));
      for (let k = 0; k < per; k++) {
        const kind = this.pickKind();
        const x = L.W * (0.2 + Math.random() * 0.6);
        const d = new Duck(this, kind, x, L.dirtTop - 8, DUCK_KINDS[kind].speed * mult, L);
        d.onTrail = (tx, ty, c) => this.emit(tx + (Math.random() * 4 - 2), ty, c, 0, -6, 0.5);
        d.onLand = (dd) => {
          this.grassBurst(dd.landX, this.L.dirtTop - 16, 12);
          audio.rustle();
        };
        this.targets.push(d);
      }
      this.flyTime = Math.max(3.8, 6.5 - 0.18 * (r - 1)) + (per === 2 ? 1.2 : 0);
      audio.quack();
    }
    this.setTime = 0;
    this.outT = 0;
    this.flyAwayShown = false;
    this.phase = 'flying';
    await new Promise<void>((res) => (this.setDone = res));
    if (!this.alive(gen)) return;
    this.phase = 'resolve';
    this.hud.flashing = [];
    if (this.flyAwayShown) {
      await wait(this, 300);
      this.msg.hide();
      this.bg.setBloodSky(false);
    }
    const hits = this.targets.filter((t) => (t instanceof Duck ? t.state === 'down' : t.state === 'hit'));
    this.targets.forEach((t, k) => {
      const i = idx + k;
      this.hud.setState(i, hits.includes(t) ? 1 : 2);
    });
    await wait(this, 350);
    if (!this.alive(gen)) return;
    if (this.mode === 'C') {
      if (hits.length === 0) await this.dog.laugh();
      else await wait(this, 400);
    } else if (hits.length) {
      const ducks = hits as Duck[];
      const x = ducks.reduce((s, d) => s + d.landX, 0) / ducks.length;
      await this.dog.showCatch(x, ducks.map((d) => d.kindIndex));
    } else await this.dog.laugh();
    if (!this.alive(gen)) return;
    this.targets.forEach((t) => t.destroy());
    this.targets = [];
    await wait(this, 250);
  }

  private async tally(gen: number): Promise<boolean> {
    this.phase = 'resolve';
    const st = this.hud.states;
    // NES-style shuffle: hits slide to the left one swap at a time
    let swapped = true;
    let n = 0;
    while (swapped) {
      swapped = false;
      for (let i = 0; i < 9; i++) {
        if (st[i] !== 1 && st[i + 1] === 1) {
          [st[i], st[i + 1]] = [st[i + 1], st[i]];
          swapped = true;
          audio.tick(n++ % 12);
          await wait(this, 90);
          if (!this.alive(gen)) return false;
        }
      }
    }
    const hits = st.filter((s) => s === 1).length;
    this.hud.flashing = st.map((s, i) => (s === 1 ? i : -1)).filter((i) => i >= 0);
    await wait(this, 900);
    this.hud.flashing = [];
    const ok = hits >= requiredHits(this.round);
    if (!ok) return false;
    const L = this.L;
    if (hits === 10) {
      const bonus = this.round <= 10 ? 10000 : this.round <= 15 ? 15000 : this.round <= 20 ? 20000 : 30000;
      this.msg.show(['PERFECT!!', String(bonus)], L.W / 2, L.H * 0.3, [COL.gold, COL.white], COL.gold);
      audio.play(PERFECT);
      this.addScore(bonus);
      await wait(this, 2600);
    } else {
      audio.play(ROUND_CLEAR);
      await wait(this, 2000);
    }
    this.msg.hide();
    return this.alive(gen);
  }

  private async gameOver(gen: number): Promise<void> {
    const L = this.L;
    this.phase = 'resolve';
    this.recordTop();
    this.msg.show(['GAME OVER'], L.W / 2, L.H * 0.3, [COL.blood], COL.blood);
    audio.play(GAME_OVER);
    await wait(this, 600);
    await this.dog.laugh();
    if (!this.alive(gen)) return;
    const best = this.score >= save.top[this.mode] && this.score > 0;
    this.msg.show(
      best ? ['GAME OVER', 'NEW TOP SCORE!', String(this.score), '', 'TAP TO CONTINUE'] : ['GAME OVER', '', 'TAP TO CONTINUE'],
      L.W / 2,
      L.H * 0.3 + 10,
      best ? [COL.blood, COL.gold, COL.white, 0, COL.gray] : [COL.blood, 0, COL.gray],
      COL.blood,
    );
    this.phase = 'over';
    await new Promise<void>((res) => {
      this.gameOverTap = res;
      this.time.delayedCall(12000, res);
    });
    this.gameOverTap = null;
    if (!this.alive(gen)) return;
    fade(this, 'out', () => this.scene.start('title', { mode: this.mode }));
  }

  // ------------------------------------------------------------ update --
  update(time: number, delta: number): void {
    const dt = Math.min(0.05, delta / 1000);
    this.hud.update(time);
    if (this.paused) return;
    this.bg.update(time, dt);

    this.fxp.update(dt);

    // brief hit-stop freezes the targets for a beat after a hit
    if (this.hitStop > 0) this.hitStop -= dt;
    else
      for (const t of this.targets) {
        if (t instanceof Duck) t.update(dt);
        else if (t.update(dt)) audio.launch();
      }

    if (this.phase === 'flying') {
      this.setTime += dt;
      if (this.outT > 0) this.outT += dt;
      const flying = this.targets.filter((t) => t.state === 'fly');
      const timeUp = this.setTime > this.flyTime || this.outT > 0.55;
      if (this.mode !== 'C' && timeUp && flying.length) {
        flying.forEach((d) => (d as Duck).flyAway());
        if (!this.flyAwayShown) {
          this.flyAwayShown = true;
          this.msg.show(['FLY AWAY'], this.L.W / 2, this.L.H * 0.3, [COL.white]);
          this.bg.setBloodSky(true);
          audio.flyAway();
        }
      }
      if (this.mode === 'C' && timeUp && flying.length) {
        flying.forEach((p) => (p as Pumpkin).smash());
        (flying as Pumpkin[]).forEach((p) => (p.state = 'gone'));
        audio.pumpkinGone();
      }
      const settled = this.targets.every((t) =>
        t instanceof Duck ? t.state === 'down' || t.state === 'gone' : t.state !== 'fly',
      );
      if (settled && this.setDone) {
        const f = this.setDone;
        this.setDone = null;
        f();
      }
    }
  }
}


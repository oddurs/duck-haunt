// The bulldog in a ghost-sheet costume.
import Phaser from 'phaser';
import type { Layout } from '../gfx/background';
import { DEPTH, COL, txt } from '../ui';
import { audio } from '../audio/audio';
import { CAUGHT } from '../audio/songs';
import { Seq, tween, wait } from '../async';

export class Dog {
  private walker: Phaser.GameObjects.Sprite;
  private pop: Phaser.GameObjects.Container;
  private face: Phaser.GameObjects.Sprite;
  private arms: Phaser.GameObjects.Image[];
  private held: Phaser.GameObjects.Image[];
  private bang: Phaser.GameObjects.BitmapText;
  private L!: Layout;
  seq: Seq | null = null;

  constructor(private scene: Phaser.Scene) {
    const s = scene;
    this.walker = s.add.sprite(0, 0, 'dogSide', 'walk0').setOrigin(0.5, 1).setDepth(DEPTH.dogWalk).setVisible(false);
    this.face = s.add.sprite(0, 0, 'dogFront', 'idle').setOrigin(0.5, 0);
    this.arms = [-1, 1].map((d) => s.add.image(d * 17, 4, 'dogArm').setOrigin(0.5, 0).setFlipX(d < 0).setVisible(false));
    this.held = [-1, 1].map((d) => s.add.image(d * 18, -2, 'duck0', 'fall').setOrigin(0.5, 0.15).setVisible(false));
    this.pop = s.add.container(0, 0, [...this.held, ...this.arms, this.face]).setDepth(DEPTH.dogPop).setVisible(false);
    this.bang = txt(s, 0, 0, '!', COL.gold).setDepth(DEPTH.dogWalk).setVisible(false);
  }

  layout(L: Layout): void {
    this.L = L;
    if (this.walker.visible) this.walker.y = L.walkY;
    if (this.pop.visible) this.pop.y = L.popShown;
  }

  hide(): void {
    this.walker.setVisible(false).stop();
    this.pop.setVisible(false);
    this.face.stop();
    this.bang.setVisible(false);
  }

  /** Walk in, sniff around, spot something, leap into the grass. Tap skips. */
  async intro(): Promise<void> {
    const L = this.L;
    const seq = (this.seq = new Seq(this.scene));
    const w = this.walker;
    w.setTexture('dogSide', 'walk0').setOrigin(0.5, 1).setDepth(DEPTH.dogWalk).setFlipX(false);
    w.setPosition(-24, L.walkY).setVisible(true).play('dogWalk');
    const walkTo = async (x: number) => {
      w.play('dogWalk', true);
      await seq.tween({ targets: w, x, duration: Math.abs(x - w.x) * 19 });
    };
    await walkTo(Math.round(L.W * 0.24));
    w.play('dogSniff');
    await seq.wait(750);
    await walkTo(Math.round(L.W * 0.42));
    w.play('dogSniff');
    await seq.wait(550);
    w.stop().setFrame('walk0');
    if (!seq.skipped) {
      this.bang.setPosition(w.x + 6, w.y - 34).setVisible(true);
      audio.bark();
    }
    await seq.wait(550);
    this.bang.setVisible(false);
    // leap
    w.setTexture('dogJump').setOrigin(0.5, 1);
    await seq.tween({ targets: w, x: w.x + 16, y: L.walkY - 30, duration: 320, ease: 'Quad.easeOut' });
    w.setTexture('dogDive').setOrigin(0.5, 1).setDepth(DEPTH.dogPop);
    await seq.tween({ targets: w, x: w.x + 6, y: L.grassTop + 30, duration: 300, ease: 'Quad.easeIn' });
    this.hide();
    this.seq = null;
  }

  private async rise(x: number, holdMs: number): Promise<void> {
    const L = this.L;
    const p = this.pop;
    p.setPosition(Math.round(Phaser.Math.Clamp(x, 28, L.W - 28)), L.popHidden).setVisible(true);
    await tween(this.scene, { targets: p, y: L.popShown, duration: 380, ease: 'Quad.easeOut' });
    await wait(this.scene, holdMs);
    await tween(this.scene, { targets: p, y: L.popHidden + 6, duration: 320, ease: 'Quad.easeIn' });
    this.hide();
  }

  /** Pop up proudly holding the downed ducks. */
  async showCatch(x: number, kinds: number[]): Promise<void> {
    this.face.stop().setFrame('happy');
    const two = kinds.length > 1;
    const sides = two ? [0, 1] : [1];
    this.arms.forEach((a, i) => a.setVisible(sides.includes(i)));
    this.held.forEach((h, i) => {
      const k = two ? kinds[i] : kinds[0];
      h.setTexture(`duck${k}`, 'fall').setVisible(sides.includes(i));
    });
    audio.play(CAUGHT);
    await this.rise(x, 900);
  }

  async laugh(x?: number): Promise<void> {
    this.arms.forEach((a) => a.setVisible(false));
    this.held.forEach((h) => h.setVisible(false));
    this.face.play('dogLaugh');
    audio.laugh();
    const bob = this.scene.tweens.add({ targets: this.face, y: 1, duration: 120, yoyo: true, repeat: -1 });
    await this.rise(x ?? this.L.W / 2, 1300);
    bob.stop();
    this.face.y = 0;
  }

  /** Title-screen cameo: peek, laugh, duck back down. */
  async cameo(x: number): Promise<void> {
    this.arms.forEach((a) => a.setVisible(false));
    this.held.forEach((h) => h.setVisible(false));
    this.face.stop().setFrame('idle');
    const L = this.L;
    const p = this.pop;
    p.setPosition(Math.round(x), L.popHidden).setVisible(true);
    await tween(this.scene, { targets: p, y: L.popShown, duration: 500, ease: 'Quad.easeOut' });
    await wait(this.scene, 700);
    this.face.play('dogLaugh');
    await wait(this.scene, 1200);
    this.face.stop().setFrame('idle');
    await tween(this.scene, { targets: p, y: L.popHidden + 6, duration: 400, ease: 'Quad.easeIn' });
    this.hide();
  }
}

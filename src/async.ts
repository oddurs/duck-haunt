// Promise helpers bound to a scene's clock/tween manager, so pausing the
// scene also pauses scripted sequences.
export function wait(scene: Phaser.Scene, ms: number): Promise<void> {
  return new Promise((res) => scene.time.delayedCall(ms, () => res()));
}

export function tween(scene: Phaser.Scene, cfg: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
  return new Promise((res) => {
    scene.tweens.add({ ...cfg, onComplete: () => res() });
  });
}

/** A skippable sequence: once skip() is called every pending/future wait resolves at once. */
export class Seq {
  skipped = false;
  private waiters: (() => void)[] = [];
  constructor(private scene: Phaser.Scene) {}
  skip() {
    if (this.skipped) return;
    this.skipped = true;
    this.waiters.splice(0).forEach((f) => f());
  }
  wait(ms: number): Promise<void> {
    if (this.skipped) return Promise.resolve();
    return new Promise((res) => {
      let done = false;
      const fin = () => {
        if (!done) {
          done = true;
          res();
        }
      };
      this.waiters.push(fin);
      this.scene.time.delayedCall(ms, fin);
    });
  }
  tween(cfg: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
    if (this.skipped) return Promise.resolve();
    return new Promise((res) => {
      let done = false;
      const fin = () => {
        if (!done) {
          done = true;
          res();
        }
      };
      this.waiters.push(() => {
        if (t.isPlaying()) t.complete();
        fin();
      });
      const t = this.scene.tweens.add({ ...cfg, onComplete: fin });
    });
  }
}

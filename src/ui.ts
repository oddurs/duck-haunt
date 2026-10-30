// NES-style UI primitives: bitmap text, bordered boxes, message panels, buttons.
export const DEPTH = {
  sky: 0,
  moon: 1,
  cloud: 2,
  land: 3,
  fog: 4,
  bats: 5,
  duck: 10,
  dogPop: 12,
  fore: 20,
  fogFront: 21,
  dogWalk: 25,
  hud: 30,
  fx: 40,
  ui: 50,
  overlay: 60,
  cursor: 100,
} as const;

export const COL = {
  white: 0xfcfcfc,
  gray: 0xbcbcbc,
  dim: 0x7c7c7c,
  black: 0x000000,
  orange: 0xf87800,
  pumpkin: 0xfca044,
  gold: 0xf8b800,
  lime: 0xb8f818,
  green: 0x58d854,
  red: 0xf83800,
  blood: 0xe40058,
  lilac: 0xd8b8f8,
  violet: 0x9878f8,
  cyan: 0x3cbcfc,
  blue: 0x0078f8,
};

export function txt(
  scene: Phaser.Scene,
  x: number,
  y: number,
  s: string,
  tint: number = COL.white,
  shadow = true,
): Phaser.GameObjects.BitmapText {
  const t = scene.add.bitmapText(Math.round(x), Math.round(y), shadow ? 'pxs' : 'px', s.toUpperCase());
  t.setTint(tint);
  return t;
}

/** Centre a bitmap text horizontally on whole pixels. */
export function centerX(t: Phaser.GameObjects.BitmapText, cx: number): Phaser.GameObjects.BitmapText {
  t.x = Math.round(cx - t.width / 2);
  return t;
}

/** Rounded 1px-border box like the NES Duck Hunt HUD panels. */
export function box(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  border: number = COL.white,
  fill: number = COL.black,
  fillAlpha = 1,
): void {
  x = Math.round(x);
  y = Math.round(y);
  g.fillStyle(fill, fillAlpha);
  g.fillRect(x + 1, y + 1, w - 2, h - 2);
  g.fillStyle(border, 1);
  g.fillRect(x + 2, y, w - 4, 1);
  g.fillRect(x + 2, y + h - 1, w - 4, 1);
  g.fillRect(x, y + 2, 1, h - 4);
  g.fillRect(x + w - 1, y + 2, 1, h - 4);
  g.fillRect(x + 1, y + 1, 1, 1);
  g.fillRect(x + w - 2, y + 1, 1, 1);
  g.fillRect(x + 1, y + h - 2, 1, 1);
  g.fillRect(x + w - 2, y + h - 2, 1, 1);
}

/** Centered message panel ("ROUND 1", "FLY AWAY", ...). */
export class MessageBox {
  readonly root: Phaser.GameObjects.Container;
  private g: Phaser.GameObjects.Graphics;
  private lines: Phaser.GameObjects.BitmapText[] = [];
  constructor(private scene: Phaser.Scene) {
    this.g = scene.add.graphics();
    this.root = scene.add.container(0, 0, [this.g]).setDepth(DEPTH.ui).setVisible(false);
  }
  private last: { lines: string[]; fx: number; fy: number; tints: number[]; border: number } | null = null;
  show(lines: string[], cx: number, cy: number, tints: number[] = [], border: number = COL.white): void {
    const sc = this.scene.scale;
    this.last = { lines, fx: cx / sc.width, fy: cy / sc.height, tints, border };
    this.lines.forEach((l) => l.destroy());
    this.lines = lines.map((s, i) => txt(this.scene, 0, 0, s, tints[i] ?? COL.white));
    const w = Math.max(...this.lines.map((l) => l.width)) + 20;
    const h = lines.length * 12 + 10;
    const x = Math.round(cx - w / 2);
    const y = Math.round(cy - h / 2);
    this.g.clear();
    box(this.g, x, y, w, h, border);
    box(this.g, x + 2, y + 2, w - 4, h - 4, border, COL.black, 0);
    this.lines.forEach((l, i) => {
      centerX(l, cx);
      l.y = y + 7 + i * 12;
      this.root.add(l);
    });
    this.root.setVisible(true);
    // NES-style blink-in
    this.blinkEv?.remove();
    this.blinkEv = this.scene.time.addEvent({ delay: 45, repeat: 3, callback: () => this.root.setVisible(!this.root.visible) });
  }
  private blinkEv?: Phaser.Time.TimerEvent;
  hide(): void {
    this.blinkEv?.remove();
    this.root.setVisible(false);
  }
  /** Re-centre after the screen changed size. */
  relayout(): void {
    if (!this.root.visible || !this.last) return;
    const { lines, fx, fy, tints, border } = this.last;
    const sc = this.scene.scale;
    this.show(lines, fx * sc.width, fy * sc.height, tints, border);
  }
  get visible() {
    return this.root.visible;
  }
}

export interface Hit {
  x: number;
  y: number;
  w: number;
  h: number;
}
export const inside = (r: Hit, x: number, y: number) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;

/** A tappable menu button with a generous hit area. */
export class Button {
  readonly g: Phaser.GameObjects.Graphics;
  readonly label: Phaser.GameObjects.BitmapText;
  area: Hit = { x: 0, y: 0, w: 0, h: 0 };
  selected = false;
  pressed = false;
  constructor(
    scene: Phaser.Scene,
    public text: string,
    public w: number,
    public h = 20,
  ) {
    this.g = scene.add.graphics().setDepth(DEPTH.ui);
    this.label = txt(scene, 0, 0, text).setDepth(DEPTH.ui);
  }
  place(cx: number, y: number, pad = 4): void {
    this.area = { x: Math.round(cx - this.w / 2) - pad, y: y - pad, w: this.w + pad * 2, h: this.h + pad * 2 };
    this.cx = cx;
    this.y = y;
    this.draw();
  }
  private cx = 0;
  private y = 0;
  draw(): void {
    const x = Math.round(this.cx - this.w / 2);
    this.g.clear();
    const y = this.y + (this.pressed ? 1 : 0);
    box(this.g, x, y, this.w, this.h, this.selected ? COL.pumpkin : COL.gray, this.pressed ? COL.orange : COL.black);
    if (this.selected && !this.pressed) box(this.g, x + 1, y + 1, this.w - 2, this.h - 2, COL.orange, COL.black, 0);
    this.label.setText(this.text.toUpperCase());
    this.label.setTint(this.pressed ? COL.black : this.selected ? COL.white : COL.gray);
    centerX(this.label, this.cx);
    this.label.y = Math.round(y + (this.h - 8) / 2);
  }
  setPressed(p: boolean) {
    this.pressed = p;
    this.draw();
  }
  setSelected(s: boolean) {
    if (s === this.selected) return;
    this.selected = s;
    this.draw();
  }
  setVisible(v: boolean) {
    this.g.setVisible(v);
    this.label.setVisible(v);
  }
  destroy() {
    this.g.destroy();
    this.label.destroy();
  }
}

/** Stepped NES-style fade (black in four palette steps). */
export function fade(scene: Phaser.Scene, dir: 'in' | 'out', done?: () => void): void {
  const steps = dir === 'in' ? [1, 0.75, 0.5, 0.25, 0] : [0, 0.25, 0.5, 0.75, 1];
  const r = scene.add
    .rectangle(0, 0, scene.scale.width, scene.scale.height, 0x000000)
    .setOrigin(0)
    .setDepth(DEPTH.cursor + 10)
    .setAlpha(steps[0]);
  let i = 0;
  scene.time.addEvent({
    delay: 55,
    repeat: steps.length - 1,
    callback: () => {
      i++;
      if (i < steps.length) r.setAlpha(steps[i]);
      else {
        if (dir === 'in') r.destroy();
        done?.();
      }
    },
  });
}

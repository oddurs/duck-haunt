import Phaser from 'phaser';
import { BootScene } from './scenes/Boot';
import { TitleScene } from './scenes/Title';
import { GameScene } from './scenes/Game';
import { audio } from './audio/audio';
import { save } from './state';

// Pick a logical resolution near the NES's 256x240 that divides the screen
// into whole device pixels, so every sprite pixel is a perfect square.
function pickSize(): { W: number; H: number; zoom: number } {
  const host = document.getElementById('game')!;
  const cs = getComputedStyle(host);
  const cw = host.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const ch = host.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const dpr = Math.min(window.devicePixelRatio || 1, 4);
  const dw = Math.max(1, cw * dpr);
  const dh = Math.max(1, ch * dpr);
  let z = Math.floor(Math.min(dw / 256, dh / 224));
  if (z < 1) z = Math.min(dw / 256, dh / 224);
  const W = Math.max(256, Math.min(520, Math.floor(dw / z)));
  const H = Math.max(224, Math.min(640, Math.floor(dh / z)));
  return { W, H, zoom: z / dpr };
}

const size = pickSize();
audio.muted = save.muted;

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: size.W,
  height: size.H,
  backgroundColor: '#05030f',
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  audio: { noAudio: true },
  input: { activePointers: 3, touch: { capture: true } },
  scale: { mode: Phaser.Scale.NONE, zoom: size.zoom, autoCenter: Phaser.Scale.NO_CENTER },
  fps: { target: 60, smoothStep: true },
  scene: [BootScene, TitleScene, GameScene],
});

let pending = 0;
function onResize() {
  clearTimeout(pending);
  pending = window.setTimeout(() => {
    const s = pickSize();
    if (s.W === game.scale.width && s.H === game.scale.height && s.zoom === game.scale.zoom) return;
    game.scale.setZoom(s.zoom);
    game.scale.resize(s.W, s.H);
  }, 120);
}
window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', onResize);
window.visualViewport?.addEventListener('resize', onResize);

// Stop iOS from rubber-banding / double-tap zooming the page.
document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
document.addEventListener('dblclick', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Handy for debugging from the console / automated playtests.
(window as unknown as { __game: Phaser.Game }).__game = game;

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

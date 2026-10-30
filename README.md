# Duck Haunt

A spooky, touch-first homage to the NES light-gun classic. Haunted ducks with
glowing eyes flap over a moonlit graveyard below a ruined castle, and a
laughing English bulldog in a bedsheet-ghost costume fetches your catches (or
snickers at your misses).

Everything is generated in code: pixel art from ASCII sprite maps, an 8x8
bitmap font, the painted night backdrop, and an NES-style chiptune synth
(pulse / triangle / noise via WebAudio). There are no image or audio assets.

## Play

```bash
npm install
npm run dev      # http://localhost:5173 (also on your LAN for phone testing)
npm run build    # static build in dist/ — host anywhere (relative paths)
```

- **Game A**: 1 duck at a time. **Game B**: 2 ducks. **Game C**: jack-o'-lanterns (clay shooting).
- Tap (or click) to shoot. 3 shots per set, 10 targets per round.
- Hit the quota (blue bars under HIT) to advance: 6 per round up to round 10, then 7, 8, 9, and finally 10.
- 10/10 is a PERFECT bonus. Top scores are saved per mode.
- Duck kinds: **Wisp** (green eyes), **Shade** (cyan eyes, faster), **Wraith** (red eyes, fastest, worth the most).
- Tap during the dog's intro to skip it. Pause button top-right (or `P`/`Esc`); `M` mutes.

## Mobile niceties

- Integer pixel scaling: the logical resolution (about 256x240, adaptive from 256–520 wide and 224–640 tall)
  is picked so each art pixel maps to a whole number of device pixels, in portrait or landscape,
  and re-fits on rotation.
- Generous touch hit boxes, no scroll, zoom or long-press menus, safe-area aware.
- Short haptic tick on shots (where `navigator.vibrate` exists), audio unlocked on the first tap,
  iOS `audioSession` set to playback so the silent switch doesn't mute it.
- Installable PWA (manifest + icons) with an offline service worker in production builds.
- Respects `prefers-reduced-motion` (no screen flash or shake).

## Layout

```
src/
  main.ts            sizing + Phaser boot
  gfx/art.ts         every sprite as ASCII pixel art + palettes
  gfx/font.ts        bitmap font + dripping logo renderer
  gfx/background.ts  procedural sky, moon, castle, tree, grass
  audio/audio.ts     chiptune synth + sound effects + sequencer
  audio/songs.ts     music cues
  objects/           Duck, Dog, Pumpkin, Hud, Backdrop
  scenes/            Boot (texture generation), Title, Game
preview.html         dev-only sprite sheet viewer (/preview.html?s=8)
scripts/             playtest bot + icon renderer (Playwright)
```

Built with [Phaser 3](https://phaser.io), TypeScript and Vite.

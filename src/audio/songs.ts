// Original spooky chiptune cues (A minor / harmonic minor).
import type { Song } from './audio';

const bass = (pairs: string[]) => pairs.map((n) => `${n}2:2 ${n}3:2`).join(' ');

export const TITLE: Song = {
  bpm: 132,
  loop: true,
  tracks: [
    {
      wave: 'p25',
      vol: 0.13,
      vib: 14,
      notes: [
        'A4:2 C5:2 E5:2 A5:2 G#5:2 E5:2 C5:2 B4:2',
        'C5:2 A4:2 E4:4 F4:2 E4:2 D#4:2 E4:2',
        'F4:2 A4:2 C5:2 F5:2 E5:2 C5:2 A4:2 G#4:2',
        'A4:6 B4:2 C5:4 E5:4',
        'D5:2 F5:2 A5:2 F5:2 E5:2 G#5:2 B5:2 G#5:2',
        'A5:4 E5:4 C5:4 A4:4',
        'F5:3 E5:1 D5:2 C5:2 B4:3 C5:1 D5:2 B4:2',
        'A4:8 -:4 E4:2 G#4:2',
      ].join(' '),
    },
    {
      wave: 'p12',
      vol: 0.06,
      notes: 'E4:8 C4:8 E4:8 B3:8 C4:8 A3:8 E4:8 E4:8 F4:8 E4:8 E4:8 C4:8 D4:8 E4:8 C4:8 B3:8',
    },
    {
      wave: 'tri',
      vol: 0.32,
      notes: [
        bass(['A', 'A', 'A', 'A']),
        bass(['A', 'A', 'E', 'E']),
        bass(['F', 'F', 'F', 'F']),
        bass(['A', 'A', 'E', 'E']),
        bass(['D', 'D', 'E', 'E']),
        bass(['A', 'A', 'G', 'G']),
        bass(['F', 'F', 'E', 'E']),
        bass(['A', 'A', 'E', 'E']),
      ].join(' '),
    },
    {
      wave: 'noise',
      vol: 0.1,
      notes: Array(8).fill('k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2').join(' '),
    },
  ],
};

export const ROUND_START: Song = {
  bpm: 150,
  tracks: [
    { wave: 'p25', vol: 0.15, vib: 10, notes: 'A4:2 C5:2 E5:2 A4:2 G#5:4 E5:4 F5:2 E5:2 D5:2 B4:2 A4:6 -:2' },
    { wave: 'p12', vol: 0.07, notes: 'E4:4 E4:4 B3:4 B3:4 A3:4 G#3:4 C4:8' },
    { wave: 'tri', vol: 0.34, notes: 'A2:4 A2:4 E2:4 E2:4 D2:4 E2:4 A2:8' },
    { wave: 'noise', vol: 0.1, notes: 'k:4 s:4 k:4 s:4 k:4 s:4 k:2 s:2 s:4' },
  ],
};

export const CAUGHT: Song = {
  bpm: 200,
  tracks: [
    { wave: 'p25', vol: 0.15, notes: 'E5:1 G5:1 B5:1 E6:4' },
    { wave: 'tri', vol: 0.3, notes: 'E3:3 B2:4' },
  ],
};

export const ROUND_CLEAR: Song = {
  bpm: 160,
  tracks: [
    { wave: 'p25', vol: 0.15, notes: 'A4:2 C#5:2 E5:2 A5:4 G#5:2 A5:4 -:2 E5:2 F#5:2 G#5:2 A5:8' },
    { wave: 'p12', vol: 0.07, notes: 'E4:4 E4:4 E4:4 E4:4 D4:4 D4:2 E4:2 C#4:8' },
    { wave: 'tri', vol: 0.32, notes: 'A2:4 A2:4 E2:4 E2:4 D2:4 E2:4 A2:8' },
    { wave: 'noise', vol: 0.1, notes: 'k:4 s:4 k:4 s:4 k:4 s:2 s:2 k:8' },
  ],
};

export const PERFECT: Song = {
  bpm: 170,
  tracks: [
    {
      wave: 'p25',
      vol: 0.15,
      notes: 'A4:1 C#5:1 E5:1 A5:1 C#6:1 E6:3 -:2 A5:1 C#6:1 E6:1 A6:5 -:2 E6:2 F#6:2 G#6:2 A6:8',
    },
    { wave: 'p12', vol: 0.07, notes: 'A4:8 E5:8 D5:4 E5:4 A5:8' },
    { wave: 'tri', vol: 0.32, notes: 'A2:4 E2:4 A2:4 E2:4 D2:4 E2:4 A2:8' },
    { wave: 'noise', vol: 0.1, notes: 'k:2 h:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 k:2 s:2 s:2 k:8' },
  ],
};

export const GAME_OVER: Song = {
  bpm: 96,
  tracks: [
    { wave: 'p25', vol: 0.15, vib: 22, notes: 'E5:4 D#5:4 D5:4 C#5:4 C5:6 B4:2 A4:12' },
    { wave: 'p12', vol: 0.06, notes: 'C5:4 B4:4 A#4:4 A4:4 A4:6 G#4:2 E4:12' },
    { wave: 'tri', vol: 0.34, notes: 'A2:8 G#2:8 F2:8 E2:4 A1:8' },
  ],
};

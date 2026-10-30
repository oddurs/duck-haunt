// All sprites in the game, authored as ASCII pixel maps.
// Every sprite is drawn facing RIGHT; flipping happens at render time.
import type { Art, Palette } from './pixel';
import { NES } from './palette';

// ---------------------------------------------------------------- DUCKS --
// K outline  D body  M wing  L wing/belly light  H head  R neck ring
// C chest    Y beak  E glowing eye  F feet  T/S ghostly tail wisps
// All side frames share the body rows (10..17) so wings flap in place.

export const DUCK_SIDE: Record<string, Art> = {
  side0: [
    '..........................',
    '.......KK.................',
    '.......KLK................',
    '........KLK...............',
    '........KMLK..............',
    '.........KMLK.............',
    '.........KMMLK....KKKK....',
    '..........KMMLK..KHHHHK...',
    '..........KMMMLKKHHHHHHK..',
    '...........KMMMKHHHEEHHKK.',
    '..TT.......KDMMKHHHEEHHKYK',
    '.TSST..KKKKDDDMKRHHHHHKYYK',
    'TS..STKDDDDDDDKKRRKKKKKKK.',
    'T....SDDDDDDDDDCCRK.......',
    '.T..SDDDLLLLDDCCCK........',
    '..TSKDLLLLLLLCCCK.........',
    '...TKKLLLLLLLCCK..........',
    '.....KKKKKKKKKK...........',
    '.......KFFK.KFFK..........',
    '........KK...KK...........',
    '..........................',
    '..........................',
  ],
  side1: [
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..................KKKK....',
    '.................KHHHHK...',
    '................KHHHHHHK..',
    '................KHHHEEHHKK',
    '..TT..KKKKKKKKKKHHHHEEHKYK',
    '.TSSTKLLLLLLLLLKRHHHHHKYYK',
    'TS..KMMMMMMMMMMKRRKKKKKKK.',
    'T...SKMMMMMMMMKCCRK.......',
    '.T..SDKKKKKKKKCCCK........',
    '..TSKDDDLLLLDCCCK.........',
    '...TKKLLLLLLLCCK..........',
    '.....KKKKKKKKKK...........',
    '.......KFFK.KFFK..........',
    '........KK...KK...........',
    '..........................',
    '..........................',
  ],
  side2: [
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..........................',
    '..................KKKK....',
    '.................KHHHHK...',
    '................KHHHHHHK..',
    '................KHHHEEHHKK',
    '..TT.......KKKKKHHHHEEHKYK',
    '.TSST..KKKKDDDDKRHHHHHKYYK',
    'TS..STKDDDDDDDDKRRKKKKKKK.',
    'T....SDDDDDDDDDCCRK.......',
    '.T..SDDKMMMMMDCCCK........',
    '..TSKDKMMMMMMKCCK.........',
    '...TKKKMMMMMMKKK..........',
    '.....KKMMMMMLK............',
    '......KMMMMLK.............',
    '......KMMMLK..............',
    '.......KMLK...............',
    '........KK................',
  ],
};

// Diagonal climb (up-right).
export const DUCK_DIAG: Record<string, Art> = {
  diag0: [
    '...................KKK..',
    '..................KYYK..',
    '................KKKYK...',
    '...KK..........KHHHKK...',
    '..KLLK........KHHEEHK...',
    '..KMMLK.......KHHEEHK...',
    '...KMMLK......KHHHHHK...',
    '....KMMLK....KRHHHHK....',
    '.....KMMLK..KRRKKKK.....',
    '......KMMLKKCCRK........',
    '.......KMMKDCCK.........',
    '........KKDDDCK.........',
    '........KDDDDDK.........',
    '.......KDDDDDLK.........',
    '......KDDDDDLLK.........',
    '.....SDDDDDLLK..........',
    '....TSDDDLLLKK..........',
    '...TS.SKKKKFK...........',
    '..T..T..KFFK............',
    '.T..T....KK.............',
    'T.......................',
    '........................',
  ],
  diag1: [
    '...................KKK..',
    '..................KYYK..',
    '................KKKYK...',
    '...............KHHHKK...',
    '..............KHHEEHK...',
    '..............KHHEEHK...',
    '..............KHHHHHK...',
    '.............KRHHHHK....',
    '...KKKKKKK..KRRKKKK.....',
    '..KLLLLLLMKKCCRK........',
    '...KMMMMMMMKCCK.........',
    '....KKKKMMKDDCK.........',
    '........KDDDDDK.........',
    '.......KDDDDDLK.........',
    '......KDDDDDLLK.........',
    '.....SDDDDDLLK..........',
    '....TSDDDLLLKK..........',
    '...TS.SKKKKFK...........',
    '..T..T..KFFK............',
    '.T..T....KK.............',
    'T.......................',
    '........................',
  ],
  diag2: [
    '...................KKK..',
    '..................KYYK..',
    '................KKKYK...',
    '...............KHHHKK...',
    '..............KHHEEHK...',
    '..............KHHEEHK...',
    '..............KHHHHHK...',
    '.............KRHHHHK....',
    '............KRRKKKK.....',
    '..........KKCCRK........',
    '.........KDDCCK.........',
    '........KDDDDCK.........',
    '......KKMMMMDDK.........',
    '.....KMMMMMMMLK.........',
    '....KMMMMMMKLLK.........',
    '...KMMMMMKKLLK..........',
    '...KLLMKKLLLKK..........',
    '...TKKKKKKKFK...........',
    '..T..T..KFFK............',
    '.T..T....KK.............',
    'T.......................',
    '........................',
  ],
};

// Hit! facing the player, wings flung out, eyes blown wide.
export const DUCK_SHOT: Art = [
  '.........KKKKKK.........',
  '........KHHHHHHK........',
  '.......KHEEHHEEHK.......',
  '.......KHEEHHEEHK.......',
  '.......KHHHKKHHHK.......',
  '..KK...KHHYYYYHHK...KK..',
  '.KLLK...KHYYYYHK...KLLK.',
  'KMMLLK..KRRRRRRK..KLLMMK',
  'KMMMMLKKDCCCCCCDKKLMMMMK',
  '.KMMMMMDDCCCCCCDDMMMMMK.',
  '..KKMMMDDDCCCCDDDMMMKK..',
  '....KKKDDDDDDDDDDKKK....',
  '.......KDDLLLLDDK.......',
  '........KDLLLLDK........',
  '.........KKFFKK.........',
  '.........KF..FK.........',
];

// Tumbling down, head first. Flipped every few frames for the spin.
export const DUCK_FALL: Art = [
  '......KF..FK......',
  '.......KFKFK......',
  '......KDDDDDK.....',
  '.....KDDLLLDDK....',
  '....KMDDLLLDDMK...',
  '...KMMDDDDDDDMMK..',
  '...KMKDDCCCDDKMK..',
  '...KK.KDCCCCK.KK..',
  '......KRRRRRK.....',
  '.....KHHHHHHHK....',
  '.....KHEHHHEHK....',
  '.....KHHHHHHHK....',
  '......KHYYYHK.....',
  '.......KYYYK......',
  '........KKK.......',
];

export interface DuckKind {
  name: string;
  pal: Palette;
  eye: string; // glow colour
  speed: number; // px / s at round 1
  points: [number, number, number]; // rounds 1-5, 6-10, 11+
}

const ghostTail = (c: string) => ({ T: c + '88', S: c + 'CC' });

export const DUCK_KINDS: DuckKind[] = [
  {
    name: 'WISP',
    eye: NES.lime,
    speed: 62,
    points: [500, 800, 1000],
    pal: {
      K: NES.black,
      D: '#2C2C3C',
      M: '#3C3C54',
      L: NES.gray0,
      H: NES.forest,
      R: NES.white,
      C: NES.olive,
      Y: NES.gold,
      E: NES.lime,
      F: NES.rust,
      ...ghostTail(NES.seafoam),
    },
  },
  {
    name: 'SHADE',
    eye: NES.cyan,
    speed: 84,
    points: [1000, 1600, 2000],
    pal: {
      K: NES.black,
      D: NES.indigo,
      M: NES.violet,
      L: NES.lavender,
      H: NES.purple,
      R: NES.lilac,
      C: NES.brick,
      Y: NES.amber,
      E: NES.cyan,
      F: NES.rust,
      ...ghostTail(NES.lilac),
    },
  },
  {
    name: 'WRAITH',
    eye: NES.red,
    speed: 108,
    points: [1500, 2400, 3000],
    pal: {
      K: NES.black,
      D: NES.brick,
      M: NES.darkRed,
      L: NES.rust,
      H: '#3C0808',
      R: NES.cream,
      C: NES.mustard,
      Y: NES.yellow,
      E: '#FF2020',
      F: NES.gold,
      ...ghostTail(NES.rose),
    },
  },
];

// ------------------------------------------------------------------ DOG --
// Norm: a white English bulldog with a brown patch over his left eye, a black
// muzzle with droopy jowls, an underbite and one snaggletooth - wearing a
// bedsheet-ghost hood.
// K outline  W sheet  G sheet shadow  g deep shadow
// T white fur  B fur shade  P brown patch  p dark patch  N black muzzle
// n muzzle grey  O eye  I eye shine  F tooth  R pink skin  M mouth  L tongue

export const DOG_PAL: Palette = {
  K: '#0C0814',
  W: '#F0F0FC',
  G: '#B8B8E0',
  g: '#8C88B8',
  T: '#FCF8EC',
  B: '#E8C8BC',
  P: '#7C4428',
  p: '#4C2414',
  N: '#24202C',
  n: '#4C4858',
  O: '#100804',
  I: NES.white,
  F: '#F8F0C8',
  R: '#F0A8B0',
  M: '#5C0C14',
  L: NES.rose,
};

const pad = (art: Art, w: number): Art => art.map((r) => r.padEnd(w, '.'));

// Side view, facing right. The hood ends at the brow; his face pokes out.
const DOG_SIDE_TOP: Art = pad(
  [
    '.....................KKK..............',
    '....................KTTRK.............',
    '.....................KKTWKKKKK........',
    '.....................KWWWWWWWWKK......',
    '....................KWWWWWWWWWWWK.....',
    '...................KWWWWWWWWWWKTTK....',
    '...................KWWWWWWWWWKTTTTK...',
    '..........KKKKKKKKKWWWWWWWWWKTKOTTK...',
    '........KKWWWWWWWWWWWWWWWWWWKTTKTTKK..',
    '.......KWWWWWWWWWWWWWWWWWWWWKTTTTnNNK.',
    '......KWWWWWWWWWWWWWWWWWWWWWWKTTnNNNNK',
    '...K.KWWWWWWWWWWWWWWWWWWWWWWWKTnnnNNK.',
    '..KTKWWWWWWWWWWWWWWWWWWWWWWWWKBnnnnnK.',
    '...KWWWWWWWWWWWWWWWWWWWWWWWWWKBnFKKKK.',
    '...KGWWWWWWWWWWWWWWWWWWWWWWWGKnnnnnK..',
    '...KGGWWWWWWWWWWWWWWWWWWWWWGGKnNnnK...',
    '...KGGGWWWWWWWWWWWWWWWWWWWWGGGGKKKK...',
    '...KgGGGGWWWWWWWWWWWWWWWWGGGGGgK......',
  ],
  38,
);

const LEGS0: Art = [
  '....KgKGGGGGKGGGGGGGGGKGGGGGgK........',
  '.....KK.KKGKK.KKGGGKKK.KKGKK..........',
  '.......KTTK..KTTK..KTTK..KTTK.........',
  '.......KTBK..KTBK..KTBK..KTBK.........',
  '.......KKKK..KKKK..KKKK..KKKK.........',
];
const LEGS1: Art = [
  '....KgGGKGGGGGGKGGGGGGGGKGGGgK........',
  '.....KKK.KKGKK.KKGGKK.KKKGKK..........',
  '........KTTK..KTTK..KTTK.KTTK.........',
  '.......KTBK..KTBK..KTBK..KTBK.........',
  '.......KKKK..KKKK..KKKK..KKKK.........',
];

export const DOG_SIDE: Record<string, Art> = {
  walk0: [...DOG_SIDE_TOP, ...LEGS0],
  walk1: [...DOG_SIDE_TOP, ...LEGS1],
};

/** Head bob for sniffing: the face (cols >= 28) drops by `dy` rows. */
function headDown(art: Art, dy: number): Art {
  const h = art.length;
  return art.map((row, y) =>
    [...row]
      .map((c, x) => {
        if (x < 29) return c;
        const sy = y - dy;
        if (sy < 0) return '.';
        return art[sy][x];
      })
      .join(''),
  ).slice(0, h);
}

export const DOG_SNIFF: Record<string, Art> = {
  sniff0: headDown([...DOG_SIDE_TOP, ...LEGS0], 2),
  sniff1: headDown([...DOG_SIDE_TOP, ...LEGS1], 3),
};

const recolor = (art: Art, rows: [number, number], fromCol: number, map: Record<string, string>): Art =>
  art.map((r, y) =>
    y < rows[0] || y > rows[1] ? r : [...r].map((c, x) => (x >= fromCol && map[c] ? map[c] : c)).join(''),
  );

// Leaping into the grass.
export const DOG_JUMP: Record<string, Art> = {
  jump: recolor(
    [
      '...........................KKKKK......',
      '.........................KKWWWWWK.....',
      '........................KWWWWWWWWK....',
      '.......................KWWWWWWKTTK....',
      '......................KWWWWWWKTOTK....',
      '.....................KWWWWWWWKTTTK....',
      '...................KKWWWWWWWWKTTTKKK..',
      '.................KKWWWWWWWWWWWKTTnNK..',
      '...............KKWWWWWWWWWWWWWKTnNNK..',
      '.............KKWWWWWWWWWWWWWWWKnnnMKK.',
      '...........KKWWWWWWWWWWWWWWWWGKnnKFK..',
      '.........KKWWWWWWWWWWWWWWWWGGKKKKKK...',
      '.......KKWWWWWWWWWWWWWWWGGGGGKKTTK....',
      '..K..KKWWWWWWWWWWWWWWGGGGGgKKTTBK.....',
      '.KTKKWWWWWWWWWWWWGGGGGGGgKK.KKKK......',
      '..KWWWWWWWWWGGGGGGGGgKKKK.............',
      '..KGGWWGGGGGGGgKKKKK..................',
      '..KgGGGGgKKKKK........................',
      '.KTTKKKKKTTK..........................',
      '.KTBK...KTBK..........................',
      '.KKKK...KKKK..........................',
    ],
    [99, 99],
    0,
    {},
  ),
  // Rear view diving down behind the grass.
  dive: [
    '.........KKKKKKKKKK.........',
    '.......KKTTBK..KBTTKK.......',
    '......KTTBK......KBTTK......',
    '......KKKK........KKKK......',
    '.....KKWWWWWWWWWWWWWWKK.....',
    '....KWWWWWWWWWWWWWWWWWWK....',
    '...KWWWWWWWWWKKWWWWWWWWWK...',
    '...KWWWWWWWWKTTKWWWWWWWWK...',
    '..KWWWWWWWWWWKKWWWWWWWWWWK..',
    '..KWWWWWWWWWWWWWWWWWWWWWWK..',
    '..KGWWWWWWWWWWWWWWWWWWWWGK..',
    '..KGGWWWWWWWWWWWWWWWWWWGGK..',
    '..KgGGWWWWWWWWWWWWWWWWGGgK..',
    '...KgGGGWWWWWWWWWWWWGGGgK...',
    '....KKgGGGGGGGGGGGGGGgKK....',
    '......KKKKKKKKKKKKKKKK......',
  ],
};

// ---- front view: a ghost-sheet hood with an oval face opening ------------
const FW = 32;
const FH = 56; // the sheet runs well below the grass line
const EAR_L: Art = ['.KKKK.', 'KpPPPK', 'KpPPPK', '.KpPK.', '..KK..'];
const EAR_R: Art = ['.KKKK.', 'KTTTTK', 'KRRTBK', '.KRBK.', '..KK..'];

// 20x18 face blocks, placed at (6, 6). Only the oval opening shows.
const EYES_OPEN = [
  'TTTTTTTTTTTTTTTTTTTT',
  'TTTTPPPTTTTTTTTTTTTT',
  'TTTPPPPPTTTBTTTTTTTT',
  'TTPPPPPPPTTTTTTTBTTT',
  'TTPPPPPPPTTTTTTTTTTT',
  'TTPPOIOPPTTTTTOIOTTT',
  'TTPPOOOPPTTTTTOOOTTT',
  'TTTpPPPPBTBBTBTTTTTT',
];
const EYES_SHUT = [
  'TTTTTTTTTTTTTTTTTTTT',
  'TTTTPPPTTTTTTTTTTTTT',
  'TTTPPPPPTTTBTTTTTTTT',
  'TTPPPPPPPTTTTTTTBTTT',
  'TTPPPPPPPTTTTTTTTTTT',
  'TTPPKKKPPTTTTTKKKTTT',
  'TTPKPPPKPTTTTKTTTKTT',
  'TTTpPPPPBTBBTBTTTTTT',
];
const NOSE = ['TTTTTTKKNNNNKKTTTTTT', 'TTTTTKNNNNNNNNKTTTTT', 'TTTTTTKNNnnNNKTTTTTT'];
const MOUTH_SHUT = [
  'TTTnTTTTTKKTTTTTnTTT',
  'TTnNNNFKKKKKKKKNNnTT',
  'TnNNNKFFKFFKFFKKNNnT',
  'TnNNNKRRRRRRRRRKNNnT',
  'nNNNNNKRRRRRRRKNNNNn',
  'nNNNNNNKKKKKKKNNNNNn',
  'TnNNNNKTTTTTTKNNNNnT',
];
const MOUTH_GRIN = [
  'TTTnTTTTTKKTTTTTnTTT',
  'TTnNNNFKKKKKKKKNNnTT',
  'TnNNNKFFKFFKFFKKNNnT',
  'TnNNNKRRKLLLLKRKNNnT',
  'nNNNNNKRKLLLLKKNNNNn',
  'nNNNNNNKKLLLLKNNNNNn',
  'TnNNNNKTTKKKKTNNNNnT',
];
const MOUTH_LAUGH0 = [
  'TTTnTTKKKKKKKKTTnTTT',
  'TTnNNKMMMMMMMMKNNnTT',
  'TnNNKMMLLLLLLMMKNNnT',
  'TnNNKMLLLLLLLLMKNNnT',
  'nNNNKFFKFFKFFKFKNNNn',
  'nNNNNKRRRRRRRRKNNNNn',
  'TnNNNNKKKKKKKKNNNNnT',
];
const MOUTH_LAUGH1 = [
  'TTTnTTTTTKKTTTTTnTTT',
  'TTnNNNKKKKKKKKKNNnTT',
  'TnNNNKMMLLLLMMKNNNnT',
  'TnNNKMMLLLLLLMMKNNnT',
  'nNNNKFFKFFKFFKFKNNNn',
  'nNNNNKRRRRRRRRKNNNNn',
  'TnNNNNKKKKKKKKNNNNnT',
];

function frontFrame(face: Art): Art {
  const g: string[][] = Array.from({ length: FH }, () => new Array(FW).fill('.'));
  const cx = 15.5;
  const inGhost = (x: number, y: number) => {
    const dx = x + 0.5 - cx;
    if (y < 13) return dx * dx + (y + 0.5 - 13) ** 2 <= 13.4 * 13.4;
    return Math.abs(dx) <= Math.min(15.4, 13.4 + (y - 13) * 0.12);
  };
  const inFace = (x: number, y: number) => ((x + 0.5 - cx) / 9.2) ** 2 + ((y + 0.5 - 14.8) / 8.6) ** 2 <= 1;
  for (let y = 0; y < FH; y++)
    for (let x = 0; x < FW; x++) {
      if (!inGhost(x, y)) continue;
      if (inFace(x, y)) {
        g[y][x] = face[y - 6]?.[x - 6] ?? 'T';
        continue;
      }
      const ax = Math.abs(x + 0.5 - cx);
      // folds of the sheet + shadow cast under the face opening
      let c = 'W';
      if (ax > 11.5) c = 'G';
      if (ax > 12.6 && y > 16) c = 'g';
      if (y > 22 && ax < 9 && inFace(x, y - 2)) c = 'G';
      if (y > 24 && (x === 9 || x === 22 || (y > 38 && (x === 5 || x === 26)))) c = 'G';
      g[y][x] = c;
    }
  // outlines: outside the ghost and around the face opening
  const out = g.map((r) => r.slice());
  for (let y = 0; y < FH; y++)
    for (let x = 0; x < FW; x++) {
      const n4 = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ];
      if (g[y][x] === '.' && n4.some(([a, b]) => g[b]?.[a] && g[b][a] !== '.')) out[y][x] = 'K';
      else if (g[y][x] !== '.' && !inFace(x, y) && n4.some(([a, b]) => b < FH && a >= 0 && a < FW && inFace(a, b) && inGhost(a, b)))
        out[y][x] = 'K';
    }
  const stamp = (art: Art, ox: number, oy: number) =>
    art.forEach((r, y) => [...r].forEach((c, x) => c !== '.' && (out[oy + y][ox + x] = c)));
  stamp(EAR_L, 1, 3);
  stamp(EAR_R, 25, 3);
  return out.map((r) => r.join(''));
}

export const DOG_FRONT: Record<string, Art> = {
  idle: frontFrame([...EYES_OPEN, ...NOSE, ...MOUTH_SHUT]),
  laugh0: frontFrame([...EYES_SHUT, ...NOSE, ...MOUTH_LAUGH0]),
  laugh1: frontFrame([...EYES_SHUT, ...NOSE, ...MOUTH_LAUGH1]),
  happy: frontFrame([...EYES_OPEN, ...NOSE, ...MOUTH_GRIN]),
};

// Sheet-covered arm with a paw, raised to hold a duck (right side).
export const DOG_ARM: Art = [
  '..KKKK..',
  '.KTTTTK.',
  '.KTBTBK.',
  '.KWWWWK.',
  'KWWWWWK.',
  'KWWWWWK.',
  'KWWWWWGK',
  'KWWWWWGK',
  '.KWWWGGK',
  '.KWWWGgK',
  '..KWGGgK',
  '..KWGGgK',
];

// --------------------------------------------------------------- PROPS --
export const PROP_PAL: Palette = {
  K: NES.black,
  O: NES.orange,
  o: NES.rust,
  r: NES.brick,
  Y: NES.gold,
  y: NES.yellow,
  G: NES.moss,
  S: '#5C5C74',
  s: '#3C3C50',
  L: '#8C8CA4',
  W: NES.white,
  w: NES.gray1,
  E: '#FF2020',
  B: '#100818',
  M: NES.mustard,
  C: NES.peach,
};

export const PUMPKIN: Record<string, Art> = {
  p16: [
    '.......KK.......',
    '......KGGK......',
    '...KKKKGKKKKK...',
    '..KOOOoKKoOOOK..',
    '.KOOOOoOOoOOOOK.',
    'KOOYYOoOOoOYYOOK',
    'KOOYYYoOOoYYYOOK',
    'KOOOOOoYYoOOOOOK',
    'KOoOOOOOOOOOOoOK',
    'KOoYOYOYYYYOYoOK',
    'KOoOYYYYYYYYYoOK',
    'KOOoOYOYYOYOoOOK',
    '.KOOooOOOOooOOK.',
    '..KKOOOooOOOKK..',
    '....KKKKKKKK....',
  ],
  p11: [
    '.....K.....',
    '....KGK....',
    '..KKKKKKK..',
    '.KOOOoOOOK.',
    'KOYYOoOYYOK',
    'KOOOOYOOOOK',
    'KoYOYYYOYoK',
    'KOOYOOOYOOK',
    '.KOOOoOOOK.',
    '..KKKKKKK..',
  ],
  p7: ['...K...', '.KKGKK.', 'KOOOOOK', 'KYOoOYK', 'KOYYYOK', '.KKKKK.'],
  p4: ['.KK.', 'KOOK', 'KYYK', '.KK.'],
};

export const BAT: Record<string, Art> = {
  bat0: [
    'K..........K',
    'KK...KK...KK',
    'KBK.KBBK.KBK',
    '.KBBBBBBBBK.',
    '..KKBEEBKK..',
    '....KBBK....',
    '.....KK.....',
  ],
  bat1: [
    '............',
    '.....KK.....',
    '....KBBK....',
    '..KKBEEBKK..',
    '.KBBBBBBBBK.',
    'KBKK.KK.KKBK',
    'KK........KK',
  ],
};

export const TOMBSTONE: Art = [
  '...KKKKKK...',
  '..KLSSSSSK..',
  '.KLSSSSSSsK.',
  '.KLSSsSSSsK.',
  '.KLSsssSSsK.',
  '.KLSSsSSSsK.',
  '.KLSSsSSSsK.',
  '.KLSSSSSSsK.',
  '.KSSSSSSSsK.',
  '.KSSSSSSssK.',
];

export const CROSS: Art = [
  '...KKK...',
  '...KLK...',
  'KKKKLKKKK',
  'KLLLLLLsK',
  'KKKKSKKKK',
  '...KSK...',
  '...KSK...',
  '...KsK...',
  '...KsK...',
];

export const CROSSHAIR: Art = [
  '....KKKKK....',
  '..KKWWWWWKK..',
  '.KWWK.W.KWWK.',
  '.KWK..W..KWK.',
  'KWK...W...KWK',
  'KWK.......KWK',
  'KWWWW.K.WWWWK',
  'KWK.......KWK',
  'KWK...W...KWK',
  '.KWK..W..KWK.',
  '.KWWK.W.KWWK.',
  '..KKWWWWWKK..',
  '....KKKKK....',
];

export const BANG: Art = [
  '....W....',
  '.W..W..W.',
  '..W.y.W..',
  '...yYy...',
  'WWyYWYyWW',
  '...yYy...',
  '..W.y.W..',
  '.W..W..W.',
  '....W....',
];

// Little soul that escapes a downed duck.
export const SOUL: Art = [
  '..WWW..',
  '.WWWWW.',
  'WWKWKWW',
  'WWWWWWW',
  'WWWKWWW',
  'WWWWWWW',
  '.WWWWWW',
  '..WW.WW',
  '...W..W',
];

// ------------------------------------------------------------------- UI --
export const UI_PAL: Palette = {
  W: NES.white,
  w: NES.gray1,
  R: NES.red,
  K: NES.black,
  B: NES.mustard,
  b: NES.olive,
  G: NES.lime,
  S: NES.lilac,
  O: NES.orange,
};

export const HUD_DUCK: Art = ['....WW.', '...WWWW', 'W..WW..', 'WWWWWW.', '.WWWWW.', '..WWW..'];

export const BULLET: Art = ['.W.', 'WWW', 'WwW', 'www', 'BBB', 'BbB', 'BBB'];

export const ICON_SOUND_ON: Art = [
  '....W....',
  '...WW..W.',
  'WWWWW...W',
  'WWWWW.W.W',
  'WWWWW.W.W',
  'WWWWW...W',
  '...WW..W.',
  '....W....',
];

export const ICON_SOUND_OFF: Art = [
  '....W....',
  '...WW....',
  'WWWWW.W.W',
  'WWWWW..W.',
  'WWWWW.W.W',
  'WWWWW....',
  '...WW....',
  '....W....',
];

export const ICON_FULL: Art = [
  'WWW...WWW',
  'W.......W',
  'W.......W',
  '.........',
  '.........',
  'W.......W',
  'W.......W',
  'WWW...WWW',
];

export const ICON_PAUSE: Art = [
  'WWW..WWW',
  'WWW..WWW',
  'WWW..WWW',
  'WWW..WWW',
  'WWW..WWW',
  'WWW..WWW',
  'WWW..WWW',
  'WWW..WWW',
];

export const ARROW: Art = ['W....', 'WW...', 'WWW..', 'WWWW.', 'WWW..', 'WW...', 'W....'];

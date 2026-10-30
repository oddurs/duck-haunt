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
// An English bulldog wearing a ghost bedsheet.
// K outline  W sheet  G sheet shadow  T fawn fur  B fur shade  N nose
// O eye  I eye shine  F fang  P tongue  M mouth  E ear (inner pink)

export const DOG_PAL: Palette = {
  K: NES.black,
  W: NES.white,
  G: NES.gray1,
  g: '#9C9CB4',
  T: '#F0B070',
  B: '#C07028',
  N: '#2C1C1C',
  O: NES.black,
  I: NES.white,
  F: NES.white,
  P: NES.rose,
  M: '#5C0C0C',
  E: NES.rose,
};

// Side view, facing right. Shared head/sheet, legs differ per frame.
const DOG_SIDE_TOP: Art = [
  '.....................KTK..............',
  '.....................KTTKKKKKK........',
  '......................KKWWWWWWKK......',
  '.....................KWWWWWWWWWWK.....',
  '....................KWWWWWWWWWWWWK....',
  '...................KWWWWWWWWKKKWWWK...',
  '...................KWWWWWWWKOIOKWWK...',
  '..........KKKKKKKKKWWWWWWWWKOOOKWWK...',
  '........KKWWWWWWWWWWWWWWWWWWKKKWWWKKK.',
  '.......KWWWWWWWWWWWWWWWWWWWWWWWWWKTNNK',
  '......KWWWWWWWWWWWWWWWWWWWWWWWWWKTTNNK',
  '...K.KWWWWWWWWWWWWWWWWWWWWWWWWWKTBTTTK',
  '..KTKWWWWWWWWWWWWWWWWWWWWWWWWWWKTTTBTK',
  '...KWWWWWWWWWWWWWWWWWWWWWWWWWWKTTKKFKK',
  '...KGWWWWWWWWWWWWWWWWWWWWWWWWGKBTTTTK.',
  '...KGGWWWWWWWWWWWWWWWWWWWWWWGGKBBBBK..',
  '...KGGGWWWWWWWWWWWWWWWWWWWWGGGGKKKK...',
  '...KgGGGGWWWWWWWWWWWWWWWWGGGGGgK......',
];

export const DOG_SIDE: Record<string, Art> = {
  walk0: [
    ...DOG_SIDE_TOP,
    '....KgKGGGGGKGGGGGGGGGKGGGGGgK........',
    '.....KK.KKGKK.KKGGGKKK.KKGKK..........',
    '.......KTTK..KTTK..KTTK..KTTK.........',
    '.......KTBK..KTBK..KTBK..KTBK.........',
    '.......KKKK..KKKK..KKKK..KKKK.........',
  ],
  walk1: [
    ...DOG_SIDE_TOP,
    '....KgGGKGGGGGGKGGGGGGGGKGGGgK........',
    '.....KKK.KKGKK.KKGGKK.KKKGKK..........',
    '........KTTK..KTTK..KTTK.KTTK.........',
    '.......KTBK..KTBK..KTBK..KTBK.........',
    '.......KKKK..KKKK..KKKK..KKKK.........',
  ],
};

const sniff = (twitch: boolean): Art => [
  '......................................',
  '......................................',
  '......................................',
  '......................................',
  '......................................',
  '..........KKKKKKKKKKKKKK..............',
  '........KKWWWWWWWWWWWWWWKK..KTK.......',
  '.......KWWWWWWWWWWWWWWWWWWKKTTKK......',
  '......KWWWWWWWWWWWWWWWWWWWWWKKWWWK....',
  '.....KWWWWWWWWWWWWWWWWWWWWWWWWWWWWK...',
  '...K.KWWWWWWWWWWWWWWWWWWWWWWWKKKWWK...',
  '..KTKWWWWWWWWWWWWWWWWWWWWWWWKOIOKWWK..',
  '...KWWWWWWWWWWWWWWWWWWWWWWWWKOOOKWWK..',
  '...KGWWWWWWWWWWWWWWWWWWWWWWWWKKKWWWKKK',
  twitch ? '...KGGWWWWWWWWWWWWWWWWWWWWWWWWWWWKTNNK' : '...KGGWWWWWWWWWWWWWWWWWWWWWWWWWWWKTTNK',
  twitch ? '...KGGGWWWWWWWWWWWWWWWWWWWWWWWWWKTTTTK' : '...KGGGWWWWWWWWWWWWWWWWWWWWWWWWWKTTTNK',
  '...KgGGGGWWWWWWWWWWWWWWWGGGGGGGKTBTTTK',
  twitch ? '....KgGGKGGGGGGKGGGGGGGGKGGGgKKTTKFKK.' : '....KgKGGGGGKGGGGGGGGGKGGGGGgKKTTKFKK.',
  twitch ? '.....KKK.KKGKK.KKGGKK.KKKGKK..KKKKK...' : '.....KK.KKGKK.KKGGGKKK.KKGKK..KKKKK...',
  '.......KTTK..KTTK..KTTK..KTTK.........',
  '.......KTBK..KTBK..KTBK..KTBK.........',
  '.......KKKK..KKKK..KKKK..KKKK.........',
];

// Nose to the ground.
export const DOG_SNIFF: Record<string, Art> = {
  sniff0: sniff(false),
  sniff1: sniff(true),
};

// Leaping into the grass.
export const DOG_JUMP: Record<string, Art> = {
  jump: [
    '...........................KKKKK......',
    '.........................KKWWWWWK.....',
    '........................KWWWWWWWWK....',
    '.......................KWWWWKKKWWK....',
    '......................KWWWWKOIOKWK....',
    '.....................KWWWWWKOOOKWK....',
    '...................KKWWWWWWWKKKWWKKK..',
    '.................KKWWWWWWWWWWWWWKTTKK.',
    '...............KKWWWWWWWWWWWWWWKTTTNK.',
    '.............KKWWWWWWWWWWWWWWWKTBTMKK.',
    '...........KKWWWWWWWWWWWWWWWWGKTTKFK..',
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

// Front view, rising out of the grass. Ears poke through holes in the sheet.
const DOG_FRONT_HEAD_TOP: Art = [
  '...........KKKKKKKKKK...........',
  '.........KKWWWWWWWWWWKK.........',
  '.......KKWWWWWWWWWWWWWWKK.......',
  '....KK.KWWWWWWWWWWWWWWWWK.KK....',
  '...KTEKWWWWWWWWWWWWWWWWWWKETK...',
  '...KTTKWWWWWWWWWWWWWWWWWWKTTK...',
  '....KKWWWWWWWWWWWWWWWWWWWWKK....',
];

const DOG_FRONT_BODY: Art = [
  '..KWWWWWWWWWWWWWWWWWWWWWWWWWWK..',
  '.KWWWWWWWWWWWWWWWWWWWWWWWWWWWWK.',
  '.KGWWWWWWWWWWWWWWWWWWWWWWWWWWGK.',
  'KGGWWWWWWWWWWWWWWWWWWWWWWWWWWGGK',
  'KGGGWWWWWWWWWWWWWWWWWWWWWWWWGGGK',
  'KgGGWWWWWWWWWWWWWWWWWWWWWWWWGGgK',
  'KgGGGWWWWWWWWWWWWWWWWWWWWWWGGGgK',
  'KgGGGWWWWWWWWWWWWWWWWWWWWWWGGGgK',
  'KgGGGGWWWWWWWWWWWWWWWWWWWWGGGGgK',
];

export const DOG_FRONT: Record<string, Art> = {
  idle: [
    ...DOG_FRONT_HEAD_TOP,
    '....KWWWWKKKKWWWWWWKKKKWWWWK....',
    '...KWWWWKOIOOKWWWWKOIOOKWWWWK...',
    '...KWWWWKOOOOKWWWWKOOOOKWWWWK...',
    '...KWWWWWKKKKWWWWWWKKKKWWWWWK...',
    '...KWWWWKTTTTTTTTTTTTTTKWWWWK...',
    '..KWWWWKTTBTTTKKKKTTTBTTKWWWWK..',
    '..KWWWKTTTTTTKNNNNKTTTTTTKWWWK..',
    '..KWWWKTTBTTTTKNNKTTTTBTTKWWWK..',
    '..KWWWKTTTTTTTTKKTTTTTTTTKWWWK..',
    '..KWWWKTTKKKKKKKKKKKKKKTTKWWWK..',
    '..KWWWKTKFKTTTTTTTTTTKFKTKWWWK..',
    '..KWWWWKTTTTTTTTTTTTTTTTKWWWWK..',
    '..KWWWWWKKTTTTTTTTTTTTKKWWWWWK..',
    '..KWWWWWWWKKKKKKKKKKKKWWWWWWWK..',
    ...DOG_FRONT_BODY,
  ],
  laugh0: [
    ...DOG_FRONT_HEAD_TOP,
    '....KWWWWWWWWWWWWWWWWWWWWWWK....',
    '...KWWWWWKKKWWWWWWWWKKKWWWWWK...',
    '...KWWWWKOWWOKWWWWKOWWOKWWWWK...',
    '...KWWWWWWWWWWWWWWWWWWWWWWWWK...',
    '...KWWWWKTTTTTTTTTTTTTTKWWWWK...',
    '..KWWWWKTTBTTTKKKKTTTBTTKWWWWK..',
    '..KWWWKTTTTTTKNNNNKTTTTTTKWWWK..',
    '..KWWWKTTKKKKKKNNKKKKKKTTKWWWK..',
    '..KWWWKTKMMMMMMKKMMMMMMKTKWWWK..',
    '..KWWWKTKMMMMMMMMMMMMMMKTKWWWK..',
    '..KWWWKTKMMMPPPPPPPPMMMKTKWWWK..',
    '..KWWWKTKFMPPPPPPPPPPMFKTKWWWK..',
    '..KWWWWKTKFKKKKKKKKKKFKTKWWWWK..',
    '..KWWWWWKKTTTTTTTTTTTTKKWWWWWK..',
    ...DOG_FRONT_BODY,
  ],
  laugh1: [
    ...DOG_FRONT_HEAD_TOP,
    '....KWWWWWWWWWWWWWWWWWWWWWWK....',
    '...KWWWWWKKKWWWWWWWWKKKWWWWWK...',
    '...KWWWWKOWWOKWWWWKOWWOKWWWWK...',
    '...KWWWWWWWWWWWWWWWWWWWWWWWWK...',
    '...KWWWWKTTTTTTTTTTTTTTKWWWWK...',
    '..KWWWWKTTBTTTKKKKTTTBTTKWWWWK..',
    '..KWWWKTTTTTTKNNNNKTTTTTTKWWWK..',
    '..KWWWKTTTTTTTKNNKTTTTTTTKWWWK..',
    '..KWWWKTTKKKKKKKKKKKKKKTTKWWWK..',
    '..KWWWKTKMMMMMMMMMMMMMMKTKWWWK..',
    '..KWWWKTKFMMPPPPPPPPMMFKTKWWWK..',
    '..KWWWWKTKFKKKKKKKKKKFKTKWWWWK..',
    '..KWWWWWKKTTTTTTTTTTTTKKWWWWWK..',
    '..KWWWWWWWKKKKKKKKKKKKWWWWWWWK..',
    ...DOG_FRONT_BODY,
  ],
  happy: [
    ...DOG_FRONT_HEAD_TOP,
    '....KWWWWKKKKWWWWWWKKKKWWWWK....',
    '...KWWWWKOIOOKWWWWKOIOOKWWWWK...',
    '...KWWWWKOOOOKWWWWKOOOOKWWWWK...',
    '...KWWWWWKKKKWWWWWWKKKKWWWWWK...',
    '...KWWWWKTTTTTTTTTTTTTTKWWWWK...',
    '..KWWWWKTTBTTTKKKKTTTBTTKWWWWK..',
    '..KWWWKTTTTTTKNNNNKTTTTTTKWWWK..',
    '..KWWWKTTBTTTTKNNKTTTTBTTKWWWK..',
    '..KWWWKTTKTTTTTKKTTTTTKTTKWWWK..',
    '..KWWWKTTTKKKKKKKKKKKKTTTKWWWK..',
    '..KWWWKTKFKMMPPPPMMKKFKTTKWWWK..',
    '..KWWWWKTKKKMPPPPMKKKKTTKWWWWK..',
    '..KWWWWWKKTTKKKKKKTTTTKKWWWWWK..',
    '..KWWWWWWWKKKKKKKKKKKKWWWWWWWK..',
    ...DOG_FRONT_BODY,
  ],
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

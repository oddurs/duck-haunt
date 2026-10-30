// Persistent settings + top scores (localStorage, failure tolerant).
export type Mode = 'A' | 'B' | 'C';

interface Saved {
  top: Record<Mode, number>;
  muted: boolean;
  music: boolean;
}

const KEY = 'duck-haunt-v1';

function load(): Saved {
  const def: Saved = { top: { A: 12000, B: 12000, C: 12000 }, muted: false, music: true };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return def;
    const s = JSON.parse(raw) as Partial<Saved>;
    return { ...def, ...s, top: { ...def.top, ...(s.top ?? {}) } };
  } catch {
    return def;
  }
}

export const save: Saved = load();

export function persist(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    /* private mode etc. */
  }
}

export const reducedMotion =
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

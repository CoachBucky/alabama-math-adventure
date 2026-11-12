import type { Rng } from "./types";

export const randInt = (rng: Rng, min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;

export const pick = <T,>(rng: Rng, items: readonly T[]): T => items[Math.floor(rng() * items.length)];

export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Deterministic generator for tests. */
export function seeded(seed: number): Rng {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

/** Correct answer plus up to 3 unique distractors, shuffled. */
export function withChoices(rng: Rng, answer: string, distractors: string[], count = 4): string[] {
  const unique: string[] = [];
  for (const d of distractors) {
    if (d !== answer && !unique.includes(d) && unique.length < count - 1) unique.push(d);
  }
  return shuffle(rng, [answer, ...unique]);
}

/** Nearby, believable wrong numbers for a numeric answer. */
export function numberDistractors(rng: Rng, answer: number, extra: number[] = []): string[] {
  const offsets = shuffle(rng, [1, -1, 2, -2, 10, -10, 3, -3]);
  const raw = [...extra, ...offsets.map((o) => answer + o)];
  return raw.filter((n) => n >= 0 && n !== answer && Number.isInteger(n)).map(String);
}

export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
export const frac = (n: number, d: number) => `${n}/${d}`;
export const mixed = (w: number, n: number, d: number) => (n === 0 ? `${w}` : w === 0 ? frac(n, d) : `${w} ${n}/${d}`);

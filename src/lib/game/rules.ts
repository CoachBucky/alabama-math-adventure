import type { Level } from "./types";

export const QUESTIONS_PER_LEVEL = 8;
export const COINS_PER_CORRECT = 10;
export const STREAK_BONUS = 5;
export const STREAK_BONUS_AT = 3;

export type Stars = 0 | 1 | 2 | 3;

/** Stars for a finished level: 85%+ = 3, 75%+ = 2, 60%+ = 1, below 60% = try again. With 8 questions: 7-8, 6, 5. */
export function starsFor(correct: number, total: number): Stars {
  if (total <= 0) return 0;
  const pct = correct / total;
  if (pct >= 0.85) return 3;
  if (pct >= 0.75) return 2;
  if (pct >= 0.6) return 1;
  return 0;
}

/** Coins for a correct first-try answer; streaks of 3+ earn a bonus. */
export function coinsForAnswer(firstTry: boolean, streak: number): number {
  if (!firstTry) return 0;
  return COINS_PER_CORRECT + (streak >= STREAK_BONUS_AT ? STREAK_BONUS : 0);
}

/** Level 1 of every world is always open; later levels open after earning at least 1 star on the level before. */
export function isLevelUnlocked(
  level: Pick<Level, "n" | "worldId">,
  starsByLevel: Record<string, { stars: number } | undefined>,
): boolean {
  if (level.n === 1) return true;
  const prev = starsByLevel[`${level.worldId}-${level.n - 1}`];
  return (prev?.stars ?? 0) >= 1;
}

export type Mastery = "not-started" | "learning" | "growing" | "mastered";

/** Skill mastery from first-try accuracy. Needs at least 8 answers before it can show "mastered". */
export function masteryFor(correct: number, total: number): Mastery {
  if (total === 0) return "not-started";
  const pct = correct / total;
  if (total >= 8 && pct >= 0.85) return "mastered";
  if (pct >= 0.6) return "growing";
  return "learning";
}

/** Normalizes typed and chosen answers so "07", " 7 " and "7.0" all match "7". */
export function normalizeAnswer(value: string): string {
  const v = value.trim().replace(/\s+/g, " ");
  if (/^-?\d*\.?\d+$/.test(v)) return String(Number(v));
  return v;
}

export const isCorrect = (given: string, answer: string) =>
  normalizeAnswer(given) === normalizeAnswer(answer);

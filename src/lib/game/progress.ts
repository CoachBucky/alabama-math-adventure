import { useSyncExternalStore } from "react";
import type { Grade } from "./types";
import type { Stars } from "./rules";

export interface LevelRecord {
  stars: Stars;
  bestCorrect: number;
  plays: number;
}

export interface Profile {
  name: string;
  grade: Grade | null;
  coins: number;
  levels: Record<string, LevelRecord>;
  /** First-try accuracy per world (skill area). */
  skills: Record<string, { correct: number; total: number }>;
  settings: { sound: boolean; autoRead: boolean };
}

const KEY = "mathquest-al-profile-v1";

export const DEFAULT_PROFILE: Profile = {
  name: "",
  grade: null,
  coins: 0,
  levels: {},
  skills: {},
  settings: { sound: true, autoRead: false },
};

let current: Profile | null = null;
const listeners = new Set<() => void>();

function load(): Profile {
  if (current) return current;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Profile>) : {};
    current = {
      ...DEFAULT_PROFILE,
      ...parsed,
      settings: { ...DEFAULT_PROFILE.settings, ...(parsed.settings ?? {}) },
    };
  } catch {
    current = DEFAULT_PROFILE;
  }
  return current;
}

function save(next: Profile) {
  current = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full or blocked: keep in memory */
  }
  listeners.forEach((l) => l());
}

export function updateProfile(fn: (p: Profile) => Profile) {
  save(fn(load()));
}

export function recordLevel(
  levelId: string,
  worldId: string,
  result: { correct: number; total: number; stars: Stars; coins: number },
) {
  updateProfile((p) => {
    const prev = p.levels[levelId];
    const skill = p.skills[worldId] ?? { correct: 0, total: 0 };
    return {
      ...p,
      coins: p.coins + result.coins,
      levels: {
        ...p.levels,
        [levelId]: {
          stars: Math.max(prev?.stars ?? 0, result.stars) as Stars,
          bestCorrect: Math.max(prev?.bestCorrect ?? 0, result.correct),
          plays: (prev?.plays ?? 0) + 1,
        },
      },
      skills: {
        ...p.skills,
        [worldId]: { correct: skill.correct + result.correct, total: skill.total + result.total },
      },
    };
  });
}

export function resetProgress() {
  updateProfile((p) => ({ ...DEFAULT_PROFILE, name: p.name, grade: p.grade, settings: p.settings }));
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      current = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

/** The explorer's saved progress on this device. Server render uses the empty default. */
export function useProfile(): Profile {
  return useSyncExternalStore(subscribe, load, () => DEFAULT_PROFILE);
}

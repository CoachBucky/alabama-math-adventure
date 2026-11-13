import { describe, expect, it } from "vitest";
import { WORLDS, findLevel } from "@/lib/game/curriculum";
import { generateLevel, generateQuestion } from "@/lib/game/generators";
import { seeded } from "@/lib/game/random";
import { coinsForAnswer, isCorrect, isLevelUnlocked, masteryFor, starsFor } from "@/lib/game/rules";
import { toSpoken } from "@/lib/game/speech";

describe("stars", () => {
  it("gives 3 stars for 7 or 8 of 8", () => {
    expect(starsFor(8, 8)).toBe(3);
    expect(starsFor(7, 8)).toBe(3);
  });
  it("gives 2 stars for 6 of 8", () => expect(starsFor(6, 8)).toBe(2));
  it("gives 1 star for 5 of 8", () => expect(starsFor(5, 8)).toBe(1));
  it("gives 0 stars for 4 of 8", () => expect(starsFor(4, 8)).toBe(0));
});

describe("unlocking", () => {
  const level2 = findLevel("g3-mult-2")!.level;
  it("always opens level 1", () => expect(isLevelUnlocked(findLevel("g4-dec-1")!.level, {})).toBe(true));
  it("keeps level 2 locked until level 1 has a star", () => {
    expect(isLevelUnlocked(level2, {})).toBe(false);
    expect(isLevelUnlocked(level2, { "g3-mult-1": { stars: 0 } })).toBe(false);
    expect(isLevelUnlocked(level2, { "g3-mult-1": { stars: 1 } })).toBe(true);
  });
});

describe("coins", () => {
  it("gives 10 coins for a first-try answer", () => expect(coinsForAnswer(true, 1)).toBe(10));
  it("adds a 5 coin bonus on a streak of 3", () => expect(coinsForAnswer(true, 3)).toBe(15));
  it("gives no coins on a second try", () => expect(coinsForAnswer(false, 0)).toBe(0));
});

describe("mastery", () => {
  it("needs 8 answers at 85% to be mastered", () => {
    expect(masteryFor(4, 4)).toBe("growing");
    expect(masteryFor(7, 8)).toBe("mastered");
    expect(masteryFor(2, 8)).toBe("learning");
  });
});

describe("answers", () => {
  it("accepts equivalent typed numbers", () => {
    expect(isCorrect("07", "7")).toBe(true);
    expect(isCorrect(".5", "0.5")).toBe(true);
    expect(isCorrect("8", "7")).toBe(false);
  });
});

describe("question makers", () => {
  it("every level produces valid questions with the answer among the choices", () => {
    for (const world of WORLDS) {
      for (const level of world.levels) {
        const rng = seeded(world.id.length * 97 + level.n);
        for (let i = 0; i < 300; i++) {
          const q = generateQuestion(world.id, level.n, rng);
          const blob = JSON.stringify(q);
          expect(blob, `${level.id}: ${q.prompt}`).not.toMatch(/NaN|undefined|Infinity|\/0\b|-\d/);
          if (q.choices) {
            expect(q.choices, `${level.id}: ${q.prompt}`).toContain(q.answer);
            expect(new Set(q.choices).size).toBe(q.choices.length);
            expect(q.choices.length).toBeGreaterThanOrEqual(2);
          } else {
            expect(q.answer, `${level.id}: ${q.prompt}`).toMatch(/^\d+(\.\d+)?$/);
          }
        }
      }
    }
  });

  it("computes basic facts correctly", () => {
    const rng = seeded(42);
    for (let i = 0; i < 300; i++) {
      for (const id of ["g3-mult", "g4-mult", "g3-div", "g4-div"]) {
        const q = generateQuestion(id, 1, rng);
        const m = q.prompt.match(/^([\d,]+) ([×÷]) ([\d,]+) = □$/);
        if (!m) continue;
        const a = Number(m[1]!.replace(/,/g, ""));
        const b = Number(m[3]!.replace(/,/g, ""));
        expect(Number(q.answer)).toBe(m[2] === "×" ? a * b : a / b);
      }
    }
  });

  it("builds a full level of 8", () => {
    expect(generateLevel("g4-ops", 3, 8, seeded(7))).toHaveLength(8);
  });
});

describe("read aloud", () => {
  it("speaks fractions and symbols as words", () => {
    expect(toSpoken("3/4 + 1/4 = □")).toBe("3 fourths plus 1 fourth equals blank");
    expect(toSpoken("2 1/3")).toBe("2 and 1 third");
    expect(toSpoken("47 ÷ 5 = 9 R2")).toBe("47 divided by 5 equals 9 remainder 2");
  });
});

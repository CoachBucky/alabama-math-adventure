import type { Grade, Level, LevelNumber, World } from "./types";

type WorldDef = Omit<World, "levels"> & { levelTitles: [string, string, string]; levelFocus: [string, string, string] };

const defs: WorldDef[] = [
  // ---------- Grade 3 · Sunny Isle ----------
  {
    id: "g3-mult",
    grade: 3,
    name: "Multiplication Meadow",
    tagline: "Equal groups, arrays & times tables",
    domain: "Operations & Algebraic Thinking",
    skills: [
      "Understand multiplication as equal groups and arrays",
      "Multiply fluently within 100",
      "Find the unknown number in a multiplication equation",
      "Multiply one-digit numbers by multiples of 10",
    ],
    tone: "coral",
    icon: "✖️",
    pos: { x: 50, y: 52 },
    levelTitles: ["Equal Groups", "Times Tables", "Meadow Master"],
    levelFocus: ["Groups, arrays, ×2 ×5 ×10", "Facts with 3, 4, 6 & unknowns", "All facts, ×10s & word problems"],
  },
  {
    id: "g3-div",
    grade: 3,
    name: "Division Desert",
    tagline: "Sharing equally & related facts",
    domain: "Operations & Algebraic Thinking",
    skills: [
      "Understand division as sharing equally or making groups",
      "Use multiplication facts to divide",
      "Divide fluently within 100",
      "Solve division word problems",
    ],
    tone: "sunny",
    icon: "➗",
    pos: { x: 21, y: 68 },
    levelTitles: ["Fair Shares", "Fact Families", "Desert Master"],
    levelFocus: ["Sharing with ÷2 ÷5 ÷10", "Use × facts to divide", "Unknowns & word problems"],
  },
  {
    id: "g3-frac",
    grade: 3,
    name: "Fraction Forest",
    tagline: "Unit fractions & fractions as numbers",
    domain: "Number & Operations — Fractions",
    skills: [
      "Understand a unit fraction 1/b as one equal part of a whole",
      "Name fractions of shapes like 3/4",
      "Place fractions on a number line",
      "Write whole numbers as fractions",
    ],
    tone: "teal",
    icon: "🍕",
    pos: { x: 25, y: 24 },
    levelTitles: ["Unit Fractions", "Parts of a Whole", "Number Line Trail"],
    levelFocus: ["Name 1/b", "Name a/b of shapes", "Number lines & wholes"],
  },
  {
    id: "g3-equiv",
    grade: 3,
    name: "Equivalence Falls",
    tagline: "Equal fractions & comparing",
    domain: "Number & Operations — Fractions",
    skills: [
      "Find equivalent fractions using models",
      "Compare fractions with the same denominator",
      "Compare fractions with the same numerator",
      "Recognize fractions equal to whole numbers",
    ],
    tone: "teal",
    icon: "💧",
    pos: { x: 83, y: 47 },
    levelTitles: ["Same Size", "Compare It", "Falls Master"],
    levelFocus: ["Equivalent fractions with models", "Compare same top or bottom", "Missing numbers & wholes"],
  },
  {
    id: "g3-area",
    grade: 3,
    name: "Area & Perimeter Peaks",
    tagline: "Square units, area & perimeter",
    domain: "Measurement & Data",
    skills: [
      "Find area by counting square units",
      "Find area by multiplying side lengths",
      "Find perimeter of polygons",
      "Find an unknown side length",
    ],
    tone: "coral",
    icon: "⛰️",
    pos: { x: 62, y: 20 },
    levelTitles: ["Square Units", "Multiply Sides", "Peak Master"],
    levelFocus: ["Count squares for area", "Area & perimeter of rectangles", "Unknown sides"],
  },
  // ---------- Grade 4 · Volcano Isle ----------
  {
    id: "g4-mult",
    grade: 4,
    name: "Multiplication Mountain",
    tagline: "Multi-digit multiplication",
    domain: "Number & Operations in Base Ten",
    skills: [
      "Multiply up to 4 digits by 1 digit",
      "Multiply two 2-digit numbers",
      "Multiply by 10, 100 and 1,000",
      "Solve multiplicative comparison problems (times as many)",
    ],
    tone: "coral",
    icon: "🏔️",
    pos: { x: 24, y: 22 },
    levelTitles: ["Base Camp", "The Climb", "Summit"],
    levelFocus: ["2-digit × 1-digit & ×10s", "3–4 digit × 1-digit, times as many", "2-digit × 2-digit"],
  },
  {
    id: "g4-div",
    grade: 4,
    name: "Division Canyon",
    tagline: "Multi-digit division & remainders",
    domain: "Number & Operations in Base Ten",
    skills: [
      "Divide up to 4 digits by 1 digit",
      "Find whole-number quotients with remainders",
      "Interpret remainders in word problems",
    ],
    tone: "sunny",
    icon: "🏜️",
    pos: { x: 24, y: 52 },
    levelTitles: ["Canyon Rim", "Remainder River", "Canyon Floor"],
    levelFocus: ["2–3 digit ÷ 1-digit", "Quotients with remainders", "4-digit ÷ & remainder stories"],
  },
  {
    id: "g4-equiv",
    grade: 4,
    name: "Fraction Fjord",
    tagline: "Equivalent fractions & comparing",
    domain: "Number & Operations — Fractions",
    skills: [
      "Generate equivalent fractions (a/b = n×a / n×b)",
      "Compare fractions using 1/2 as a benchmark",
      "Compare fractions with different denominators",
    ],
    tone: "teal",
    icon: "🌊",
    pos: { x: 50, y: 40 },
    levelTitles: ["Matching Waves", "Benchmark Bay", "Fjord Master"],
    levelFocus: ["Make equivalent fractions", "Simplify & compare to 1/2", "Compare unlike fractions"],
  },
  {
    id: "g4-ops",
    grade: 4,
    name: "Fraction Harbor",
    tagline: "Add, subtract & multiply fractions",
    domain: "Number & Operations — Fractions",
    skills: [
      "Add and subtract fractions with like denominators",
      "Decompose a fraction into a sum of fractions",
      "Add and subtract mixed numbers with like denominators",
      "Multiply a fraction by a whole number",
    ],
    tone: "coral",
    icon: "⚓",
    pos: { x: 62, y: 70 },
    levelTitles: ["Docking", "Set Sail", "Harbor Master"],
    levelFocus: ["Add like denominators", "Subtract & decompose", "Mixed numbers & whole × fraction"],
  },
  {
    id: "g4-dec",
    grade: 4,
    name: "Decimal Volcano",
    tagline: "Tenths, hundredths & decimals",
    domain: "Number & Operations — Fractions",
    skills: [
      "Write tenths and hundredths as decimals",
      "Add tenths and hundredths (3/10 = 30/100)",
      "Compare decimals to hundredths",
    ],
    tone: "sunny",
    icon: "🌋",
    pos: { x: 77, y: 24 },
    levelTitles: ["Warm Up", "Lava Lines", "Eruption"],
    levelFocus: ["Tenths & hundredths grids", "Fractions ↔ decimals, place value", "Compare decimals & money"],
  },
];

export const WORLDS: World[] = defs.map(({ levelTitles, levelFocus, ...w }) => ({
  ...w,
  levels: ([1, 2, 3] as LevelNumber[]).map(
    (n): Level => ({ id: `${w.id}-${n}`, worldId: w.id, n, title: levelTitles[n - 1]!, focus: levelFocus[n - 1]! }),
  ),
}));

export const GRADES: { grade: Grade; island: string; blurb: string }[] = [
  { grade: 3, island: "Sunny Isle", blurb: "Multiplication, division, fractions, area & perimeter" },
  { grade: 4, island: "Volcano Isle", blurb: "Big multiplication & division, fraction operations, decimals" },
];

export const worldsForGrade = (grade: Grade) => WORLDS.filter((w) => w.grade === grade);

export function findLevel(levelId: string): { world: World; level: Level } | null {
  for (const world of WORLDS) {
    const level = world.levels.find((l) => l.id === levelId);
    if (level) return { world, level };
  }
  return null;
}

export const parseGrade = (value: string): Grade | null => (value === "3" ? 3 : value === "4" ? 4 : null);

export type Grade = 3 | 4;
export type LevelNumber = 1 | 2 | 3;
export type Rng = () => number;

export type Visual =
  | { kind: "groups"; groups: number; each: number }
  | { kind: "array"; rows: number; cols: number }
  | { kind: "fractionBar"; parts: number; shaded: number }
  | { kind: "fractionCircle"; parts: number; shaded: number }
  | { kind: "fractionBars"; bars: { parts: number; shaded: number }[] }
  | { kind: "numberLine"; parts: number; mark: number; wholes?: number }
  | { kind: "areaGrid"; w: number; h: number }
  | { kind: "rect"; w: number; h: number; unit: string; labelH?: string }
  | { kind: "decimalGrid"; shaded: number };

export interface Question {
  /** Text shown to the student. Fractions like 3/4 and mixed numbers like 1 2/3 render stacked; □ renders as a blank box. */
  prompt: string;
  visual?: Visual;
  /** Correct answer, compared as a normalized string. */
  answer: string;
  /** Multiple-choice options. When absent, the student types a number on the keypad. */
  choices?: string[];
  /** Allows the decimal point on the keypad. */
  allowDecimal?: boolean;
  /** Unit shown after the typed answer (e.g. "square units"). */
  unit?: string;
  hint: string;
  explanation: string;
}

export interface Level {
  id: string;
  worldId: string;
  n: LevelNumber;
  title: string;
  focus: string;
}

export interface World {
  id: string;
  grade: Grade;
  name: string;
  tagline: string;
  /** Alabama Course of Study / ACAP reporting domain */
  domain: string;
  skills: string[];
  tone: "coral" | "teal" | "sunny";
  icon: string;
  /** Position on the map image, in percent. */
  pos: { x: number; y: number };
  levels: Level[];
}

import { frac, gcd, mixed, numberDistractors, pick, randInt, shuffle, withChoices } from "./random";
import type { LevelNumber, Question, Rng } from "./types";

type Gen = (rng: Rng, level: LevelNumber) => Question;

const NAMES = ["Ava", "Jalen", "Maya", "Leo", "Zoe", "Mateo", "Kiara", "Eli", "Nia", "Owen", "Sofia", "Caleb"];
const DEN_WORD: Record<number, [string, string]> = {
  2: ["half", "halves"],
  3: ["third", "thirds"],
  4: ["fourth", "fourths"],
  5: ["fifth", "fifths"],
  6: ["sixth", "sixths"],
  8: ["eighth", "eighths"],
  10: ["tenth", "tenths"],
  12: ["twelfth", "twelfths"],
  100: ["hundredth", "hundredths"],
};
const denWord = (d: number, plural = true) => DEN_WORD[d]?.[plural ? 1 : 0] ?? `${d}ths`;

// ======================= GRADE 3 =======================

const g3Mult: Gen = (rng, level) => {
  const type =
    level === 1
      ? pick(rng, ["groups", "array", "fact", "fact"] as const)
      : level === 2
        ? pick(rng, ["fact", "fact", "unknown", "word", "array"] as const)
        : pick(rng, ["fact", "commute", "tens", "word", "unknown"] as const);
  const factors = level === 1 ? [2, 5, 10] : level === 2 ? [3, 4, 6, 2, 5] : [6, 7, 8, 9, 4, 3];
  const a = pick(rng, factors);
  const b = randInt(rng, level === 1 ? 1 : 2, 10);
  const p = a * b;
  const name = pick(rng, NAMES);

  switch (type) {
    case "groups": {
      const g = randInt(rng, 2, 5);
      const e = randInt(rng, 2, 6);
      return {
        prompt: `There are ${g} groups with ${e} stars in each group. How many stars in all?`,
        visual: { kind: "groups", groups: g, each: e },
        answer: String(g * e),
        choices: withChoices(rng, String(g * e), numberDistractors(rng, g * e, [g + e, g * e + e, g * e - e])),
        hint: `${g} groups of ${e} means ${g} × ${e}. Skip count by ${e}s ${g} times.`,
        explanation: `${g} × ${e} = ${g * e}. ${g} equal groups of ${e} make ${g * e}.`,
      };
    }
    case "array": {
      const r = randInt(rng, 2, 6);
      const c = randInt(rng, 2, level === 1 ? 5 : 8);
      return {
        prompt: `How many dots are in this array?`,
        visual: { kind: "array", rows: r, cols: c },
        answer: String(r * c),
        choices: withChoices(rng, String(r * c), numberDistractors(rng, r * c, [r + c, r * c + r])),
        hint: `Count the rows, then how many in each row. ${r} rows of ${c}.`,
        explanation: `${r} rows × ${c} in each row = ${r * c} dots.`,
      };
    }
    case "unknown":
      return {
        prompt: `${a} × □ = ${p}`,
        answer: String(b),
        hint: `How many groups of ${a} make ${p}? Skip count by ${a}s until you reach ${p}.`,
        explanation: `${a} × ${b} = ${p}, so the missing number is ${b}.`,
      };
    case "commute":
      return {
        prompt: `Which has the same product as ${a} × ${b}?`,
        answer: `${b} × ${a}`,
        choices: withChoices(rng, `${b} × ${a}`, [`${a} + ${b}`, `${a} × ${b + 1}`, `${b} × ${b}`, `${a + 1} × ${b}`]),
        hint: `You can switch the order of factors and the product stays the same.`,
        explanation: `${a} × ${b} = ${b} × ${a} = ${p}. Order doesn't change the product.`,
      };
    case "tens": {
      const t = randInt(rng, 2, 9);
      const n = randInt(rng, 2, 9);
      return {
        prompt: `${n} × ${t * 10} = □`,
        answer: String(n * t * 10),
        hint: `Think ${n} × ${t} = ${n * t}. Then ${n} × ${t} tens = ${n * t} tens.`,
        explanation: `${n} × ${t} = ${n * t}, so ${n} × ${t * 10} = ${n * t * 10}.`,
      };
    }
    case "word": {
      const stories = [
        `At Gulf Shores, ${name} fills ${a} buckets with ${b} seashells in each. How many seashells does ${name} have?`,
        `${name} picks peaches and puts ${b} peaches in each of ${a} baskets. How many peaches in all?`,
        `${a} rockets at the Space & Rocket Center each have ${b} windows. How many windows in all?`,
        `${name} has ${a} strings of Mardi Gras beads with ${b} beads on each. How many beads in all?`,
      ];
      return {
        prompt: pick(rng, stories),
        answer: String(p),
        choices: withChoices(rng, String(p), numberDistractors(rng, p, [a + b, p + a, p - b])),
        hint: `There are ${a} equal groups of ${b}. Multiply.`,
        explanation: `${a} × ${b} = ${p}.`,
      };
    }
    default:
      return {
        prompt: `${a} × ${b} = □`,
        answer: String(p),
        hint: `Skip count by ${a}s, ${b} times.`,
        explanation: `${a} × ${b} = ${p}.`,
      };
  }
};

const g3Div: Gen = (rng, level) => {
  const type =
    level === 1
      ? pick(rng, ["share", "share", "fact"] as const)
      : level === 2
        ? pick(rng, ["related", "fact", "share", "groups"] as const)
        : pick(rng, ["unknown", "word", "fact", "groups"] as const);
  const divisor = pick(rng, level === 1 ? [2, 5, 10] : level === 2 ? [3, 4, 6, 2, 5] : [6, 7, 8, 9, 4]);
  const q = randInt(rng, level === 1 ? 2 : 2, level === 1 ? 6 : 10);
  const total = divisor * q;
  const name = pick(rng, NAMES);

  switch (type) {
    case "share": {
      const g = Math.min(divisor, 5) === divisor ? divisor : randInt(rng, 2, 5);
      const each = randInt(rng, 2, 6);
      const t = g * each;
      return {
        prompt: `${name} shares ${t} cookies equally on ${g} plates. How many cookies go on each plate?`,
        visual: { kind: "groups", groups: g, each },
        answer: String(each),
        choices: withChoices(rng, String(each), numberDistractors(rng, each, [t - g, g, each * 2])),
        hint: `Put the cookies on ${g} plates one at a time until all ${t} are used.`,
        explanation: `${t} ÷ ${g} = ${each}, because ${g} × ${each} = ${t}.`,
      };
    }
    case "related":
      return {
        prompt: `If ${divisor} × ${q} = ${total}, then ${total} ÷ ${divisor} = □`,
        answer: String(q),
        hint: `Multiplication and division are a fact family. Use the facts you see.`,
        explanation: `${total} ÷ ${divisor} = ${q} because ${divisor} × ${q} = ${total}.`,
      };
    case "groups":
      return {
        prompt: `A farmer packs ${total} peaches into boxes of ${divisor}. How many boxes does the farmer fill?`,
        answer: String(q),
        choices: withChoices(rng, String(q), numberDistractors(rng, q, [total - divisor, divisor, q + divisor])),
        hint: `How many groups of ${divisor} are in ${total}? Think ${divisor} × □ = ${total}.`,
        explanation: `${total} ÷ ${divisor} = ${q} boxes.`,
      };
    case "unknown":
      return {
        prompt: `□ ÷ ${divisor} = ${q}`,
        answer: String(total),
        hint: `Which number split into ${divisor} equal groups gives ${q} in each? Multiply ${divisor} × ${q}.`,
        explanation: `${total} ÷ ${divisor} = ${q}, because ${divisor} × ${q} = ${total}.`,
      };
    case "word":
      return {
        prompt: `${name} has ${total} Mardi Gras beads and gives the same number to each of ${divisor} friends. How many beads does each friend get?`,
        answer: String(q),
        choices: withChoices(rng, String(q), numberDistractors(rng, q, [total - divisor, total + divisor, divisor])),
        hint: `Share ${total} equally among ${divisor}. What times ${divisor} equals ${total}?`,
        explanation: `${total} ÷ ${divisor} = ${q} beads each.`,
      };
    default:
      return {
        prompt: `${total} ÷ ${divisor} = □`,
        answer: String(q),
        hint: `Think: ${divisor} × □ = ${total}.`,
        explanation: `${total} ÷ ${divisor} = ${q} because ${divisor} × ${q} = ${total}.`,
      };
  }
};

const g3Frac: Gen = (rng, level) => {
  const d = pick(rng, [2, 3, 4, 6, 8]);
  if (level === 1) {
    const type = pick(rng, ["shade", "parts", "circle"] as const);
    if (type === "parts") {
      return {
        prompt: `A whole is cut into ${d} equal parts. What fraction is ONE part?`,
        visual: { kind: "fractionBar", parts: d, shaded: 1 },
        answer: frac(1, d),
        choices: withChoices(rng, frac(1, d), [frac(d, 1), frac(1, d + 1), frac(1, d * 2), frac(d - 1, d)]),
        hint: `One part out of ${d} equal parts is 1/${d}.`,
        explanation: `Each part is 1/${d} (one ${denWord(d, false)}) of the whole.`,
      };
    }
    return {
      prompt: `What fraction of the shape is shaded?`,
      visual: type === "circle" ? { kind: "fractionCircle", parts: d, shaded: 1 } : { kind: "fractionBar", parts: d, shaded: 1 },
      answer: frac(1, d),
      choices: withChoices(rng, frac(1, d), [frac(d, 1), frac(1, d + 1), frac(d - 1, d), frac(1, d * 2)]),
      hint: `Count all the equal parts. That number goes on the bottom.`,
      explanation: `1 part is shaded out of ${d} equal parts, so it's 1/${d}.`,
    };
  }
  if (level === 2) {
    const d = pick(rng, [3, 4, 5, 6, 8]);
    const nn = randInt(rng, 2, d - 1);
    const type = pick(rng, ["bar", "circle", "meaning"] as const);
    if (type === "meaning") {
      return {
        prompt: `The fraction ${frac(nn, d)} means ${nn} parts that are each what size?`,
        answer: frac(1, d),
        choices: withChoices(rng, frac(1, d), [frac(1, nn), frac(nn, 1), frac(d, nn), frac(1, d + 2)]),
        hint: `The bottom number tells the size of each part.`,
        explanation: `${frac(nn, d)} is ${nn} parts of size 1/${d}.`,
      };
    }
    return {
      prompt: `What fraction of the shape is shaded?`,
      visual: type === "circle" ? { kind: "fractionCircle", parts: d, shaded: nn } : { kind: "fractionBar", parts: d, shaded: nn },
      answer: frac(nn, d),
      choices: withChoices(rng, frac(nn, d), [frac(d, nn), frac(d - nn, d), frac(nn, d + 1), frac(1, d)]),
      hint: `Top number = shaded parts. Bottom number = all equal parts.`,
      explanation: `${nn} of ${d} equal parts are shaded: ${frac(nn, d)}.`,
    };
  }
  const type = pick(rng, ["line", "line", "whole", "wholeNum"] as const);
  if (type === "whole") {
    return {
      prompt: `Which fraction is equal to 1 whole?`,
      answer: frac(d, d),
      choices: withChoices(rng, frac(d, d), [frac(1, d), frac(d, 1), frac(d - 1, d), frac(1, 1 + d)]),
      hint: `A whole has ALL of its parts. The top and bottom are the same.`,
      explanation: `${frac(d, d)} means all ${d} parts, which is 1 whole.`,
    };
  }
  if (type === "wholeNum") {
    const w = randInt(rng, 2, 6);
    return {
      prompt: `Which fraction is equal to ${w}?`,
      answer: frac(w, 1),
      choices: withChoices(rng, frac(w, 1), [frac(1, w), frac(w, w), frac(w + 1, 1), frac(1, 1)]),
      hint: `${w} wholes, each cut into just 1 part.`,
      explanation: `${frac(w, 1)} = ${w} because there are ${w} wholes of 1 part each.`,
    };
  }
  const n = randInt(rng, 1, d - 1);
  return {
    prompt: `What fraction is at the point on the number line?`,
    visual: { kind: "numberLine", parts: d, mark: n },
    answer: frac(n, d),
    choices: withChoices(rng, frac(n, d), [frac(n + 1, d), frac(d, n), frac(n, d + 1), frac(Math.max(1, n - 1), d)]),
    hint: `Count the equal jumps from 0 to 1. Then count jumps to the point.`,
    explanation: `0 to 1 is cut into ${d} equal parts. The point is ${n} jumps from 0: ${frac(n, d)}.`,
  };
};

const g3Equiv: Gen = (rng, level) => {
  if (level === 1) {
    const base = pick(rng, [2, 3, 4]);
    const mult = base === 4 ? 2 : pick(rng, [2, 3]);
    const n = randInt(rng, 1, base - 1);
    const d2 = base * mult;
    return {
      prompt: `${frac(n, base)} = □/${d2}. Use the bars to find the missing number.`,
      visual: { kind: "fractionBars", bars: [{ parts: base, shaded: n }, { parts: d2, shaded: n * mult }] },
      answer: String(n * mult),
      hint: `Look at the bottom bar. How many small parts line up with the shaded part on top?`,
      explanation: `${frac(n, base)} = ${frac(n * mult, d2)}. The same amount is shaded on both bars.`,
    };
  }
  if (level === 2) {
    const sameDen = rng() < 0.5;
    if (sameDen) {
      const d = pick(rng, [4, 6, 8]);
      const [a, b] = shuffle(rng, [randInt(rng, 1, d - 1), randInt(rng, 1, d - 1)]);
      const ans = a > b ? ">" : a < b ? "<" : "=";
      return {
        prompt: `Compare: ${frac(a, d)} ◯ ${frac(b, d)}`,
        visual: { kind: "fractionBars", bars: [{ parts: d, shaded: a }, { parts: d, shaded: b }] },
        answer: ans,
        choices: [">", "<", "="],
        hint: `Same size parts! The fraction with more parts is greater.`,
        explanation: `Both are ${denWord(d)}. ${a} ${a === b ? "equals" : a > b ? "is more than" : "is less than"} ${b}, so ${frac(a, d)} ${ans} ${frac(b, d)}.`,
      };
    }
    const n = randInt(rng, 1, 2);
    const [d1, d2] = shuffle(rng, pick(rng, [[3, 6], [2, 8], [4, 8], [3, 4], [2, 6]] as const));
    const ans = d1 < d2 ? ">" : "<";
    return {
      prompt: `Compare: ${frac(n, d1)} ◯ ${frac(n, d2)}`,
      visual: { kind: "fractionBars", bars: [{ parts: d1, shaded: n }, { parts: d2, shaded: n }] },
      answer: ans,
      choices: [">", "<", "="],
      hint: `Same number of parts. When a whole is cut into MORE parts, each part is smaller.`,
      explanation: `${denWord(d1)} are ${d1 < d2 ? "bigger" : "smaller"} than ${denWord(d2)}, so ${frac(n, d1)} ${ans} ${frac(n, d2)}.`,
    };
  }
  const type = pick(rng, ["missing", "missing", "which", "whole"] as const);
  if (type === "whole") {
    const w = randInt(rng, 1, 3);
    const d = pick(rng, [2, 3, 4]);
    return {
      prompt: `${frac(w * d, d)} = □`,
      answer: String(w),
      hint: `How many wholes can you make? Every ${d} ${denWord(d)} make 1 whole.`,
      explanation: `${w * d} ${denWord(d)} make ${w} whole${w > 1 ? "s" : ""}.`,
    };
  }
  const base = pick(rng, [2, 3, 4]);
  const n = randInt(rng, 1, base - 1);
  const m = base === 4 ? 2 : pick(rng, [2, 3, 4].filter((x) => base * x <= 8 || base === 2));
  if (type === "which") {
    const ans = frac(n * m, base * m);
    return {
      prompt: `Which fraction is equivalent to ${frac(n, base)}?`,
      answer: ans,
      choices: withChoices(rng, ans, [frac(n + m, base + m), frac(n * m, base), frac(n, base * m), frac(n + 1, base * m)]),
      hint: `Equivalent fractions name the same amount. Try cutting each part into ${m} pieces.`,
      explanation: `${frac(n, base)} = ${ans}. Both cover the same part of the whole.`,
    };
  }
  return {
    prompt: `${frac(n, base)} = □/${base * m}`,
    visual: { kind: "fractionBars", bars: [{ parts: base, shaded: n }, { parts: base * m, shaded: 0 }] },
    answer: String(n * m),
    hint: `Each ${denWord(base, false)} is the same as ${m} ${denWord(base * m)}.`,
    explanation: `${frac(n, base)} = ${frac(n * m, base * m)}.`,
  };
};

const g3Area: Gen = (rng, level) => {
  if (level === 1) {
    const w = randInt(rng, 2, 6);
    const h = randInt(rng, 2, 5);
    return {
      prompt: `Each square is 1 square unit. What is the area of the rectangle?`,
      visual: { kind: "areaGrid", w, h },
      answer: String(w * h),
      unit: "square units",
      hint: `Count the squares. Or count rows: ${h} rows of ${w}.`,
      explanation: `${h} rows × ${w} squares = ${w * h} square units.`,
    };
  }
  const w = randInt(rng, 3, 10);
  const h = randInt(rng, 2, 8);
  if (level === 2) {
    const type = pick(rng, ["area", "perimeter", "perimeter"] as const);
    if (type === "area") {
      return {
        prompt: `What is the area of this rectangle?`,
        visual: { kind: "rect", w, h, unit: "ft" },
        answer: String(w * h),
        unit: "square feet",
        hint: `Area = length × width. Multiply ${w} × ${h}.`,
        explanation: `${w} × ${h} = ${w * h} square feet.`,
      };
    }
    return {
      prompt: `What is the perimeter of this rectangle?`,
      visual: { kind: "rect", w, h, unit: "ft" },
      answer: String(2 * (w + h)),
      unit: "feet",
      hint: `Perimeter is the distance AROUND. Add all 4 sides: ${w} + ${h} + ${w} + ${h}.`,
      explanation: `${w} + ${h} + ${w} + ${h} = ${2 * (w + h)} feet.`,
    };
  }
  const type = pick(rng, ["sideArea", "sidePerim", "garden", "compare"] as const);
  if (type === "sideArea") {
    return {
      prompt: `This rectangle has an area of ${w * h} square meters. What is the missing side length?`,
      visual: { kind: "rect", w, h, unit: "m", labelH: "?" },
      answer: String(h),
      unit: "meters",
      hint: `${w} × □ = ${w * h}. Use division: ${w * h} ÷ ${w}.`,
      explanation: `${w * h} ÷ ${w} = ${h} meters.`,
    };
  }
  if (type === "sidePerim") {
    return {
      prompt: `The perimeter is ${2 * (w + h)} inches. What is the missing side length?`,
      visual: { kind: "rect", w, h, unit: "in", labelH: "?" },
      answer: String(h),
      unit: "inches",
      hint: `Two sides are ${w}, so they add to ${2 * w}. The other two sides share what's left.`,
      explanation: `${2 * (w + h)} − ${2 * w} = ${2 * h}, and ${2 * h} ÷ 2 = ${h} inches.`,
    };
  }
  if (type === "garden") {
    const name = pick(rng, NAMES);
    return {
      prompt: `${name} builds a fence around a garden that is ${w} feet long and ${h} feet wide. How many feet of fence are needed?`,
      answer: String(2 * (w + h)),
      choices: withChoices(rng, String(2 * (w + h)), numberDistractors(rng, 2 * (w + h), [w * h, w + h, 2 * w + h])),
      hint: `A fence goes AROUND the garden. That's perimeter.`,
      explanation: `${w} + ${h} + ${w} + ${h} = ${2 * (w + h)} feet of fence.`,
    };
  }
  // Same perimeter, different area
  const a = { w: 6, h: 2 };
  const b = { w: 4, h: 4 };
  return {
    prompt: `Rectangle A is 6 by 2. Rectangle B is 4 by 4. Both have a perimeter of 16. Which has the greater area?`,
    answer: "Rectangle B",
    choices: ["Rectangle A", "Rectangle B", "They are the same"],
    hint: `Find each area: multiply the sides.`,
    explanation: `A: ${a.w} × ${a.h} = 12. B: ${b.w} × ${b.h} = 16. Rectangle B has more area.`,
  };
};

// ======================= GRADE 4 =======================

const g4Mult: Gen = (rng, level) => {
  const name = pick(rng, NAMES);
  if (level === 1) {
    if (rng() < 0.35) {
      const n = randInt(rng, 2, 9) * pick(rng, [1, 1, 10]);
      const p = pick(rng, [10, 100, 1000]);
      return {
        prompt: `${n} × ${p.toLocaleString("en-US")} = □`,
        answer: String(n * p),
        hint: `Multiplying by ${p} shifts each digit ${String(p).length - 1} place${p > 10 ? "s" : ""} to the left.`,
        explanation: `${n} × ${p} = ${n * p}.`,
      };
    }
    const a = randInt(rng, 12, 99);
    const b = randInt(rng, 2, 9);
    const tens = Math.floor(a / 10) * 10;
    return {
      prompt: `${a} × ${b} = □`,
      answer: String(a * b),
      hint: `Break it apart: (${tens} × ${b}) + (${a - tens} × ${b}).`,
      explanation: `${tens} × ${b} = ${tens * b} and ${a - tens} × ${b} = ${(a - tens) * b}. ${tens * b} + ${(a - tens) * b} = ${a * b}.`,
    };
  }
  if (level === 2) {
    if (rng() < 0.4) {
      const small = randInt(rng, 3, 12);
      const times = randInt(rng, 3, 9);
      return {
        prompt: `${name} collected ${small} pecans. Grandma collected ${times} times as many. How many pecans did Grandma collect?`,
        answer: String(small * times),
        choices: withChoices(rng, String(small * times), numberDistractors(rng, small * times, [small + times, small * times - small, small * (times + 1)])),
        hint: `"Times as many" means multiply: ${small} × ${times}.`,
        explanation: `${small} × ${times} = ${small * times} pecans.`,
      };
    }
    const a = randInt(rng, 100, rng() < 0.5 ? 999 : 4999);
    const b = randInt(rng, 2, 9);
    return {
      prompt: `${a} × ${b} = □`,
      answer: String(a * b),
      hint: `Multiply each place: thousands, hundreds, tens, ones. Then add the partial products.`,
      explanation: `${a} × ${b} = ${a * b}.`,
    };
  }
  if (rng() < 0.25) {
    const a = randInt(rng, 21, 89);
    const b = randInt(rng, 21, 89);
    const est = Math.round(a / 10) * 10 * (Math.round(b / 10) * 10);
    return {
      prompt: `Which is the best estimate for ${a} × ${b}?`,
      answer: String(est),
      choices: withChoices(rng, String(est), [String(est * 10), String(Math.round(a / 10) * 10 + Math.round(b / 10) * 10), String(Math.max(1, est / 10))]),
      hint: `Round each number to the nearest ten, then multiply.`,
      explanation: `${a} ≈ ${Math.round(a / 10) * 10} and ${b} ≈ ${Math.round(b / 10) * 10}. ${Math.round(a / 10) * 10} × ${Math.round(b / 10) * 10} = ${est}.`,
    };
  }
  const a = randInt(rng, 11, 99);
  const b = randInt(rng, 11, 99);
  const bt = Math.floor(b / 10) * 10;
  return {
    prompt: `${a} × ${b} = □`,
    answer: String(a * b),
    hint: `Split ${b} into ${bt} + ${b - bt}. Find ${a} × ${bt} and ${a} × ${b - bt}, then add.`,
    explanation: `${a} × ${bt} = ${a * bt} and ${a} × ${b - bt} = ${a * (b - bt)}. Total: ${a * b}.`,
  };
};

const rem = (q: number, r: number) => (r === 0 ? String(q) : `${q} R${r}`);

const g4Div: Gen = (rng, level) => {
  if (level === 1) {
    if (rng() < 0.4) {
      const d = randInt(rng, 2, 9);
      const q = randInt(rng, 2, 9) * 10;
      return {
        prompt: `${d * q} ÷ ${d} = □`,
        answer: String(q),
        hint: `Use a basic fact: ${(d * q) / 10} ÷ ${d} = ${q / 10}. Now think in tens.`,
        explanation: `${(d * q) / 10} tens ÷ ${d} = ${q / 10} tens = ${q}.`,
      };
    }
    const d = randInt(rng, 2, 9);
    const q = randInt(rng, 11, level === 1 ? 49 : 99);
    return {
      prompt: `${d * q} ÷ ${d} = □`,
      answer: String(q),
      hint: `Divide the tens first, then the ones. Check: ${d} × □ = ${d * q}.`,
      explanation: `${d * q} ÷ ${d} = ${q} because ${d} × ${q} = ${d * q}.`,
    };
  }
  if (level === 2) {
    const d = randInt(rng, 3, 9);
    const q = randInt(rng, 12, 99);
    const r = randInt(rng, 1, d - 1);
    const n = d * q + r;
    const ans = rem(q, r);
    return {
      prompt: `${n} ÷ ${d} = ?`,
      answer: ans,
      choices: withChoices(rng, ans, [rem(q, r === d - 1 ? r - 1 : r + 1), rem(q + 1, r), rem(q - 1, r), rem(q, d)]),
      hint: `Find how many groups of ${d} fit in ${n}. What's left over is the remainder (smaller than ${d}).`,
      explanation: `${d} × ${q} = ${d * q}, and ${n} − ${d * q} = ${r}. So ${n} ÷ ${d} = ${q} R${r}.`,
    };
  }
  if (rng() < 0.5) {
    const k = randInt(rng, 4, 9);
    const groups = randInt(rng, 5, 12);
    const r = randInt(rng, 1, k - 1);
    const n = k * groups + r;
    return {
      prompt: `${n} students are going to the Space & Rocket Center. Each van holds ${k} students. How many vans are needed so everyone can go?`,
      answer: String(groups + 1),
      choices: withChoices(rng, String(groups + 1), [String(groups), String(r), rem(groups, r)]),
      hint: `${n} ÷ ${k} has a remainder. The leftover students still need a ride!`,
      explanation: `${n} ÷ ${k} = ${groups} R${r}. ${groups} vans are full and ${r} students need 1 more van: ${groups + 1} vans.`,
    };
  }
  const d = randInt(rng, 2, 9);
  const q = randInt(rng, 125, 1100);
  return {
    prompt: `${(d * q).toLocaleString("en-US")} ÷ ${d} = □`,
    answer: String(q),
    hint: `Divide one place at a time: thousands, hundreds, tens, ones.`,
    explanation: `${d * q} ÷ ${d} = ${q} because ${d} × ${q} = ${d * q}.`,
  };
};

const g4Equiv: Gen = (rng, level) => {
  const pairs = [2, 3, 4, 5, 6, 8, 10, 12];
  if (level === 1) {
    const b = pick(rng, [2, 3, 4, 5, 6]);
    const a = randInt(rng, 1, b - 1);
    const n = pick(rng, [2, 3, 4]);
    return {
      prompt: `${frac(a, b)} = □/${b * n}`,
      visual: b * n <= 12 ? { kind: "fractionBars", bars: [{ parts: b, shaded: a }, { parts: b * n, shaded: a * n }] } : undefined,
      answer: String(a * n),
      hint: `${b} × ${n} = ${b * n}. Multiply the top by the same number.`,
      explanation: `${frac(a, b)} = ${frac(a * n, b * n)} (top and bottom × ${n}).`,
    };
  }
  if (level === 2) {
    if (rng() < 0.5) {
      const b = pick(rng, [2, 3, 4, 5]);
      const a = randInt(rng, 1, b - 1);
      const n = pick(rng, [2, 3]);
      const shown = frac(a * n, b * n);
      const ans = frac(a, b);
      return {
        prompt: `Which fraction is equivalent to ${shown}?`,
        answer: ans,
        choices: withChoices(rng, ans, [frac(a + 1, b), frac(a * n, b), frac(a, b * n), frac(b, a * n), frac(a * n - 1, b * n)]),
        hint: `Divide the top and bottom by the same number (${n}).`,
        explanation: `${shown} ÷ ${n}/${n} = ${ans}.`,
      };
    }
    const d = pick(rng, [5, 6, 8, 10, 12]);
    let n = randInt(rng, 1, d - 1);
    if (n * 2 === d) n = n + 1;
    const ans = n * 2 > d ? "greater than 1/2" : "less than 1/2";
    return {
      prompt: `Is ${frac(n, d)} greater than or less than 1/2?`,
      answer: ans,
      choices: ["greater than 1/2", "less than 1/2"],
      hint: `Half of ${d} is ${d / 2}. Is ${n} more or less than ${d / 2}?`,
      explanation: `1/2 = ${d / 2}/${d}. ${n} is ${n * 2 > d ? "more" : "less"} than ${d / 2}, so ${frac(n, d)} is ${ans}.`,
    };
  }
  const d1 = pick(rng, pairs);
  let d2 = pick(rng, pairs);
  if (d2 === d1) d2 = pick(rng, pairs.filter((x) => x !== d1));
  const n1 = randInt(rng, 1, d1 - 1);
  const n2 = randInt(rng, 1, d2 - 1);
  const v1 = n1 * d2;
  const v2 = n2 * d1;
  const ans = v1 > v2 ? ">" : v1 < v2 ? "<" : "=";
  const common = (d1 * d2) / gcd(d1, d2);
  return {
    prompt: `Compare: ${frac(n1, d1)} ◯ ${frac(n2, d2)}`,
    answer: ans,
    choices: [">", "<", "="],
    hint: `Rename both with a common denominator like ${common}, or compare each to 1/2.`,
    explanation: `${frac(n1, d1)} = ${frac((n1 * common) / d1, common)} and ${frac(n2, d2)} = ${frac((n2 * common) / d2, common)}. So ${frac(n1, d1)} ${ans} ${frac(n2, d2)}.`,
  };
};

const g4Ops: Gen = (rng, level) => {
  const d = pick(rng, [3, 4, 5, 6, 8, 10, 12]);
  const name = pick(rng, NAMES);
  if (level === 1) {
    const a = randInt(rng, 1, d - 1);
    const b = randInt(rng, 1, d - a);
    const ans = frac(a + b, d);
    return {
      prompt: rng() < 0.6 ? `${frac(a, d)} + ${frac(b, d)} = ?` : `${name} walked ${frac(a, d)} mile to the park and ${frac(b, d)} mile to the library. How far did ${name} walk?`,
      visual: { kind: "fractionBar", parts: d, shaded: a + b },
      answer: ans,
      choices: withChoices(rng, ans, [frac(a + b, d + d), frac(a + b + 1, d), frac(a * b, d), frac(Math.abs(a - b) || 1, d)]),
      hint: `Same denominator? Add the tops. The bottom stays ${d}.`,
      explanation: `${a} ${denWord(d)} + ${b} ${denWord(d)} = ${a + b} ${denWord(d)}: ${ans}.`,
    };
  }
  if (level === 2) {
    if (rng() < 0.6) {
      const a = randInt(rng, 2, d);
      const b = randInt(rng, 1, a - 1);
      const ans = frac(a - b, d);
      return {
        prompt: `${frac(a, d)} − ${frac(b, d)} = ?`,
        answer: ans,
        choices: withChoices(rng, ans, [frac(a - b, d * 2), frac(a + b, d), frac(a - b + 1, d), frac(b, d)]),
        hint: `Subtract the tops. The bottom stays ${d}.`,
        explanation: `${a} ${denWord(d)} − ${b} ${denWord(d)} = ${a - b} ${denWord(d)}: ${ans}.`,
      };
    }
    const total = randInt(rng, 3, d);
    const part = randInt(rng, 1, total - 1);
    return {
      prompt: `${frac(total, d)} = ${frac(part, d)} + □/${d}`,
      visual: { kind: "fractionBar", parts: d, shaded: total },
      answer: String(total - part),
      hint: `How many more ${denWord(d)} do you need to get from ${part} to ${total}?`,
      explanation: `${frac(part, d)} + ${frac(total - part, d)} = ${frac(total, d)}.`,
    };
  }
  const type = pick(rng, ["mixedAdd", "mixedSub", "times", "times"] as const);
  if (type === "times") {
    const w = randInt(rng, 2, 6);
    const n = randInt(rng, 1, Math.min(4, d - 1));
    const ans = frac(w * n, d);
    return {
      prompt: `${w} × ${frac(n, d)} = ?`,
      answer: ans,
      choices: withChoices(rng, ans, [frac(w * n, w * d), frac(n, w * d), frac(w + n, d), frac(w * n + 1, d)]),
      hint: `${w} × ${frac(n, d)} means ${w} groups of ${frac(n, d)}. Multiply the top by ${w}.`,
      explanation: `${w} × ${n} = ${w * n}, so ${w} × ${frac(n, d)} = ${ans}.`,
    };
  }
  const w1 = randInt(rng, 1, 5);
  const w2 = randInt(rng, 1, 4);
  if (type === "mixedAdd") {
    const a = randInt(rng, 1, d - 2);
    const b = randInt(rng, 1, d - 1 - a);
    const ans = mixed(w1 + w2, a + b, d);
    return {
      prompt: `${mixed(w1, a, d)} + ${mixed(w2, b, d)} = ?`,
      answer: ans,
      choices: withChoices(rng, ans, [mixed(w1 + w2, a + b, d + d), mixed(w1 + w2 + 1, a + b, d), mixed(w1 + w2, Math.abs(a - b) || 1, d), mixed(w1 * w2, a + b, d)]),
      hint: `Add the whole numbers. Then add the fractions.`,
      explanation: `${w1} + ${w2} = ${w1 + w2} and ${frac(a, d)} + ${frac(b, d)} = ${frac(a + b, d)}. Answer: ${ans}.`,
    };
  }
  const big = w1 + w2;
  const a = randInt(rng, 2, d - 1);
  const b = randInt(rng, 1, a - 1);
  const ans = mixed(big - w2, a - b, d);
  return {
    prompt: `${mixed(big, a, d)} − ${mixed(w2, b, d)} = ?`,
    answer: ans,
    choices: withChoices(rng, ans, [mixed(big + w2, a - b, d), mixed(big - w2, a + b > d - 1 ? a : a + b, d), mixed(big - w2 - 1, a - b, d), mixed(big - w2, a - b, d * 2)]),
    hint: `Subtract the whole numbers. Then subtract the fractions.`,
    explanation: `${big} − ${w2} = ${big - w2} and ${frac(a, d)} − ${frac(b, d)} = ${frac(a - b, d)}. Answer: ${ans}.`,
  };
};

const toDec = (hundredths: number) => (hundredths / 100).toFixed(2).replace(/0$/, "").replace(/\.$/, "");

const g4Dec: Gen = (rng, level) => {
  if (level === 1) {
    const type = pick(rng, ["grid", "tenths", "grid"] as const);
    if (type === "tenths") {
      const t = randInt(rng, 1, 9);
      return {
        prompt: `Write ${frac(t, 10)} as a decimal.`,
        answer: `0.${t}`,
        allowDecimal: true,
        hint: `Tenths go in the first place after the decimal point.`,
        explanation: `${t} tenths = 0.${t}.`,
      };
    }
    const h = randInt(rng, 3, 97);
    const ans = (h / 100).toFixed(2);
    return {
      prompt: `The whole grid is 1. What decimal is shaded?`,
      visual: { kind: "decimalGrid", shaded: h },
      answer: ans,
      choices: withChoices(rng, ans, [String(h), `0.0${h % 10}`, (h / 10).toFixed(1), ((100 - h) / 100).toFixed(2)]),
      hint: `Count shaded squares out of 100. Each full column is 0.1.`,
      explanation: `${h} out of 100 squares = ${frac(h, 100)} = ${ans}.`,
    };
  }
  if (level === 2) {
    const type = pick(rng, ["hund", "add", "place"] as const);
    if (type === "hund") {
      const h = randInt(rng, 11, 99);
      return {
        prompt: `Write ${frac(h, 100)} as a decimal.`,
        answer: (h / 100).toFixed(2),
        allowDecimal: true,
        hint: `Hundredths need two places after the decimal point.`,
        explanation: `${h} hundredths = ${(h / 100).toFixed(2)}.`,
      };
    }
    if (type === "add") {
      const t = randInt(rng, 1, 8);
      const h = randInt(rng, 1, 9);
      return {
        prompt: `${frac(t, 10)} + ${frac(h, 100)} = □/100`,
        answer: String(t * 10 + h),
        hint: `${frac(t, 10)} is the same as ${frac(t * 10, 100)}.`,
        explanation: `${frac(t, 10)} = ${frac(t * 10, 100)}, and ${t * 10} + ${h} = ${t * 10 + h}. So ${frac(t * 10 + h, 100)}.`,
      };
    }
    const tenths = randInt(rng, 1, 9);
    const hundredths = randInt(rng, 1, 9);
    const ones = randInt(rng, 0, 9);
    const n = `${ones}.${tenths}${hundredths}`;
    const which = rng() < 0.5 ? "tenths" : "hundredths";
    const ans = String(which === "tenths" ? tenths : hundredths);
    return {
      prompt: `In ${n}, which digit is in the ${which} place?`,
      answer: ans,
      choices: withChoices(rng, ans, [String(which === "tenths" ? hundredths : tenths), String(ones), String((Number(ans) + 1) % 10)]),
      hint: `The first digit after the decimal point is tenths. The second is hundredths.`,
      explanation: `In ${n}: ${ones} ones, ${tenths} tenths, ${hundredths} hundredths.`,
    };
  }
  const type = pick(rng, ["compare", "compare", "money", "greatest"] as const);
  if (type === "money") {
    const c = randInt(rng, 5, 95);
    const ans = (c / 100).toFixed(2);
    return {
      prompt: `${pick(rng, NAMES)} has ${c} cents. Write it as a decimal part of a dollar.`,
      answer: `$${ans}`,
      choices: withChoices(rng, `$${ans}`, [`$${c}.00`, `$${(c / 10).toFixed(1)}`, `$0.0${c % 10}`, `$${c / 10}0`]),
      hint: `100 cents = $1.00. So 1 cent = $0.01.`,
      explanation: `${c} cents = ${frac(c, 100)} of a dollar = $${ans}.`,
    };
  }
  if (type === "greatest") {
    const vals = shuffle(rng, [randInt(rng, 10, 99), randInt(rng, 1, 9) * 10, randInt(rng, 1, 9), randInt(rng, 10, 99)]);
    const uniq = Array.from(new Set(vals));
    const labels = uniq.map((v) => toDec(v).padEnd(3, "0"));
    const max = Math.max(...uniq);
    const ans = toDec(max).padEnd(3, "0");
    return {
      prompt: `Which decimal is the greatest?`,
      answer: ans,
      choices: shuffle(rng, labels),
      hint: `Compare the tenths first. If they tie, compare the hundredths.`,
      explanation: `${ans} is the greatest because it has the most hundredths (${max}/100).`,
    };
  }
  let a = randInt(rng, 1, 99);
  let b = randInt(rng, 1, 99);
  if (rng() < 0.25) {
    // Same value written two ways, e.g. 0.5 and 0.50
    a = randInt(rng, 1, 9) * 10;
    b = a;
  }
  const ans = a > b ? ">" : a < b ? "<" : "=";
  const showA = a % 10 === 0 && rng() < 0.5 ? (a / 100).toFixed(1) : (a / 100).toFixed(2);
  const showB = (b / 100).toFixed(2);
  return {
    prompt: `Compare: ${showA} ◯ ${showB}`,
    answer: ans,
    choices: [">", "<", "="],
    hint: `Line up the decimal points. Think in hundredths: ${a} hundredths and ${b} hundredths.`,
    explanation: `${showA} = ${frac(a, 100)} and ${showB} = ${frac(b, 100)}. So ${showA} ${ans} ${showB}.`,
  };
};

const GENERATORS: Record<string, Gen> = {
  "g3-mult": g3Mult,
  "g3-div": g3Div,
  "g3-frac": g3Frac,
  "g3-equiv": g3Equiv,
  "g3-area": g3Area,
  "g4-mult": g4Mult,
  "g4-div": g4Div,
  "g4-equiv": g4Equiv,
  "g4-ops": g4Ops,
  "g4-dec": g4Dec,
};

export function generateQuestion(worldId: string, level: LevelNumber, rng: Rng): Question {
  const gen = GENERATORS[worldId];
  if (!gen) throw new Error(`No questions for ${worldId}`);
  return gen(rng, level);
}

/** A level's question set, avoiding repeated prompts where possible. */
export function generateLevel(worldId: string, level: LevelNumber, count: number, rng: Rng): Question[] {
  const out: Question[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (out.length < count && guard < count * 12) {
    guard++;
    const q = generateQuestion(worldId, level, rng);
    const key = q.prompt + JSON.stringify(q.visual ?? "");
    if (seen.has(key) && guard < count * 10) continue;
    seen.add(key);
    out.push(q);
  }
  return out;
}

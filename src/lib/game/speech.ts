const DEN: Record<number, [string, string]> = {
  1: ["whole", "wholes"],
  2: ["half", "halves"],
  3: ["third", "thirds"],
  4: ["fourth", "fourths"],
  5: ["fifth", "fifths"],
  6: ["sixth", "sixths"],
  7: ["seventh", "sevenths"],
  8: ["eighth", "eighths"],
  9: ["ninth", "ninths"],
  10: ["tenth", "tenths"],
  12: ["twelfth", "twelfths"],
  100: ["hundredth", "hundredths"],
};

export function spokenFraction(n: number, d: number): string {
  const words = DEN[d] ?? [`${d}th`, `${d}ths`];
  return `${n} ${n === 1 ? words[0] : words[1]}`;
}

/** Turns math notation into words a speech voice reads naturally. */
export function toSpoken(text: string): string {
  return text
    .replace(/(\d+) R(\d+)/g, "$1 remainder $2")
    .replace(/(\d+) (\d+)\/(\d+)/g, (_, w, n, d) => `${w} and ${spokenFraction(+n, +d)}`)
    .replace(/(\d+)\/(\d+)/g, (_, n, d) => spokenFraction(+n, +d))
    .replace(/□/g, " blank ")
    .replace(/◯/g, " and ")
    .replace(/×/g, " times ")
    .replace(/÷/g, " divided by ")
    .replace(/−/g, " minus ")
    .replace(/\+/g, " plus ")
    .replace(/=/g, " equals ")
    .replace(/^>$/, "greater than")
    .replace(/^<$/, "less than")
    .replace(/\s+/g, " ")
    .trim();
}

let cachedVoice: SpeechSynthesisVoice | null = null;

function chooseVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  cachedVoice =
    en.find((v) => /samantha|google us english|aria|jenny|female/i.test(v.name)) ??
    en.find((v) => v.lang === "en-US") ??
    en[0] ??
    null;
  return cachedVoice;
}

export const speechSupported = () => typeof window !== "undefined" && "speechSynthesis" in window;

/** Reads text aloud with the browser's built-in voice. Call from event handlers or effects only. */
export function speak(text: string, onEnd?: () => void) {
  if (!speechSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(toSpoken(text));
  const voice = chooseVoice();
  if (voice) u.voice = voice;
  u.lang = "en-US";
  u.rate = 0.88;
  u.pitch = 1.05;
  if (onEnd) {
    u.onend = onEnd;
    u.onerror = onEnd;
  }
  synth.speak(u);
}

export function stopSpeaking() {
  if (speechSupported()) window.speechSynthesis.cancel();
}

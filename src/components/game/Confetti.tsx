import { useState } from "react";

const TONES = ["bg-primary", "bg-secondary", "bg-sunny", "bg-success"];

export function Confetti({ count = 70 }: { count?: number }) {
  // Rendered only after a level ends on the client, so random layout is safe here.
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      dur: 2.2 + Math.random() * 1.6,
      drift: (Math.random() - 0.5) * 200,
      tone: TONES[i % TONES.length],
    })),
  );
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className={`confetti-piece ${p.tone}`}
          style={{ left: `${p.left}%`, ["--delay" as string]: `${p.delay}s`, ["--dur" as string]: `${p.dur}s`, ["--drift" as string]: `${p.drift}px` }}
        />
      ))}
    </div>
  );
}

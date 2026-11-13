import { Fragment } from "react";
import { cn } from "@/lib/utils";

const TOKEN = /(\d+ \d+\/\d+|□\/\d+|\d+\/\d+|□|◯)/g;

function Frac({ n, d, whole }: { n: string; d: string; whole?: string | undefined }) {
  return (
    <span className="mx-0.5 inline-flex items-center gap-1 align-middle">
      {whole && <span>{whole}</span>}
      <span className="inline-flex flex-col items-center text-[0.78em] leading-none">
        <span className="px-1 pb-0.5">{n === "□" ? <Blank small /> : n}</span>
        <span className="h-[3px] w-full rounded-full bg-current" />
        <span className="px-1 pt-0.5">{d}</span>
      </span>
    </span>
  );
}

function Blank({ small }: { small?: boolean }) {
  return (
    <span
      aria-label="blank"
      className={cn(
        "inline-block rounded-lg border-[3px] border-dashed border-secondary bg-teal-soft align-middle",
        small ? "h-[1em] w-[1.1em]" : "mx-1 h-[1.15em] w-[1.6em]",
      )}
    />
  );
}

/** Renders math text: stacked fractions, mixed numbers, blanks (□) and compare circles (◯). */
export function MathText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(TOKEN);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (!part) return null;
        if (part === "□") return <Blank key={i} />;
        if (part === "◯")
          return (
            <span
              key={i}
              aria-label="compare"
              className="mx-1 inline-block h-[1.1em] w-[1.1em] rounded-full border-[3px] border-dashed border-primary bg-coral-soft align-middle"
            />
          );
        let m = part.match(/^(\d+) (\d+)\/(\d+)$/);
        if (m) return <Frac key={i} whole={m[1]!} n={m[2]!} d={m[3]!} />;
        m = part.match(/^(□|\d+)\/(\d+)$/);
        if (m) return <Frac key={i} n={m[1]!} d={m[2]!} />;
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </span>
  );
}

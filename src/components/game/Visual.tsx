import type { Visual as VisualSpec } from "@/lib/game/types";
import { cn } from "@/lib/utils";

function Dot({ className }: { className?: string }) {
  return <span className={cn("block size-5 rounded-full bg-primary shadow-[inset_0_-3px_0_var(--primary-deep)] sm:size-6", className)} />;
}

function FractionBar({ parts, shaded, tone = "secondary" }: { parts: number; shaded: number; tone?: "secondary" | "primary" }) {
  return (
    <div className="flex h-14 w-full max-w-lg overflow-hidden rounded-xl border-[3px] border-foreground/80 bg-card">
      {Array.from({ length: parts }, (_, i) => (
        <div
          key={i}
          className={cn(
            "flex-1 border-foreground/70",
            i < parts - 1 && "border-r-[3px]",
            i < shaded && (tone === "secondary" ? "bg-secondary" : "bg-primary"),
          )}
        />
      ))}
    </div>
  );
}

function FractionCircle({ parts, shaded }: { parts: number; shaded: number }) {
  const r = 80;
  const c = 90;
  const slices = Array.from({ length: parts }, (_, i) => {
    const a0 = (i / parts) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / parts) * Math.PI * 2 - Math.PI / 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const d = `M ${c} ${c} L ${c + r * Math.cos(a0)} ${c + r * Math.sin(a0)} A ${r} ${r} 0 ${large} 1 ${c + r * Math.cos(a1)} ${c + r * Math.sin(a1)} Z`;
    return <path key={i} d={d} className={i < shaded ? "fill-secondary" : "fill-card"} stroke="currentColor" strokeWidth={3} strokeLinejoin="round" />;
  });
  return (
    <svg viewBox="0 0 180 180" className="size-44 text-foreground/80" role="img" aria-label={`circle with ${parts} equal parts`}>
      {slices}
    </svg>
  );
}

function NumberLine({ parts, mark, wholes = 1 }: { parts: number; mark: number; wholes?: number | undefined }) {
  const x0 = 30;
  const x1 = 490;
  const total = parts * wholes;
  const x = (i: number) => x0 + ((x1 - x0) * i) / total;
  return (
    <svg viewBox="0 0 520 110" className="w-full max-w-xl text-foreground" role="img" aria-label="number line">
      <line x1={x0 - 14} x2={x1 + 14} y1={62} y2={62} stroke="currentColor" strokeWidth={4} strokeLinecap="round" />
      {Array.from({ length: total + 1 }, (_, i) => {
        const isWhole = i % parts === 0;
        return (
          <g key={i}>
            <line x1={x(i)} x2={x(i)} y1={isWhole ? 46 : 52} y2={isWhole ? 78 : 72} stroke="currentColor" strokeWidth={isWhole ? 4 : 3} strokeLinecap="round" />
            {isWhole && (
              <text x={x(i)} y={104} textAnchor="middle" className="fill-current font-display text-[22px] font-semibold">
                {i / parts}
              </text>
            )}
          </g>
        );
      })}
      <circle cx={x(mark)} cy={62} r={11} className="fill-primary" stroke="currentColor" strokeWidth={3} />
      <text x={x(mark)} y={32} textAnchor="middle" className="fill-primary font-display text-[26px] font-bold">
        ?
      </text>
    </svg>
  );
}

function Rect({ w, h, unit, labelH }: { w: number; h: number; unit: string; labelH?: string | undefined }) {
  const scale = Math.min(260 / w, 150 / h);
  const rw = w * scale;
  const rh = h * scale;
  const ox = (360 - rw) / 2;
  const oy = 40;
  return (
    <svg viewBox={`0 0 360 ${rh + 70}`} className="w-full max-w-md text-foreground" role="img" aria-label="rectangle">
      <rect x={ox} y={oy} width={rw} height={rh} rx={6} className="fill-sunny-soft" stroke="currentColor" strokeWidth={4} />
      <text x={ox + rw / 2} y={oy - 12} textAnchor="middle" className="fill-current font-display text-[22px] font-semibold">
        {w} {unit}
      </text>
      <text x={ox + rw + 12} y={oy + rh / 2 + 8} textAnchor="start" className={cn("font-display text-[22px] font-semibold", labelH === "?" ? "fill-primary" : "fill-current")}>
        {labelH ?? `${h} ${unit}`}
      </text>
    </svg>
  );
}

export function Visual({ visual }: { visual: VisualSpec }) {
  switch (visual.kind) {
    case "groups":
      return (
        <div className="flex flex-wrap justify-center gap-3">
          {Array.from({ length: visual.groups }, (_, g) => (
            <div key={g} className="flex max-w-36 flex-wrap justify-center gap-1.5 rounded-2xl border-[3px] border-dashed border-secondary bg-teal-soft p-3">
              {Array.from({ length: visual.each }, (_, i) => (
                <Dot key={i} />
              ))}
            </div>
          ))}
        </div>
      );
    case "array":
      return (
        <div className="inline-grid gap-2 rounded-2xl bg-card p-4 shadow-card" style={{ gridTemplateColumns: `repeat(${visual.cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: visual.rows * visual.cols }, (_, i) => (
            <Dot key={i} />
          ))}
        </div>
      );
    case "fractionBar":
      return <FractionBar parts={visual.parts} shaded={visual.shaded} />;
    case "fractionCircle":
      return <FractionCircle parts={visual.parts} shaded={visual.shaded} />;
    case "fractionBars":
      return (
        <div className="flex w-full max-w-lg flex-col gap-3">
          {visual.bars.map((b, i) => (
            <FractionBar key={i} parts={b.parts} shaded={b.shaded} tone={i % 2 ? "primary" : "secondary"} />
          ))}
        </div>
      );
    case "numberLine":
      return <NumberLine parts={visual.parts} mark={visual.mark} wholes={visual.wholes} />;
    case "areaGrid":
      return (
        <div className="inline-grid gap-0 overflow-hidden rounded-lg border-[3px] border-foreground/80" style={{ gridTemplateColumns: `repeat(${visual.w}, minmax(0, 1fr))` }}>
          {Array.from({ length: visual.w * visual.h }, (_, i) => (
            <span key={i} className="block size-9 border border-sunny-deep bg-sunny sm:size-11" />
          ))}
        </div>
      );
    case "rect":
      return <Rect w={visual.w} h={visual.h} unit={visual.unit} labelH={visual.labelH} />;
    case "decimalGrid":
      return (
        <div className="grid size-56 grid-flow-col grid-rows-10 grid-cols-10 overflow-hidden rounded-lg border-[3px] border-foreground/80 bg-card sm:size-64">
          {Array.from({ length: 100 }, (_, i) => (
            <span key={i} className={cn("border border-border", i < visual.shaded && "bg-secondary")} />
          ))}
        </div>
      );
  }
}

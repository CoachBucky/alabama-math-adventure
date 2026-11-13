import { Delete } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  allowDecimal?: boolean | undefined;
  disabled?: boolean | undefined;
  unit?: string | undefined;
}

const MAX = 7;

export function NumberPad({ value, onChange, onSubmit, allowDecimal, disabled, unit }: Props) {
  const press = (key: string) => {
    if (disabled) return;
    if (key === "del") return onChange(value.slice(0, -1));
    if (key === "." && (!allowDecimal || value.includes("."))) return;
    if (value.length >= MAX) return;
    onChange(value + key);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (disabled) return;
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === ".") press(".");
      else if (e.key === "Backspace") press("del");
      else if (e.key === "Enter" && value) onSubmit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", allowDecimal ? "." : "", "0", "del"];

  return (
    <div className="mx-auto flex w-full max-w-xs flex-col items-center gap-3">
      <div className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl border-[3px] border-secondary bg-card px-4 font-display text-4xl font-bold">
        <span className={cn(!value && "text-muted-foreground/50")}>{value || "?"}</span>
        {unit && <span className="text-base font-semibold text-muted-foreground">{unit}</span>}
      </div>
      <div className="grid w-full grid-cols-3 gap-2.5">
        {keys.map((k, i) =>
          k === "" ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => press(k)}
              aria-label={k === "del" ? "Delete" : k === "." ? "Decimal point" : k}
              className={cn(
                "press-3d shadow-press flex h-14 items-center justify-center rounded-2xl border-2 border-border bg-card font-display text-2xl font-semibold disabled:opacity-50",
                k === "del" && "bg-coral-soft",
              )}
            >
              {k === "del" ? <Delete className="size-6" /> : k}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

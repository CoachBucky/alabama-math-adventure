import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRow({ stars, size = "sm", animate }: { stars: number; size?: "sm" | "md" | "lg"; animate?: boolean }) {
  const cls = size === "lg" ? "size-14" : size === "md" ? "size-7" : "size-4";
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${stars} of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <Star
          key={i}
          className={cn(cls, i < stars ? "fill-sunny text-sunny-deep" : "fill-muted text-border", animate && i < stars && "animate-star-pop")}
          style={animate ? { animationDelay: `${0.3 + i * 0.25}s` } : undefined}
          strokeWidth={2.5}
        />
      ))}
    </span>
  );
}

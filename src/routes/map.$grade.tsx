import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, Lock, Play } from "lucide-react";
import { useEffect, useState } from "react";
import map3 from "@/assets/map-grade3.jpg";
import map4 from "@/assets/map-grade4.jpg";
import { StarRow } from "@/components/game/StarRow";
import { TopBar } from "@/components/game/TopBar";
import { Button } from "@/components/ui/button";
import { GRADES, parseGrade, worldsForGrade } from "@/lib/game/curriculum";
import { useProfile } from "@/lib/game/progress";
import { isLevelUnlocked } from "@/lib/game/rules";
import type { Grade, World } from "@/lib/game/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/map/$grade")({
  loader: ({ params }) => {
    const grade = parseGrade(params.grade);
    if (!grade) throw notFound();
    return { grade };
  },
  head: ({ loaderData }) => {
    const g = loaderData?.grade;
    const island = GRADES.find((x) => x.grade === g)?.island ?? "Adventure map";
    const title = g ? `${island} · Grade ${g} map — Math Quest Alabama` : "Adventure map — Math Quest Alabama";
    const description = g
      ? `Choose a world on ${island} to practice Grade ${g} math skills for ACAP.`
      : "Choose a world to practice math skills.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: MapPage,
});

const MAPS: Record<Grade, string> = { 3: map3, 4: map4 };

const toneNode: Record<World["tone"], string> = {
  coral: "bg-primary [--press-shadow:var(--primary-deep)]",
  teal: "bg-secondary [--press-shadow:var(--secondary-deep)]",
  sunny: "bg-sunny [--press-shadow:var(--sunny-deep)]",
};
const toneSoft: Record<World["tone"], string> = {
  coral: "bg-coral-soft",
  teal: "bg-teal-soft",
  sunny: "bg-sunny-soft",
};

function MapPage() {
  const { grade } = Route.useLoaderData();
  const profile = useProfile();
  const worlds = worldsForGrade(grade);
  const island = GRADES.find((g) => g.grade === grade)!.island;
  const [selectedId, setSelectedId] = useState(worlds[0]!.id);

  const worldStars = (w: World) => w.levels.reduce((s, l) => s + (profile.levels[l.id]?.stars ?? 0), 0);
  const earned = worlds.reduce((s, w) => s + worldStars(w), 0);
  const possible = worlds.length * 9;

  // Start on the first world that still has stars to earn.
  useEffect(() => {
    const next = worlds.find((w) => worldStars(w) < 9);
    if (next) setSelectedId(next.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grade, Object.keys(profile.levels).length]);

  const selected = worlds.find((w) => w.id === selectedId) ?? worlds[0]!;
  const pathD = worlds.map((w, i) => `${i === 0 ? "M" : "L"} ${w.pos.x} ${w.pos.y}`).join(" ");

  return (
    <div className="min-h-screen bg-sky">
      <TopBar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-display font-semibold text-secondary-deep">Grade {grade}</p>
            <h1 className="text-4xl font-bold sm:text-5xl">{island}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-card px-4 py-2 shadow-card">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Island stars</p>
              <p className="font-display text-2xl font-bold">
                ⭐ {earned} <span className="text-base text-muted-foreground">/ {possible}</span>
              </p>
            </div>
            <Link
              to="/map/$grade"
              params={{ grade: grade === 3 ? "4" : "3" }}
              className="rounded-full border-2 border-border bg-card px-4 py-2 font-display font-semibold text-muted-foreground hover:bg-muted"
            >
              Go to Grade {grade === 3 ? 4 : 3}
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="relative aspect-[1600/1008] overflow-hidden rounded-[2rem] border-4 border-card shadow-card">
            <img src={MAPS[grade]} alt={`Illustrated map of ${island}`} width={1600} height={1008} className="absolute inset-0 size-full object-cover" />
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
              <path d={pathD} fill="none" stroke="var(--card)" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" opacity={0.9} />
              <path d={pathD} fill="none" stroke="var(--primary-deep)" strokeWidth={3} strokeDasharray="2 10" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
            {worlds.map((w, i) => {
              const stars = worldStars(w);
              const active = w.id === selected.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setSelectedId(w.id)}
                  className="group absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${w.pos.x}%`, top: `${w.pos.y}%` }}
                  aria-label={`${w.name}, ${stars} of 9 stars`}
                >
                  <span
                    className={cn(
                      "press-3d shadow-press relative flex size-11 items-center justify-center rounded-full border-4 border-card text-xl sm:size-16 sm:text-3xl",
                      toneNode[w.tone],
                      active && "animate-pulse-ring scale-110",
                    )}
                  >
                    {w.icon}
                    <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-card font-display text-xs font-bold sm:size-6 sm:text-sm">
                      {i + 1}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "absolute left-1/2 top-full mt-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-card px-3 py-1 font-display text-sm font-semibold shadow-card md:block",
                      active && "bg-foreground text-background",
                    )}
                  >
                    {w.name} · ⭐{stars}
                  </span>
                </button>
              );
            })}
          </div>

          <aside className={cn("rounded-[2rem] border-4 border-card p-5 shadow-card", toneSoft[selected.tone])}>
            <div className="flex items-start gap-3">
              <span className={cn("flex size-14 shrink-0 items-center justify-center rounded-2xl text-3xl", toneNode[selected.tone])}>{selected.icon}</span>
              <div>
                <h2 className="text-2xl font-bold leading-tight">{selected.name}</h2>
                <p className="text-muted-foreground">{selected.tagline}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {selected.levels.map((l) => {
                const rec = profile.levels[l.id];
                const unlocked = isLevelUnlocked(l, profile.levels);
                return (
                  <div key={l.id} className={cn("flex items-center gap-3 rounded-2xl bg-card p-3", !unlocked && "opacity-60")}>
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted font-display text-lg font-bold">
                      {rec && rec.stars > 0 ? <Check className="size-6 text-success" strokeWidth={3} /> : l.n}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg font-semibold leading-tight">{l.title}</p>
                      <p className="truncate text-sm text-muted-foreground">{l.focus}</p>
                      <StarRow stars={rec?.stars ?? 0} />
                    </div>
                    {unlocked ? (
                      <Button asChild variant="coral" size="round" aria-label={`Play ${l.title}`}>
                        <Link to="/play/$levelId" params={{ levelId: l.id }}>
                          <Play className="fill-current" />
                        </Link>
                      </Button>
                    ) : (
                      <span className="flex size-12 items-center justify-center rounded-full bg-muted" title="Earn 1 star on the level before to unlock">
                        <Lock className="size-5 text-muted-foreground" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl bg-card/70 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">You'll practice</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {selected.skills.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="text-secondary-deep">●</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {worlds.map((w, i) => (
            <button
              key={w.id}
              type="button"
              onClick={() => setSelectedId(w.id)}
              className={cn(
                "press-3d shadow-press flex items-center gap-2 rounded-2xl border-[3px] bg-card p-3 text-left",
                w.id === selected.id ? "border-secondary [--press-shadow:var(--secondary-deep)]" : "border-border",
              )}
            >
              <span className="text-2xl">{w.icon}</span>
              <span className="min-w-0">
                <span className="block truncate font-display font-semibold leading-tight">
                  {i + 1}. {w.name}
                </span>
                <span className="text-sm text-muted-foreground">⭐ {worldStars(w)} / 9</span>
              </span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

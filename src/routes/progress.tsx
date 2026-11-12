import { createFileRoute, Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import chest from "@/assets/treasure-chest.png";
import { StarRow } from "@/components/game/StarRow";
import { TopBar } from "@/components/game/TopBar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { GRADES, worldsForGrade } from "@/lib/game/curriculum";
import { resetProgress, useProfile } from "@/lib/game/progress";
import { isLevelUnlocked, masteryFor, type Mastery } from "@/lib/game/rules";
import type { World } from "@/lib/game/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Trophy Room — Math Quest Alabama" },
      { name: "description", content: "See your stars, coins and how strong each math skill is getting." },
      { property: "og:title", content: "Trophy Room — Math Quest Alabama" },
      { property: "og:description", content: "Stars, coins and skill mastery for every Math Quest world." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProgressPage,
});

const MASTERY: Record<Mastery, { label: string; cls: string; bar: string }> = {
  "not-started": { label: "Not started", cls: "bg-muted text-muted-foreground", bar: "bg-border" },
  learning: { label: "Learning", cls: "bg-coral-soft text-primary-deep", bar: "bg-primary" },
  growing: { label: "Growing", cls: "bg-sunny-soft text-sunny-foreground", bar: "bg-sunny" },
  mastered: { label: "Mastered", cls: "bg-success-soft text-success", bar: "bg-success" },
};

function ProgressPage() {
  const profile = useProfile();
  const totalStars = Object.values(profile.levels).reduce((s, l) => s + l.stars, 0);
  const gradesToShow = profile.grade ? [profile.grade, ...GRADES.map((g) => g.grade).filter((g) => g !== profile.grade)] : GRADES.map((g) => g.grade);

  // Suggest the weakest skill that has been tried, or the first untried one, in the explorer's grade.
  const mine = worldsForGrade(profile.grade ?? 3);
  const tried = mine.filter((w) => (profile.skills[w.id]?.total ?? 0) > 0);
  const weakest = [...tried].sort((a, b) => acc(profile.skills[a.id]) - acc(profile.skills[b.id]))[0];
  const suggestion: World | undefined =
    weakest && acc(profile.skills[weakest.id]) < 0.85 ? weakest : mine.find((w) => !profile.skills[w.id]) ?? weakest;
  const suggestedLevel = suggestion
    ? [...suggestion.levels].reverse().find((l) => isLevelUnlocked(l, profile.levels)) ?? suggestion.levels[0]
    : null;

  return (
    <div className="min-h-screen bg-sky">
      <TopBar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="grid items-center gap-6 rounded-[2rem] border-4 border-card bg-card p-6 shadow-card sm:grid-cols-[auto_1fr_auto] sm:p-8">
          <img src={chest} alt="Treasure chest" width={816} height={816} className="mx-auto w-36" />
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold">{profile.name ? `${profile.name}'s Trophy Room` : "Trophy Room"}</h1>
            <p className="mt-1 text-muted-foreground">Every star shows a skill getting stronger.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
              <span className="rounded-2xl bg-sunny-soft px-4 py-2 font-display text-2xl font-bold">⭐ {totalStars} stars</span>
              <span className="rounded-2xl bg-sunny-soft px-4 py-2 font-display text-2xl font-bold">🪙 {profile.coins} coins</span>
            </div>
          </div>
          {suggestion && suggestedLevel && (
            <div className="rounded-3xl bg-teal-soft p-4 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-secondary-deep">Finn suggests</p>
              <p className="mt-1 font-display text-lg font-semibold">
                {suggestion.icon} {suggestion.name}
              </p>
              <Button asChild variant="teal" size="game" className="mt-3">
                <Link to="/play/$levelId" params={{ levelId: suggestedLevel.id }}>
                  <Play className="fill-current" /> Practice
                </Link>
              </Button>
            </div>
          )}
        </section>

        {gradesToShow.map((grade) => (
          <section key={grade} className="mt-10">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-bold">
                Grade {grade} · {GRADES.find((g) => g.grade === grade)?.island}
              </h2>
              <Link to="/map/$grade" params={{ grade: String(grade) }} className="font-display font-semibold text-secondary-deep hover:underline">
                Open map →
              </Link>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {worldsForGrade(grade).map((w) => {
                const s = profile.skills[w.id] ?? { correct: 0, total: 0 };
                const m = masteryFor(s.correct, s.total);
                const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
                return (
                  <div key={w.id} className="rounded-3xl border-[3px] border-border bg-card p-5">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{w.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-xl font-semibold leading-tight">{w.name}</p>
                        <p className="text-sm text-muted-foreground">{w.domain}</p>
                      </div>
                      <span className={cn("rounded-full px-3 py-1 font-display text-sm font-semibold", MASTERY[m].cls)}>{MASTERY[m].label}</span>
                    </div>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
                      <div className={cn("h-full rounded-full transition-all", MASTERY[m].bar)} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {s.total ? `${pct}% right on the first try · ${s.total} questions` : "No questions answered yet"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {w.levels.map((l) => (
                        <span key={l.id} className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-semibold">
                          {l.title} <StarRow stars={profile.levels[l.id]?.stars ?? 0} />
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <div className="mt-12 flex justify-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="text-muted-foreground">
                Start over on this device
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Start over?</AlertDialogTitle>
                <AlertDialogDescription>
                  This clears all stars, coins and skill progress saved on this device. Your name and grade stay.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep my progress</AlertDialogCancel>
                <AlertDialogAction onClick={resetProgress}>Yes, start over</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
    </div>
  );
}

function acc(s?: { correct: number; total: number }) {
  return s && s.total ? s.correct / s.total : 0;
}

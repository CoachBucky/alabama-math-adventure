import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import fox from "@/assets/fox-mascot.png";
import map3 from "@/assets/map-grade3.jpg";
import map4 from "@/assets/map-grade4.jpg";
import { Button } from "@/components/ui/button";
import { GRADES } from "@/lib/game/curriculum";
import { updateProfile, useProfile } from "@/lib/game/progress";
import type { Grade } from "@/lib/game/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Math Quest Alabama — Start your math adventure" },
      {
        name: "description",
        content:
          "Pick your island and start a math adventure. Grade 3 and Grade 4 practice aligned to the Alabama Numeracy Act and ACAP.",
      },
      { property: "og:title", content: "Math Quest Alabama — Start your math adventure" },
      {
        property: "og:description",
        content: "Explore islands, solve math puzzles and earn treasure. Built for Alabama grades 3 & 4.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const MAPS: Record<Grade, string> = { 3: map3, 4: map4 };

function Home() {
  const profile = useProfile();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<Grade | null>(null);

  useEffect(() => {
    if (profile.name) setName(profile.name);
    if (profile.grade) setGrade(profile.grade);
  }, [profile.name, profile.grade]);

  const start = () => {
    if (!grade) return;
    updateProfile((p) => ({ ...p, name: name.trim() || "Explorer", grade }));
    navigate({ to: "/map/$grade", params: { grade: String(grade) } });
  };

  return (
    <main className="min-h-screen bg-sunburst">
      <div className="bg-dots">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1fr_1.1fr] lg:py-16">
          <section className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 font-display text-sm font-semibold text-secondary-deep shadow-card">
              🗺️ Alabama Numeracy · ACAP practice
            </span>
            <h1 className="mt-5 text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
              Math <span className="text-primary">Quest</span>
              <br />
              <span className="text-secondary">Alabama</span>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground lg:mx-0">
              Sail to treasure islands, solve math puzzles, and collect stars and coins on your adventure!
            </p>
            <img
              src={fox}
              alt="Finn the fox explorer waving"
              width={1024}
              height={1024}
              className="mx-auto mt-6 w-56 animate-bob drop-shadow-xl sm:w-72 lg:mx-0"
            />
          </section>

          <section className="rounded-[2rem] border-4 border-card bg-card/95 p-6 shadow-card sm:p-8">
            <h2 className="text-2xl font-bold sm:text-3xl">
              {profile.name ? `Welcome back, ${profile.name}!` : "Hi, explorer! I'm Finn."}
            </h2>
            <label htmlFor="explorer-name" className="mt-5 block font-display text-lg font-semibold">
              What's your explorer name?
            </label>
            <input
              id="explorer-name"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 20))}
              placeholder="Type your first name"
              autoComplete="off"
              className="mt-2 h-14 w-full rounded-2xl border-[3px] border-border bg-background px-4 font-display text-xl font-semibold outline-none transition focus:border-secondary"
            />

            <p className="mt-6 font-display text-lg font-semibold">Pick your island</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {GRADES.map((g) => (
                <button
                  key={g.grade}
                  type="button"
                  onClick={() => setGrade(g.grade)}
                  aria-pressed={grade === g.grade}
                  className={cn(
                    "press-3d shadow-press overflow-hidden rounded-3xl border-[3px] bg-card text-left",
                    grade === g.grade
                      ? "border-secondary [--press-shadow:var(--secondary-deep)]"
                      : "border-border",
                  )}
                >
                  <img src={MAPS[g.grade]} alt="" width={1600} height={1008} loading="lazy" className="h-28 w-full object-cover" />
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-2xl font-bold">Grade {g.grade}</span>
                      {grade === g.grade && (
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 font-display text-sm font-semibold text-secondary-foreground">
                          Picked!
                        </span>
                      )}
                    </div>
                    <p className="font-display font-semibold text-secondary-deep">{g.island}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{g.blurb}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {["K", "1", "2", "5"].map((g) => (
                <span key={g} className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground">
                  <Lock className="size-3.5" /> Grade {g} soon
                </span>
              ))}
            </div>

            <Button variant="coral" size="xl" className="mt-7 w-full" disabled={!grade} onClick={start}>
              {profile.name ? "Continue adventure" : "Start adventure"} <ArrowRight />
            </Button>
          </section>
        </div>

        <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-4 px-5 pb-10 text-sm text-muted-foreground lg:justify-start">
          <Link to="/guide" className="inline-flex items-center gap-1.5 font-semibold text-secondary-deep hover:underline">
            <BookOpen className="size-4" /> For teachers & families
          </Link>
          <span>Progress is saved on this device. No sign-up needed.</span>
        </footer>
      </div>
    </main>
  );
}

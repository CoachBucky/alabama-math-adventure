import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import fox from "@/assets/fox-mascot.png";
import { GRADES, worldsForGrade } from "@/lib/game/curriculum";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "Teacher & family guide — Math Quest Alabama" },
      {
        name: "description",
        content:
          "How Math Quest Alabama supports the Alabama Numeracy Act and ACAP math: skills covered in grades 3 and 4, how stars and hints work, and tips for use.",
      },
      { property: "og:title", content: "Teacher & family guide — Math Quest Alabama" },
      {
        property: "og:description",
        content: "Skills covered, how practice works, and tips for classrooms and homes.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GuidePage,
});

function GuidePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-5 py-10">
        <Link to="/" className="inline-flex items-center gap-1.5 font-display font-semibold text-secondary-deep hover:underline">
          <ArrowLeft className="size-4" /> Back to Math Quest
        </Link>
        <header className="mt-6 flex items-center gap-5">
          <img src={fox} alt="" width={96} height={96} className="hidden size-24 sm:block" />
          <div>
            <h1 className="text-4xl font-bold sm:text-5xl">Teacher & family guide</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Math Quest gives students short, game-like practice on the grade 3 and 4 skills emphasized by the Alabama
              Numeracy Act and assessed on ACAP math.
            </p>
          </div>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { t: "8 questions per level", d: "Short rounds fit a center rotation or a few minutes at home." },
            { t: "Hint, then try again", d: "A wrong first answer shows a hint. A second miss shows the answer and a worked explanation." },
            { t: "Read-aloud on every question", d: "Tap the speaker to hear questions, hints and explanations, so reading doesn't block math." },
          ].map((c) => (
            <div key={c.t} className="rounded-3xl bg-card p-5 shadow-card">
              <p className="font-display text-lg font-semibold">{c.t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-3xl bg-sunny-soft p-6">
          <h2 className="text-2xl font-bold">How stars work</h2>
          <ul className="mt-3 space-y-1.5">
            <li>⭐⭐⭐ 7–8 correct on the first try (85%+)</li>
            <li>⭐⭐ 6 correct (75%+)</li>
            <li>⭐ 5 correct (60%+) — unlocks the next level in that world</li>
            <li>Below 5: “So close!” and an invitation to try again</li>
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            Mastery on the Trophy Room page uses first-try accuracy. A skill shows “Mastered” after at least 8 questions
            at 85% or higher. Questions are generated fresh each time, so replaying gives new practice.
          </p>
        </section>

        {GRADES.map((g) => (
          <section key={g.grade} className="mt-10">
            <h2 className="text-3xl font-bold">
              Grade {g.grade} · {g.island}
            </h2>
            <div className="mt-4 space-y-4">
              {worldsForGrade(g.grade).map((w) => (
                <div key={w.id} className="rounded-3xl border-2 border-border bg-card p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-xl font-semibold">
                      {w.icon} {w.name}
                    </h3>
                    <span className="rounded-full bg-teal-soft px-3 py-1 text-sm font-semibold text-secondary-deep">{w.domain}</span>
                  </div>
                  <ul className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
                    {w.skills.map((s) => (
                      <li key={s} className="flex gap-2">
                        <span className="text-primary">●</span> {s}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Levels: {w.levels.map((l) => `${l.title} (${l.focus})`).join(" → ")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="mt-10 rounded-3xl bg-teal-soft p-6">
          <h2 className="text-2xl font-bold">Good to know</h2>
          <ul className="mt-3 space-y-2">
            <li>• No accounts or sign-up. Progress is saved in the browser on each device.</li>
            <li>• Shared devices: use “Start over on this device” in the Trophy Room between students.</li>
            <li>• Read-aloud uses the device’s built-in voice; quality varies by browser.</li>
            <li>• Kindergarten through grade 2 and grade 5 islands are planned next.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}

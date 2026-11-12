import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Lightbulb, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import fox from "@/assets/fox-mascot.png";
import chest from "@/assets/treasure-chest.png";
import { Confetti } from "@/components/game/Confetti";
import { MathText } from "@/components/game/MathText";
import { NumberPad } from "@/components/game/NumberPad";
import { ReadAloudButton } from "@/components/game/ReadAloudButton";
import { StarRow } from "@/components/game/StarRow";
import { Visual } from "@/components/game/Visual";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { findLevel } from "@/lib/game/curriculum";
import { generateLevel } from "@/lib/game/generators";
import { recordLevel, updateProfile, useProfile } from "@/lib/game/progress";
import { coinsForAnswer, isCorrect, QUESTIONS_PER_LEVEL, starsFor, type Stars } from "@/lib/game/rules";
import { sounds } from "@/lib/game/sound";
import { speak, stopSpeaking } from "@/lib/game/speech";
import type { Question } from "@/lib/game/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/play/$levelId")({
  loader: ({ params }) => {
    const found = findLevel(params.levelId);
    if (!found) throw notFound();
    return { levelId: params.levelId };
  },
  head: ({ loaderData }) => {
    const found = loaderData ? findLevel(loaderData.levelId) : null;
    const title = found ? `${found.world.name}: ${found.level.title} — Math Quest Alabama` : "Play — Math Quest Alabama";
    const description = found
      ? `Grade ${found.world.grade} practice: ${found.level.focus}. ${found.world.domain}.`
      : "Solve math puzzles to earn stars and coins.";
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
  component: PlayPage,
});

type Phase = "answer" | "retry" | "correct" | "reveal";
type Result = "first" | "second" | "miss";

const CHEERS = ["Awesome!", "You got it!", "Super smart!", "Great job!", "Way to go!", "Nailed it!"];

function choiceSpeech(c: string) {
  return c === ">" ? "greater than" : c === "<" ? "less than" : c === "=" ? "equal to" : c;
}
function readText(q: Question) {
  const base = q.prompt.replace(/^Compare:/, "Compare");
  return q.choices ? `${base}. Is it: ${q.choices.map(choiceSpeech).join(", or ")}?` : base;
}

function PlayPage() {
  const { levelId } = Route.useLoaderData();
  const { world, level } = findLevel(levelId)!;
  const profile = useProfile();
  const sound = profile.settings.sound;

  const [round, setRound] = useState(0);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("answer");
  const [typed, setTyped] = useState("");
  const [wrongPicks, setWrongPicks] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [streak, setStreak] = useState(0);
  const [coins, setCoins] = useState(0);
  const [cheer, setCheer] = useState(CHEERS[0]);
  const [shake, setShake] = useState(0);
  const [finished, setFinished] = useState<{ stars: Stars; correct: number } | null>(null);

  // Questions are random, so build them on the client after mount.
  useEffect(() => {
    setQuestions(generateLevel(world.id, level.n, QUESTIONS_PER_LEVEL, Math.random));
    setIdx(0);
    setPhase("answer");
    setTyped("");
    setWrongPicks([]);
    setPicked(null);
    setResults([]);
    setStreak(0);
    setCoins(0);
    setFinished(null);
  }, [world.id, level.n, round]);

  const q = questions?.[idx];

  useEffect(() => {
    if (q && profile.settings.autoRead && phase === "answer") speak(readText(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  useEffect(() => () => stopSpeaking(), []);

  const submit = useCallback(
    (value: string) => {
      if (!q || (phase !== "answer" && phase !== "retry")) return;
      setPicked(value);
      if (isCorrect(value, q.answer)) {
        const firstTry = phase === "answer";
        const nextStreak = firstTry ? streak + 1 : 0;
        setStreak(nextStreak);
        setCoins((c) => c + coinsForAnswer(firstTry, nextStreak));
        setResults((r) => [...r, firstTry ? "first" : "second"]);
        setCheer(CHEERS[Math.floor(Math.random() * CHEERS.length)]);
        setPhase("correct");
        if (sound) sounds.correct();
      } else {
        setStreak(0);
        setShake((s) => s + 1);
        if (sound) sounds.wrong();
        if (phase === "answer") {
          setWrongPicks([value]);
          setPhase("retry");
        } else {
          setResults((r) => [...r, "miss"]);
          setPhase("reveal");
        }
      }
    },
    [q, phase, streak, sound],
  );

  const next = () => {
    if (!questions) return;
    stopSpeaking();
    if (idx + 1 >= questions.length) {
      const correct = results.filter((r) => r === "first").length;
      const stars = starsFor(correct, questions.length);
      recordLevel(level.id, world.id, { correct, total: questions.length, stars, coins });
      setFinished({ stars, correct });
      if (sound) sounds.win();
      return;
    }
    setIdx((i) => i + 1);
    setPhase("answer");
    setTyped("");
    setWrongPicks([]);
    setPicked(null);
  };

  if (finished && questions) {
    return (
      <Finish
        worldName={world.name}
        grade={world.grade}
        levelTitle={level.title}
        nextLevelId={level.n < 3 && finished.stars > 0 ? `${world.id}-${level.n + 1}` : null}
        stars={finished.stars}
        correct={finished.correct}
        total={questions.length}
        coins={coins}
        onReplay={() => setRound((r) => r + 1)}
      />
    );
  }

  const locked = phase === "correct" || phase === "reveal";

  return (
    <div className="flex min-h-screen flex-col bg-sky">
      <header className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 pt-4">
        <Link
          to="/map/$grade"
          params={{ grade: String(world.grade) }}
          aria-label="Back to map"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-card text-muted-foreground shadow-card hover:text-foreground"
        >
          <X className="size-6" />
        </Link>
        <div className="flex flex-1 gap-1.5" aria-label={`Question ${idx + 1} of ${QUESTIONS_PER_LEVEL}`}>
          {Array.from({ length: QUESTIONS_PER_LEVEL }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-4 flex-1 rounded-full bg-card",
                results[i] === "first" && "bg-success",
                results[i] === "second" && "bg-sunny",
                results[i] === "miss" && "bg-primary",
                i === idx && !results[i] && "bg-secondary/40 ring-2 ring-secondary",
              )}
            />
          ))}
        </div>
        <span className={cn("rounded-full bg-card px-3 py-1.5 font-display font-bold shadow-card", streak >= 3 && "bg-coral-soft text-primary-deep")} title="Streak">
          🔥 {streak}
        </span>
        <span className="hidden rounded-full bg-card px-3 py-1.5 font-display font-bold shadow-card sm:inline" title="Coins this level">
          🪙 {coins}
        </span>
      </header>

      <div className="mx-auto mt-2 flex w-full max-w-4xl items-center justify-between px-4 text-sm">
        <p className="font-display font-semibold text-muted-foreground">
          {world.icon} {world.name} · {level.title}
        </p>
        <label className="flex items-center gap-2 font-semibold text-muted-foreground">
          Auto read
          <Switch
            checked={profile.settings.autoRead}
            onCheckedChange={(v) => updateProfile((p) => ({ ...p, settings: { ...p.settings, autoRead: v } }))}
            aria-label="Read every question aloud automatically"
          />
        </label>
      </div>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pb-6 pt-4">
        {!q ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <img src={fox} alt="" width={160} height={160} className="w-40 animate-bob" />
            <p className="font-display text-xl font-semibold">Packing your backpack…</p>
          </div>
        ) : (
          <>
            <section key={idx} className="animate-pop-in rounded-[2rem] border-4 border-card bg-card p-5 shadow-card sm:p-7">
              <div className="flex items-start gap-3">
                <ReadAloudButton text={readText(q)} label="Read the question aloud" />
                <h1 className="flex-1 pt-1.5 font-display text-2xl font-semibold leading-snug sm:text-3xl">
                  <MathText text={q.prompt} />
                </h1>
              </div>
              {q.visual && (
                <div className="mt-5 flex justify-center">
                  <Visual visual={q.visual} />
                </div>
              )}
            </section>

            <section key={`a-${idx}-${shake}`} className={cn("mt-5", shake > 0 && phase !== "correct" && "animate-wiggle")}>
              {q.choices ? (
                <div className={cn("grid gap-3", q.choices.length === 3 && q.choices[0].length <= 2 ? "grid-cols-3" : "sm:grid-cols-2")}>
                  {q.choices.map((c) => {
                    const isAnswer = isCorrect(c, q.answer);
                    const wrong = wrongPicks.includes(c) || (phase === "reveal" && picked === c);
                    return (
                      <button
                        key={c}
                        type="button"
                        disabled={locked || wrong}
                        onClick={() => {
                          if (sound) sounds.tap();
                          submit(c);
                        }}
                        className={cn(
                          "press-3d shadow-press flex min-h-20 flex-col items-center justify-center rounded-3xl border-[3px] border-border bg-card px-4 py-3 font-display text-3xl font-semibold",
                          locked && isAnswer && "border-success bg-success-soft [--press-shadow:var(--success)]",
                          wrong && "border-primary bg-coral-soft line-through decoration-primary/60 opacity-70",
                          locked && !isAnswer && !wrong && "opacity-50",
                        )}
                      >
                        <MathText text={c} />
                        {[">", "<", "="].includes(c) && (
                          <span className="text-sm font-semibold text-muted-foreground no-underline">{choiceSpeech(c)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <NumberPad
                    value={locked ? (phase === "reveal" ? q.answer : typed) : typed}
                    onChange={setTyped}
                    onSubmit={() => submit(typed)}
                    allowDecimal={q.allowDecimal}
                    disabled={locked}
                    unit={q.unit}
                  />
                  {!locked && (
                    <Button variant="teal" size="game" className="w-full max-w-xs" disabled={!typed} onClick={() => submit(typed)}>
                      Check answer
                    </Button>
                  )}
                </div>
              )}
            </section>

            <Feedback
              phase={phase}
              question={q}
              cheer={cheer}
              coinsEarned={phase === "correct" && results[idx] === "first" ? coinsForAnswer(true, streak) : 0}
              onRetry={() => {
                setTyped("");
              }}
              onNext={next}
              last={idx + 1 >= (questions?.length ?? 0)}
            />
          </>
        )}
      </main>
    </div>
  );
}

function Feedback({
  phase,
  question,
  cheer,
  coinsEarned,
  onRetry,
  onNext,
  last,
}: {
  phase: Phase;
  question: Question;
  cheer: string;
  coinsEarned: number;
  onRetry: () => void;
  onNext: () => void;
  last: boolean;
}) {
  useEffect(() => {
    if (phase !== "correct" && phase !== "reveal") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") onNext();
    };
    const t = window.setTimeout(() => window.addEventListener("keydown", onKey), 150);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [phase, onNext]);

  if (phase === "answer") return null;

  if (phase === "retry") {
    return (
      <div className="mt-5 flex animate-pop-in items-start gap-3 rounded-3xl border-[3px] border-sunny-deep bg-sunny-soft p-4">
        <Lightbulb className="mt-0.5 size-7 shrink-0 text-sunny-deep" />
        <div className="flex-1">
          <p className="font-display text-lg font-bold">Not quite — try once more!</p>
          <p className="mt-1 text-lg">
            <MathText text={question.hint} />
          </p>
        </div>
        <ReadAloudButton text={`Hint. ${question.hint}`} label="Read the hint aloud" />
        {!question.choices && (
          <Button variant="paper" size="sm" onClick={onRetry} className="self-center">
            Clear
          </Button>
        )}
      </div>
    );
  }

  const good = phase === "correct";
  return (
    <div
      className={cn(
        "mt-5 flex animate-pop-in flex-col gap-4 rounded-3xl border-[3px] p-4 sm:flex-row sm:items-center",
        good ? "border-success bg-success-soft" : "border-primary bg-coral-soft",
      )}
    >
      <img src={fox} alt="" width={64} height={64} className="hidden size-16 sm:block" />
      <div className="flex-1">
        <p className="font-display text-2xl font-bold">
          {good ? cheer : "Let's learn this one!"}
          {coinsEarned > 0 && <span className="ml-2 text-lg text-sunny-foreground">+{coinsEarned} 🪙</span>}
        </p>
        <p className="mt-1 text-lg">
          {!good && (
            <>
              The answer is <strong><MathText text={question.answer} /></strong>.{" "}
            </>
          )}
          <MathText text={question.explanation} />
        </p>
      </div>
      <div className="flex items-center gap-2">
        <ReadAloudButton
          text={good ? question.explanation : `The answer is ${question.answer}. ${question.explanation}`}
          label="Read the explanation aloud"
        />
        <Button variant={good ? "teal" : "coral"} size="game" onClick={onNext} autoFocus>
          {last ? "Finish" : "Next"} <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

function Finish({
  worldName,
  grade,
  levelTitle,
  nextLevelId,
  stars,
  correct,
  total,
  coins,
  onReplay,
}: {
  worldName: string;
  grade: number;
  levelTitle: string;
  nextLevelId: string | null;
  stars: Stars;
  correct: number;
  total: number;
  coins: number;
  onReplay: () => void;
}) {
  const title = stars === 3 ? "Perfect treasure!" : stars === 2 ? "Super job!" : stars === 1 ? "You did it!" : "So close!";
  return (
    <div className="flex min-h-screen items-center justify-center bg-sunburst px-4 py-10">
      {stars > 0 && <Confetti />}
      <div className="w-full max-w-lg animate-pop-in rounded-[2.5rem] border-4 border-card bg-card p-8 text-center shadow-card">
        <p className="font-display font-semibold text-secondary-deep">
          {worldName} · {levelTitle}
        </p>
        <h1 className="mt-1 text-4xl font-bold sm:text-5xl">{title}</h1>
        <img src={chest} alt="Treasure chest full of coins and stars" width={816} height={816} className="mx-auto mt-4 w-48 animate-bob" />
        <div className="mt-2 flex justify-center">
          <StarRow stars={stars} size="lg" animate />
        </div>
        <p className="mt-4 text-lg">
          <strong>{correct}</strong> of {total} correct on the first try
        </p>
        <p className="mt-1 font-display text-2xl font-bold text-sunny-foreground">+{coins} 🪙 coins</p>
        {stars === 0 && (
          <p className="mx-auto mt-3 max-w-sm rounded-2xl bg-sunny-soft p-3 text-base">
            Get {Math.ceil(total * 0.6)} right on the first try to earn a star and unlock the next level. You can do it!
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3">
          {nextLevelId && (
            <Button asChild variant="coral" size="game">
              <Link to="/play/$levelId" params={{ levelId: nextLevelId }}>
                Next level <ArrowRight />
              </Link>
            </Button>
          )}
          <Button variant={nextLevelId ? "paper" : "coral"} size="game" onClick={onReplay}>
            <RotateCcw /> Play again
          </Button>
          <Button asChild variant="paper" size="game">
            <Link to="/map/$grade" params={{ grade: String(grade) }}>
              Back to map
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

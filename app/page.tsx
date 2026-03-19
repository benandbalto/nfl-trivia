"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Difficulty, TriviaQuiz } from "@/lib/triviaTypes";

const LOADING_MESSAGES = [
  "Huddling up questions...",
  "Reviewing the game film...",
  "Calling an audible...",
  "Checking the instant replay...",
  "Drawing up the play...",
  "Reading the defense...",
  "Almost at the end zone...",
];

function LoadingBar() {
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        const remaining = 90 - p;
        return p + remaining * 0.04;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2">
      <div className="h-3 w-full rounded bg-nfl-navy-deep overflow-hidden border border-nfl-border-light">
        <div
          className="h-full bg-nfl-field transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-nfl-gold-dim text-center animate-pulse scoreboard">
        {LOADING_MESSAGES[msgIndex]}
      </p>
    </div>
  );
}

const STORAGE_KEY = "nflTrivia.quiz";

export default function Home() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const difficulties = useMemo(
    () =>
      [
        { id: "easy", label: "EASY" },
        { id: "medium", label: "MEDIUM" },
        { id: "hard", label: "HARD" },
      ] as const,
    [],
  );

  async function startRound() {
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({ difficulty });
      if (theme.trim()) params.set("theme", theme.trim());
      const res = await fetch(
        `/api/generate-quiz?${params.toString()}`,
        { method: "GET" },
      );

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? `Request failed: ${res.status}`);
      }

      const quiz = (await res.json()) as TriviaQuiz;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(quiz));
      sessionStorage.setItem("nflTrivia.difficulty", difficulty);
      sessionStorage.removeItem("nflTrivia.answers");
      router.push("/quiz");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start round.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex flex-col bg-nfl-navy-deep">
      {/* Endzone header stripe */}
      <div className="endzone h-3" />

      <main className="flex-1 w-full max-w-xl mx-auto px-6 py-12">
        <div className="flex flex-col gap-6">
          <header className="space-y-1 text-center">
            <h1 className="font-heading text-5xl font-bold uppercase tracking-wide text-nfl-cream jumbotron-text">
              NFL Trivia
            </h1>
            <div className="flex items-center justify-center gap-3 text-nfl-text-dim text-sm">
              <span className="inline-block w-8 h-px bg-nfl-gold-dim" />
              <span className="uppercase tracking-widest text-xs">Pick your challenge</span>
              <span className="inline-block w-8 h-px bg-nfl-gold-dim" />
            </div>
          </header>

          <section className="retro-card p-5">
            <h2 className="font-heading text-lg font-semibold uppercase tracking-wide text-nfl-gold">
              Difficulty
            </h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {difficulties.map((d) => {
                const selected = d.id === difficulty;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id)}
                    disabled={loading}
                    className={[
                      "retro-btn rounded-md border-2 px-3 py-3 text-sm font-bold uppercase tracking-wider transition font-heading",
                      selected
                        ? "border-nfl-gold bg-nfl-gold text-nfl-navy-deep"
                        : "border-nfl-border-light bg-nfl-navy-deep text-nfl-cream hover:border-nfl-gold-dim hover:text-nfl-gold",
                    ].join(" ")}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="retro-card p-5">
            <h2 className="font-heading text-lg font-semibold uppercase tracking-wide text-nfl-gold">
              Theme
            </h2>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              disabled={loading}
              placeholder="e.g. Super Bowl upsets, Patrick Mahomes, 49ers history..."
              className="mt-3 w-full rounded-md border-2 border-nfl-border-light bg-nfl-navy-deep px-4 py-3 text-sm text-nfl-cream placeholder:text-nfl-text-dim focus:outline-none focus:border-nfl-gold disabled:opacity-60"
            />
            <p className="mt-2 text-xs text-nfl-text-dim">
              Leave blank for a random theme.
            </p>
          </section>

          <section className="space-y-3">
            <button
              type="button"
              onClick={startRound}
              disabled={loading}
              className="retro-btn w-full rounded-md bg-nfl-red border-2 border-nfl-red-dark text-nfl-cream px-5 py-4 font-heading font-bold text-lg uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Generating questions..." : "Start Round"}
            </button>

            {loading && <LoadingBar />}

            {error ? (
              <div className="rounded-md border-2 border-nfl-red-dark bg-nfl-red/20 text-nfl-cream px-4 py-3 text-sm">
                {error}
              </div>
            ) : (
              <div className="text-xs text-nfl-text-dim text-center">
                Powered by Claude. You&apos;ll get a new themed round each time.
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Endzone footer stripe */}
      <div className="endzone h-3" />
    </div>
  );
}

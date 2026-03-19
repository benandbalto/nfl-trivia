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
    // Animate progress from 0 to ~90 over ~12s (slows down as it approaches 90)
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
      <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center animate-pulse">
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
        { id: "easy", label: "Easy" },
        { id: "medium", label: "Medium" },
        { id: "hard", label: "Hard" },
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
    <div className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
      <main className="flex-1 w-full max-w-xl mx-auto px-6 py-14">
        <div className="flex flex-col gap-6">
          <header className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
              NFL Trivia
            </h1>
            <p className="text-zinc-700 dark:text-zinc-300">
              Pick a difficulty, then answer 15 multiple-choice questions.
            </p>
          </header>

          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
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
                      "rounded-xl border px-3 py-3 text-sm font-semibold transition",
                      selected
                        ? "border-zinc-950 dark:border-zinc-50 bg-zinc-950 text-white dark:bg-zinc-50 dark:text-black"
                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800",
                    ].join(" ")}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
              Theme
            </h2>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              disabled={loading}
              placeholder="e.g. Super Bowl upsets, Patrick Mahomes, 49ers history..."
              className="mt-3 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-50 disabled:opacity-60"
            />
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Leave blank for a random theme.
            </p>
          </section>

          <section className="space-y-3">
            <button
              type="button"
              onClick={startRound}
              disabled={loading}
              className="w-full rounded-2xl bg-zinc-950 text-white dark:bg-zinc-50 dark:text-black px-5 py-4 font-bold text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Generating questions..." : "Start Round"}
            </button>

            {loading && <LoadingBar />}

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200 px-4 py-3">
                {error}
              </div>
            ) : (
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Powered by Claude. You'll get a new themed round each time.
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

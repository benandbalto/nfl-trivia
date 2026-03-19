"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Difficulty, TriviaQuiz } from "@/lib/triviaTypes";
import ScoreCard from "@/components/ScoreCard";
import { difficultySchema } from "@/lib/triviaTypes";

const STORAGE_KEY = "nflTrivia.quiz";
const ANSWERS_KEY = "nflTrivia.answers";
const DIFFICULTY_KEY = "nflTrivia.difficulty";

type ScoreBreakdownItem = {
  question: string;
  choices: string[];
  correctIndex: number;
  selectedIndex: number | null;
  explanation: string;
};

function gradeLabel(percent: number) {
  if (percent >= 90) return "A";
  if (percent >= 80) return "B";
  if (percent >= 70) return "C";
  if (percent >= 60) return "D";
  return "F";
}

export default function ResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [quiz, setQuiz] = useState<TriviaQuiz | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [grade, setGrade] = useState<string>("—");
  const [breakdown, setBreakdown] = useState<ScoreBreakdownItem[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      const rawQuiz = sessionStorage.getItem(STORAGE_KEY);
      const rawAnswers = sessionStorage.getItem(ANSWERS_KEY);
      if (!rawQuiz || !rawAnswers) {
        setInitialLoading(false);
        return;
      }

      const parsedQuiz = JSON.parse(rawQuiz) as TriviaQuiz;
      const parsedAnswers = JSON.parse(rawAnswers) as Array<number | null>;

      const items = parsedQuiz.questions.map((q, idx) => {
        const selectedIndex = parsedAnswers[idx] ?? null;
        const isCorrect = selectedIndex === q.answerIndex;
        return {
          question: q.question,
          choices: q.choices,
          correctIndex: q.answerIndex,
          selectedIndex,
          explanation: q.explanation,
          isCorrect,
        };
      });

      const computedScore = items.reduce(
        (acc, item) => acc + (item.isCorrect ? 1 : 0),
        0,
      );
      const computedTotal = parsedQuiz.questions.length;
      const computedPercent =
        computedTotal <= 0
          ? 0
          : Math.round((computedScore / computedTotal) * 100);

      setQuiz(parsedQuiz);
      setScore(computedScore);
      setTotal(computedTotal);
      setGrade(gradeLabel(computedPercent));
      setBreakdown(
        items.map((it) => ({
          question: it.question,
          choices: it.choices,
          correctIndex: it.correctIndex,
          selectedIndex: it.selectedIndex,
          explanation: it.explanation,
        })),
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load the results.",
      );
    } finally {
      setInitialLoading(false);
    }
  }, []);

  // Play NFL on FOX theme when score > 80%
  useEffect(() => {
    if (initialLoading || !quiz || total === 0) return;
    const percent = Math.round((score / total) * 100);
    if (percent > 80 && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Autoplay blocked — ignore silently
      });
    }
  }, [initialLoading, quiz, score, total]);

  async function playAgain() {
    if (!quiz) return;
    setError(null);
    setLoading(true);
    try {
      const rawDifficulty = sessionStorage.getItem(DIFFICULTY_KEY);
      const parsedDifficulty = difficultySchema.safeParse(rawDifficulty);
      const difficulty: Difficulty = parsedDifficulty.success
        ? parsedDifficulty.data
        : "medium";

      const res = await fetch(
        `/api/generate-quiz?difficulty=${encodeURIComponent(difficulty)}`,
        { method: "GET" },
      );
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? `Request failed: ${res.status}`);
      }

      const nextQuiz = (await res.json()) as TriviaQuiz;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextQuiz));
      sessionStorage.removeItem(ANSWERS_KEY);
      router.push("/quiz");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate a new round.");
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
        <main className="flex-1 w-full max-w-xl mx-auto px-6 py-14 space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            NFL Trivia
          </h1>
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-4 text-zinc-700 dark:text-zinc-200">
            Loading results...
          </div>
        </main>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
        <main className="flex-1 w-full max-w-xl mx-auto px-6 py-14 space-y-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            NFL Trivia
          </h1>
          <div className="rounded-2xl border border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200 px-4 py-3">
            No results found. Start a round from the home page.
          </div>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full rounded-2xl bg-zinc-950 text-white dark:bg-zinc-50 dark:text-black px-5 py-4 font-bold text-base"
          >
            Back to Home
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
      <main className="flex-1 w-full max-w-xl mx-auto px-6 py-10 space-y-6">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200 px-4 py-3">
            {error}
          </div>
        ) : null}

        <ScoreCard
          theme={quiz.theme}
          score={score}
          total={total}
          gradeLabel={grade}
          breakdown={breakdown}
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              audioRef.current?.pause();
              router.push("/");
            }}
            className="w-1/2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-4 font-bold text-base text-zinc-800 dark:text-zinc-200"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => {
              audioRef.current?.pause();
              playAgain();
            }}
            disabled={loading}
            className="w-1/2 rounded-2xl bg-zinc-950 text-white dark:bg-zinc-50 dark:text-black px-5 py-4 font-bold text-base disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Generating..." : "Play Again"}
          </button>
        </div>

        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio ref={audioRef} src="/nfl-on-fox-theme.mp3" preload="auto" />
      </main>
    </div>
  );
}


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
      <div className="min-h-full flex flex-col bg-nfl-navy-deep">
        <div className="endzone h-3" />
        <main className="flex-1 w-full max-w-xl mx-auto px-6 py-14 space-y-3">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wide text-nfl-cream jumbotron-text">
            NFL Trivia
          </h1>
          <div className="retro-card px-5 py-4 text-nfl-cream">
            Loading results...
          </div>
        </main>
        <div className="endzone h-3" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-full flex flex-col bg-nfl-navy-deep">
        <div className="endzone h-3" />
        <main className="flex-1 w-full max-w-xl mx-auto px-6 py-14 space-y-4">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wide text-nfl-cream jumbotron-text">
            NFL Trivia
          </h1>
          <div className="rounded-md border-2 border-nfl-red-dark bg-nfl-red/20 text-nfl-cream px-4 py-3">
            No results found. Start a round from the home page.
          </div>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="retro-btn w-full rounded-md bg-nfl-red border-2 border-nfl-red-dark text-nfl-cream px-5 py-4 font-heading font-bold uppercase tracking-wider"
          >
            Back to Home
          </button>
        </main>
        <div className="endzone h-3" />
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-nfl-navy-deep">
      <div className="endzone h-3" />

      <main className="flex-1 w-full max-w-xl mx-auto px-6 py-10 space-y-6">
        {error ? (
          <div className="rounded-md border-2 border-nfl-red-dark bg-nfl-red/20 text-nfl-cream px-4 py-3 text-sm">
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
            className="retro-btn w-1/2 rounded-md border-2 border-nfl-border-light bg-nfl-navy px-5 py-4 font-heading font-bold uppercase tracking-wider text-nfl-cream hover:border-nfl-gold-dim"
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
            className="retro-btn w-1/2 rounded-md bg-nfl-red border-2 border-nfl-red-dark px-5 py-4 font-heading font-bold uppercase tracking-wider text-nfl-cream disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Generating..." : "Play Again"}
          </button>
        </div>

        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio ref={audioRef} src="/nfl-on-fox-theme.mp3" preload="auto" />
      </main>

      <div className="endzone h-3" />
    </div>
  );
}

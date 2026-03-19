"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { TriviaQuiz } from "@/lib/triviaTypes";
import QuestionCard from "@/components/QuestionCard";
import ProgressBar from "@/components/ProgressBar";

/* eslint-disable react-hooks/set-state-in-effect */

const STORAGE_KEY = "nflTrivia.quiz";
const ANSWERS_KEY = "nflTrivia.answers";

type SelectedAnswers = Array<number | null>;

export default function QuizPage() {
  const router = useRouter();
  const [quiz, setQuiz] = useState<TriviaQuiz | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<SelectedAnswers>(() =>
    Array.from({ length: 10 }, () => null),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const rawQuiz = sessionStorage.getItem(STORAGE_KEY);
      if (!rawQuiz) {
        setError("No active round found. Start a round from the home page.");
        return;
      }

      const parsedQuiz = JSON.parse(rawQuiz) as TriviaQuiz;
      setQuiz(parsedQuiz);

      const rawAnswers = sessionStorage.getItem(ANSWERS_KEY);
      if (rawAnswers) {
        const parsedAnswers = JSON.parse(rawAnswers) as SelectedAnswers;
        if (Array.isArray(parsedAnswers)) {
          setAnswers((prev) => {
            const next = [...prev];
            for (let i = 0; i < Math.min(next.length, parsedAnswers.length); i++) {
              next[i] = parsedAnswers[i] ?? null;
            }
            return next;
          });
        }
      }
    } catch {
      setError("Failed to load the quiz. Please start a new round.");
    }
  }, []);

  const total = quiz?.questions.length ?? 10;
  const question = quiz?.questions[current];
  const selectedIndex = answers[current] ?? null;
  const revealed = selectedIndex !== null;

  const correctIndex = useMemo(() => {
    if (!question) return 0;
    return question.answerIndex;
  }, [question]);

  function handleSelect(idx: number) {
    if (!quiz || revealed) return;

    const next = [...answers];
    next[current] = idx;
    setAnswers(next);
    sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(next));
  }

  function goNext() {
    if (!quiz) return;
    if (current < total - 1) {
      setCurrent((c) => c + 1);
      return;
    }
    router.push("/results");
  }

  if (error) {
    return (
      <div className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
        <main className="flex-1 w-full max-w-xl mx-auto px-6 py-14">
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50">
              NFL Trivia
            </h1>
            <div className="rounded-2xl border border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200 px-4 py-3">
              {error}
            </div>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full rounded-2xl bg-zinc-950 text-white dark:bg-zinc-50 dark:text-black px-5 py-4 font-bold text-base"
            >
              Back to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!quiz || !question) {
    return (
      <div className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
        <main className="flex-1 w-full max-w-xl mx-auto px-6 py-14">
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
              NFL Trivia
            </h1>
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-4 text-zinc-700 dark:text-zinc-200">
              Loading your round...
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
      <main className="flex-1 w-full max-w-xl mx-auto px-6 py-10 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Theme
            </div>
            <div className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
              {quiz.theme}
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Change Round
          </button>
        </div>

        <ProgressBar current={current} total={total} />

        <QuestionCard
          questionNumberLabel={`Question ${current + 1}`}
          question={question.question}
          choices={question.choices}
          selectedIndex={selectedIndex}
          revealed={revealed}
          correctIndex={correctIndex}
          explanation={revealed ? question.explanation : undefined}
          onSelect={handleSelect}
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem(ANSWERS_KEY);
              router.push("/");
            }}
            className="w-1/2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-4 font-bold text-base text-zinc-800 dark:text-zinc-200"
          >
            Quit
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={!revealed}
            className="w-1/2 rounded-2xl bg-zinc-950 text-white dark:bg-zinc-50 dark:text-black px-5 py-4 font-bold text-base disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {current < total - 1 ? "Next" : "See Results"}
          </button>
        </div>
      </main>
    </div>
  );
}


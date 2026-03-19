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
      <div className="min-h-full flex flex-col bg-nfl-navy-deep">
        <div className="endzone h-3" />
        <main className="flex-1 w-full max-w-xl mx-auto px-6 py-14">
          <div className="space-y-4">
            <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-nfl-cream jumbotron-text">
              NFL Trivia
            </h1>
            <div className="rounded-md border-2 border-nfl-red-dark bg-nfl-red/20 text-nfl-cream px-4 py-3">
              {error}
            </div>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="retro-btn w-full rounded-md bg-nfl-red border-2 border-nfl-red-dark text-nfl-cream px-5 py-4 font-heading font-bold uppercase tracking-wider"
            >
              Back to Home
            </button>
          </div>
        </main>
        <div className="endzone h-3" />
      </div>
    );
  }

  if (!quiz || !question) {
    return (
      <div className="min-h-full flex flex-col bg-nfl-navy-deep">
        <div className="endzone h-3" />
        <main className="flex-1 w-full max-w-xl mx-auto px-6 py-14">
          <div className="space-y-3">
            <h1 className="font-heading text-3xl font-bold uppercase tracking-wide text-nfl-cream jumbotron-text">
              NFL Trivia
            </h1>
            <div className="retro-card px-5 py-4 text-nfl-cream">
              Loading your round...
            </div>
          </div>
        </main>
        <div className="endzone h-3" />
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-nfl-navy-deep">
      <div className="endzone h-3" />

      {/* Gridiron section behind the quiz content */}
      <main className="flex-1 gridiron">
        <div className="w-full max-w-xl mx-auto px-6 py-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-heading text-xs font-semibold uppercase tracking-wider text-nfl-gold">
                Theme
              </div>
              <div className="font-heading text-xl font-bold uppercase text-nfl-cream">
                {quiz.theme}
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="retro-btn rounded-md border-2 border-nfl-border-light bg-nfl-navy px-3 py-2 text-sm font-heading font-bold uppercase tracking-wider text-nfl-cream hover:border-nfl-gold-dim hover:text-nfl-gold"
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
              className="retro-btn w-1/2 rounded-md border-2 border-nfl-border-light bg-nfl-navy px-5 py-4 font-heading font-bold uppercase tracking-wider text-nfl-cream hover:border-nfl-gold-dim"
            >
              Quit
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={!revealed}
              className="retro-btn w-1/2 rounded-md bg-nfl-red border-2 border-nfl-red-dark px-5 py-4 font-heading font-bold uppercase tracking-wider text-nfl-cream disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {current < total - 1 ? "Next" : "See Results"}
            </button>
          </div>
        </div>
      </main>

      <div className="endzone h-3" />
    </div>
  );
}

"use client";

type QuestionCardProps = {
  questionNumberLabel: string;
  question: string;
  choices: string[];
  selectedIndex: number | null;
  revealed: boolean;
  correctIndex: number;
  explanation?: string;
  onSelect: (index: number) => void;
};

export default function QuestionCard({
  questionNumberLabel,
  question,
  choices,
  selectedIndex,
  revealed,
  correctIndex,
  explanation,
  onSelect,
}: QuestionCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
      <div className="space-y-3">
        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          {questionNumberLabel}
        </div>
        <div className="text-lg font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
          {question}
        </div>

        <div className="grid grid-cols-1 gap-2">
          {choices.map((c, idx) => {
            const isSelected = selectedIndex === idx;
            const isCorrect = idx === correctIndex;
            const isIncorrect = revealed && isSelected && !isCorrect;

            const buttonBase =
              "w-full rounded-xl px-4 py-3 text-left border text-sm font-semibold transition";

            const className = revealed
              ? isCorrect
                ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-100"
                : isIncorrect
                  ? "border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-900/25 dark:text-red-200"
                  : "border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-50"
              : isSelected
                ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-black"
                : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/60 dark:text-zinc-50";

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelect(idx)}
                disabled={revealed}
                className={`${buttonBase} ${className}`}
              >
                {String.fromCharCode(65 + idx)}. {c}
              </button>
            );
          })}
        </div>

        {revealed && explanation ? (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200">
            <span className="font-bold">Why:</span> {explanation}
          </div>
        ) : null}
      </div>
    </div>
  );
}


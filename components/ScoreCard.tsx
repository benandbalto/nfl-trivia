type ScoreBreakdownItem = {
  question: string;
  choices: string[];
  correctIndex: number;
  selectedIndex: number | null;
  explanation: string;
};

type ScoreCardProps = {
  theme: string;
  score: number;
  total: number;
  gradeLabel: string;
  breakdown: ScoreBreakdownItem[];
};

function pct(score: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((score / total) * 100);
}

export default function ScoreCard({
  theme,
  score,
  total,
  gradeLabel,
  breakdown,
}: ScoreCardProps) {
  const percent = pct(score, total);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
        <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          Theme
        </div>
        <div className="text-lg font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
          {theme}
        </div>

        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Score
            </div>
            <div className="text-5xl font-extrabold text-zinc-950 dark:text-zinc-50 leading-none">
              {score}/{total}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-300">
              {percent}% correct
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Grade
            </div>
            <div className="text-3xl font-extrabold text-zinc-950 dark:text-zinc-50">
              {gradeLabel}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {breakdown.map((item, idx) => {
          const isCorrect = item.selectedIndex === item.correctIndex;
          const your =
            item.selectedIndex == null
              ? "No answer"
              : item.choices[item.selectedIndex] ?? "No answer";
          const correct = item.choices[item.correctIndex] ?? "Unknown";

          return (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Question {idx + 1}
                  </div>
                  <div className="text-base font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
                    {item.question}
                  </div>
                </div>
                <div
                  className={[
                    "rounded-xl px-3 py-2 text-xs font-bold border",
                    isCorrect
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-100"
                      : "border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-900/25 dark:text-red-200",
                  ].join(" ")}
                >
                  {isCorrect ? "Correct" : "Wrong"}
                </div>
              </div>

              <div className="mt-3 text-sm text-zinc-700 dark:text-zinc-200">
                <div>
                  <span className="font-semibold">Your answer:</span> {your}
                </div>
                <div>
                  <span className="font-semibold">Correct:</span> {correct}
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200">
                {item.explanation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


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
      {/* Jumbotron score display */}
      <div className="retro-card p-6 text-center">
        <div className="font-heading text-xs font-semibold uppercase tracking-wider text-nfl-gold">
          Theme
        </div>
        <div className="font-heading text-xl font-bold uppercase tracking-wide text-nfl-cream mt-1">
          {theme}
        </div>

        <div className="mt-6 flex items-end justify-center gap-8">
          <div>
            <div className="font-heading text-xs font-semibold uppercase tracking-wider text-nfl-text-dim">
              Score
            </div>
            <div className="scoreboard text-6xl font-extrabold text-nfl-gold jumbotron-text leading-none mt-1">
              {score}/{total}
            </div>
            <div className="scoreboard text-sm text-nfl-text-dim mt-1">
              {percent}% correct
            </div>
          </div>

          <div>
            <div className="font-heading text-xs font-semibold uppercase tracking-wider text-nfl-text-dim">
              Grade
            </div>
            <div className="scoreboard text-5xl font-extrabold text-nfl-cream jumbotron-text mt-1">
              {gradeLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown */}
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
              className="retro-card p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="font-heading text-xs font-semibold uppercase tracking-wider text-nfl-gold">
                    Question {idx + 1}
                  </div>
                  <div className="text-base font-extrabold tracking-tight text-nfl-cream">
                    {item.question}
                  </div>
                </div>
                <div
                  className={[
                    "rounded-md px-3 py-2 text-xs font-bold font-heading uppercase tracking-wider border-2",
                    isCorrect
                      ? "border-nfl-field bg-nfl-field/20 text-nfl-cream"
                      : "border-nfl-red bg-nfl-red/20 text-nfl-cream",
                  ].join(" ")}
                >
                  {isCorrect ? "Correct" : "Wrong"}
                </div>
              </div>

              <div className="mt-3 text-sm text-nfl-cream">
                <div>
                  <span className="font-semibold text-nfl-text-dim">Your answer:</span>{" "}
                  <span className={isCorrect ? "text-nfl-field" : "text-nfl-red"}>{your}</span>
                </div>
                <div>
                  <span className="font-semibold text-nfl-text-dim">Correct:</span>{" "}
                  <span className="text-nfl-field">{correct}</span>
                </div>
              </div>

              <div className="mt-3 rounded-md border-2 border-nfl-border-light bg-nfl-navy-deep px-4 py-3 text-sm text-nfl-cream">
                {item.explanation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

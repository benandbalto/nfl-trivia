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
    <div className="retro-card p-5">
      <div className="space-y-3">
        <div className="font-heading text-xs font-semibold uppercase tracking-wider text-nfl-gold">
          {questionNumberLabel}
        </div>
        <div className="text-lg font-extrabold tracking-tight text-nfl-cream">
          {question}
        </div>

        <div className="grid grid-cols-1 gap-2">
          {choices.map((c, idx) => {
            const isSelected = selectedIndex === idx;
            const isCorrect = idx === correctIndex;
            const isIncorrect = revealed && isSelected && !isCorrect;

            const buttonBase =
              "retro-btn w-full rounded-md px-4 py-3 text-left border-2 text-sm font-semibold transition";

            const className = revealed
              ? isCorrect
                ? "border-nfl-field bg-nfl-field/20 text-nfl-cream"
                : isIncorrect
                  ? "border-nfl-red bg-nfl-red/20 text-nfl-cream"
                  : "border-nfl-border bg-nfl-navy-deep/50 text-nfl-text-dim"
              : isSelected
                ? "border-nfl-gold bg-nfl-gold text-nfl-navy-deep"
                : "border-nfl-border-light bg-nfl-navy-deep text-nfl-cream hover:border-nfl-gold-dim hover:text-nfl-gold";

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelect(idx)}
                disabled={revealed}
                className={`${buttonBase} ${className}`}
              >
                <span className="inline-flex items-center gap-2">
                  <span
                    className={[
                      "inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold font-heading",
                      revealed && isCorrect
                        ? "bg-nfl-field text-nfl-cream"
                        : revealed && isIncorrect
                          ? "bg-nfl-red text-nfl-cream"
                          : isSelected
                            ? "bg-nfl-navy-deep text-nfl-gold"
                            : "bg-nfl-border-light text-nfl-cream",
                    ].join(" ")}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {c}
                </span>
              </button>
            );
          })}
        </div>

        {revealed && explanation ? (
          <div className="rounded-md border-2 border-nfl-border-light bg-nfl-navy-deep px-4 py-3 text-sm text-nfl-cream">
            <span className="font-bold text-nfl-gold">Why:</span> {explanation}
          </div>
        ) : null}
      </div>
    </div>
  );
}

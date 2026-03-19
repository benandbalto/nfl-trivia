type ProgressBarProps = {
  current: number; // 0-based index of current question
  total: number;
};

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total <= 0 ? 0 : Math.round(((current + 1) / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-nfl-text-dim">
        <span className="font-heading uppercase tracking-wider">
          Question {current + 1} of {total}
        </span>
        <span className="scoreboard text-nfl-gold">{pct}%</span>
      </div>
      {/* Yard-line progress bar */}
      <div className="relative h-4 rounded-sm bg-nfl-field-dark overflow-hidden border border-nfl-border-light">
        {/* Yard line markers */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-white/15 last:border-r-0"
            />
          ))}
        </div>
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 bg-nfl-field transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
        {/* Hash marks overlay */}
        <div className="absolute inset-0 flex items-center">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 flex justify-end"
            >
              <div className="w-px h-2 bg-white/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

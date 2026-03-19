type ProgressBarProps = {
  current: number; // 0-based index of current question
  total: number;
};

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total <= 0 ? 0 : Math.round(((current + 1) / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>
          Question {current + 1} of {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
        <div
          className="h-full bg-zinc-950 dark:bg-zinc-50 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}


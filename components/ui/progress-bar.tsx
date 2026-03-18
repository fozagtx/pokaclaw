interface ProgressBarProps {
  percent: number;
  className?: string;
}

export function ProgressBar({ percent, className = '' }: ProgressBarProps) {
  return (
    <div className={`h-2.5 bg-white/15 rounded-full ${className}`}>
      <div
        className="h-full bg-[var(--yo-yellow)] rounded-full transition-[width] duration-[1200ms] ease-in-out"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

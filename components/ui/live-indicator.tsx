export function LiveIndicator({ label = 'Live' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--card-mint)] opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--card-mint)]" />
      </span>
      <span className="text-[13px] font-bold uppercase tracking-[1.2px] text-[var(--card-mint)]">
        {label}
      </span>
    </div>
  );
}

export default function UploadProgressBar({ fraction, label }: { fraction: number; label: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, fraction)) * 100);
  return (
    <div className="mt-4" role="status" aria-live="polite">
      <div className="flex items-center justify-between text-xs uppercase tracking-widest2 text-neutral-500">
        <span>{label}</span>
        <span className="tabular-nums text-gold">{pct}%</span>
      </div>
      <div className="mt-2 h-1 w-full bg-line">
        <div className="h-1 bg-gold transition-[width] duration-150" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

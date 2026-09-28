const STEPS = ['DiW ID', 'Challenge & photos', 'Result'] as const;

export default function StepRail({ current }: { current: 1 | 2 | 3 }) {
  return (
    <nav aria-label="Verification progress" className="mb-8 text-xs uppercase tracking-widest2 md:mb-10">
      {/* Phones: one compact line plus a progress bar instead of a rail that wraps. */}
      <div className="sm:hidden">
        <p>
          <span className="text-gold">Step {current} of {STEPS.length}</span>
          <span className="text-neutral-400"> · {STEPS[current - 1]}</span>
        </p>
        <div className="mt-3 flex gap-1.5">
          {STEPS.map((label, index) => (
            <span
              key={label}
              className={`h-0.5 flex-1 ${index < current ? 'bg-gold' : 'bg-black/10'}`}
            />
          ))}
        </div>
      </div>

      <ol className="hidden items-center gap-x-3 sm:flex">
        {STEPS.map((label, index) => {
          const step = index + 1;
          return (
            <li key={label} className="flex items-center gap-3">
              <span
                aria-current={step === current ? 'step' : undefined}
                className={step === current ? 'text-gold' : 'text-neutral-400'}
              >
                {step}. {label}
              </span>
              {step < STEPS.length && <span className="text-neutral-300">—</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

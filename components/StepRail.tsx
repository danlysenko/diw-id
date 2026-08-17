const STEPS = ['DiW ID', 'Live challenge', 'Photos', 'Result'] as const;

export default function StepRail({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <ol className="mb-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs uppercase tracking-widest2">
      {STEPS.map((label, index) => {
        const step = index + 1;
        const state = step === current ? 'current' : step < current ? 'done' : 'todo';
        return (
          <li key={label} className="flex items-center gap-3">
            <span
              className={
                state === 'current'
                  ? 'text-gold'
                  : state === 'done'
                    ? 'text-neutral-400'
                    : 'text-neutral-700'
              }
            >
              {step}. {label}
            </span>
            {step < STEPS.length && <span className="text-neutral-800">—</span>}
          </li>
        );
      })}
    </ol>
  );
}

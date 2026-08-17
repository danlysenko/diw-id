import type { CheckResult } from '@/lib/checks';

const MARK: Record<CheckResult['verdict'], { glyph: string; className: string }> = {
  pass: { glyph: '✓', className: 'text-good' },
  fail: { glyph: '✕', className: 'text-bad' },
  review: { glyph: '•', className: 'text-warn' },
};

export default function CheckList({ checks }: { checks: CheckResult[] }) {
  return (
    <ul className="divide-y divide-line/60">
      {checks.map((check) => {
        const mark = MARK[check.verdict];
        return (
          <li key={check.key} className="flex gap-4 py-4">
            <span className={`mt-0.5 w-4 shrink-0 text-center ${mark.className}`}>{mark.glyph}</span>
            <div>
              <p className="text-sm text-neutral-200">{check.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">{check.detail}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

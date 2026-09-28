'use client';

import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { CASE_STATUS_LABEL, type CaseKind, type CaseStatus } from '@/lib/caseStatusShared';

// Current / selected status: its own colour, with a tinted fill so it stands out from the rest.
const TONE: Record<CaseStatus, string> = {
  new: 'border-info bg-info/15 text-info',
  pending: 'border-warn bg-warn/15 text-warn',
  verified: 'border-good bg-good/15 text-good',
  counterfeit: 'border-bad bg-bad/15 text-bad',
};

// Hover previews the colour the case will take: green for Verified, red for Counterfeit…
const HOVER: Record<CaseStatus, string> = {
  new: 'hover:border-info hover:bg-info/15 hover:text-info',
  pending: 'hover:border-warn hover:bg-warn/15 hover:text-warn',
  verified: 'hover:border-good hover:bg-good/15 hover:text-good',
  counterfeit: 'hover:border-bad hover:bg-bad/15 hover:text-bad',
};

// Idle pills get a light fill so they read as buttons on the dark panel, not bare outlines.
const IDLE = 'border-line bg-white/[0.07] text-neutral-300';

// 9px top / 7px bottom rather than an even 8px: uppercase Circe sits high in its line box, so
// equal padding leaves the text visibly above the centre line (same fix as the .btn class).
const PILL = 'rounded-full border px-4 pb-[7px] pt-[9px] text-xs uppercase leading-none tracking-wide3 transition';

// Smaller inline version of a pill, used for the statuses named in the confirmation.
const BADGE = 'rounded-full border px-3 pb-[5px] pt-[7px] text-xs uppercase leading-none tracking-wide3';

type Props = {
  kind: CaseKind;
  caseId: string;
  current: CaseStatus;
  options: CaseStatus[];
  /** The case's change history, rendered by the server and shown in the right-hand column. */
  log: ReactNode;
};

type Mode = { type: 'status'; target: CaseStatus } | { type: 'delete' } | null;

/**
 * The review panel of one case, stacked top to bottom: status buttons, the log, then
 * "Delete case". Nothing changes until the reviewer confirms — "Yes" for a status change,
 * the admin key again for a deletion.
 */
export default function CaseStatusControl({ kind, caseId, current, options, log }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(null);
  const [note, setNote] = useState('');
  const [key, setKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function cancel() {
    setMode(null);
    setNote('');
    setKey('');
    setError(null);
  }

  function choose(next: Mode) {
    setMode(next);
    setError(null);
  }

  async function send(url: string, body: object, fallback: string, clearKey = false) {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? fallback);
        if (clearKey) setKey('');
        return;
      }
      cancel();
      router.refresh();
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  const target = mode?.type === 'status' ? mode.target : null;

  return (
    <div className="space-y-8">
      <div>
        <p className="label">Status</p>
        {/* A row while the panel sits under the evidence; a stack once it is the narrow side column. */}
        <div className="flex flex-wrap gap-2 xl:flex-col">
          {/* A status staff can't set (only "New") is shown as a marker, not a button. */}
          {!options.includes(current) && (
            <span className={`${PILL} text-center ${TONE[current]}`}>● {CASE_STATUS_LABEL[current]}</span>
          )}
          {options.map((status) => {
            const isCurrent = status === current;
            return (
              <button
                key={status}
                type="button"
                aria-pressed={isCurrent}
                disabled={isCurrent || saving}
                onClick={() => choose({ type: 'status', target: status })}
                className={`${PILL} ${
                  isCurrent
                    ? `${TONE[status]} cursor-default`
                    : status === target
                      ? TONE[status]
                      : `${IDLE} ${HOVER[status]}`
                }`}
              >
                {isCurrent && '● '}
                {CASE_STATUS_LABEL[status]}
              </button>
            );
          })}
        </div>

        {target && (
          // The note field bleeds edge-to-edge (no horizontal padding on the box, border-x-0 on
          // the field itself); everything else keeps its own padding and is centred.
          <div role="alertdialog" aria-labelledby={`confirm-${caseId}`} className="mt-4 rounded-lg border border-gold/40 py-3">
            <p id={`confirm-${caseId}`} className="flex flex-wrap items-center justify-center gap-2 px-3 text-center text-sm text-neutral-100">
              Change status to:
              <span className={`${BADGE} ${TONE[target]}`}>{CASE_STATUS_LABEL[target]}</span>
            </p>
            {kind === 'verification' && (target === 'verified' || current === 'verified') && (
              <p className="mt-1 px-3 text-center text-xs text-neutral-500">
                {target === 'verified'
                  ? 'The customer gets a fresh 24-hour proof link.'
                  : 'Any proof link issued for this case stops working.'}
              </p>
            )}
            <label className="label mt-4 px-3 text-center" htmlFor={`note-${caseId}`}>
              Notes
            </label>
            <textarea
              id={`note-${caseId}`}
              className="field min-h-[7rem] rounded-none border-x-0 text-left"
              placeholder="Why the status is changing"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            {error && <p className="mt-3 px-3 text-center text-sm text-bad">{error}</p>}
            <div className="mt-4 flex flex-wrap justify-center gap-3 px-3 xl:flex-col xl:gap-2">
              <button
                type="button"
                className="btn-primary whitespace-nowrap xl:w-full"
                onClick={() => send('/api/admin/status', { kind, caseId, status: target, note }, 'Could not change the status.')}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Change status'}
              </button>
              <button type="button" className="btn-ghost whitespace-nowrap bg-white/[0.07] xl:w-full" onClick={cancel} disabled={saving}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div>{log}</div>

      <div className="border-t border-line pt-6">
        <div className="flex justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={() => choose({ type: 'delete' })}
            className={`${PILL} ${
              mode?.type === 'delete' ? TONE.counterfeit : `${IDLE} ${HOVER.counterfeit}`
            }`}
          >
            Delete case
          </button>
        </div>

        {mode?.type === 'delete' && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              send('/api/admin/delete', { kind, caseId, key }, 'Could not delete the case.', true);
            }}
            className="mt-4 rounded-lg border border-bad/50 px-2 py-3"
          >
            <p className="text-sm text-neutral-100">Delete this case permanently?</p>
            <p className="mt-1 text-xs text-neutral-500">
              The case and its photos are removed and cannot be restored. Enter the admin key to confirm.
            </p>
            <label className="label mt-4" htmlFor={`delete-key-${caseId}`}>
              Admin key
            </label>
            <input
              id={`delete-key-${caseId}`}
              type="password"
              className="field"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              autoComplete="off"
              required
            />
            {error && <p className="mt-3 text-sm text-bad">{error}</p>}
            <div className="mt-4 flex flex-wrap gap-3 xl:flex-col xl:gap-2">
              <button
                type="submit"
                className="btn whitespace-nowrap border-bad bg-bad text-white hover:opacity-90 xl:w-full"
                disabled={saving || !key}
              >
                {saving ? 'Deleting…' : 'Delete permanently'}
              </button>
              <button type="button" className="btn-ghost whitespace-nowrap bg-white/[0.07] xl:w-full" onClick={cancel} disabled={saving}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

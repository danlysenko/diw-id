'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { LegacyStatus } from '@/lib/sessions';

type Props = {
  caseId: string;
  status: string;
  reviewedBy: string | null;
  reviewNote: string | null;
};

export default function LegacyReviewActions({ caseId, status, reviewedBy, reviewNote }: Props) {
  const router = useRouter();
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<LegacyStatus | null>(null);

  async function setStatus(next: LegacyStatus) {
    setError(null);
    setPending(next);

    try {
      const response = await fetch('/api/admin/legacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, status: next, note }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? 'Could not record the decision.');
        return;
      }
      router.refresh();
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setPending(null);
    }
  }

  if (status === 'verified' || status === 'counterfeit' || status === 'resolved') {
    return (
      <div className="text-sm text-neutral-400">
        <p>
          Marked <span className="text-neutral-200">{status === 'counterfeit' ? 'counterfeit' : 'verified'}</span>
          {reviewedBy && <> by {reviewedBy}</>}.
        </p>
        {reviewNote && <p className="mt-1 text-neutral-500">{reviewNote}</p>}
      </div>
    );
  }

  if (status === 'submitted') {
    return (
      <div>
        {error && <p className="mb-3 text-sm text-bad">{error}</p>}
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setStatus('under_review')}
          disabled={pending !== null}
        >
          {pending === 'under_review' ? 'Starting…' : 'Start review'}
        </button>
      </div>
    );
  }

  return (
    <div>
      <label className="label" htmlFor={`note-${caseId}`}>
        Reviewer note
      </label>
      <textarea
        id={`note-${caseId}`}
        className="field min-h-[5rem]"
        placeholder="Archive match, or why this case is closed"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      {error && <p className="mt-3 text-sm text-bad">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-primary"
          onClick={() => setStatus('verified')}
          disabled={pending !== null}
        >
          {pending === 'verified' ? 'Saving…' : 'Mark verified'}
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setStatus('counterfeit')}
          disabled={pending !== null}
        >
          {pending === 'counterfeit' ? 'Saving…' : 'Mark counterfeit'}
        </button>
      </div>
    </div>
  );
}

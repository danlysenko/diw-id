'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ReviewActions({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<'approve' | 'reject' | null>(null);

  async function decide(decision: 'approve' | 'reject') {
    setError(null);
    setPending(decision);

    try {
      const response = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, decision, note }),
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

  return (
    <div>
      <label className="label" htmlFor={`note-${sessionId}`}>
        Reviewer note
      </label>
      <textarea
        id={`note-${sessionId}`}
        className="field min-h-[5rem]"
        placeholder="What did you see in the images?"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      {error && <p className="mt-3 text-sm text-bad">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-primary"
          onClick={() => decide('approve')}
          disabled={pending !== null}
        >
          {pending === 'approve' ? 'Approving…' : 'Approve — authentic'}
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => decide('reject')}
          disabled={pending !== null}
        >
          {pending === 'reject' ? 'Rejecting…' : 'Reject'}
        </button>
      </div>
    </div>
  );
}

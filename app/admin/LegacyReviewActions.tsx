'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LegacyReviewActions({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function resolve() {
    setError(null);
    setPending(true);

    try {
      const response = await fetch('/api/admin/legacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, note }),
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
      setPending(false);
    }
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

      <div className="mt-4">
        <button type="button" className="btn-primary" onClick={resolve} disabled={pending}>
          {pending ? 'Saving…' : 'Mark resolved'}
        </button>
      </div>
    </div>
  );
}

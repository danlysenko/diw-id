'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DiwIdForm({ flow }: { flow: 'owner' | 'dealer' }) {
  const router = useRouter();
  const [diwId, setDiwId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const response = await fetch('/api/verify/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diwId, flow }),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? 'Something went wrong. Try again.');
      setSubmitting(false);
      return;
    }

    router.push(`/verify/session/${data.sessionId}/live`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="label" htmlFor="diwId">
        DiW ID
      </label>
      <input
        id="diwId"
        className="field font-display text-lg tracking-widest"
        placeholder="26-00483"
        value={diwId}
        onChange={(e) => setDiwId(e.target.value)}
        autoComplete="off"
        inputMode="numeric"
        required
      />

      {error && (
        <p className="mt-4 rounded-lg border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary mt-6 w-full" disabled={submitting || !diwId.trim()}>
        {submitting ? 'Checking…' : 'Continue'}
      </button>
    </form>
  );
}

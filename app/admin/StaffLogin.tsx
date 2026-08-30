'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function StaffLogin() {
  const router = useRouter();
  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? 'Sign-in failed.');
        return;
      }
      router.refresh();
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <p className="eyebrow">DiW Authentication</p>
      <h1 className="mt-4 font-display text-2xl text-neutral-50">Staff sign-in</h1>

      <form onSubmit={handleSubmit} className="panel mt-8 p-8">
        <label className="label" htmlFor="key">
          Staff key
        </label>
        <input
          id="key"
          type="password"
          className="field"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          autoComplete="current-password"
          required
        />
        {error && <p className="mt-4 text-sm text-bad">{error}</p>}
        <button type="submit" className="btn-primary mt-6 w-full" disabled={submitting || !key}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

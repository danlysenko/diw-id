'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { LegacyEmail } from '@/lib/db';

type Props = {
  caseId: string;
  defaultSubject: string;
  log: LegacyEmail[];
};

/**
 * Manual "email the customer" action for a Legacy case, shown directly under the contact
 * address (which is already visible above it). Nothing sends until staff click Send.
 */
export default function EmailCaseControl({ caseId, defaultSubject, log }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, subject, message }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? 'Could not send the email.');
        return;
      }
      setOpen(false);
      setMessage('');
      router.refresh();
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs uppercase tracking-wide3 text-gold underline-offset-4 hover:underline"
        >
          → Send email
        </button>
      )}

      {open && (
        <form onSubmit={send} className="max-w-md rounded-lg border border-gold/40 px-2 py-3">
          <label className="label px-3" htmlFor={`email-subject-${caseId}`}>
            Subject
          </label>
          <input
            id={`email-subject-${caseId}`}
            className="field rounded-none border-x-0"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />

          <label className="label mt-4 px-3" htmlFor={`email-message-${caseId}`}>
            Message
          </label>
          <textarea
            id={`email-message-${caseId}`}
            className="field min-h-[8rem] rounded-none border-x-0"
            placeholder="What DiW Authentication found, or what's needed next…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          {error && <p className="mt-3 px-3 text-sm text-bad">{error}</p>}

          <div className="mt-4 flex flex-wrap gap-3 px-3">
            <button type="submit" className="btn-primary whitespace-nowrap" disabled={sending}>
              {sending ? 'Sending…' : 'Send email'}
            </button>
            <button
              type="button"
              className="btn-ghost whitespace-nowrap bg-white/[0.07]"
              onClick={() => {
                setOpen(false);
                setError(null);
              }}
              disabled={sending}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {log.length > 0 && (
        <ol className="mt-3 max-w-md space-y-3 border-l border-line pl-4">
          {log.map((entry) => (
            <li key={entry.id} className="text-sm">
              <p className="text-xs text-neutral-500">
                {new Date(entry.created_at.replace(' ', 'T') + 'Z').toLocaleString('en-GB')} · {entry.sent_by}
              </p>
              <p className={entry.ok ? 'text-neutral-100' : 'text-bad'}>
                {entry.ok ? entry.subject : `Failed — ${entry.error}`}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

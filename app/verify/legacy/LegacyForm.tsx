'use client';

import { useState } from 'react';
import UploadProgressBar from '@/components/UploadProgressBar';
import { uploadFormData } from '@/lib/uploadWithProgress';

export default function LegacyForm() {
  const [caseId, setCaseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);
  const [progress, setProgress] = useState(0);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    setProgress(0);

    try {
      const { status, body } = await uploadFormData(
        '/api/legacy',
        new FormData(event.currentTarget),
        setProgress,
      );
      const data = JSON.parse(body || '{}');

      if (status < 200 || status >= 300) {
        setError(data.error ?? `Submission failed (${status}). Try again.`);
        return;
      }
      setCaseId(data.caseId);
    } catch {
      setError(
        'Something went wrong sending the submission. If your photos are large, try fewer or smaller images, then try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (caseId) {
    return (
      <div className="panel border-good/40 bg-good/5 p-8">
        <p className="eyebrow text-good">Case opened</p>
        <h2 className="mt-3 font-display text-2xl text-neutral-50">
          Your Legacy case is with DiW Authentication
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-neutral-400">
          A member of the team will match your watch against the DiW build archive. Legacy cases are
          reviewed by a person, so they take longer than an instant DiW ID verification.
        </p>
        <p className="mt-5 text-xs text-neutral-600">Case reference: {caseId}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="panel space-y-6 p-8">
      <div>
        <label className="label" htmlFor="model">
          Model
        </label>
        <input
          id="model"
          name="model"
          className="field"
          placeholder="e.g. DiW Carbon Submariner"
          required
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="label" htmlFor="approxYear">
            Approximate production year
          </label>
          <input id="approxYear" name="approxYear" className="field" placeholder="e.g. 2023" required />
        </div>
        <div>
          <label className="label" htmlFor="originalSerial">
            Base watch serial (if known)
          </label>
          <input id="originalSerial" name="originalSerial" className="field" placeholder="Optional" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="purchaseLocation">
          Where the watch was bought
        </label>
        <input
          id="purchaseLocation"
          name="purchaseLocation"
          className="field"
          placeholder="Dealer, boutique, private sale, marketplace…"
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="contactEmail">
          Contact email
        </label>
        <input
          id="contactEmail"
          name="contactEmail"
          type="email"
          className="field"
          placeholder="Where DiW should reply"
        />
      </div>

      <div>
        <label className="label" htmlFor="photos">
          Photographs (up to 6)
        </label>
        <input
          id="photos"
          name="photos"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/heic,image/heif,image/webp"
          className="field file:mr-4 file:rounded file:border-0 file:bg-line file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-widest2 file:text-neutral-300"
          onChange={(e) => setPhotoCount(e.target.files?.length ?? 0)}
          required
        />
        <p className="mt-2 text-xs text-neutral-600">
          Dial, caseback, lugs and any engraving. {photoCount > 0 && `${photoCount} selected.`}
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">{error}</p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Open Legacy case'}
      </button>

      {submitting && <UploadProgressBar fraction={progress} label="Uploading photographs" />}
    </form>
  );
}

'use client';

import { useEffect, useState } from 'react';
import ClockFace from '@/components/ClockFace';
import Countdown from '@/components/Countdown';
import UploadProgressBar from '@/components/UploadProgressBar';
import { formatChallenge } from '@/lib/challenge';
import { uploadFormData } from '@/lib/uploadWithProgress';

type Challenge = { id: string; hour: number; minute: number; expiresAt: string };

export default function LegacyForm({ challenge }: { challenge: Challenge }) {
  const [caseId, setCaseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [expired, setExpired] = useState(() => new Date(challenge.expiresAt).getTime() <= Date.now());

  useEffect(() => {
    const ms = new Date(challenge.expiresAt).getTime() - Date.now();
    if (ms <= 0) return setExpired(true);
    const timer = setTimeout(() => setExpired(true), ms);
    return () => clearTimeout(timer);
  }, [challenge.expiresAt]);

  const time = formatChallenge(challenge.hour, challenge.minute);

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
      <div className="panel panel-pad border-good/40 bg-good/5 lg:max-w-3xl">
        <p className="eyebrow text-good">Case opened</p>
        <h2 className="mt-3 font-display text-2xl text-neutral-50">
          Your Legacy case is with DiW Authentication
        </h2>
        <p className="mt-4 text-base leading-relaxed text-neutral-600">
          A member of the team will match your watch against the DiW build archive. Legacy cases are
          reviewed by a person, so they take longer than an instant DiW ID verification.
        </p>
        <p className="mt-5 text-xs text-neutral-500">Case reference: {caseId}</p>
      </div>
    );
  }

  return (
    // One box. Phones: the hand position first, then the details. From `lg` the position sits in
    // its own column, pinned so it stays in view while the details are filled in beside it.
    <form
      onSubmit={handleSubmit}
      className="panel panel-pad grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] xl:gap-12"
    >
      <input type="hidden" name="challengeId" value={challenge.id} />

      <section className="border-b border-black/10 pb-8 lg:sticky lg:top-8 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8 xl:pr-12">
        <p className="eyebrow">Live hand position</p>
        <ClockFace
          hour={challenge.hour}
          minute={challenge.minute}
          size={200}
          className="mx-auto mt-6 h-auto w-44 sm:w-52 xl:w-60"
        />
        <p className="mt-6 text-center font-display text-2xl text-neutral-50">
          Set your watch to <span className="text-gold">{time}</span>
        </p>
        <p className="mt-2 text-center">
          {expired ? (
            <a href="/verify/legacy" className="text-sm text-bad underline">
              Position expired — get a new one
            </a>
          ) : (
            <Countdown expiresAt={challenge.expiresAt} />
          )}
        </p>
        <p className="mt-4 text-base leading-relaxed text-neutral-600">
          Generated for this case only. Move the hands to this time and include a photo of the dial
          — it shows the watch is with you, not in an old photograph.
        </p>
      </section>

      <section className="space-y-6">
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
          <p className="mt-2 text-sm text-neutral-600">
            Include one front-on shot of the dial set to{' '}
            <span className="text-gold">{time}</span>, plus the caseback, lugs and any engraving.{' '}
            {photoCount > 0 && `${photoCount} selected.`}
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">{error}</p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={submitting || expired}>
          {submitting ? 'Submitting…' : 'Open Legacy case'}
        </button>

        {submitting && <UploadProgressBar fraction={progress} label="Uploading photographs" />}
      </section>
    </form>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import PhotoUploader from '@/components/PhotoUploader';
import UploadProgressBar from '@/components/UploadProgressBar';
import { uploadFormData } from '@/lib/uploadWithProgress';

export default function PhotoSubmitForm({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [watchPhoto, setWatchPhoto] = useState<File | null>(null);
  const [idPhoto, setIdPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!watchPhoto || !idPhoto) return;

    setError(null);
    setSubmitting(true);
    setProgress(0);

    const body = new FormData();
    body.append('sessionId', sessionId);
    body.append('watchPhoto', watchPhoto);
    body.append('idPhoto', idPhoto);

    try {
      const { status, body: responseBody } = await uploadFormData('/api/verify/submit', body, setProgress);
      const data = JSON.parse(responseBody || '{}');

      if (status < 200 || status >= 300) {
        setError(data.error ?? `Upload failed (${status}). Try again.`);
        return;
      }

      router.push(`/verify/session/${sessionId}/result`);
    } catch {
      setError(
        'Something went wrong sending the photos. If they are large, try smaller images, then try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <PhotoUploader
          name="watchPhoto"
          title="Photo 1 — the watch, front on"
          hint="A clear front photo of the watch showing the requested hand position."
          requirements={[
            'The whole watch is in frame',
            'The dial is clearly readable',
            'Hour and minute hands are clearly visible',
            'No heavy glare across the crystal',
            'Screenshots are rejected',
            'Keep the original image metadata — do not re-export',
          ]}
          onSelect={setWatchPhoto}
        />

        <PhotoUploader
          name="idPhoto"
          title="Photo 2 — the DiW ID"
          hint="A photo of the DiW ID engraved on the rehaut at 6 o’clock."
          requirements={[
            'The full number is legible, e.g. 26-00483',
            'Engraving is in focus',
            'Shot on the same watch as photo 1',
          ]}
          onSelect={setIdPhoto}
        />
      </div>

      {error && (
        <p className="mt-6 rounded-lg border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="btn-primary mt-8"
        disabled={submitting || !watchPhoto || !idPhoto}
      >
        {submitting ? 'Submitting…' : 'Submit for verification'}
      </button>

      {submitting && <UploadProgressBar fraction={progress} label="Uploading photographs" />}
    </form>
  );
}

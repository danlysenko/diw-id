'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';

export type LightboxPhoto = {
  path: string;
  label: string;
  meta?: ReactNode;
};

export default function PhotoLightbox({ photos }: { photos: LightboxPhoto[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length)),
    [photos.length],
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openIndex, close, prev, next]);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, index) => (
          <button
            key={photo.path}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="group block w-full border border-line p-3 text-left transition hover:border-gold"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.path}
              alt={photo.label}
              className="max-h-96 w-full object-contain transition group-hover:opacity-80"
            />
            <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
              <span>{photo.label}</span>
              {photo.meta}
            </div>
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={photos[openIndex].label}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-6 top-6 text-3xl leading-none text-neutral-400 transition hover:text-gold"
          >
            ×
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Previous photo"
                className="absolute left-2 text-4xl leading-none text-neutral-400 transition hover:text-gold sm:left-6"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Next photo"
                className="absolute right-2 text-4xl leading-none text-neutral-400 transition hover:text-gold sm:right-6"
              >
                ›
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[openIndex].path}
            alt={photos[openIndex].label}
            className="max-h-[88vh] max-w-[88vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <p className="absolute bottom-6 text-xs uppercase tracking-widest2 text-neutral-500">
            {photos[openIndex].label}
            {photos.length > 1 && ` — ${openIndex + 1} / ${photos.length}`}
          </p>
        </div>
      )}
    </>
  );
}

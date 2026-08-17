'use client';

import { useRef, useState } from 'react';

type Props = {
  name: string;
  title: string;
  hint: string;
  requirements: string[];
  onSelect: (file: File | null) => void;
};

export default function PhotoUploader({ name, title, hint, requirements, onSelect }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
    setFileName(file?.name ?? null);
    onSelect(file);
  }

  return (
    <div className="panel p-6">
      <p className="eyebrow">{title}</p>
      <p className="mt-2 text-sm text-neutral-300">{hint}</p>

      <ul className="mt-4 space-y-1 text-xs text-neutral-500">
        {requirements.map((r) => (
          <li key={r}>— {r}</li>
        ))}
      </ul>

      <input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/heic,image/heif,image/webp"
        capture="environment"
        className="sr-only"
        onChange={handleChange}
      />

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" className="btn-ghost" onClick={() => inputRef.current?.click()}>
          {fileName ? 'Replace photo' : 'Choose photo'}
        </button>
        {fileName && <span className="truncate text-xs text-neutral-500">{fileName}</span>}
      </div>

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Selected upload preview"
          className="mt-5 max-h-64 w-full rounded-lg border border-line object-contain"
        />
      )}
    </div>
  );
}

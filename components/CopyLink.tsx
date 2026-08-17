'use client';

import { useEffect, useState } from 'react';

export default function CopyLink({ path }: { path: string }) {
  const [url, setUrl] = useState(path);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
  }, [path]);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <code className="flex-1 truncate rounded-lg border border-line bg-ink px-4 py-3 text-xs text-neutral-300">
        {url}
      </code>
      <button type="button" className="btn-ghost" onClick={copy}>
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  );
}

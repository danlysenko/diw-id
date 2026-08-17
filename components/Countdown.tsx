'use client';

import { useEffect, useState } from 'react';

export default function Countdown({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)),
  );

  useEffect(() => {
    const tick = () =>
      setRemaining(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const urgent = remaining <= 120;

  if (remaining === 0) {
    return <span className="text-sm text-bad">Challenge expired</span>;
  }

  return (
    <span className={urgent ? 'text-sm tabular-nums text-warn' : 'text-sm tabular-nums text-neutral-400'}>
      {minutes}:{String(seconds).padStart(2, '0')} remaining
    </span>
  );
}

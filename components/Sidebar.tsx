'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV = [
  { href: '/', label: 'Check My DiW' },
  { href: '/verify', label: 'Verify' },
  { href: '/dealer', label: 'Dealers' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-line bg-ink px-5 py-3 md:hidden">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-[10px] tracking-wide3 text-neutral-100"
        >
          DiW
        </Link>
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex flex-col gap-1.5 p-2"
        >
          <span className={`block h-px w-6 bg-neutral-300 transition ${open ? 'translate-y-[6px] rotate-45' : ''}`} />
          <span className={`block h-px w-6 bg-neutral-300 transition ${open ? 'opacity-0' : ''}`} />
          <span className={`block h-px w-6 bg-neutral-300 transition ${open ? '-translate-y-[6px] -rotate-45' : ''}`} />
        </button>
      </header>

      {open && (
        <nav className="fixed inset-x-0 top-[57px] bottom-0 z-30 bg-ink px-6 py-10 md:hidden">
          <ul className="space-y-6 text-sm uppercase tracking-wide3">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={pathname === item.href ? 'text-gold' : 'text-neutral-300'}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col border-r border-line bg-ink px-8 py-10 md:flex">
        <Link
          href="/"
          className="flex h-16 w-16 items-center justify-center self-center rounded-full border border-line text-sm tracking-wide3 text-neutral-100 transition hover:border-gold hover:text-gold"
        >
          DiW
        </Link>

        <div className="mt-14">
          <p className="text-xs uppercase tracking-widest2 text-gold">Menu</p>
          <nav className="mt-5">
            <ul className="space-y-4 text-xs uppercase tracking-wide3">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`transition hover:text-gold ${
                      pathname === item.href ? 'text-gold' : 'text-neutral-400'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-auto space-y-4 text-xs">
          <ul className="space-y-2 text-neutral-500">
            <li>
              <Link href="/dealer" className="transition hover:text-gold">
                For dealers
              </Link>
            </li>
            <li>
              <Link href="/verify" className="transition hover:text-gold">
                Start a verification
              </Link>
            </li>
          </ul>
          <p className="leading-relaxed text-neutral-600">
            Live verification proves possession at a moment in time, not ownership.
          </p>
          <p className="text-neutral-700">{new Date().getFullYear()} © DiW Authentication</p>
        </div>
      </aside>
    </>
  );
}

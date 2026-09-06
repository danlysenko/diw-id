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
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-line bg-[#1c1c1e] px-5 py-3 md:hidden">
        <Link href="/" className="flex h-10 w-10 items-center justify-center transition hover:opacity-80">
          <img src="/logo.png" width={40} height={40} alt="DiW" />
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
        <nav className="fixed inset-x-0 top-[57px] bottom-0 z-30 bg-[#1c1c1e] px-6 py-10 md:hidden">
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

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[160px] flex-col border-r border-line bg-[#1c1c1e] px-6 py-10 md:flex">
        <Link
          href="/"
          className="mt-[20px] flex h-20 w-20 items-center justify-center self-center transition hover:opacity-80"
        >
          <img src="/logo.png" width={80} height={80} alt="DiW" />
        </Link>

        <div className="mt-14">
          <nav>
            <ul className="space-y-2 text-xs uppercase tracking-wide3">
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

        <div className="mt-auto space-y-4 font-['Arial'] text-[12px] font-normal text-[#777777]">
          <p className="leading-relaxed">
            Live verification proves possession at a moment in time, not ownership.
          </p>
          <p>{new Date().getFullYear()} © DiW Authentication</p>
        </div>
      </aside>
    </>
  );
}

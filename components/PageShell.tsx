'use client';

import { usePathname } from 'next/navigation';

/**
 * Everything renders light by default; /admin stays dark like the sidebar. Adding
 * .theme-dark here (rather than in globals.css unconditionally) is what lets the same
 * .panel/.field/.btn-ghost classes and neutral-50/100/200 headings used across every
 * page render correctly in both themes — see the CSS variables in app/globals.css.
 */
export default function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dark = pathname?.startsWith('/admin');

  return (
    <main className={`min-h-screen md:ml-[160px] ${dark ? 'theme-dark bg-ink text-neutral-500' : ''}`}>
      <div className="mx-auto max-w-5xl px-6 pb-16 pt-24 md:pt-16">{children}</div>
    </main>
  );
}

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
      {/* Fluid up to 1440px so wide screens get real columns instead of one narrow strip;
          top padding clears the fixed mobile header (65px) on small screens. */}
      <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-[5.5rem] sm:px-8 md:pt-8 lg:px-12 2xl:px-16">
        {children}
      </div>
    </main>
  );
}

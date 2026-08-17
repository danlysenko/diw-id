import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Check My DiW — Watch Authentication',
  description: 'Live verification of DiW watches. Prove physical possession, get a shareable proof link.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <header className="border-b border-line/70">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
            <Link href="/" className="font-display text-lg tracking-widest2 text-neutral-100">
              DiW
            </Link>
            <nav className="flex items-center gap-6 text-xs uppercase tracking-widest2 text-neutral-500">
              <Link href="/verify" className="transition hover:text-gold">
                Check My DiW
              </Link>
              <Link href="/dealer" className="transition hover:text-gold">
                Dealers
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-12">{children}</main>

        <footer className="mt-20 border-t border-line/70">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-xs text-neutral-600">
            <span>DiW Authentication</span>
            <span>Live verification proves possession at a moment in time, not ownership.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}

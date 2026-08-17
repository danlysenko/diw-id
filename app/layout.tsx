import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Check My DiW — Watch Authentication',
  description: 'Live verification of DiW watches. Prove physical possession, get a shareable proof link.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Sidebar />
        <main className="md:ml-[240px]">
          <div className="mx-auto max-w-5xl px-6 pb-16 pt-24 md:pt-16">{children}</div>
        </main>
      </body>
    </html>
  );
}

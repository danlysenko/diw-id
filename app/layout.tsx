import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import PageShell from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Check My DiW — Watch Authentication',
  description: 'Live verification of DiW watches. Prove physical possession, get a shareable proof link.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Sidebar />
        <PageShell>{children}</PageShell>
      </body>
    </html>
  );
}

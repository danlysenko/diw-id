import Link from 'next/link';
import { notFound } from 'next/navigation';
import WatchCard from '@/components/WatchCard';
import { isExpired } from '@/lib/challenge';
import { findWatch, getSessionByToken } from '@/lib/sessions';

export const dynamic = 'force-dynamic';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function VerificationLinkPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = getSessionByToken(token);
  if (!session || session.status !== 'passed' || !session.link_expires_at) notFound();

  if (isExpired(session.link_expires_at)) {
    return (
      <div className="panel p-8">
        <p className="eyebrow text-neutral-500">Link expired</p>
        <h1 className="mt-3 font-display text-3xl text-neutral-50">This verification has expired</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-400">
          DiW verification links are valid for 24 hours so they cannot be recycled from an earlier
          sale. Ask the seller to run a fresh live verification and send you a new link.
        </p>
        <Link href="/" className="btn-ghost mt-8">
          About Check My DiW
        </Link>
      </div>
    );
  }

  const watch = findWatch(session.diw_id);
  if (!watch || !session.verified_at) notFound();

  return (
    <div>
      <div className="panel border-good/40 bg-good/5 p-8">
        <p className="eyebrow text-good">Verified by DiW</p>
        <h1 className="mt-3 font-display text-3xl leading-snug text-neutral-50">
          This DiW watch successfully passed a live verification on{' '}
          {formatDate(session.verified_at)}.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-neutral-400">
          At that moment, someone holding this watch set its hands to a position DiW chose at
          random and photographed the result inside a 20-minute window. You are reading this
          confirmation on diw.com, not from the seller.
        </p>
        <p className="mt-4 text-xs uppercase tracking-widest2 text-neutral-600">
          Link valid until {new Date(session.link_expires_at).toLocaleString('en-GB')}
        </p>
      </div>

      <div className="mt-8">
        <WatchCard watch={watch} verifiedAt={session.verified_at} possessionVerified />
      </div>

      <p className="mt-8 max-w-2xl text-xs leading-relaxed text-neutral-600">
        A live verification confirms authenticity and physical possession at the time it was run.
        It does not confirm legal ownership, and DiW never discloses who holds the watch.
      </p>
    </div>
  );
}

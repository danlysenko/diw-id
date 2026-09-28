import Link from 'next/link';
import { notFound } from 'next/navigation';
import WatchCard from '@/components/WatchCard';
import { CHALLENGE_WINDOW_TEXT, isExpired } from '@/lib/challenge';
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
      <div className="panel panel-pad lg:max-w-3xl">
        <p className="eyebrow text-neutral-600">Link expired</p>
        <h1 className="mt-3 font-display text-3xl text-neutral-50">This verification has expired</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-400">
          DiW verification links are valid for 24 hours so they cannot be recycled from an earlier
          sale. Ask the seller to run a fresh live verification and send you a new link.
        </p>
        <Link href="/" className="btn-ghost mt-8 w-full sm:w-auto">
          About Check My DiW
        </Link>
      </div>
    );
  }

  const watch = findWatch(session.diw_id);
  if (!watch || !session.verified_at) notFound();

  return (
    // From xl: the verified statement on the left, the instance record on the right.
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] xl:gap-8">
      <div className="space-y-6">
        <div className="panel panel-pad border-good/40 bg-good/5">
          <p className="eyebrow text-good">Verified by DiW</p>
          <h1 className="mt-3 font-display text-2xl leading-snug text-neutral-50 sm:text-3xl">
            This DiW watch successfully passed a live verification on{' '}
            {formatDate(session.verified_at)}.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-neutral-400">
            At that moment, someone holding this watch set its hands to a position DiW chose at
            random and photographed the result inside a {CHALLENGE_WINDOW_TEXT} window. You are
            reading this confirmation on diw.com, not from the seller.
          </p>
          <p className="mt-4 text-xs uppercase tracking-widest2 text-neutral-500">
            Link valid until {new Date(session.link_expires_at).toLocaleString('en-GB')}
          </p>
        </div>

        <p className="max-w-2xl text-xs leading-relaxed text-neutral-500">
          A live verification confirms authenticity and physical possession at the time it was run.
          It does not confirm legal ownership, and DiW never discloses who holds the watch.
        </p>
      </div>

      <WatchCard watch={watch} verifiedAt={session.verified_at} possessionVerified />
    </div>
  );
}

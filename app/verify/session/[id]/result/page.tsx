import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import CheckList from '@/components/CheckList';
import CopyLink from '@/components/CopyLink';
import StepRail from '@/components/StepRail';
import WatchCard from '@/components/WatchCard';
import type { CheckResult } from '@/lib/checks';
import { findWatch, getSession } from '@/lib/sessions';

export const dynamic = 'force-dynamic';

function parseChecks(json: string | null): CheckResult[] {
  if (!json) return [];
  try {
    return JSON.parse(json) as CheckResult[];
  } catch {
    return [];
  }
}

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = getSession(id);
  if (!session) notFound();
  if (session.status === 'pending_challenge') redirect(`/verify/session/${session.id}/live`);

  const watch = findWatch(session.diw_id);
  const checks = parseChecks(session.checks_json);

  if (session.status === 'passed' && watch) {
    return (
      <div>
        <StepRail current={3} />

        {/* From xl: status, link and checks on the left, the instance record on the right. */}
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] xl:gap-8">
          <div className="space-y-6">
            <div className="panel panel-pad border-good/40 bg-good/5">
              <p className="eyebrow text-good">Live verification passed</p>
              <h1 className="mt-3 font-display text-3xl tracking-wide text-neutral-50 sm:text-4xl">
                AUTHENTIC DiW
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-400">
                The requested hand position, the DiW ID engraving and the archive configuration all
                matched, inside the verification window.
              </p>
            </div>

            {session.link_token && (
              <section className="panel panel-pad">
                <p className="eyebrow">Verification link</p>
                <h2 className="mt-3 font-display text-xl text-neutral-100">
                  Verified by DiW — valid for 24 hours
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-neutral-400">
                  Send this to a buyer. They open it on this site and read the result from DiW
                  directly, so they do not have to trust photographs sent by the seller. No owner
                  details are shown.
                </p>
                <div className="mt-6">
                  <CopyLink path={`/v/${session.link_token}`} />
                </div>
              </section>
            )}

            <details className="panel panel-pad">
              <summary className="cursor-pointer text-sm text-neutral-700">What was checked</summary>
              <div className="mt-4">
                <CheckList checks={checks} />
              </div>
            </details>
          </div>

          <WatchCard watch={watch} verifiedAt={session.verified_at} possessionVerified />
        </div>
      </div>
    );
  }

  if (session.status === 'manual_review') {
    return (
      <div>
        <StepRail current={3} />
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 xl:gap-8">
          <div className="panel panel-pad border-warn/40 bg-warn/5">
            <p className="eyebrow text-warn">Sent for manual review</p>
            <h1 className="mt-3 font-display text-3xl text-neutral-50">A DiW reviewer is checking</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-400">
              The automated checks did not settle every point, so your submission has gone to DiW
              Authentication. The instance record and verification link stay closed until a
              reviewer confirms the result. Keep this page — it updates in place.
            </p>
            <p className="mt-4 break-all text-xs text-neutral-600">Reference: {session.id}</p>
          </div>

          <div className="panel panel-pad">
            <p className="eyebrow">Check status</p>
            <div className="mt-4">
              <CheckList checks={checks} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StepRail current={3} />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 xl:gap-8">
        <div className="panel panel-pad border-bad/40 bg-bad/5">
          <p className="eyebrow text-bad">Not verified</p>
          <h1 className="mt-3 font-display text-3xl text-neutral-50">Live verification failed</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-400">
            {session.fail_reason ?? 'One or more checks did not pass.'} No watch details are
            released for a failed verification. If you believe this is wrong, contact DiW
            Authentication with the reference below.
          </p>
          <p className="mt-4 break-all text-xs text-neutral-600">Reference: {session.id}</p>
          <Link href="/verify/new" className="btn-ghost mt-8 w-full sm:w-auto">
            Try again
          </Link>
        </div>

        <div className="panel panel-pad">
          <p className="eyebrow">Check status</p>
          <div className="mt-4">
            <CheckList checks={checks} />
          </div>
        </div>
      </div>
    </div>
  );
}

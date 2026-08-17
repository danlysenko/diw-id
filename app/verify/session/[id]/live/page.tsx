import Link from 'next/link';
import { notFound } from 'next/navigation';
import ClockFace from '@/components/ClockFace';
import Countdown from '@/components/Countdown';
import StepRail from '@/components/StepRail';
import { formatChallenge, isExpired } from '@/lib/challenge';
import { getSession } from '@/lib/sessions';

export const dynamic = 'force-dynamic';

export default async function LiveChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = getSession(id);
  if (!session) notFound();

  const time = formatChallenge(session.challenge_hour, session.challenge_minute);
  const expired = isExpired(session.expires_at);

  if (session.status === 'passed' || session.status === 'manual_review' || session.status === 'failed') {
    return (
      <div>
        <StepRail current={4} />
        <p className="text-neutral-400">This verification has already been submitted.</p>
        <Link href={`/verify/session/${session.id}/result`} className="btn-primary mt-6">
          View result
        </Link>
      </div>
    );
  }

  return (
    <div>
      <StepRail current={2} />

      <div className="grid items-start gap-12 md:grid-cols-[1fr_auto]">
        <div>
          <p className="eyebrow">Live verification</p>
          <h1 className="mt-4 font-display text-3xl text-neutral-50">
            Set your watch to <span className="text-gold">{time}</span>
          </h1>
          <p className="mt-4 max-w-xl text-neutral-400">
            DiW generated this hand position just now, for this session only. Move the hands on the
            physical watch to exactly this time — that is what proves the watch is with you rather
            than in an old photograph.
          </p>

          <div className="mt-8 flex items-center gap-4">
            {expired ? (
              <span className="text-sm text-bad">Challenge expired</span>
            ) : (
              <Countdown expiresAt={session.expires_at} />
            )}
            <span className="text-xs uppercase tracking-widest2 text-neutral-700">
              One-time challenge
            </span>
          </div>

          <ul className="mt-8 space-y-2 text-sm text-neutral-500">
            <li>— Seconds are not checked; only the hour and minute hands matter.</li>
            <li>— Do not wind the date forward; only the time is being read.</li>
            <li>— If the window closes, start again and DiW will issue a new position.</li>
          </ul>

          <div className="mt-10 flex flex-wrap gap-4">
            {expired ? (
              <Link href="/verify/new" className="btn-primary">
                Request a new challenge
              </Link>
            ) : (
              <Link href={`/verify/session/${session.id}/photos`} className="btn-primary">
                Hands are set — continue
              </Link>
            )}
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <div className="panel p-8">
            <ClockFace hour={session.challenge_hour} minute={session.challenge_minute} size={260} />
            <p className="mt-6 text-center font-display text-2xl tracking-widest text-neutral-100">
              {time}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

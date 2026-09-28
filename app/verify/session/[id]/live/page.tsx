import Link from 'next/link';
import { notFound } from 'next/navigation';
import ClockFace from '@/components/ClockFace';
import Countdown from '@/components/Countdown';
import StepRail from '@/components/StepRail';
import { CHALLENGE_WINDOW_TEXT, formatChallenge, isExpired } from '@/lib/challenge';
import { getSession } from '@/lib/sessions';
import PhotoSubmitForm from '../photos/PhotoSubmitForm';

export const dynamic = 'force-dynamic';

/** The live challenge and the photo upload on one page: set the hands, then send both photos. */
export default async function LiveChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = getSession(id);
  if (!session) notFound();

  const time = formatChallenge(session.challenge_hour, session.challenge_minute);
  const expired = isExpired(session.expires_at);

  if (session.status !== 'pending_challenge') {
    return (
      <div>
        <StepRail current={3} />
        <p className="text-neutral-600">This verification has already been submitted.</p>
        <Link href={`/verify/session/${session.id}/result`} className="btn-primary mt-6 w-full sm:w-auto">
          View result
        </Link>
      </div>
    );
  }

  return (
    <div>
      <StepRail current={2} />

      <p className="eyebrow text-center">Live verification</p>

      <div className="mt-6 md:mt-8">
        <h1 className="font-display text-[1.75rem] leading-tight text-neutral-50 sm:text-3xl xl:text-4xl">
          Set your watch to the time shown below, then send two photos
        </h1>

        {/* The dial sits in the instructions block itself — beside the copy from `sm`, above it
            on phones — rather than in a separate box. */}
        <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
          <div className="shrink-0 text-center">
            <ClockFace
              hour={session.challenge_hour}
              minute={session.challenge_minute}
              size={176}
              className="h-auto w-44 lg:w-48"
            />
            {/* As on the Legacy page: the countdown follows the requested time, so it reads as
                time left for the challenge rather than a reading of the dial. */}
            <p className="mt-4 font-display text-lg text-neutral-50">
              Set your watch to <span className="text-gold">{time}</span>
            </p>
            <p className="mt-1">
              {expired ? (
                <span className="text-sm text-bad">Challenge expired</span>
              ) : (
                <Countdown expiresAt={session.expires_at} />
              )}
            </p>
          </div>

          <div>
            <p className="max-w-2xl text-neutral-400">
              DiW generated this hand position just now, for this session only. Move the hands on
              the physical watch to exactly this time and photograph it — that is what proves the
              watch is with you rather than in an old photograph.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-neutral-500">
              <li>— Seconds are not checked; only the hour and minute hands matter.</li>
              <li>— Do not wind the date forward; only the time is being read.</li>
              <li>
                — You have {CHALLENGE_WINDOW_TEXT}. If the window closes, start again and DiW will
                issue a new position.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 md:mt-10">
          {expired ? (
            <Link href="/verify/new" className="btn-primary w-full sm:w-auto">
              Request a new challenge
            </Link>
          ) : (
            <PhotoSubmitForm sessionId={session.id} />
          )}
        </div>
      </div>
    </div>
  );
}

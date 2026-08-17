import Link from 'next/link';
import { notFound } from 'next/navigation';
import ClockFace from '@/components/ClockFace';
import Countdown from '@/components/Countdown';
import StepRail from '@/components/StepRail';
import { formatChallenge, isExpired } from '@/lib/challenge';
import { getSession } from '@/lib/sessions';
import PhotoSubmitForm from './PhotoSubmitForm';

export const dynamic = 'force-dynamic';

export default async function PhotosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = getSession(id);
  if (!session) notFound();

  if (session.status !== 'pending_challenge') {
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

  const time = formatChallenge(session.challenge_hour, session.challenge_minute);

  if (isExpired(session.expires_at)) {
    return (
      <div>
        <StepRail current={3} />
        <p className="eyebrow">Live verification</p>
        <h1 className="mt-4 font-display text-3xl text-neutral-50">Challenge expired</h1>
        <p className="mt-4 max-w-xl text-neutral-400">
          The 20-minute window for {time} has closed. Start again and DiW will issue a new hand
          position.
        </p>
        <Link href="/verify/new" className="btn-primary mt-8">
          Request a new challenge
        </Link>
      </div>
    );
  }

  return (
    <div>
      <StepRail current={3} />

      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="eyebrow">Live verification</p>
          <h1 className="mt-4 font-display text-3xl text-neutral-50">Send two photos</h1>
          <p className="mt-4 max-w-xl text-neutral-400">
            The hands must read <span className="text-gold">{time}</span> in the photograph. Both
            images are checked against the DiW archive before any watch details are shown.
          </p>
        </div>
        <div className="panel flex items-center gap-5 p-5">
          <ClockFace hour={session.challenge_hour} minute={session.challenge_minute} size={92} />
          <div>
            <p className="font-display text-xl tracking-widest text-neutral-100">{time}</p>
            <Countdown expiresAt={session.expires_at} />
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PhotoSubmitForm sessionId={session.id} />
      </div>
    </div>
  );
}

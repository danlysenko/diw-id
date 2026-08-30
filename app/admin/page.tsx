import { formatChallenge } from '@/lib/challenge';
import { adminEnabled, isStaff } from '@/lib/adminAuth';
import { listLegacySubmissions, listManualReviewSessions } from '@/lib/sessions';
import ClockFace from '@/components/ClockFace';
import StaffLogin from './StaffLogin';
import ReviewActions from './ReviewActions';
import LegacyReviewActions from './LegacyReviewActions';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!adminEnabled()) {
    return (
      <div className="panel p-8">
        <p className="eyebrow">Staff review</p>
        <h1 className="mt-3 font-display text-2xl text-neutral-50">Review queue is not configured</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-400">
          Set <code className="text-neutral-200">DIW_ADMIN_KEY</code> in the environment to open the
          manual review queue. Without it the queue stays closed rather than unguarded.
        </p>
      </div>
    );
  }

  if (!(await isStaff())) return <StaffLogin />;

  const queue = listManualReviewSessions();
  const legacyQueue = listLegacySubmissions();

  return (
    <div>
      <p className="eyebrow">DiW Authentication</p>
      <h1 className="mt-4 font-display text-3xl text-neutral-50">Manual review queue</h1>
      <p className="mt-4 max-w-2xl text-neutral-400">
        {queue.length === 0 && legacyQueue.length === 0
          ? 'Nothing is waiting on a reviewer.'
          : [
              queue.length > 0 &&
                `${queue.length} live verification${queue.length === 1 ? '' : 's'} awaiting a decision`,
              legacyQueue.length > 0 &&
                `${legacyQueue.length} Legacy case${legacyQueue.length === 1 ? '' : 's'} awaiting review`,
            ]
              .filter(Boolean)
              .join(' · ') + '.'}
      </p>

      <div className="mt-10 space-y-6">
        {queue.map((session) => (
          <article key={session.id} className="panel p-8">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <h2 className="font-display text-xl text-neutral-50">{session.diw_id}</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  {session.collection} — {session.base_watch}
                </p>
                <p className="mt-3 text-xs uppercase tracking-widest2 text-neutral-600">
                  {session.flow} flow · submitted {new Date(session.created_at).toLocaleString('en-GB')}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <ClockFace hour={session.challenge_hour} minute={session.challenge_minute} size={78} />
                <div>
                  <p className="text-xs uppercase tracking-widest2 text-neutral-600">Requested</p>
                  <p className="font-display text-lg text-neutral-100">
                    {formatChallenge(session.challenge_hour, session.challenge_minute)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { path: session.watch_photo_path, label: 'Dial photo', exif: session.watch_photo_has_exif },
                { path: session.id_photo_path, label: 'DiW ID photo', exif: session.id_photo_has_exif },
              ].map((photo) => (
                <figure key={photo.label} className="rounded-lg border border-line p-3">
                  {photo.path && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo.path}
                      alt={photo.label}
                      className="max-h-72 w-full rounded object-contain"
                    />
                  )}
                  <figcaption className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                    <span>{photo.label}</span>
                    <span className={photo.exif ? 'text-good' : 'text-warn'}>
                      {photo.exif ? 'capture metadata present' : 'no capture metadata'}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>

            <div className="mt-6">
              <ReviewActions sessionId={session.id} />
            </div>
          </article>
        ))}
      </div>

      {legacyQueue.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl text-neutral-50">Legacy cases</h2>
          <div className="mt-6 space-y-6">
            {legacyQueue.map((submission) => {
              const photos = JSON.parse(submission.photo_paths) as string[];
              return (
                <article key={submission.id} className="panel p-8">
                  <div className="flex flex-wrap items-start justify-between gap-6">
                    <div>
                      <h3 className="font-display text-xl text-neutral-50">{submission.model}</h3>
                      <p className="mt-1 text-sm text-neutral-400">
                        Approx. {submission.approx_year} · bought at {submission.purchase_location}
                      </p>
                      {submission.original_serial && (
                        <p className="mt-1 text-sm text-neutral-500">
                          Base watch serial: {submission.original_serial}
                        </p>
                      )}
                      {submission.contact_email && (
                        <p className="mt-1 text-sm text-neutral-500">{submission.contact_email}</p>
                      )}
                    </div>
                    <p className="text-xs uppercase tracking-widest2 text-neutral-600">
                      submitted {new Date(submission.created_at).toLocaleString('en-GB')}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {photos.map((path, index) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={path}
                        src={path}
                        alt={`${submission.model} photo ${index + 1}`}
                        className="max-h-72 w-full rounded-lg border border-line object-contain p-3"
                      />
                    ))}
                  </div>

                  <div className="mt-6">
                    <LegacyReviewActions caseId={submission.id} />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

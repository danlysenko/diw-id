import { formatChallenge } from '@/lib/challenge';
import { adminEnabled, isStaff } from '@/lib/adminAuth';
import { listAllLegacySubmissions, listAllVerificationSessions } from '@/lib/sessions';
import type { LegacySubmission, VerificationSession } from '@/lib/db';
import ClockFace from '@/components/ClockFace';
import PhotoLightbox from '@/components/PhotoLightbox';
import StaffLogin from './StaffLogin';
import ReviewActions from './ReviewActions';
import LegacyReviewActions from './LegacyReviewActions';

export const dynamic = 'force-dynamic';

type CaseColor = 'info' | 'warn' | 'good' | 'bad';

const DOT_CLASS: Record<CaseColor, string> = {
  info: 'bg-info',
  warn: 'bg-warn',
  good: 'bg-good',
  bad: 'bg-bad',
};
const TEXT_CLASS: Record<CaseColor, string> = {
  info: 'text-info',
  warn: 'text-warn',
  good: 'text-good',
  bad: 'text-bad',
};
const BORDER_CLASS: Record<CaseColor, string> = {
  info: 'border-l-info',
  warn: 'border-l-warn',
  good: 'border-l-good',
  bad: 'border-l-bad',
};

function verificationMeta(status: VerificationSession['status']): { label: string; color: CaseColor } {
  switch (status) {
    case 'passed':
      return { label: 'Verified', color: 'good' };
    case 'failed':
      return { label: 'Counterfeit', color: 'bad' };
    case 'manual_review':
      return { label: 'Pending review', color: 'warn' };
    default:
      return { label: 'New', color: 'info' };
  }
}

function legacyMeta(status: string): { label: string; color: CaseColor } {
  switch (status) {
    case 'verified':
    case 'resolved': // pre-existing value from before verified/counterfeit split
      return { label: 'Verified', color: 'good' };
    case 'counterfeit':
      return { label: 'Counterfeit', color: 'bad' };
    case 'under_review':
      return { label: 'Pending review', color: 'warn' };
    default:
      return { label: 'New', color: 'info' };
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-GB');
}

type CaseRow =
  | {
      kind: 'verification';
      id: string;
      createdAt: string;
      meta: { label: string; color: CaseColor };
      session: VerificationSession & { collection: string; base_watch: string };
    }
  | {
      kind: 'legacy';
      id: string;
      createdAt: string;
      meta: { label: string; color: CaseColor };
      submission: LegacySubmission;
    };

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

  const sessions = listAllVerificationSessions();
  const legacySubmissions = listAllLegacySubmissions();

  const rows: CaseRow[] = [
    ...sessions.map(
      (session): CaseRow => ({
        kind: 'verification',
        id: session.id,
        createdAt: session.created_at,
        meta: verificationMeta(session.status),
        session,
      }),
    ),
    ...legacySubmissions.map(
      (submission): CaseRow => ({
        kind: 'legacy',
        id: submission.id,
        createdAt: submission.created_at,
        meta: legacyMeta(submission.status),
        submission,
      }),
    ),
  ].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const counts = { info: 0, warn: 0, good: 0, bad: 0 } as Record<CaseColor, number>;
  for (const row of rows) counts[row.meta.color] += 1;

  return (
    <div>
      <p className="eyebrow">DiW Authentication</p>
      <h1 className="mt-4 font-display text-3xl text-neutral-50">All cases</h1>
      <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <span className={TEXT_CLASS.info}>{counts.info} new</span>
        <span className={TEXT_CLASS.warn}>{counts.warn} pending review</span>
        <span className={TEXT_CLASS.good}>{counts.good} verified</span>
        <span className={TEXT_CLASS.bad}>{counts.bad} counterfeit</span>
      </p>

      <div className="mt-10 space-y-4">
        {rows.length === 0 && <p className="text-neutral-400">No cases yet.</p>}

        {rows.map((row) => (
          <details
            key={`${row.kind}-${row.id}`}
            className={`panel border-l-4 ${BORDER_CLASS[row.meta.color]}`}
          >
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 p-5">
              <div className="flex min-w-0 items-center gap-4">
                <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${DOT_CLASS[row.meta.color]}`} />
                <span className={`text-xs uppercase tracking-widest2 ${TEXT_CLASS[row.meta.color]}`}>
                  {row.meta.label}
                </span>
                <span className="text-xs uppercase tracking-widest2 text-neutral-700">
                  {row.kind === 'verification' ? 'Live' : 'Legacy'}
                </span>
                <span className="truncate text-neutral-100">
                  {row.kind === 'verification' ? row.session.diw_id : row.submission.model}
                </span>
              </div>
              <span className="shrink-0 text-xs text-neutral-600">{formatDate(row.createdAt)}</span>
            </summary>

            <div className="border-t border-line p-6">
              {row.kind === 'verification' ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-6">
                    <div>
                      <h2 className="font-display text-xl text-neutral-50">{row.session.diw_id}</h2>
                      <p className="mt-1 text-sm text-neutral-400">
                        {row.session.collection} — {row.session.base_watch}
                      </p>
                      <p className="mt-3 text-xs uppercase tracking-widest2 text-neutral-600">
                        {row.session.flow} flow · submitted {formatDate(row.session.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <ClockFace hour={row.session.challenge_hour} minute={row.session.challenge_minute} size={78} />
                      <div>
                        <p className="text-xs uppercase tracking-widest2 text-neutral-600">Requested</p>
                        <p className="font-display text-lg text-neutral-100">
                          {formatChallenge(row.session.challenge_hour, row.session.challenge_minute)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <PhotoLightbox
                      photos={[
                        {
                          path: row.session.watch_photo_path,
                          label: 'Dial photo',
                          exif: row.session.watch_photo_has_exif,
                        },
                        {
                          path: row.session.id_photo_path,
                          label: 'DiW ID photo',
                          exif: row.session.id_photo_has_exif,
                        },
                      ]
                        .filter((p): p is { path: string; label: string; exif: number | null } => Boolean(p.path))
                        .map((p) => ({
                          path: p.path,
                          label: p.label,
                          meta: (
                            <span className={p.exif ? 'text-good' : 'text-warn'}>
                              {p.exif ? 'capture metadata present' : 'no capture metadata'}
                            </span>
                          ),
                        }))}
                    />
                  </div>

                  <div className="mt-6">
                    {row.session.status === 'manual_review' ? (
                      <ReviewActions sessionId={row.session.id} />
                    ) : (
                      <p className="text-sm text-neutral-400">
                        {row.session.status === 'passed' || row.session.status === 'failed'
                          ? `Resolved automatically as ${row.session.status}${
                              row.session.reviewed_by ? ` by ${row.session.reviewed_by}` : ''
                            }.`
                          : 'Still in progress — nothing for a reviewer to do yet.'}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-6">
                    <div>
                      <h2 className="font-display text-xl text-neutral-50">{row.submission.model}</h2>
                      <p className="mt-1 text-sm text-neutral-400">
                        Approx. {row.submission.approx_year} · bought at {row.submission.purchase_location}
                      </p>
                      {row.submission.original_serial && (
                        <p className="mt-1 text-sm text-neutral-500">
                          Base watch serial: {row.submission.original_serial}
                        </p>
                      )}
                      {row.submission.contact_email && (
                        <p className="mt-1 text-sm text-neutral-500">{row.submission.contact_email}</p>
                      )}
                    </div>
                    <p className="text-xs uppercase tracking-widest2 text-neutral-600">
                      submitted {formatDate(row.submission.created_at)}
                    </p>
                  </div>

                  <div className="mt-6">
                    <PhotoLightbox
                      photos={(JSON.parse(row.submission.photo_paths) as string[]).map((path, index) => ({
                        path,
                        label: `${row.submission.model} — photo ${index + 1}`,
                      }))}
                    />
                  </div>

                  <div className="mt-6">
                    <LegacyReviewActions
                      caseId={row.submission.id}
                      status={row.submission.status}
                      reviewedBy={row.submission.reviewed_by}
                      reviewNote={row.submission.review_note}
                    />
                  </div>
                </>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

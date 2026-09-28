import Link from 'next/link';
import { formatChallenge } from '@/lib/challenge';
import { adminEnabled, isStaff } from '@/lib/adminAuth';
import {
  listAllLegacySubmissions,
  listAllVerificationSessions,
  pruneAbandonedChallenges,
} from '@/lib/sessions';
import {
  CASE_STATUS_LABEL,
  SETTABLE_STATUSES,
  legacyStatus,
  statusLogsByCase,
  verificationStatus,
  type CaseStatus,
} from '@/lib/caseStatus';
import type { CheckResult } from '@/lib/checks';
import type { CaseStatusLogEntry, LegacyEmail, LegacySubmission, VerificationSession } from '@/lib/db';
import { emailsByCase } from '@/lib/email';
import CheckList from '@/components/CheckList';
import ClockFace from '@/components/ClockFace';
import PageHeader from '@/components/PageHeader';
import PhotoLightbox from '@/components/PhotoLightbox';
import StaffLogin from './StaffLogin';
import CaseStatusControl from './CaseStatusControl';
import EmailCaseControl from './EmailCaseControl';

export const dynamic = 'force-dynamic';

type CaseColor = 'info' | 'warn' | 'good' | 'bad';

const TEXT_CLASS: Record<CaseColor, string> = {
  info: 'text-info',
  warn: 'text-warn',
  good: 'text-good',
  bad: 'text-bad',
};
// Coloured edge on the header row only; `-ml-px` lays it over the card's own left border.
const BORDER_CLASS: Record<CaseColor, string> = {
  info: 'border-l-info',
  warn: 'border-l-warn',
  good: 'border-l-good',
  bad: 'border-l-bad',
};

const STATUS_COLOR: Record<CaseStatus, CaseColor> = {
  new: 'info',
  pending: 'warn',
  verified: 'good',
  counterfeit: 'bad',
};

/**
 * SQLite's datetime('now') gives UTC as "YYYY-MM-DD HH:MM:SS" with no zone marker, which
 * `new Date()` would read as local time — so mark it as UTC before formatting. ISO strings
 * written by the app itself already carry their zone and pass through unchanged.
 */
function formatDate(value: string): string {
  const utc = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value) ? `${value.replace(' ', 'T')}Z` : value;
  return new Date(utc).toLocaleString('en-GB');
}

type CaseRow =
  | {
      kind: 'verification';
      id: string;
      createdAt: string;
      status: CaseStatus;
      session: VerificationSession & { collection: string; base_watch: string };
    }
  | {
      kind: 'legacy';
      id: string;
      createdAt: string;
      status: CaseStatus;
      submission: LegacySubmission;
    };

const FILTERS: { status: CaseStatus; color: CaseColor; label: string }[] = [
  { status: 'new', color: 'info', label: 'new' },
  { status: 'pending', color: 'warn', label: 'pending review' },
  { status: 'verified', color: 'good', label: 'verified' },
  { status: 'counterfeit', color: 'bad', label: 'counterfeit' },
];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawFilter } = await searchParams;
  const filter = FILTERS.find((f) => f.status === rawFilter)?.status ?? null;

  if (!adminEnabled()) {
    return (
      <div className="panel panel-pad lg:max-w-3xl">
        <p className="eyebrow">Staff review</p>
        <h1 className="mt-3 font-display text-2xl text-neutral-50">Review queue is not configured</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600">
          Set <code className="text-neutral-200">DIW_ADMIN_KEY</code> in the environment to open the
          manual review queue. Without it the queue stays closed rather than unguarded.
        </p>
      </div>
    );
  }

  if (!(await isStaff())) return <StaffLogin />;

  pruneAbandonedChallenges();
  const sessions = listAllVerificationSessions();
  const legacySubmissions = listAllLegacySubmissions();

  const rows: CaseRow[] = [
    ...sessions.map(
      (session): CaseRow => ({
        kind: 'verification',
        id: session.id,
        createdAt: session.created_at,
        status: verificationStatus(session.status),
        session,
      }),
    ),
    ...legacySubmissions.map(
      (submission): CaseRow => ({
        kind: 'legacy',
        id: submission.id,
        createdAt: submission.created_at,
        status: legacyStatus(submission.status),
        submission,
      }),
    ),
  ].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const counts = { info: 0, warn: 0, good: 0, bad: 0 } as Record<CaseColor, number>;
  for (const row of rows) counts[STATUS_COLOR[row.status]] += 1;
  const logs = statusLogsByCase();
  const emailLogs = emailsByCase();
  const visibleRows = filter ? rows.filter((row) => row.status === filter) : rows;

  return (
    <div>
      <PageHeader eyebrow="DiW Authentication" title="All cases">
        {/* The counts double as filters (?status=…); counts always cover every case. */}
        <nav aria-label="Filter cases by status" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link
            href="/admin"
            aria-current={filter === null ? 'page' : undefined}
            className={`transition hover:text-neutral-100 ${
              filter === null ? 'text-neutral-100 underline underline-offset-4' : 'text-neutral-500'
            }`}
          >
            {rows.length} total
          </Link>
          {FILTERS.map((f) => (
            <Link
              key={f.status}
              href={`/admin?status=${f.status}`}
              aria-current={filter === f.status ? 'page' : undefined}
              className={`${TEXT_CLASS[f.color]} transition hover:opacity-80 ${
                filter === f.status ? 'underline underline-offset-4' : filter ? 'opacity-50' : ''
              }`}
            >
              {counts[f.color]} {f.label}
            </Link>
          ))}
        </nav>
      </PageHeader>

      <div className="space-y-4">
        {visibleRows.length === 0 && (
          <p className="text-neutral-600">
            {filter ? `No ${CASE_STATUS_LABEL[filter].toLowerCase()} cases.` : 'No cases yet.'}
          </p>
        )}

        {visibleRows.map((row) => (
          // Shared `name` makes the entries an accordion: opening one closes the others.
          <details
            name="admin-case"
            key={`${row.kind}-${row.id}`}
            className="panel group"
          >
            <summary
              className={`-ml-px flex cursor-pointer flex-wrap items-center justify-between gap-3 border-l-4 p-5 ${BORDER_CLASS[STATUS_COLOR[row.status]]}`}
            >
              <div className="flex min-w-0 items-center gap-5">
                <span className={`text-xs uppercase tracking-widest2 ${TEXT_CLASS[STATUS_COLOR[row.status]]}`}>
                  {CASE_STATUS_LABEL[row.status]}
                </span>
                <span aria-hidden className="h-3 w-px shrink-0 bg-line" />
                <span className="text-xs uppercase tracking-widest2 text-neutral-400">
                  {row.kind === 'verification' ? 'Live' : 'Legacy'}
                </span>
                <span aria-hidden className="h-3 w-px shrink-0 bg-line" />
                <span className="truncate text-neutral-100">
                  {row.kind === 'verification' ? row.session.diw_id : row.submission.model}
                </span>
              </div>
              <span className="flex shrink-0 items-center gap-4 text-xs text-neutral-500">
                {formatDate(row.createdAt)}
                <span aria-hidden className="text-neutral-400 transition group-open:rotate-180">
                  ▾
                </span>
              </span>
            </summary>

            <CaseBody
              row={row}
              log={logs.get(`${row.kind}:${row.id}`) ?? []}
              emailLog={row.kind === 'legacy' ? (emailLogs.get(row.id) ?? []) : []}
            />
          </details>
        ))}
      </div>
    </div>
  );
}

/**
 * An expanded case. Wide screens: the evidence on the left (details, the requested time right
 * above the photos, automatic checks) and the review panel on the right, pinned while the
 * evidence scrolls. Narrower screens stack the review panel under the evidence.
 */
function CaseBody({
  row,
  log,
  emailLog,
}: {
  row: CaseRow;
  log: CaseStatusLogEntry[];
  emailLog: LegacyEmail[];
}) {
  const requested =
    row.kind === 'verification'
      ? { hour: row.session.challenge_hour, minute: row.session.challenge_minute }
      : { hour: row.submission.challenge_hour, minute: row.submission.challenge_minute };

  return (
    <div className="grid grid-cols-1 border-t border-line xl:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="space-y-8 p-5 sm:p-6">
        {row.kind === 'verification' ? (
          <VerificationEvidence session={row.session} />
        ) : (
          <LegacyEvidence submission={row.submission} emailLog={emailLog} />
        )}
      </div>

      <aside className="border-t border-line bg-white/[0.02] p-5 sm:p-6 xl:border-l xl:border-t-0">
        <div className="space-y-8 xl:sticky xl:top-6">
          {requested.hour !== null && requested.minute !== null && (
            <div>
              <p className="label">Requested time</p>
              <div className="flex items-center gap-4">
                <ClockFace hour={requested.hour} minute={requested.minute} size={72} showSeconds={false} />
                <p className="font-display text-2xl text-neutral-50">
                  {formatChallenge(requested.hour, requested.minute)}
                </p>
              </div>
            </div>
          )}
          <CaseFooter kind={row.kind} caseId={row.id} status={row.status} log={log} />
        </div>
      </aside>
    </div>
  );
}

function VerificationEvidence({
  session,
}: {
  session: VerificationSession & { collection: string; base_watch: string };
}) {
  const photos = [
    { path: session.watch_photo_path, label: 'Dial photo', exif: session.watch_photo_has_exif },
    { path: session.id_photo_path, label: 'DiW ID photo', exif: session.id_photo_has_exif },
  ].filter((p): p is { path: string; label: string; exif: number | null } => Boolean(p.path));
  const checks = parseChecks(session.checks_json);

  return (
    <>
      <div>
        <h2 className="font-display text-2xl text-neutral-50">{session.diw_id}</h2>
        <DetailGrid
          items={[
            ['Collection', session.collection],
            ['Base watch', session.base_watch],
            ['Flow', session.flow === 'dealer' ? 'Dealer' : 'Owner'],
            ['Submitted', formatDate(session.created_at)],
          ]}
        />
      </div>

      <PhotoSection>
        <PhotoLightbox
          photos={photos.map((p) => ({
            path: p.path,
            label: p.label,
            meta: (
              <span key={p.path} className={p.exif ? 'text-good' : 'text-warn'}>
                {p.exif ? 'capture metadata present' : 'no capture metadata'}
              </span>
            ),
          }))}
        />
      </PhotoSection>

      {checks.length > 0 && (
        <section>
          <p className="label">Automatic checks</p>
          <CheckList checks={checks} />
        </section>
      )}
    </>
  );
}

function LegacyEvidence({
  submission,
  emailLog,
}: {
  submission: LegacySubmission;
  emailLog: LegacyEmail[];
}) {
  const photos = [
    ...(submission.dial_photo_path && submission.challenge_hour !== null
      ? [
          {
            path: submission.dial_photo_path,
            label: `Dial at ${formatChallenge(submission.challenge_hour, submission.challenge_minute ?? 0)}`,
          },
        ]
      : []),
    ...(JSON.parse(submission.photo_paths) as string[]).map((path, index) => ({
      path,
      label: `Photo ${index + 1}`,
    })),
  ];

  return (
    <>
      <div>
        <h2 className="font-display text-2xl text-neutral-50">{submission.model}</h2>
        <DetailGrid
          items={[
            ['Approx. year', submission.approx_year],
            ['Bought at', submission.purchase_location],
            ['Base watch serial', submission.original_serial ?? '—'],
            [
              'Contact email',
              submission.contact_email ? (
                <a
                  href={`mailto:${submission.contact_email}`}
                  className="text-gold underline-offset-4 hover:underline"
                >
                  {submission.contact_email}
                </a>
              ) : (
                '—'
              ),
            ],
            ...(submission.contact_email
              ? ([
                  [
                    'Verification link',
                    <EmailCaseControl
                      key="email"
                      caseId={submission.id}
                      defaultSubject={`Your DiW archive case — ${submission.model}`}
                      log={emailLog}
                    />,
                  ],
                ] satisfies [string, React.ReactNode][])
              : []),
            ['Submitted', formatDate(submission.created_at)],
          ]}
        />
      </div>

      <PhotoSection>
        <PhotoLightbox photos={photos} />
      </PhotoSection>
    </>
  );
}

/** Label / value pairs in a grid that reads at a glance. */
function DetailGrid({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 2xl:grid-cols-3">
      {items.map(([term, value]) => (
        <div key={term}>
          <dt className="text-xs uppercase tracking-widest2 text-neutral-500">{term}</dt>
          <dd className="mt-1 break-words text-sm text-neutral-100">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The case's photos; the requested time to compare them against is in the review panel. */
function PhotoSection({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <p className="label">Photos</p>
      {children}
    </section>
  );
}

function parseChecks(json: string | null): CheckResult[] {
  if (!json) return [];
  try {
    return JSON.parse(json) as CheckResult[];
  } catch {
    return [];
  }
}

/** The review panel for a case: status buttons, the change log and "Delete case". */
function CaseFooter({
  kind,
  caseId,
  status,
  log,
}: {
  kind: 'verification' | 'legacy';
  caseId: string;
  status: CaseStatus;
  log: CaseStatusLogEntry[];
}) {
  // The control lays out the footer (status left, log + delete right); the log is rendered here.
  return (
    <CaseStatusControl
      kind={kind}
      caseId={caseId}
      current={status}
      options={SETTABLE_STATUSES}
      log={
        <>
          <p className="label">Log</p>
          {log.length === 0 ? (
            <p className="text-sm text-neutral-600">No changes recorded yet.</p>
          ) : (
            <ol className="space-y-3 border-l border-line pl-4">
              {log.map((entry) => (
                <li key={entry.id} className="text-sm">
                  <p className="text-xs text-neutral-500">
                    {formatDate(entry.created_at)} · {entry.changed_by}
                  </p>
                  <p className="text-neutral-100">
                    {entry.from_status
                      ? `${label(entry.from_status)} → ${label(entry.to_status)}`
                      : `Submitted as ${label(entry.to_status)}`}
                  </p>
                  {entry.note && <p className="italic text-warn">“{entry.note}”</p>}
                </li>
              ))}
            </ol>
          )}
        </>
      }
    />
  );
}

function label(status: string): string {
  return CASE_STATUS_LABEL[status as CaseStatus] ?? status;
}

import type { CheckResult } from './checks';
import { formatChallenge } from './challenge';
import type { LegacySubmission, VerificationSession, Watch } from './db';
import { notifyStaff } from './email';
import { formatDateTime } from './formatDate';

function appUrl(path: string): string | null {
  const base = process.env.APP_URL?.replace(/\/+$/, '');
  return base ? `${base}${path}` : null;
}

function lines(rows: [string, string | null | undefined][]): string {
  return rows
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');
}

function submittedAt(): string {
  return formatDateTime(new Date());
}

export function notifyNewLegacyCase(c: LegacySubmission, origin: string): Promise<void> {
  const photos: string[] = JSON.parse(c.photo_paths);
  const photoLinks = photos.map((p) => appUrl(p) ?? p);

  const body = [
    'A new DiW Legacy case has been submitted.',
    '',
    lines([
      ['Model', c.model],
      ['Approx. year', c.approx_year],
      ['Bought at', c.purchase_location],
      ['Base watch serial', c.original_serial],
      ['Contact email', c.contact_email ?? 'not given'],
      [
        'Hand position',
        c.challenge_hour !== null && c.challenge_minute !== null
          ? formatChallenge(c.challenge_hour, c.challenge_minute)
          : null,
      ],
      ['Submitted', `${submittedAt()} (${origin})`],
      ['Case ID', c.id],
    ]),
    '',
    `Photographs (${photoLinks.length}):`,
    ...photoLinks.map((link) => `  ${link}`),
    '',
    appUrl('/admin') ? `Review in admin: ${appUrl('/admin')}` : '',
  ].join('\n');

  return notifyStaff(`New Legacy case — ${c.model}`, body.trimEnd());
}

const VERDICT_MARK: Record<CheckResult['verdict'], string> = { pass: '✓', fail: '✕', review: '•' };

const OUTCOME_LABEL: Record<VerificationSession['status'], string> = {
  pending_challenge: 'Pending',
  photos_uploaded: 'Photos uploaded',
  checking: 'Checking',
  passed: 'Passed automatically',
  failed: 'Failed automatically',
  manual_review: 'Needs manual review',
};

export function notifyNewVerification(
  session: VerificationSession,
  watch: Watch | undefined,
  checks: CheckResult[],
  photoPaths: string[],
  origin: string,
): Promise<void> {
  const body = [
    'A new DiW ID live verification has been submitted.',
    '',
    lines([
      ['Result', OUTCOME_LABEL[session.status]],
      ['Reason', session.fail_reason],
      ['DiW ID', session.diw_id],
      ['Watch', watch ? `${watch.collection} — ${watch.base_watch}` : 'not found in archive'],
      ['Flow', session.flow === 'dealer' ? 'Dealer' : 'Owner'],
      ['Hand position', formatChallenge(session.challenge_hour, session.challenge_minute)],
      ['Submitted', `${submittedAt()} (${origin})`],
      ['Case ID', session.id],
    ]),
    '',
    'Checks:',
    ...checks.map((c) => `  ${VERDICT_MARK[c.verdict]} ${c.label}`),
    '',
    'Photographs:',
    ...photoPaths.map((p) => `  ${appUrl(p) ?? p}`),
    '',
    appUrl('/admin') ? `Review in admin: ${appUrl('/admin')}` : '',
  ].join('\n');

  return notifyStaff(
    `New verification — ${session.diw_id} (${OUTCOME_LABEL[session.status].toLowerCase()})`,
    body.trimEnd(),
  );
}

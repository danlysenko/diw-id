import { db, type VerificationSession, type Watch } from './db';
import { isExpired } from './challenge';
import { analyzePhotos, type ImageVerdict } from './analysis';
import type { StoredPhoto } from './uploads';

export type CheckKey =
  | 'diw_id_exists'
  | 'hand_position'
  | 'window_open'
  | 'id_photo_matches'
  | 'model_matches'
  | 'archive_config_matches'
  | 'photo_not_reused';

export type CheckResult = {
  key: CheckKey;
  label: string;
  verdict: 'pass' | 'fail' | 'review';
  detail: string;
};

export type VerificationOutcome = {
  status: 'passed' | 'failed' | 'manual_review';
  checks: CheckResult[];
  failReason: string | null;
};

const LABELS: Record<CheckKey, string> = {
  diw_id_exists: 'DiW ID exists in archive',
  hand_position: 'Hand position matches the challenge',
  window_open: 'Verification window still open',
  id_photo_matches: 'DiW ID legible and matching',
  model_matches: 'Model matches DiW records',
  archive_config_matches: 'Appearance matches archive configuration',
  photo_not_reused: 'Photos not previously submitted',
};

function fromVerdict(verdict: ImageVerdict): CheckResult['verdict'] {
  if (verdict === 'match') return 'pass';
  if (verdict === 'mismatch') return 'fail';
  return 'review';
}

export async function runChecks(args: {
  session: VerificationSession;
  watch: Watch | undefined;
  watchPhoto: StoredPhoto;
  idPhoto: StoredPhoto;
}): Promise<VerificationOutcome> {
  const { session, watch, watchPhoto, idPhoto } = args;
  const checks: CheckResult[] = [];

  checks.push({
    key: 'diw_id_exists',
    label: LABELS.diw_id_exists,
    verdict: watch ? 'pass' : 'fail',
    detail: watch ? `${session.diw_id} found in the DiW archive.` : `${session.diw_id} is not in the DiW archive.`,
  });

  const expired = isExpired(session.expires_at);
  checks.push({
    key: 'window_open',
    label: LABELS.window_open,
    verdict: expired ? 'fail' : 'pass',
    detail: expired
      ? 'The 20-minute live verification window closed before the photos were submitted.'
      : 'Photos were submitted inside the live verification window.',
  });

  const reuse = db
    .prepare('SELECT session_id FROM photo_hashes WHERE hash IN (?, ?) AND session_id != ?')
    .all(watchPhoto.sha256, idPhoto.sha256, session.id) as { session_id: string }[];
  checks.push({
    key: 'photo_not_reused',
    label: LABELS.photo_not_reused,
    verdict: reuse.length > 0 ? 'fail' : 'pass',
    detail:
      reuse.length > 0
        ? 'One of these images was already submitted in an earlier verification.'
        : 'Both images are new to the DiW system.',
  });

  if (!watch || expired || reuse.length > 0) {
    const failReason = !watch
      ? 'DiW ID not found.'
      : expired
        ? 'Verification window expired.'
        : 'Photo reuse detected.';
    // Image checks are not run once a hard check has already failed.
    for (const key of ['hand_position', 'id_photo_matches', 'model_matches', 'archive_config_matches'] as CheckKey[]) {
      checks.push({ key, label: LABELS[key], verdict: 'review', detail: 'Not evaluated.' });
    }
    return { status: 'failed', checks, failReason };
  }

  const analysis = await analyzePhotos({
    watch,
    challenge: { hour: session.challenge_hour, minute: session.challenge_minute },
    watchPhoto,
    idPhoto,
  });

  const imageChecks: { key: CheckKey; verdict: ImageVerdict }[] = [
    { key: 'hand_position', verdict: analysis.handPosition },
    { key: 'id_photo_matches', verdict: analysis.readDiwId },
    { key: 'model_matches', verdict: analysis.modelMatch },
    { key: 'archive_config_matches', verdict: analysis.archiveConfigMatch },
  ];

  for (const { key, verdict } of imageChecks) {
    checks.push({
      key,
      label: LABELS[key],
      verdict: fromVerdict(verdict),
      detail:
        verdict === 'match'
          ? 'Confirmed against the DiW archive.'
          : verdict === 'mismatch'
            ? 'Did not match the DiW archive.'
            : 'Needs a DiW reviewer.',
    });
  }

  if (checks.some((c) => c.verdict === 'fail')) {
    return {
      status: 'failed',
      checks,
      failReason: checks.find((c) => c.verdict === 'fail')!.label,
    };
  }
  if (checks.some((c) => c.verdict === 'review')) {
    return { status: 'manual_review', checks, failReason: null };
  }
  return { status: 'passed', checks, failReason: null };
}

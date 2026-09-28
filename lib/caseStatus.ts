import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { LINK_VALID_HOURS, expiresAtFromNow } from './challenge';
import { SETTABLE_STATUSES, type CaseKind, type CaseStatus } from './caseStatusShared';
import { db, type CaseStatusLogEntry, type LegacySubmission, type VerificationSession } from './db';
import { UPLOAD_DIR } from './uploads';

export { CASE_STATUS_LABEL, SETTABLE_STATUSES, type CaseKind, type CaseStatus } from './caseStatusShared';

export function verificationStatus(status: VerificationSession['status']): CaseStatus {
  switch (status) {
    case 'passed':
      return 'verified';
    case 'failed':
      return 'counterfeit';
    case 'manual_review':
      return 'pending';
    default:
      return 'new';
  }
}

export function legacyStatus(status: string): CaseStatus {
  switch (status) {
    case 'verified':
    case 'resolved': // pre-existing value from before the verified/counterfeit split
      return 'verified';
    case 'counterfeit':
      return 'counterfeit';
    case 'under_review':
      return 'pending';
    default:
      return 'new';
  }
}

const LEGACY_DB_STATUS: Record<CaseStatus, string> = {
  new: 'submitted',
  pending: 'under_review',
  verified: 'verified',
  counterfeit: 'counterfeit',
};

export function logStatusChange(entry: {
  kind: CaseKind;
  caseId: string;
  from: CaseStatus | null;
  to: CaseStatus;
  by: string;
  note?: string | null;
}): void {
  db.prepare(
    `INSERT INTO case_status_log (case_kind, case_id, from_status, to_status, changed_by, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(entry.kind, entry.caseId, entry.from, entry.to, entry.by, entry.note ?? null, new Date().toISOString());
}

/** Every log entry for every case, grouped by `${kind}:${id}`, oldest first within a case. */
export function statusLogsByCase(): Map<string, CaseStatusLogEntry[]> {
  const rows = db.prepare('SELECT * FROM case_status_log ORDER BY id ASC').all() as CaseStatusLogEntry[];
  const byCase = new Map<string, CaseStatusLogEntry[]>();
  for (const row of rows) {
    const key = `${row.case_kind}:${row.case_id}`;
    const list = byCase.get(key);
    if (list) list.push(row);
    else byCase.set(key, [row]);
  }
  return byCase;
}

export type ChangeResult = { ok: true } | { ok: false; status: number; error: string };

/**
 * Staff status change: applies it to the case and logs it in one transaction, so the log can
 * never disagree with the case. Also keeps the customer-facing side consistent — a verified live
 * case gets a fresh 24-hour proof link, and any other status leaves its old link unusable (the
 * proof page only opens links for passed verifications).
 */
export function changeCaseStatus(input: {
  kind: CaseKind;
  caseId: string;
  to: CaseStatus;
  by: string;
  note: string | null;
}): ChangeResult {
  const { kind, caseId, to, by, note } = input;
  if (!SETTABLE_STATUSES.includes(to)) {
    return { ok: false, status: 400, error: 'That status cannot be set.' };
  }

  const run = db.transaction((): ChangeResult => {
    if (kind === 'verification') {
      const session = db.prepare('SELECT * FROM verification_sessions WHERE id = ?').get(caseId) as
        | VerificationSession
        | undefined;
      if (!session || session.status === 'pending_challenge') {
        return { ok: false, status: 404, error: 'Case not found.' };
      }
      const from = verificationStatus(session.status);
      if (from === to) return { ok: false, status: 409, error: 'The case already has that status.' };

      const now = new Date().toISOString();
      if (to === 'verified') {
        db.prepare(
          `UPDATE verification_sessions
           SET status = 'passed', verified_at = COALESCE(verified_at, ?), fail_reason = NULL,
               reviewed_by = ?, review_note = ?, link_token = ?, link_expires_at = ?
           WHERE id = ?`,
        ).run(
          now,
          by,
          note,
          crypto.randomBytes(24).toString('base64url'),
          expiresAtFromNow(LINK_VALID_HOURS * 60).toISOString(),
          caseId,
        );
      } else if (to === 'counterfeit') {
        db.prepare(
          `UPDATE verification_sessions
           SET status = 'failed', fail_reason = ?, reviewed_by = ?, review_note = ?
           WHERE id = ?`,
        ).run(note || 'Marked counterfeit by DiW Authentication.', by, note, caseId);
      } else {
        db.prepare(
          `UPDATE verification_sessions SET status = 'manual_review', reviewed_by = ?, review_note = ?
           WHERE id = ?`,
        ).run(by, note, caseId);
      }
      logStatusChange({ kind, caseId, from, to, by, note });
      return { ok: true };
    }

    const submission = db.prepare('SELECT * FROM legacy_submissions WHERE id = ?').get(caseId) as
      | LegacySubmission
      | undefined;
    if (!submission) return { ok: false, status: 404, error: 'Case not found.' };
    const from = legacyStatus(submission.status);
    if (from === to) return { ok: false, status: 409, error: 'The case already has that status.' };

    db.prepare(`UPDATE legacy_submissions SET status = ?, reviewed_by = ?, review_note = ? WHERE id = ?`).run(
      LEGACY_DB_STATUS[to],
      by,
      note,
      caseId,
    );
    logStatusChange({ kind, caseId, from, to, by, note });
    return { ok: true };
  });

  return run();
}

/**
 * Permanently deletes a case: the case row, its photo-reuse hashes and its uploaded photos.
 * The case's status log is kept (with a final "deleted" entry) so there is an audit trail of
 * what existed and who removed it, even though admin no longer shows it.
 */
export async function deleteCase(input: { kind: CaseKind; caseId: string; by: string }): Promise<ChangeResult> {
  const { kind, caseId, by } = input;
  let photoPaths: string[] = [];

  const run = db.transaction((): ChangeResult => {
    let from: CaseStatus;
    if (kind === 'verification') {
      const session = db.prepare('SELECT * FROM verification_sessions WHERE id = ?').get(caseId) as
        | VerificationSession
        | undefined;
      if (!session) return { ok: false, status: 404, error: 'Case not found.' };
      from = verificationStatus(session.status);
      photoPaths = [session.watch_photo_path, session.id_photo_path].filter((p): p is string => Boolean(p));
      db.prepare('DELETE FROM photo_hashes WHERE session_id = ?').run(caseId);
      db.prepare('DELETE FROM verification_sessions WHERE id = ?').run(caseId);
    } else {
      const submission = db.prepare('SELECT * FROM legacy_submissions WHERE id = ?').get(caseId) as
        | LegacySubmission
        | undefined;
      if (!submission) return { ok: false, status: 404, error: 'Case not found.' };
      from = legacyStatus(submission.status);
      photoPaths = [...(JSON.parse(submission.photo_paths) as string[]), submission.dial_photo_path].filter(
        (p): p is string => Boolean(p),
      );
      db.prepare('DELETE FROM legacy_submissions WHERE id = ?').run(caseId);
    }
    db.prepare(
      `INSERT INTO case_status_log (case_kind, case_id, from_status, to_status, changed_by, note, created_at)
       VALUES (?, ?, ?, 'deleted', ?, 'Case deleted', ?)`,
    ).run(kind, caseId, from, by, new Date().toISOString());
    return { ok: true };
  });

  const result = run();
  if (!result.ok) return result;

  // Files go only after the database change has committed. Uploaded names are always flat
  // (`/uploads/<name>`), so basename() keeps this inside UPLOAD_DIR.
  await Promise.all(
    photoPaths.map((p) => fs.unlink(path.join(UPLOAD_DIR, path.basename(p))).catch(() => undefined)),
  );
  return result;
}

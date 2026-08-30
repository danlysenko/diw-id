import crypto from 'node:crypto';
import { db, type LegacySubmission, type VerificationSession, type Watch } from './db';
import {
  CHALLENGE_WINDOW_MINUTES,
  LINK_VALID_HOURS,
  expiresAtFromNow,
  generateChallenge,
} from './challenge';

export function findWatch(diwId: string): Watch | undefined {
  return db.prepare('SELECT * FROM watches WHERE diw_id = ?').get(diwId) as Watch | undefined;
}

export function getSession(id: string): VerificationSession | undefined {
  return db.prepare('SELECT * FROM verification_sessions WHERE id = ?').get(id) as
    | VerificationSession
    | undefined;
}

export function getSessionByToken(token: string): VerificationSession | undefined {
  return db.prepare('SELECT * FROM verification_sessions WHERE link_token = ?').get(token) as
    | VerificationSession
    | undefined;
}

export function createSession(diwId: string, flow: 'owner' | 'dealer'): VerificationSession {
  const id = crypto.randomUUID();
  const { hour, minute } = generateChallenge();
  const expiresAt = expiresAtFromNow(CHALLENGE_WINDOW_MINUTES).toISOString();

  db.prepare(
    `INSERT INTO verification_sessions (id, diw_id, flow, challenge_hour, challenge_minute, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(id, diwId, flow, hour, minute, expiresAt);

  return getSession(id)!;
}

export function issueVerificationLink(sessionId: string): { token: string; expiresAt: string } {
  const token = crypto.randomBytes(24).toString('base64url');
  const expiresAt = expiresAtFromNow(LINK_VALID_HOURS * 60).toISOString();
  db.prepare('UPDATE verification_sessions SET link_token = ?, link_expires_at = ? WHERE id = ?').run(
    token,
    expiresAt,
    sessionId,
  );
  return { token, expiresAt };
}

export function recordPhotoHashes(sessionId: string, hashes: string[]): void {
  const stmt = db.prepare(
    'INSERT INTO photo_hashes (hash, session_id) VALUES (?, ?) ON CONFLICT(hash) DO NOTHING',
  );
  const tx = db.transaction(() => {
    for (const hash of hashes) stmt.run(hash, sessionId);
  });
  tx();
}

export function listManualReviewSessions(): (VerificationSession & { collection: string; base_watch: string })[] {
  return db
    .prepare(
      `SELECT s.*, w.collection, w.base_watch
       FROM verification_sessions s
       JOIN watches w ON w.diw_id = s.diw_id
       WHERE s.status = 'manual_review'
       ORDER BY s.created_at DESC`,
    )
    .all() as (VerificationSession & { collection: string; base_watch: string })[];
}

export function listLegacySubmissions(): LegacySubmission[] {
  return db
    .prepare(`SELECT * FROM legacy_submissions WHERE status != 'resolved' ORDER BY created_at DESC`)
    .all() as LegacySubmission[];
}

export function resolveLegacySubmission(id: string, reviewer: string, note: string | null): void {
  db.prepare(
    `UPDATE legacy_submissions SET status = 'resolved', reviewed_by = ?, review_note = ? WHERE id = ?`,
  ).run(reviewer, note, id);
}

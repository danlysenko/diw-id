import crypto from 'node:crypto';
import {
  db,
  type LegacyChallenge,
  type LegacySubmission,
  type VerificationSession,
  type Watch,
} from './db';
import {
  CHALLENGE_WINDOW_SECONDS,
  CHALLENGE_WINDOW_TEXT,
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
  const expiresAt = expiresAtFromNow(CHALLENGE_WINDOW_SECONDS / 60).toISOString();

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

/**
 * Cases for the staff queue: only verifications that were actually submitted. A session row has
 * to exist from the moment the DiW ID is entered (it holds the server-issued hand position), but
 * until photos arrive there is nothing for a reviewer to look at.
 */
export function listAllVerificationSessions(): (VerificationSession & {
  collection: string;
  base_watch: string;
})[] {
  return db
    .prepare(
      `SELECT s.*, w.collection, w.base_watch
       FROM verification_sessions s
       JOIN watches w ON w.diw_id = s.diw_id
       WHERE s.status != 'pending_challenge'
       ORDER BY s.created_at DESC`,
    )
    .all() as (VerificationSession & { collection: string; base_watch: string })[];
}

/** How long an abandoned challenge is kept after expiry, so a late visitor still gets the
 *  "challenge expired" page instead of a 404. */
const ABANDONED_GRACE_HOURS = 24;

/**
 * Deletes verification sessions that never got photos and Legacy hand positions that were never
 * used, once they have been expired for the grace period. Neither can be completed any more, and
 * neither ever holds photos, so nothing a reviewer needs is lost.
 */
export function pruneAbandonedChallenges(): void {
  const cutoff = new Date(Date.now() - ABANDONED_GRACE_HOURS * 3_600_000).toISOString();
  db.prepare(
    `DELETE FROM verification_sessions WHERE status = 'pending_challenge' AND expires_at < ?`,
  ).run(cutoff);
  db.prepare(`DELETE FROM legacy_challenges WHERE used_at IS NULL AND expires_at < ?`).run(cutoff);
}

export function createLegacyChallenge(): LegacyChallenge {
  const id = crypto.randomUUID();
  const { hour, minute } = generateChallenge();
  const expiresAt = expiresAtFromNow(CHALLENGE_WINDOW_SECONDS / 60).toISOString();

  db.prepare(
    `INSERT INTO legacy_challenges (id, challenge_hour, challenge_minute, expires_at) VALUES (?, ?, ?, ?)`,
  ).run(id, hour, minute, expiresAt);

  return db.prepare('SELECT * FROM legacy_challenges WHERE id = ?').get(id) as LegacyChallenge;
}

/**
 * Marks a Legacy challenge as used and returns it, or an error if it is unknown, expired or
 * already consumed. The UPDATE's WHERE clause makes the check-and-consume atomic, so the same
 * hand position can never back two submissions.
 */
export function consumeLegacyChallenge(id: string): LegacyChallenge | { error: string } {
  const challenge = db.prepare('SELECT * FROM legacy_challenges WHERE id = ?').get(id) as
    | LegacyChallenge
    | undefined;
  if (!challenge) return { error: 'This hand position is not recognised. Reload the page for a new one.' };

  const result = db
    .prepare(
      `UPDATE legacy_challenges SET used_at = datetime('now')
       WHERE id = ? AND used_at IS NULL AND expires_at > ?`,
    )
    .run(id, new Date().toISOString());
  if (result.changes === 0) {
    return challenge.used_at
      ? { error: 'This hand position has already been used. Reload the page for a new one.' }
      : {
          error: `The ${CHALLENGE_WINDOW_TEXT} window for this hand position has closed. Reload the page for a new one.`,
        };
  }
  return challenge;
}

export function listAllLegacySubmissions(): LegacySubmission[] {
  return db.prepare(`SELECT * FROM legacy_submissions ORDER BY created_at DESC`).all() as LegacySubmission[];
}


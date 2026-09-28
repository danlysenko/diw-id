import nodemailer from 'nodemailer';
import { db, type LegacyEmail } from './db';

/**
 * Email is unreachable until SMTP is configured — the same "closed until configured" pattern
 * as the admin key (see lib/adminAuth.ts), rather than failing loudly at boot when a var is
 * missing.
 */
export function emailEnabled(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function transport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    // Port 465 is implicit TLS; anything else (587, 25) starts plain and upgrades via STARTTLS.
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

export type SendResult = { ok: true } | { ok: false; error: string };

/**
 * Sends one email and records the attempt (success or failure) against the case, so admin has a
 * full history even when delivery fails — the record is written either way.
 */
export async function sendCaseEmail(input: {
  caseId: string;
  sentBy: string;
  to: string;
  subject: string;
  body: string;
}): Promise<SendResult> {
  const { caseId, sentBy, to, subject, body } = input;

  let result: SendResult;
  if (!emailEnabled()) {
    // Still recorded below: staff did attempt a send, even though nothing left the server.
    result = { ok: false, error: 'Email is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS.' };
  } else {
    try {
      await transport().sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        text: body,
      });
      result = { ok: true };
    } catch (err) {
      result = { ok: false, error: err instanceof Error ? err.message : 'Could not send the email.' };
    }
  }

  db.prepare(
    `INSERT INTO legacy_emails (case_id, sent_by, to_address, subject, body, ok, error)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(caseId, sentBy, to, subject, body, result.ok ? 1 : 0, result.ok ? null : result.error);

  return result;
}

/** Every sent email, grouped by case id, oldest first within a case — avoids one query per row. */
export function emailsByCase(): Map<string, LegacyEmail[]> {
  const rows = db.prepare('SELECT * FROM legacy_emails ORDER BY id ASC').all() as LegacyEmail[];
  const byCase = new Map<string, LegacyEmail[]>();
  for (const row of rows) {
    const list = byCase.get(row.case_id);
    if (list) list.push(row);
    else byCase.set(row.case_id, [row]);
  }
  return byCase;
}

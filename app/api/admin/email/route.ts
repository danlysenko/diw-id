import { NextResponse } from 'next/server';
import { isStaff } from '@/lib/adminAuth';
import { db, type LegacySubmission } from '@/lib/db';
import { sendCaseEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

/**
 * Sends one email to a Legacy case's contact address. Manual only — nothing here runs on a
 * status change; staff write the message and send it themselves.
 */
export async function POST(request: Request) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { caseId?: unknown; subject?: unknown; message?: unknown }
    | null;

  const caseId = typeof body?.caseId === 'string' ? body.caseId : '';
  const subject = typeof body?.subject === 'string' ? body.subject.trim().slice(0, 200) : '';
  const message = typeof body?.message === 'string' ? body.message.trim().slice(0, 5000) : '';

  if (!caseId || !subject || !message) {
    return NextResponse.json({ error: 'caseId, subject and message are required.' }, { status: 400 });
  }

  const submission = db.prepare('SELECT * FROM legacy_submissions WHERE id = ?').get(caseId) as
    | LegacySubmission
    | undefined;
  if (!submission) return NextResponse.json({ error: 'Case not found.' }, { status: 404 });
  if (!submission.contact_email) {
    return NextResponse.json({ error: 'This case has no contact email on file.' }, { status: 400 });
  }

  const result = await sendCaseEmail({
    caseId,
    sentBy: 'DiW staff',
    to: submission.contact_email,
    subject,
    body: message,
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });
  return NextResponse.json({ ok: true });
}

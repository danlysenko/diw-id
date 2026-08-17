import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isStaff } from '@/lib/adminAuth';
import { getSession, issueVerificationLink } from '@/lib/sessions';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { sessionId?: unknown; decision?: unknown; note?: unknown; reviewer?: unknown }
    | null;

  const sessionId = typeof body?.sessionId === 'string' ? body.sessionId : '';
  const decision = body?.decision === 'approve' ? 'approve' : body?.decision === 'reject' ? 'reject' : null;
  const note = typeof body?.note === 'string' ? body.note.slice(0, 500) : null;
  const reviewer = typeof body?.reviewer === 'string' ? body.reviewer.slice(0, 100) : 'DiW staff';

  if (!sessionId || !decision) {
    return NextResponse.json({ error: 'sessionId and decision are required.' }, { status: 400 });
  }

  const session = getSession(sessionId);
  if (!session) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  if (session.status !== 'manual_review') {
    return NextResponse.json({ error: 'This session is not awaiting review.' }, { status: 409 });
  }

  if (decision === 'approve') {
    db.prepare(
      `UPDATE verification_sessions
       SET status = 'passed', verified_at = ?, reviewed_by = ?, review_note = ?
       WHERE id = ?`,
    ).run(new Date().toISOString(), reviewer, note, sessionId);
    issueVerificationLink(sessionId);
  } else {
    db.prepare(
      `UPDATE verification_sessions
       SET status = 'failed', fail_reason = ?, reviewed_by = ?, review_note = ?
       WHERE id = ?`,
    ).run(note ?? 'Rejected by DiW Authentication.', reviewer, note, sessionId);
  }

  return NextResponse.json({ ok: true });
}

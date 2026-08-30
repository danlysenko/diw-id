import { NextResponse } from 'next/server';
import { isStaff } from '@/lib/adminAuth';
import { resolveLegacySubmission } from '@/lib/sessions';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { caseId?: unknown; note?: unknown }
    | null;

  const caseId = typeof body?.caseId === 'string' ? body.caseId : '';
  const note = typeof body?.note === 'string' ? body.note.slice(0, 500) : null;

  if (!caseId) {
    return NextResponse.json({ error: 'caseId is required.' }, { status: 400 });
  }

  resolveLegacySubmission(caseId, 'DiW staff', note);
  return NextResponse.json({ ok: true });
}

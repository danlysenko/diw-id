import { NextResponse } from 'next/server';
import { isStaff } from '@/lib/adminAuth';
import { updateLegacyStatus, type LegacyStatus } from '@/lib/sessions';

export const dynamic = 'force-dynamic';

const VALID_STATUSES: LegacyStatus[] = ['under_review', 'verified', 'counterfeit'];

export async function POST(request: Request) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { caseId?: unknown; status?: unknown; note?: unknown }
    | null;

  const caseId = typeof body?.caseId === 'string' ? body.caseId : '';
  const status = typeof body?.status === 'string' ? body.status : '';
  const note = typeof body?.note === 'string' ? body.note.slice(0, 500) : null;

  if (!caseId) {
    return NextResponse.json({ error: 'caseId is required.' }, { status: 400 });
  }
  if (!VALID_STATUSES.includes(status as LegacyStatus)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }

  updateLegacyStatus(caseId, status as LegacyStatus, 'DiW staff', note);
  return NextResponse.json({ ok: true });
}

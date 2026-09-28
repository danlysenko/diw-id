import { NextResponse } from 'next/server';
import { isStaff } from '@/lib/adminAuth';
import { SETTABLE_STATUSES, changeCaseStatus, type CaseKind } from '@/lib/caseStatus';

export const dynamic = 'force-dynamic';

const KINDS: CaseKind[] = ['verification', 'legacy'];

/** The single place staff change a case's status; every change is logged (see lib/caseStatus). */
export async function POST(request: Request) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { kind?: unknown; caseId?: unknown; status?: unknown; note?: unknown }
    | null;

  const kind = KINDS.find((k) => k === body?.kind);
  const status = SETTABLE_STATUSES.find((s) => s === body?.status);
  const caseId = typeof body?.caseId === 'string' ? body.caseId : '';
  const note = typeof body?.note === 'string' && body.note.trim() ? body.note.trim().slice(0, 500) : null;

  if (!kind || !status || !caseId) {
    return NextResponse.json({ error: 'kind, caseId and status are required.' }, { status: 400 });
  }

  // One shared staff key, so individual reviewers can't be told apart yet.
  const result = changeCaseStatus({ kind, caseId, to: status, by: 'DiW staff', note });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from 'next/server';
import { isStaff, keyMatches } from '@/lib/adminAuth';
import { deleteCase, type CaseKind } from '@/lib/caseStatus';

export const dynamic = 'force-dynamic';

const KINDS: CaseKind[] = ['verification', 'legacy'];

/**
 * Permanently deletes a case. Being signed in is not enough: the admin key has to be entered
 * again for each deletion, so an unattended signed-in browser can't be used to remove cases.
 */
export async function POST(request: Request) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { kind?: unknown; caseId?: unknown; key?: unknown }
    | null;

  const kind = KINDS.find((k) => k === body?.kind);
  const caseId = typeof body?.caseId === 'string' ? body.caseId : '';
  const key = typeof body?.key === 'string' ? body.key : '';

  if (!kind || !caseId) {
    return NextResponse.json({ error: 'kind and caseId are required.' }, { status: 400 });
  }
  if (!keyMatches(key)) {
    return NextResponse.json({ error: 'Incorrect admin key — the case was not deleted.' }, { status: 403 });
  }

  const result = await deleteCase({ kind, caseId, by: 'DiW staff' });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true });
}

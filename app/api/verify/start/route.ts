import { NextResponse } from 'next/server';
import { normalizeDiwId } from '@/lib/diwId';
import { createSession, findWatch } from '@/lib/sessions';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { diwId?: unknown; flow?: unknown }
    | null;

  const rawId = typeof body?.diwId === 'string' ? body.diwId : '';
  const flow = body?.flow === 'dealer' ? 'dealer' : 'owner';

  const diwId = normalizeDiwId(rawId);
  if (!diwId) {
    return NextResponse.json(
      { error: 'Enter a DiW ID in the format 26-00483.' },
      { status: 400 },
    );
  }

  const watch = findWatch(diwId);
  if (!watch) {
    // Deliberately identical response shape for every unknown ID: no hint about which
    // part of the number was wrong, and no watch details until possession is proven.
    return NextResponse.json(
      { error: 'DiW ID not found. Please contact DiW Authentication.' },
      { status: 404 },
    );
  }

  const session = createSession(diwId, flow);
  return NextResponse.json({ sessionId: session.id });
}

import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminEnabled, keyMatches } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!adminEnabled()) {
    return NextResponse.json({ error: 'Staff review is not configured.' }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { key?: unknown } | null;
  const key = typeof body?.key === 'string' ? body.key : '';

  if (!keyMatches(key)) {
    return NextResponse.json({ error: 'Incorrect staff key.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, key, {
    httpOnly: true,
    sameSite: 'strict',
    secure: request.headers.get('x-forwarded-proto') === 'https',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  return response;
}

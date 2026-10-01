import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminEnabled, keyMatches } from '@/lib/adminAuth';
import { clientIp, rateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!adminEnabled()) {
    return NextResponse.json({ error: 'Staff review is not configured.' }, { status: 503 });
  }

  const limit = rateLimit(`admin-login:${clientIp(request)}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again in a minute.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
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

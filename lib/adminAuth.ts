import crypto from 'node:crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'diw_staff';

function adminKey(): string | null {
  const key = process.env.DIW_ADMIN_KEY;
  return key && key.length > 0 ? key : null;
}

/** Admin review is unreachable until a staff key is configured. */
export function adminEnabled(): boolean {
  return adminKey() !== null;
}

export function keyMatches(candidate: string): boolean {
  const key = adminKey();
  if (!key) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(key);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function isStaff(): Promise<boolean> {
  const cookie = (await cookies()).get(ADMIN_COOKIE)?.value;
  return typeof cookie === 'string' && keyMatches(cookie);
}

export const CHALLENGE_WINDOW_MINUTES = 20;
export const LINK_VALID_HOURS = 24;

/**
 * Pick a random hand position that's unambiguous on an analog dial:
 * avoid :00 and minute values within 2 minutes of the same reading twice in a row
 * isn't tracked here, but we avoid the top-of-hour / bottom-of-hour marks so the
 * photo genuinely proves the minute hand was moved, not just left resting.
 */
export function generateChallenge(): { hour: number; minute: number } {
  const hour = 1 + Math.floor(Math.random() * 12); // 1-12, shown as-is on a 12h dial
  let minute = Math.floor(Math.random() * 60);
  if (minute % 5 === 0) minute += 1 + Math.floor(Math.random() * 3); // dodge exact 5-min marks
  minute = minute % 60;
  return { hour, minute };
}

export function formatChallenge(hour: number, minute: number): string {
  const h = hour.toString().padStart(2, '0');
  const m = minute.toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function expiresAtFromNow(minutes: number): Date {
  return new Date(Date.now() + minutes * 60_000);
}

export function isExpired(isoTimestamp: string): boolean {
  return new Date(isoTimestamp).getTime() < Date.now();
}

export function minutesRemaining(isoTimestamp: string): number {
  return Math.max(0, Math.ceil((new Date(isoTimestamp).getTime() - Date.now()) / 60_000));
}

export function secondsRemaining(isoTimestamp: string): number {
  return Math.max(0, Math.floor((new Date(isoTimestamp).getTime() - Date.now()) / 1000));
}

// Browser-safe. One fixed zone so the server-rendered admin, client components and emails all
// show the same clock regardless of where the server or the viewer is.
const TIME_ZONE = 'Europe/London';

const parts = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** SQLite's datetime('now') is UTC without a zone marker; ISO strings already carry theirs. */
function toDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  return new Date(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value) ? `${value.replace(' ', 'T')}Z` : value);
}

/** "11.10.2026, 09:02" */
export function formatDateTime(value: string | Date): string {
  const p = Object.fromEntries(parts.formatToParts(toDate(value)).map(({ type, value: v }) => [type, v]));
  return `${p.day}.${p.month}.${p.year}, ${p.hour}:${p.minute}`;
}

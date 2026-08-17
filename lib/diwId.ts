const DIW_ID_PATTERN = /^(\d{2})-(\d{5})$/;

/** Accepts "26-00483", "2600483", " 26 - 483 " and normalises to "26-00483". */
export function normalizeDiwId(raw: string): string | null {
  const cleaned = raw.trim().toUpperCase().replace(/\s+/g, '');
  const direct = cleaned.match(DIW_ID_PATTERN);
  if (direct) return `${direct[1]}-${direct[2]}`;

  const loose = cleaned.match(/^(\d{2})-?(\d{1,5})$/);
  if (loose) return `${loose[1]}-${loose[2].padStart(5, '0')}`;

  return null;
}

export function isModernDiwId(diwId: string): boolean {
  const match = diwId.match(DIW_ID_PATTERN);
  if (!match) return false;
  return 2000 + Number(match[1]) >= 2026;
}

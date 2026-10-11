import geoip from 'geoip-lite';
import { clientIp } from './rateLimit';

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

function countryName(code: string): string {
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

/** "From United Kingdom" — looked up offline, the IP never leaves the server and isn't stored. */
export function describeOrigin(request: Request): string {
  const ip = clientIp(request);
  const country = ip === 'unknown' ? null : geoip.lookup(ip)?.country;
  return country ? `From ${countryName(country)}` : 'From unknown location';
}

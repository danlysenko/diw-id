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

/** "IP 81.2.69.160 · London, United Kingdom" — looked up offline, the IP never leaves the server. */
export function describeOrigin(request: Request): string {
  const ip = clientIp(request);
  if (ip === 'unknown') return 'IP unknown';

  const geo = geoip.lookup(ip);
  if (!geo || !geo.country) return `IP ${ip} · location unknown`;

  const place = [geo.city, countryName(geo.country)].filter(Boolean).join(', ');
  return `IP ${ip} · ${place}`;
}

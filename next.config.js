/** @type {import('next').NextConfig} */
const nextConfig = {
  // geoip-lite reads its data files relative to its own install path, so it can't be bundled.
  serverExternalPackages: ['better-sqlite3', 'geoip-lite'],
};

module.exports = nextConfig;

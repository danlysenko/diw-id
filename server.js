// Passenger-compatible custom server (cPanel "Setup Node.js App" hosts, e.g. FlokiNET).
//
// cPanel's Node.js Selector runs Passenger, which requires a plain Node entry
// file that listens on process.env.PORT — it can't run `next start` directly.
// This wraps the same Next.js app in a minimal http server so the app can move
// from the current VPS (pm2 + `npm start`) to a Passenger host by just pointing
// its "Application startup file" at this file, with no other code changes.
//
// The VPS deploy is untouched: pm2 still runs `npm start` (see package.json),
// this file is only exercised once porting to a Passenger-managed host.
require('tsx/cjs');
require('./scripts/seed.ts');

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  }).listen(port, () => {
    console.log(`> Ready on port ${port}`);
  });
});

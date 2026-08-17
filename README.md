# Check My DiW — watch authentication

Live verification for DiW watches. A photograph on its own proves nothing: anyone can forward
one. This flow asks for a hand position that did not exist until DiW asked for it, so a passing
result means someone physically held that specific watch inside a 20-minute window.

## Running it

```bash
npm install
npm run seed          # loads the demo watches listed below
cp .env.example .env  # then set DIW_ADMIN_KEY
npm run dev
```

Open http://localhost:3000.

### Environment

| Variable | Effect |
| --- | --- |
| `DIW_ADMIN_KEY` | Staff key for the review queue at `/admin`. Until it is set, the queue is closed rather than unguarded. |
| `DIW_ANALYZER` | `manual` (default) sends every submission to a human reviewer. `demo` auto-passes the image checks so the full flow can be walked without a vision provider. |

### Seeded watches

| DiW ID | Collection | Base watch | Status |
| --- | --- | --- | --- |
| `26-00483` | DiW Carbon Emerald | Rolex Submariner | Authentic |
| `26-00512` | DiW NOMOS Time Machine | Rolex Daytona | Authentic |
| `26-00047` | DiW Alchemist Steel | Rolex GMT-Master II | Authentic |
| `27-00019` | DiW Carbon Emerald | Rolex Submariner | Flagged |

Any other ID returns *DiW ID not found. Please contact DiW Authentication.*

## The flow

1. **`/verify`** — the owner picks *DiW 2026 or newer* (has a DiW ID) or *DiW Legacy — before 2026*.
2. **`/verify/new`** — they enter the DiW ID engraved on the rehaut at 6 o'clock, e.g. `26-00483`.
   A valid number releases **no watch details at this stage**, so a guessed or copied number gains
   nothing.
3. **`/verify/session/[id]/live`** — DiW generates a random hand position, shows it as a dial
   diagram, and starts a 20-minute countdown. The challenge is single-use.
4. The owner physically sets the hands to that time.
5. **`/verify/session/[id]/photos`** — two uploads: the dial front-on at the requested time, and
   the DiW ID engraving.
6. **`/verify/session/[id]/result`** — `AUTHENTIC DiW` plus the instance record, a manual-review
   holding page, or a failure that releases no watch details.
7. A passing result issues a **verification link** valid for 24 hours.

Dealers use the same pipeline via `/dealer` → `/verify/new?flow=dealer`, and send the resulting
link to a buyer. The buyer reads the confirmation on the DiW site rather than trusting photographs
from the seller.

Legacy pieces (no DiW ID on the case) open an archive case at `/verify/legacy` with model,
approximate year, place of purchase, optional base-watch serial, and photographs.

## Checks

`lib/checks.ts` runs seven checks. Three are decided deterministically from the database and the
uploaded bytes:

- **DiW ID exists** in the archive.
- **Verification window still open** — submissions after the 20 minutes fail outright.
- **Photos not previously submitted** — every upload's SHA-256 is retained, so a recycled image
  from an earlier verification is rejected.

The other four read image content — hand position, DiW ID legibility, model match, and match
against the archived configuration. These need a vision model, and `lib/analysis.ts` is the seam
where one plugs in. **No vision provider is wired up**, so by default those four return
*inconclusive* and the submission is routed to a DiW reviewer at `/admin`, who approves or rejects
it. Approving there issues the verification link exactly as an automatic pass would.

Hard checks run before image analysis, so an expired window or a reused photo fails without ever
reaching a reviewer.

## Privacy

Owner identity, contact details and transaction history never appear on an instance record or a
verification link. A failed verification and an expired link both release nothing about the watch.
A passing result attests to authenticity and physical possession at a point in time — not legal
ownership.

## Layout

```
app/
  page.tsx                        landing
  verify/                         type choice, DiW ID entry, legacy case
  verify/session/[id]/            live challenge → photos → result
  v/[token]/                      public 24-hour verification link
  dealer/                         dealer explainer
  admin/                          manual review queue (staff key)
  api/                            verify start/submit, legacy, admin login/review
lib/
  db.ts          SQLite schema and row types
  challenge.ts   random hand position, window and link lifetimes
  checks.ts      the seven checks
  analysis.ts    vision-provider seam
  uploads.ts     storage, SHA-256, EXIF inspection
  sessions.ts    session and verification-link queries
components/      ClockFace, WatchCard, PhotoUploader, CheckList, …
```

State lives in SQLite at `data/diw.db` with uploads under `public/uploads/` — both are
gitignored. For anything beyond local use, move uploads to object storage and the database to a
managed instance.

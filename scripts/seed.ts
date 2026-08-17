import { db } from '../lib/db';

const watches = [
  {
    diw_id: '26-00483',
    collection: 'DiW Carbon Emerald',
    base_watch: 'Rolex Submariner',
    materials: 'Forged carbon case, emerald-green ceramic bezel, DLC hardware',
    production_year: 2026,
    status: 'Authentic',
    archive_photo_url: '/archive/26-00483.svg',
  },
  {
    diw_id: '26-00512',
    collection: 'DiW NOMOS Time Machine',
    base_watch: 'Rolex Daytona',
    materials: 'Titanium DLC case, meteorite dial',
    production_year: 2026,
    status: 'Authentic',
    archive_photo_url: '/archive/26-00512.svg',
  },
  {
    diw_id: '26-00047',
    collection: 'DiW Alchemist Steel',
    base_watch: 'Rolex GMT-Master II',
    materials: 'Stainless steel, sandblasted finish, ceramic bezel insert',
    production_year: 2026,
    status: 'Authentic',
    archive_photo_url: '/archive/26-00047.svg',
  },
  {
    diw_id: '27-00019',
    collection: 'DiW Carbon Emerald',
    base_watch: 'Rolex Submariner',
    materials: 'Forged carbon case, black ceramic bezel',
    production_year: 2027,
    status: 'Flagged',
    archive_photo_url: '/archive/27-00019.svg',
  },
];

const insert = db.prepare(`
  INSERT INTO watches (diw_id, collection, base_watch, materials, production_year, status, archive_photo_url)
  VALUES (@diw_id, @collection, @base_watch, @materials, @production_year, @status, @archive_photo_url)
  ON CONFLICT(diw_id) DO UPDATE SET
    collection=excluded.collection,
    base_watch=excluded.base_watch,
    materials=excluded.materials,
    production_year=excluded.production_year,
    status=excluded.status,
    archive_photo_url=excluded.archive_photo_url
`);

const tx = db.transaction(() => {
  for (const w of watches) insert.run(w);
});
tx();

console.log(`Seeded ${watches.length} DiW watches:`);
for (const w of watches) console.log(`  ${w.diw_id} — ${w.collection} (${w.status})`);

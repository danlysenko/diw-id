import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'diw.db');

// Reuse a single connection across hot reloads in dev.
const globalForDb = globalThis as unknown as { __diwDb?: Database.Database };

export const db = globalForDb.__diwDb ?? new Database(dbPath);
if (process.env.NODE_ENV !== 'production') globalForDb.__diwDb = db;

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS watches (
    diw_id TEXT PRIMARY KEY,
    collection TEXT NOT NULL,
    base_watch TEXT NOT NULL,
    materials TEXT NOT NULL,
    production_year INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'Authentic',
    archive_photo_url TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS verification_sessions (
    id TEXT PRIMARY KEY,
    diw_id TEXT NOT NULL REFERENCES watches(diw_id),
    flow TEXT NOT NULL DEFAULT 'owner', -- owner | dealer
    challenge_hour INTEGER NOT NULL,
    challenge_minute INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_challenge',
    -- pending_challenge -> photos_uploaded -> checking -> passed | failed | manual_review
    watch_photo_path TEXT,
    watch_photo_hash TEXT,
    watch_photo_has_exif INTEGER,
    id_photo_path TEXT,
    id_photo_hash TEXT,
    id_photo_has_exif INTEGER,
    checks_json TEXT,
    fail_reason TEXT,
    reviewed_by TEXT,
    review_note TEXT,
    verified_at TEXT,
    link_token TEXT,
    link_expires_at TEXT
  );

  CREATE TABLE IF NOT EXISTS photo_hashes (
    hash TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS legacy_submissions (
    id TEXT PRIMARY KEY,
    model TEXT NOT NULL,
    approx_year TEXT NOT NULL,
    purchase_location TEXT NOT NULL,
    original_serial TEXT,
    contact_email TEXT,
    photo_paths TEXT NOT NULL, -- JSON array
    status TEXT NOT NULL DEFAULT 'submitted', -- submitted | under_review | verified | counterfeit
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Added after the initial release — guarded so it's a no-op once already applied.
for (const stmt of [
  'ALTER TABLE legacy_submissions ADD COLUMN reviewed_by TEXT',
  'ALTER TABLE legacy_submissions ADD COLUMN review_note TEXT',
]) {
  try {
    db.exec(stmt);
  } catch {
    // column already exists
  }
}

export type Watch = {
  diw_id: string;
  collection: string;
  base_watch: string;
  materials: string;
  production_year: number;
  status: string;
  archive_photo_url: string | null;
  created_at: string;
};

export type VerificationSession = {
  id: string;
  diw_id: string;
  flow: 'owner' | 'dealer';
  challenge_hour: number;
  challenge_minute: number;
  created_at: string;
  expires_at: string;
  status:
    | 'pending_challenge'
    | 'photos_uploaded'
    | 'checking'
    | 'passed'
    | 'failed'
    | 'manual_review';
  watch_photo_path: string | null;
  watch_photo_hash: string | null;
  watch_photo_has_exif: number | null;
  id_photo_path: string | null;
  id_photo_hash: string | null;
  id_photo_has_exif: number | null;
  checks_json: string | null;
  fail_reason: string | null;
  reviewed_by: string | null;
  review_note: string | null;
  verified_at: string | null;
  link_token: string | null;
  link_expires_at: string | null;
};

export type LegacySubmission = {
  id: string;
  model: string;
  approx_year: string;
  purchase_location: string;
  original_serial: string | null;
  contact_email: string | null;
  photo_paths: string;
  status: string;
  created_at: string;
  reviewed_by: string | null;
  review_note: string | null;
};

#!/usr/bin/env bash
# Runs ON THE VPS — pulls the latest branch, rebuilds, and restarts the app under pm2.
# Called by .github/workflows/deploy.yml over SSH on every push, or by hand for a manual redeploy.
set -euo pipefail

BRANCH="claude/designa-individual-style-b1g7xu"
APP_NAME="diw-id"

cd "$(dirname "$0")/.."

git fetch origin "$BRANCH"
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

npm ci

# This Next.js build has shown stale-cache behavior across deploys: a build once failed
# type-checking against a previous commit's now-removed export, at a line number that didn't
# even exist in the actual pulled file, even after clearing .next. Root cause was TypeScript's
# own incremental build cache (tsconfig.json's "incremental": true) — a gitignored .tsbuildinfo
# file at the project root, untouched by both `git reset --hard` and `rm -rf .next` since it
# lives outside both. Clear everything that could carry stale build state across deploys.
rm -rf .next
rm -f ./*.tsbuildinfo
npm run build

if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  pm2 restart "$APP_NAME"
else
  pm2 start npm --name "$APP_NAME" -- start
fi
pm2 save

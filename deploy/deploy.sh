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
npm run build

if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  pm2 restart "$APP_NAME"
else
  pm2 start npm --name "$APP_NAME" -- start
fi
pm2 save

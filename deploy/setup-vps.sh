#!/usr/bin/env bash
# One-time bootstrap for a fresh Ubuntu/Debian VPS. Run this by hand over SSH — review it first,
# then edit the two variables below before running.
#
#   ssh you@your-vps
#   nano setup-vps.sh   # paste this file in, edit DOMAIN and REPO_URL
#   chmod +x setup-vps.sh && ./setup-vps.sh
set -euo pipefail

DOMAIN="check.example.com"          # <-- the (sub)domain you're pointing at this VPS
REPO_URL="https://github.com/danlysenko/diw-id.git"
BRANCH="claude/designa-individual-style-b1g7xu"
APP_DIR="$HOME/diw-id"

echo "== Installing Node.js 20 =="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "== Installing nginx, certbot, pm2 =="
sudo apt-get update
sudo apt-get install -y nginx
sudo apt-get install -y certbot python3-certbot-nginx
sudo npm install -g pm2

echo "== Cloning the app =="
if [ -d "$APP_DIR" ]; then
  echo "$APP_DIR already exists, skipping clone"
else
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"
npm ci
npm run build

echo "== Starting under pm2 =="
pm2 start npm --name diw-id -- start
pm2 save
pm2 startup systemd -u "$USER" --hp "$HOME" | tail -n 1 | sudo bash

echo "== Configuring nginx reverse proxy for $DOMAIN =="
sudo tee "/etc/nginx/sites-available/$DOMAIN" > /dev/null <<NGINX
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

sudo ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
sudo nginx -t
sudo systemctl reload nginx

echo "== Requesting a TLS certificate =="
echo "Make sure $DOMAIN's DNS A record already points at this VPS's IP before continuing,"
echo "otherwise certbot's ownership check will fail."
read -p "DNS is pointed and propagated — continue with certbot? [y/N] " ok
if [[ "$ok" == "y" || "$ok" == "Y" ]]; then
  sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "you@example.com" --redirect
else
  echo "Skipped certbot. The app is reachable over plain http://$DOMAIN for now;"
  echo "re-run: sudo certbot --nginx -d $DOMAIN  once DNS is ready."
fi

echo "== Done. $DOMAIN should now proxy to the app on port 3000. =="

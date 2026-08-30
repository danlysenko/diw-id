# Deploying to the IONOS VPS

One-time setup, then every `git push` to `claude/designa-individual-style-b1g7xu` redeploys automatically.

## 1. One-time VPS setup

SSH into the VPS, copy `setup-vps.sh` over (or paste its contents into a new file), edit the
`DOMAIN` variable at the top, then run it:

```bash
scp deploy/setup-vps.sh you@your-vps:~/
ssh you@your-vps
nano setup-vps.sh   # set DOMAIN to your (sub)domain
chmod +x setup-vps.sh
./setup-vps.sh
```

It installs Node 20, nginx, certbot and pm2, clones the app to `~/diw-id`, builds it, starts it
under pm2 (survives reboots), and configures nginx + TLS for your domain. Point that domain's DNS
A record at the VPS's IP before the certbot step, or skip certbot and re-run it later once DNS has
propagated.

## 2. Auto-deploy on push

The repo already has `.github/workflows/deploy.yml`, which SSHes into the VPS and runs
`deploy/deploy.sh` on every push to the branch. It just needs four secrets added in
**GitHub repo → Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `VPS_HOST` | the VPS's IP address or hostname |
| `VPS_USER` | the SSH user you used above |
| `VPS_SSH_KEY` | a **private** key whose matching public key is in that user's `~/.ssh/authorized_keys` on the VPS (generate a dedicated deploy key — don't reuse your personal one) |
| `VPS_APP_DIR` | `/home/<that user>/diw-id` |
| `VPS_PORT` | only needed if SSH isn't on port 22 |

To generate a dedicated deploy key:

```bash
ssh-keygen -t ed25519 -f diw-deploy-key -N ""
# paste diw-deploy-key.pub into ~/.ssh/authorized_keys on the VPS
# paste the contents of diw-deploy-key (the private half) into the VPS_SSH_KEY secret
```

Once those secrets are set, push to the branch and check the **Actions** tab — the workflow SSHes
in, runs `git pull`, rebuilds, and restarts the app with zero downtime beyond the restart itself.

## Notes

- `data/` (the sqlite db and submitted photos) is gitignored and lives outside what `git pull`
  touches, so it persists across deploys — no volume/storage setup needed, unlike a container
  platform.
- `npm start` re-seeds the 4 demo watches on every boot (harmless upsert), so the demo DiW IDs
  always work even after a restart.
- To redeploy by hand instead of waiting on a push: `ssh you@your-vps '~/diw-id/deploy/deploy.sh'`.

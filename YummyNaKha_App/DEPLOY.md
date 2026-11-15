# Deploying YummyNaKha! to Azure (Azure for Students)

One Linux server runs everything with Docker: the database, our OCR service,
the app, and Caddy for HTTPS. Menu photos never leave this server.

```
browser ──HTTPS──▶ Caddy :443 ──▶ app :3000 ──▶ db :5432
                                      └──────▶ ocr :8765   (not reachable from outside)
```

**Cost:** a `Standard_B2s` server (2 CPUs, 4 GB RAM) plus its disk and IP address
costs roughly **$35–45 a month** — check the price Azure shows when you create
it. The $100 student credit therefore lasts about 2 months. **Stop the server
when nobody is testing** (step 7) to make it last longer.

---

## 1. Activate Azure for Students

1. Go to <https://azure.microsoft.com/free/students> and sign in with your
   **university email**. No credit card is needed.
2. Open the portal: <https://portal.azure.com>.
3. Set a budget alert so the credit can't run out by surprise: search
   **Cost Management** → **Budgets** → **Add** → amount `$80`, alert at 80%.

## 2. Create the server

Portal → **Virtual machines** → **Create** → **Azure virtual machine**:

| Setting | Value |
|---|---|
| Resource group | New: `yummynakha` |
| Virtual machine name | `yummynakha` |
| Region | **(Asia Pacific) Southeast Asia** — if it isn't allowed for your subscription, pick another region in the list, e.g. East Asia |
| Image | **Ubuntu Server 24.04 LTS – x64** |
| Size | **Standard_B2s** (2 vCPUs, 4 GiB) — click *See all sizes* if it isn't listed |
| Authentication type | **SSH public key**, username `azureuser`, key pair name `yummynakha` |
| Public inbound ports | Allow **SSH (22)**, **HTTP (80)**, **HTTPS (443)** |
| Disks → OS disk | **Standard SSD**, 30 GiB is enough |

**Review + create** → **Create** → **Download private key** (keep the
`yummynakha.pem` file safe; you need it to log in).

## 3. Give it a free web address

VM page → **Overview** → click the **Public IP address** → **Configuration** →
**DNS name label**: `yummynakha` (or any free name) → **Save**.

Your address is now e.g. `yummynakha.southeastasia.cloudapp.azure.com`. This is
your `APP_DOMAIN`.

## 4. Log in and install Docker

On your Mac:

```bash
chmod 400 ~/Downloads/yummynakha.pem
ssh -i ~/Downloads/yummynakha.pem azureuser@yummynakha.southeastasia.cloudapp.azure.com
```

On the server:

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# Extra memory for building the app on a 4 GB server
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
exit
```

Log in again (so the Docker group applies).

## 5. Get the code and configure it

```bash
git clone https://github.com/Uni-T17/YummyNaKha-.git
cd YummyNaKha-/YummyNaKha_App
cp .env.production.example .env.production
nano .env.production
```

If the repository is private, GitHub asks for a username and password: use your
GitHub username and a **personal access token** (GitHub → Settings → Developer
settings → Fine-grained tokens, read-only access to this repository).

Fill in `.env.production`:

- `APP_DOMAIN` — the address from step 3, without `https://`
- `POSTGRES_PASSWORD` — paste the output of `openssl rand -hex 24`
- `AUTH_SECRET` — paste the output of `openssl rand -base64 48`
- Google and Gemini keys — optional, see step 8

Save with `Ctrl+O`, `Enter`, then `Ctrl+X`.

## 6. Start it

```bash
docker compose --env-file .env.production up -d --build
```

The first build takes about 10–15 minutes. Then:

```bash
docker compose --env-file .env.production ps          # all four should be "running"
docker compose --env-file .env.production logs -f ocr # wait for "models ready" (about a minute)
```

Open `https://<APP_DOMAIN>` — Caddy gets the HTTPS certificate automatically
on the first visit (allow a minute).

## 7. Everyday commands (run in `YummyNaKha-/YummyNaKha_App`)

| Task | Command |
|---|---|
| Update to the latest code | `git pull && docker compose --env-file .env.production up -d --build` |
| See logs | `docker compose --env-file .env.production logs -f app` |
| Restart | `docker compose --env-file .env.production restart` |
| Guide coverage and dish reports | `docker compose --env-file .env.production exec app npm run guide:coverage` |
| Back up the database | `docker compose --env-file .env.production exec db pg_dump -U yummy yummynakha > backup-$(date +%F).sql` |

**Save credit:** in the portal, VM → **Stop** when nobody is testing, **Start**
before a session. A stopped (deallocated) VM costs only its disk. Everything
starts by itself when the VM starts, and the web address stays the same.

## 8. Google sign-in (optional)

Google Cloud Console → **APIs & Services** → **Credentials** → your OAuth
client → **Authorized redirect URIs** → add:

```
https://<APP_DOMAIN>/api/auth/google/callback
```

Put the client ID and secret in `.env.production`, then run
`docker compose --env-file .env.production up -d`. While the OAuth consent
screen is in *Testing* mode, only the Google accounts you add as test users
can sign in — add your testers there.

## Before real users

- The Thai dish guide, the staff phrase cards and the legal texts are still
  **drafts** — get the Thai-literate review done first.
- Run the safety tests in `.docs/03-testing/01-test-plan.md` (TC-ST-09, -11,
  -13, -26, -27) against this server.
- The OCR service reads one photo at a time; with several people scanning at
  once, scans queue up.

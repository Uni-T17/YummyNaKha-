# Free deployment: Vercel + Neon + Hugging Face

Three free services, no credit card:

```
browser ──HTTPS──▶ Vercel (the app)  ──▶ Neon (PostgreSQL database)
                         └──Bearer token──▶ Hugging Face Space (our OCR service, private)
```

Same features as running it yourself. What's different:

- **Slower scans** — the free Space has 2 shared CPUs.
- **Sleeps** — after ~2 days without use the Space sleeps; the first scan then
  waits a few minutes or fails with "try again". **Open the Space page a few
  minutes before a demo or test session** to wake it. Neon also pauses after a
  few idle minutes (the next request takes about a second longer).
- **Data is stored outside Thailand** (Vercel, Neon, Hugging Face). The privacy
  notice must say where data is processed — see *Before real users*.

For the paid-server version see [DEPLOY.md](DEPLOY.md).

---

## 1. Neon — the database (5 min)

1. Sign up at <https://neon.tech> (GitHub or Google login).
2. **Create project** → name `yummynakha`, Postgres 17, region **AWS Asia
   Pacific (Singapore)**.
3. On the project dashboard click **Connect**:
   - with **Connection pooling ON**, copy the string → this is `DATABASE_URL`
   - with **Connection pooling OFF**, copy the string → this is `DIRECT_URL`

Keep both somewhere safe; they contain the password.

## 2. Hugging Face — the OCR service (10 min + ~15 min build)

1. Sign up at <https://huggingface.co>.
2. **New → Space**: name `yummynakha-ocr`, SDK **Docker** → *Blank*, hardware
   **CPU basic (free)**, visibility **Private** → **Create Space**.
3. In the Space: **Files → Add file → Upload files**, and upload these six
   files from `YummyNaKha_App/ocr-service/`:
   `Dockerfile`, `README.md`, `server.py`, `pyproject.toml`, `uv.lock`,
   `.dockerignore`
   (On a Mac press `Cmd+Shift+.` in the file picker to see `.dockerignore`.)
   **Commit**.
4. The Space builds (~15 minutes; watch **Logs**). It's ready when the log
   shows `models ready` and the status says **Running**.
5. Create a token: your avatar → **Settings → Access Tokens → Create new
   token** → type **Read** → name `yummynakha-vercel`. Copy it → this is
   `OCR_SERVICE_TOKEN`.
6. The Space's direct address is
   `https://<your-username>-yummynakha-ocr.hf.space` → this is
   `OCR_SERVICE_URL`. (Lower-case; any `_` or `.` in the name becomes `-`.
   The exact address is under the Space's **⋮ → Embed this Space**.)

Check it from your Mac (should print `{"ok":true,...}`):

```bash
curl -H "Authorization: Bearer <OCR_SERVICE_TOKEN>" https://<your-username>-yummynakha-ocr.hf.space/health
```

## 3. Vercel — the app (10 min)

1. Sign up at <https://vercel.com> with **GitHub**, plan **Hobby**.
2. **Add New → Project** → import `Uni-T17/YummyNaKha-`.
   (If you can't see it, the repository owner must give Vercel access, or
   install it on their account.)
3. **Root Directory**: `YummyNaKha_App`. Framework: Next.js (detected).
4. **Environment Variables** — add:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | Neon pooled string (step 1) |
   | `DIRECT_URL` | Neon direct string (step 1) |
   | `AUTH_SECRET` | output of `openssl rand -base64 48` |
   | `OCR_SERVICE_URL` | `https://<your-username>-yummynakha-ocr.hf.space` |
   | `OCR_SERVICE_TOKEN` | the Hugging Face read token |
   | `GEMINI_API_KEY` | optional — leave out to turn the Menu helper off |

5. **Deploy**. The build also creates the database tables
   (`npm run vercel-build` runs `prisma migrate deploy`).
6. Note your address, e.g. `https://yummy-na-kha.vercel.app`. Add it as
   `APP_URL` (Settings → Environment Variables), then **Deployments → ⋯ →
   Redeploy**.
7. Optional, faster for Thai users: **Settings → Functions → Function Region**
   → **Singapore (sin1)** (next to the Neon database), then redeploy.

## 4. Google sign-in (optional)

Google Cloud Console → **APIs & Services → Credentials** → your OAuth client →
**Authorized redirect URIs** → add `https://<your-app>.vercel.app/api/auth/google/callback`.
Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Vercel and redeploy. While
the consent screen is in *Testing*, add your testers' Google accounts as test
users.

## 5. Check it works

1. Open the Space page (wakes it), then your Vercel address.
2. Sign up, accept the terms, set My Taste, scan a menu.
3. If a scan fails with "The menu reader isn't available", the Space is
   asleep or still starting — wait a minute and retry.

## Everyday

| Task | How |
|---|---|
| Update the app | Push to the branch Vercel deploys (usually `main`) — Vercel redeploys by itself and applies new migrations |
| Update the OCR service | Upload the changed files to the Space again |
| See app errors | Vercel → project → **Logs** |
| Guide coverage and dish reports | On your Mac: `DATABASE_URL="<Neon direct string>" npm run guide:coverage` |
| Back up the database | Neon → **Branches** (instant copy) or `pg_dump "<Neon direct string>" > backup.sql` |

## Before real users

- **Privacy notice:** it currently says menu photos are read "on our own
  server". With this setup they are read by our own code on Hugging Face's
  servers, and data is stored by Neon and Vercel outside Thailand. Update the
  wording (and its version) before real users.
- The Thai dish guide, staff phrase cards and legal texts are still drafts.
- Rate limits are kept in memory, which is weaker on Vercel (each server copy
  counts on its own).

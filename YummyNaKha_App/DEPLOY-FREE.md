# Free deployment: Vercel + Neon + OCR.space

Fully free and always on — no server and no laptop needed. Testers get a fixed
address (`https://<your-app>.vercel.app`) that works from anywhere.

```
tester's phone ──HTTPS──▶ Vercel (the app) ──▶ Neon (database, Singapore)
                                └──photo only──▶ OCR.space (reads the menu text)
```

- **OCR.space free plan:** 500 photos a day, 1 MB per photo (the app shrinks
  photos before upload). Enough for user testing.
- **Privacy:** the menu photo goes to OCR.space. With
  `NEXT_PUBLIC_OCR_PROVIDER=ocrspace` the app asks every user to agree to that
  ("Menu photo reading") before the first scan, and the privacy notice says so.
  Only the photo is sent — never the user's name, email or food profile.
- **Accuracy:** on our generated test menus OCR.space matched PaddleOCR (98% of
  dishes, 97% of prices, no wrong dishes). Check a few real menus before user
  sessions.

To keep photos on your own server instead, use [DEPLOY.md](DEPLOY.md) (Azure).

---

## 1. Neon — the database
Done: you have `DATABASE_URL` (pooled) and `DIRECT_URL` (direct).

## 2. OCR.space key
Done: register at <https://ocr.space/ocrapi> → *Register for free API key*.
The key arrives by email → `OCR_SPACE_API_KEY`.

## 3. A login secret
```bash
openssl rand -base64 48
```
→ `AUTH_SECRET`

## 4. Vercel — the app
1. <https://vercel.com> → **Sign up with GitHub** → plan **Hobby**.
2. **Add New → Project** → import `Uni-T17/YummyNaKha-`.
3. **Root Directory** → **Edit** → `YummyNaKha_App`.
4. **Environment Variables**:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | Neon pooled string |
   | `DIRECT_URL` | Neon direct string |
   | `AUTH_SECRET` | from step 3 |
   | `NEXT_PUBLIC_OCR_PROVIDER` | `ocrspace` |
   | `OCR_SPACE_API_KEY` | your OCR.space key |

5. **Deploy** (3–5 minutes; this also creates the database tables).
6. Copy your address (e.g. `https://yummy-na-kha.vercel.app`), add it as
   `APP_URL` under **Settings → Environment Variables**, then
   **Deployments → ⋯ → Redeploy**.
7. Optional: **Settings → Functions → Function Region → Singapore (sin1)**,
   then redeploy (faster for Thai users, next to the Neon database).

## 5. Test
Open your Vercel address on a phone: sign up, accept the agreements, set My
Taste, scan a real menu, open Order in Thai.

## Optional: Google sign-in
Add `https://<your-app>.vercel.app/api/auth/google/callback` to the Google OAuth
client's redirect URIs, add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in
Vercel, redeploy. While the consent screen is in *Testing*, add testers as test
users.

## Everyday

| Task | How |
|---|---|
| Update the app | Push to `main` — Vercel redeploys and applies new migrations by itself |
| See errors | Vercel → project → **Logs** |
| "The menu reader is busy today" | The 500-a-day free limit is used up — it resets after 24 hours |
| Guide coverage and dish reports | On your Mac: `DATABASE_URL="<Neon direct string>" npm run guide:coverage` |

## Before real users
- Changing `NEXT_PUBLIC_OCR_PROVIDER` changes the privacy notice version, so
  existing users are asked to accept again — that's intended (LR9).
- The Thai dish guide, staff phrase cards and legal texts are still drafts.
- Record the switch to OCR.space in the spec (LR2/LR3 currently say photos stay
  on our server).

# YummyNaKha! — app

Next.js 16 app (UI + API in `app/`, server code in `lib/server/`), PostgreSQL via
Prisma 7, and our own OCR service (`ocr-service/`, PaddleOCR Thai model). Menu
photos and food profiles are not sent to a third-party AI provider unless an
optional provider is configured and the user consents (see `.env.example`).

## How to run (local)

### 1. Prerequisites

| Tool | Version | Check |
| --- | --- | --- |
| Node.js | 20.9 or newer (tested on 22) | `node -v` |
| npm | comes with Node | `npm -v` |
| PostgreSQL | 14 or newer (production uses 17) — local install or Docker | `psql --version` / `docker -v` |
| uv (runs the Python OCR service, fetches Python 3.12 itself) | any recent | `uv --version` (`brew install uv`) |

No PostgreSQL installed? Start one in Docker (local-only credentials):

```bash
docker run -d --name yummy-db -p 5432:5432 -e POSTGRES_USER=yummy -e POSTGRES_PASSWORD=yummy-local-dev -e POSTGRES_DB=yummynakha postgres:17-alpine
```

### 2. Environment — `.env`

```bash
cp .env.example .env
```

Fill in at least:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | e.g. `postgresql://yummy:yummy-local-dev@localhost:5432/yummynakha?schema=public` for the Docker DB above |
| `AUTH_SECRET` | output of `openssl rand -base64 48` |
| `OCR_SERVICE_URL` | keep `http://127.0.0.1:8765` |

Everything else is optional (Google sign-in, OCR.space, Gemini Menu helper) and
documented line by line in [`.env.example`](.env.example). `.env` is git-ignored —
never commit it, and never put a real key in `.env.example`.

### 3. Install and migrate the database

```bash
npm install          # also runs `prisma generate`
npm run db:migrate   # applies prisma/migrations to DATABASE_URL (dev); use `npm run db:deploy` on a server
```

### 4. Create the test account

```bash
npm run db:seed
```

[`scripts/seed-test-user.ts`](scripts/seed-test-user.ts) creates — or resets —
one **test-only** account:

- **Email:** `tester@yummynakha.test` (reserved `.test` domain, no real inbox)
- **Password:** the test-only default in `scripts/seed-test-user.ts` (`PASSWORD`),
  or your own `SEED_TEST_PASSWORD` from `.env`. It is not, and must never be, a real password.
- **My Taste:** Fav *Chicken*, Avoid *Coriander* (reason: dislike), spice "mild" —
  ordinary preferences only, no allergy or doctor-advised data.
- **No consent records:** on first sign-in you accept the Terms / AI & Accuracy
  Disclaimer in the app, as a real user would.

The script refuses to run with `NODE_ENV=production` or a non-`.test` email.
To use a different test account, set `SEED_TEST_EMAIL` / `SEED_TEST_PASSWORD`
in `.env` and run it again. You can also just sign up in the app.

### 5. Start the OCR service and the app (two terminals)

```bash
npm run ocr    # terminal 1 — OCR service on 127.0.0.1:8765; first run builds ocr-service/.venv and downloads the models
```

```bash
npm run dev    # terminal 2 — the app on http://localhost:3000
```

Check the OCR service is up: `curl http://127.0.0.1:8765/health` → `{"ok": true, …}`.
Then open http://localhost:3000, sign in with the test account, accept the
terms, upload a Thai menu photo and press **Find My Food**.

### Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Can't reach database server` | PostgreSQL not running, or `DATABASE_URL` wrong |
| Analysis fails with "couldn't read this photo" right away | `npm run ocr` is not running, or `OCR_SERVICE_URL` differs |
| First analysis is slow | the OCR models load on the first request (~6 s per photo afterwards on a laptop CPU) |
| `CONSENT_REQUIRED` from `/api/ai/analyze` | accept the terms in the app first |

Tests: `npx vitest@3.2.4 run` (unit tests in `tests/unit/`; vitest is not a project dependency). Deployment: [`DEPLOY.md`](DEPLOY.md)
(VPS + Docker) and [`DEPLOY-FREE.md`](DEPLOY-FREE.md).

## Backend overview

The API lives in `app/api/*` (thin route handlers) with services in `lib/server/*`.
Menu photos are read by **our own OCR service** and each dish is looked up in
the **Thai dish guide** (`lib/server/thai-food/`).

### How a menu is analysed

1. **Read** — `ocr-service/server.py` returns each text box with its position (~6 s per photo on a laptop CPU).
2. **Parse** — `lib/server/menu/parse-ocr.ts` pairs each dish name with the price on its row, correcting for a tilted photo.
3. **Match** — `lib/server/thai-food/match.ts` finds the guide dish in the line (ignoring tone marks and small OCR slips) plus its protein (`ผัดกะเพรา` + `หมูสับ`). A dish that isn't in the guide is **read from the words of its name** (`หมึก` + `ทอด` + `กระเทียม` → *Deep-fried squid with garlic*) using `words.ts`.
   English-only menus are read the same way: English lines are matched by `english.ts` to the same guide dishes and words, and the Thai name for ordering comes from the guide. On a Thai menu with English translations, the Thai names are used.
4. **Categorise** — `lib/matching.ts` checks the ingredients and their allergen groups against the diner's Avoid list → Top Pick / Check First / Avoid. Dishes read from their name, misread names and unstated proteins are always Check First.

### Extending the Thai dish guide

| File | What goes in it |
| --- | --- |
| `lib/server/thai-food/dishes.ts`, `dishes-more.ts`, `dishes-datasets.ts` | Dishes: Thai spellings, English name, description, spice, ingredients (listed / often added) |
| `lib/server/thai-food/variants.ts` | Proteins and styles added to a dish name (หมูสับ, กุ้ง, น้ำข้น…) |
| `lib/server/thai-food/words.ts` | Menu words for reading unlisted dishes (ผัด, ทอด, แกง, กระเทียม, เห็ด…) |
| `lib/server/thai-food/english.ts` | English menus: how restaurants write guide dishes in English ("Basil Pork", "Tom Yum Goong") and English words → the Thai menu words above |
| `lib/server/thai-food/ingredients.ts` | Every ingredient with its Thai name and allergen groups |

Bump `GUIDE_VERSION` after any change, then:

```bash
npm run guide:check                          # data checks (duplicate spellings, unused ingredients)
npm run guide:check -- path/to/menu-lines.txt  # how a list of menu names is matched
npm run guide:check -- scripts/test-menus/kaggle-thai-dishes.txt   # benchmark: 324 names from a public Kaggle list
npm run guide:check -- scripts/test-menus/inmu-prepared-dishes.txt # benchmark: 90 prepared dishes from INMU (Mahidol)
npm run guide:check -- scripts/test-menus/english-menu-sample.txt  # smoke test: English menu wording
npm run guide:export                         # writes data/thai-dish-guide.csv (one row per dish) for review in a spreadsheet
npm run guide:coverage                       # dishes from real scans that are missing from the guide, most frequent first
```

Grow the guide from `guide:coverage`: after each round of real scans, add the most frequent missing dishes. The data is a **draft** until a Thai-literate team member has reviewed it.

Public datasets are used for dish **names only** (`dishes-datasets.ts` and the benchmark lists). Their ingredient lists leave out allergens (the Kaggle Pad Thai has no peanuts, egg or shrimp), so ingredients are always written and reviewed by the team.

| Endpoint | Purpose |
| --- | --- |
| `POST /api/auth/register`, `/login`, `/logout` · `GET/PATCH /api/auth/me` · `POST /api/auth/password` | Accounts and sessions (httpOnly cookie, DB-backed) |
| `GET /api/preferences` · `POST/DELETE /api/preferences/favorite` · `POST/DELETE /api/preferences/dislike` | My Taste (Favs / Avoid list) |
| `POST /api/images` · `GET/DELETE /api/images/:id` | Menu photo upload (JPG/PNG/WebP ≤ 8 MB) |
| `POST /api/ai/analyze` | Full pipeline → OCR service → Thai dish guide → dishes for the Menu screen |
| `GET/POST /api/consents` · `POST /api/consents/withdraw` | Terms, privacy notice and disclaimer acceptance records |

Errors are returned as `{ "error": { "code", "message", "fields?" } }`.

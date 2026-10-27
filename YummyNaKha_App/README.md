This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Backend setup

The API lives in `app/api/*` (thin route handlers) with services in `lib/server/*`.
PostgreSQL via Prisma 7. Menu photos are read by **our own OCR service**
(`ocr-service/`, PaddleOCR with the Thai model) and each dish is looked up in
the **Thai dish guide** (`lib/server/thai-food/`). No menu photo or food profile
is sent to a third-party AI provider.

```bash
cp .env.example .env        # fill in DATABASE_URL and AUTH_SECRET
npm install                 # also runs `prisma generate`
npm run db:deploy           # apply migrations (use `npm run db:migrate` while developing)
npm run ocr                 # terminal 1 — OCR service on :8765 (first run downloads the models)
npm run dev                 # terminal 2 — the app on :3000
```

`npm run ocr` needs [uv](https://docs.astral.sh/uv/) (`brew install uv`); it
creates the Python environment in `ocr-service/.venv` on first run.

### How a menu is analysed

1. **Read** — `ocr-service/server.py` returns each text box with its position (~6 s per photo on a laptop CPU).
2. **Parse** — `lib/server/menu/parse-ocr.ts` pairs each dish name with the price on its row, correcting for a tilted photo.
3. **Match** — `lib/server/thai-food/match.ts` finds the guide dish in the line (ignoring tone marks and small OCR slips) plus its protein (`ผัดกะเพรา` + `หมูสับ`). A dish that isn't in the guide is **read from the words of its name** (`หมึก` + `ทอด` + `กระเทียม` → *Deep-fried squid with garlic*) using `words.ts`.
4. **Categorise** — `lib/matching.ts` checks the ingredients and their allergen groups against the diner's Avoid list → Top Pick / Check First / Avoid. Dishes read from their name, misread names and unstated proteins are always Check First.

### Extending the Thai dish guide

| File | What goes in it |
| --- | --- |
| `lib/server/thai-food/dishes.ts`, `dishes-more.ts` | Dishes: Thai spellings, English name, description, spice, ingredients (listed / often added) |
| `lib/server/thai-food/variants.ts` | Proteins and styles added to a dish name (หมูสับ, กุ้ง, น้ำข้น…) |
| `lib/server/thai-food/words.ts` | Menu words for reading unlisted dishes (ผัด, ทอด, แกง, กระเทียม, เห็ด…) |
| `lib/server/thai-food/ingredients.ts` | Every ingredient with its Thai name and allergen groups |

Bump `GUIDE_VERSION` after any change, then:

```bash
npm run guide:check                          # data checks (duplicate spellings, unused ingredients)
npm run guide:check -- path/to/menu-lines.txt  # how a list of menu names is matched
npm run guide:coverage                       # dishes from real scans that are missing from the guide, most frequent first
```

Grow the guide from `guide:coverage`: after each round of real scans, add the most frequent missing dishes. The data is a **draft** until a Thai-literate team member has reviewed it.

| Endpoint | Purpose |
| --- | --- |
| `POST /api/auth/register`, `/login`, `/logout` · `GET/PATCH /api/auth/me` · `POST /api/auth/password` | Accounts and sessions (httpOnly cookie, DB-backed) |
| `GET /api/preferences` · `POST/DELETE /api/preferences/favorite` · `POST/DELETE /api/preferences/dislike` | My Taste (Favs / Avoid list) |
| `POST /api/images` · `GET/DELETE /api/images/:id` | Menu photo upload (JPG/PNG/WebP ≤ 8 MB) |
| `POST /api/ai/analyze` | Full pipeline → OCR service → Thai dish guide → dishes for the Menu screen |
| `GET/POST /api/consents` · `POST /api/consents/withdraw` | Terms, privacy notice and disclaimer acceptance records |

Errors are returned as `{ "error": { "code", "message", "fields?" } }`.

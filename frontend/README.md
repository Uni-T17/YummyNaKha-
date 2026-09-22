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
PostgreSQL via Prisma 7; Hugging Face (OCR + translation) and Google Gemini
(menu analysis) are called only from the server.

```bash
cp .env.example .env        # fill in DATABASE_URL, AUTH_SECRET and the API keys
npm install                 # also runs `prisma generate`
npm run db:deploy           # apply migrations (use `npm run db:migrate` while developing)
npm run dev
```

| Endpoint | Purpose |
| --- | --- |
| `POST /api/auth/register`, `/login`, `/logout` · `GET/PATCH /api/auth/me` · `POST /api/auth/password` | Accounts and sessions (httpOnly cookie, DB-backed) |
| `GET /api/preferences` · `POST/DELETE /api/preferences/favorite` · `POST/DELETE /api/preferences/dislike` | My Taste (Favs / Avoid list) |
| `POST /api/images` · `GET/DELETE /api/images/:id` | Menu photo upload (JPG/PNG/WebP ≤ 8 MB) |
| `POST /api/ai/extract-text` | Photo → Hugging Face OCR → translation |
| `POST /api/ai/analyze` | Full pipeline → Gemini → dishes for the Menu screen |
| `GET/POST /api/consents` · `POST /api/consents/withdraw` | Terms & AI-transfer consent records |

Errors are returned as `{ "error": { "code", "message", "fields?" } }`.

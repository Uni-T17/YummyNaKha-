# API checks, logic checks and 60-pair TC9 set — 17 Nov 2026

Run by Claude Code for Chan Nyein Thu (AI Lead) against commit `befc0d0`: production build (`next start`), throwaway PostgreSQL 17 Docker container, disposable `@example.test` accounts. No real users. Results are written up in [02-test-results.md](../../02-test-results.md).

| File | What it is | Result |
|---|---|---|
| `api-tests.mjs` → `api-results.json` | 47 HTTP + database checks for TC1, TC2 (upload validation), TC3, TC4, TC6, TC14 | 47 / 47 pass (the Google OAuth check only shows the fallback redirect: OAuth itself is Blocked, no credentials) |
| `run-tc.ts` → `unit-results.txt` | 26 logic checks: TC7 parser, TC9 rules, sweep of 247 guide dishes × 3 profiles (741 results), TC11 wording | 25 / 26 pass: R1-01 (unlisted dish gets a rough English name; allowed since PO decision D1) |
| `tc9-60.ts` → `tc9-60.txt` | 60 dish/profile pairs (20 conflict, 20 control, 20 uncertain/dislike) | missed 0/20, false conflict 0/20, uncertain shown as Top Pick 0 |
| `fx/` | Synthetic menu images rendered from HTML (not real photos) | — |

**Re-run:** the `.ts` files run from `YummyNaKha_App` with `npx tsx --conditions=react-server --tsconfig tsconfig.json <file>`. `api-tests.mjs` needs the app on `BASE` (default `http://127.0.0.1:3100`), a Docker Postgres named `ynk-test-db` (user `ynk`, db `ynk_test`), and the `fx/` folder next to it.

**Limits:** the TC9 labels are not yet approved by the Product Owner. Tests that need OCR (TC2 multi-page, TC5, TC8, TC10, TC12, TC13) were not run. The IDs in `api-results.json` are from the throwaway test database, which has since been deleted.

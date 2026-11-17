# OCR run (Run 2): TC5, TC10, TC12, TC13 — 17 Nov 2026

Run by Claude Code against commit `4d7d737` (app code unchanged). The full write-up is in [02-test-results.md](../../02-test-results.md#run-2--17-nov-2026-ocr-run-tc5-tc10-tc12-tc13). No real users and no real personal data: one disposable `@example.test` account with a synthetic profile (fav Chicken; avoid Peanut, allergy, after the health-data opt-in; Shrimp added later as an ordinary dislike).

## Set-up

| Part | What was used |
|---|---|
| App | `next dev -p 3100` (Next.js 16.3.5, Node v24.18.1), `NEXT_PUBLIC_OCR_PROVIDER=local` (PaddleOCR, not OCR.space), `OCR_SERVICE_TOKEN` empty |
| Database | Throwaway PostgreSQL cluster (Homebrew `initdb`) on `127.0.0.1:5544`, all migrations applied with `prisma migrate deploy`. Deleted after the run. |
| OCR | `npm run ocr` → PaddleOCR 3.7.0 (`PP-OCRv5_mobile_det` + `th_PP-OCRv5_mobile_rec`) on `127.0.0.1:8765`; `GET /health` → `{"ok":true,…}` |
| TC5 capture | [`ocr-capture-proxy.mjs`](ocr-capture-proxy.mjs) on `127.0.0.1:8766` between the app and PaddleOCR (`OCR_SERVICE_URL=http://127.0.0.1:8766`): records method, path, headers and a body summary (size, SHA-256, first bytes), then forwards unchanged |
| Server outbound log | [`net-log-preload.cjs`](net-log-preload.cjs) loaded into the Next.js server with `NODE_OPTIONS=--require`: logs every outbound socket and every `fetch()` destination (no payloads) |
| Browser | Claude's built-in browser. Photos were put into the app's file input from a small local static server on `127.0.0.1:8767` (test harness only) |
| Client build | `next build` of a copy of the app (scratch folder, real `.env` present) for the secret scan |

## Files

| File | What it is |
|---|---|
| `fx/menu1.jpg` | Synthetic Thai menu, 8 dishes (same image as Run 1's `fx/menu1.jpg`) |
| `fx/blurred-menu1.jpg` | `menu1.jpg` with a 14 px Gaussian blur |
| `fx/english-only-menu.jpg` | Synthetic English-only menu ("Joe's Diner", 5 items) |
| `ocr-capture.jsonl` | Every request the OCR service received (6 × `POST /ocr` from the app; 3 × `GET /health` from the tester's own checks) |
| `net-log.jsonl` | Every outbound connection / fetch from the Next.js server process after the logger was upgraded (first scan's log was incomplete — see limits) |
| `tc5-browser-requests.txt` | Summary of the browser network log for the TC5 scan |
| `tc5-client-secret-scan.txt` | Result of searching the production client bundle for each secret value (values never printed) |
| `tc13-menuanalysis-before.json` | Stored `MenuAnalysis` for scan 1, read right after the scan |
| `tc13-menuimage.json` | The linked `MenuImage` row (OCR model, OCR text, OCR boxes, image bytes deleted) |
| `tc13-menuanalysis-after-profile-change.json` | Same record read after Shrimp was added to the profile (byte-identical, same SHA-256) |
| `tc13-reproduce.ts` → `tc13-reproduce-output.txt` | Rebuilds the categories from the stored record alone and compares them with what the browser showed |
| `tc13-after-photo-removed.json` | State of the record after the photo was removed from Home |
| `r2-01-english-alias-probe.ts` → `…-output.txt` | Probe for defect R2-01 (English "chocolate" lines matched to Iced Cocoa) |
| `rendered-pages.txt` | Page text of each screen as rendered in the browser |
| `server-api-log.txt` | The dev server's API request lines and `[ocr]` error lines (image IDs replaced by `<id>`) |
| `screenshots/01…11` | Screenshots of the screens above |

## Results in one line each

- **TC5 Pass.** Each `POST /ocr` body is byte-identical to the uploaded photo (SHA-256 equal); headers are only `content-type`, `content-length` and standard Node fetch headers — no cookie, no `Authorization`, no email, name or profile. Server outbound during scans: test DB + OCR only. Browser: app origin only. Client bundle: no secret values, no OCR address.
- **TC10 Fail (1 assertion).** Blurred photo, OCR stopped, OCR unreachable: clear messages, no raw errors, no dishes; retry after restart works with the same photo (same image ID, no new upload). English-only menu: "Chocolate Shake" shown as Top Pick **Iced Cocoa / โกโก้เย็น**, a guide dish that is not on the menu (R2-01), and no message that the menu isn't Thai.
- **TC12 Pass.** Two selected, one removed → My Order and Order in Thai show exactly แกงเขียวหวานไก่ 90 บาท. Adding Shrimp on My Taste → 4 dishes move to Check First on return, no new scan or OCR call. Empty order shows "No dishes selected yet."
- **TC13 Pass, defect logged.** The record has timestamp, OCR model and text, guide version, English output and profile snapshot. It is unchanged after the profile edit, and rebuilding from it gives the categories that were shown, 8/8. The category itself and the matching-rule version are **not stored**, and removing the photo deletes the OCR model name (R2-02).

## Limits

- The app ran under `next dev`, not `next start`. At start-up, `next dev` itself fetched `https://registry.npmjs.org/-/package/next/dist-tags` (its version check). That is dev tooling, not app code, but a production capture is still worth doing.
- The first scan (14:55 UTC) was captured by the OCR proxy, but the first version of the server logger missed `fetch()` calls. The logger was fixed and the server restarted before the TC5 scan (14:56 UTC), which is the scan TC5 is judged on.
- TC10 checks **not run**: OCR timeout, malformed OCR response, empty OCR text, and the ≥ 95 % scheduled availability measure.
- `OCR_SERVICE_TOKEN` was empty, so the `Authorization: Bearer` header used for a public OCR host was not exercised.
- The photos are synthetic, not real menu photos.

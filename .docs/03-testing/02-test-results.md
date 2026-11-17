# YummyNaKha! — Test Results (Runs 1–2)

> **Run 2 (OCR run, 17 Nov 2026 evening)** covers TC5, TC10, TC12 and TC13 — see [Run 2](#run-2--17-nov-2026-ocr-run-tc5-tc10-tc12-tc13) below. Sections 1–5 are Run 1 and are left as they were run.

**Run date:** 17 Nov 2026 · **Build:** `main` @ `befc0d0` (production build, `next start`) · **Plan:** [01-test-plan.md](01-test-plan.md) (TC1–TC15)
**Environment:** macOS laptop, Node (project lockfile, `npm ci`), PostgreSQL 17 in a disposable Docker container (all migrations applied), disposable `@example.test` accounts. Google OAuth, Gemini and OCR.space keys were **not** set.
**Executed by:** Claude Code. Scripts were run against the local app/API and the test database. No real users took part.

> Status values follow the plan: **Pass / Fail / Blocked / Not run**. A case is marked Pass only when every assertion that was run passed. A case is marked **Partial** when some assertions are still Not run.

## 1. Summary — Run 1 (before the OCR run)

### Combined status — Runs 1–2 (17 Nov 2026)

One row per test case, latest result across all runs. The same totals are in the [execution log](02-test-execution-log.md#status-of-all-15-test-cases).

| TC | Case | Status | Source |
|---|---|---|---|
| TC1 | Account and ordinary profile persistence | Pass | Run 1 (Google OAuth assertion Blocked: no credentials in the test env) |
| TC2 | Menu upload, including multiple pages | Partial | Run 1: upload checks pass; multi-page analysis not run |
| TC3 | Separate sensitive-profile opt-in | Pass | Run 1 |
| TC4 | Terms, privacy and disclaimer gate | Pass | Run 1 |
| TC5 | Own-server OCR and data minimisation | Pass | [Run 2](#r22-tc5--own-server-ocr-and-data-minimisation--pass) |
| TC6 | Consent withdrawal takes effect | Pass | Run 1 |
| TC7 | OCR parser and deterministic guide lookup | Pass | Vitest run, [execution log](02-test-execution-log.md) Run 1 (16/16). Run 1's R1-01 failure here was closed by PO decision D1 |
| TC8 | Upload-to-result latency | Partial | [Execution log](02-test-execution-log.md) Run 2 (16 Nov): 7 scans per engine, server time only. **Not measured in this file's Run 2** |
| TC9 | Profile matching and uncertainty | Pass | Run 1 + Vitest run |
| TC10 | Unreadable menu and OCR failure recovery | **Fail** | [Run 2](#r23-tc10--unreadable-menu-and-ocr-failure-recovery--fail-1-assertion): English-only menu, R2-01 |
| TC11 | Explainable results and safety wording | Partial | Run 1: browser walk-through not run |
| TC12 | Select dishes and order in Thai | Pass | [Run 2](#r24-tc12--select-dishes-and-order-in-thai--pass) |
| TC13 | Processing record reproduces displayed result | Pass | [Run 2](#r25-tc13--processing-record-reproduces-displayed-result--pass-defect-r2-02-logged) (defect R2-02 logged) |
| TC14 | Content deletion and traffic retention | Pass | Run 1 (photo clean-up window part Blocked) |
| TC15 | Real-menu extraction and English quality | Partial | [Execution log](02-test-execution-log.md) Run 2 (16 Nov): 1 real menu + 6 generated, not the 20-photo set |

**Totals:** Pass **10** · Partial **4** · Fail **1** · Blocked **0** · Not run **0** (15 cases).

### Run 1 only (as run, kept for the record)

| Status | Cases |
|---|---|
| Pass | TC1\*, TC3, TC4, TC6, TC9, TC14 |
| Fail | TC7 (1 assertion) |
| Partial (run part, rest Not run) | TC2, TC11 |
| Not run (need the OCR service) | TC5, TC8, TC10, TC12, TC13 |
| Blocked | TC15 (no annotated 20-photo corpus) |

\*TC1: the OAuth assertion is **Blocked** because no Google credentials exist in the test env. The app falls back to `/sign-in?google=unavailable` as designed.

**Assertions run:** 47 API checks + 26 logic checks + 60 TC9 pairs. **1 failure** against the plan as written (finding R1-01). The PO changed that rule the same day (D1), so it is no longer a defect.

**Why five cases were not run:** the local PaddleOCR service (`npm run ocr`) couldn't finish installing. The first try timed out downloading a package. A retry with a longer timeout was still downloading its ~200 MB of packages when this run stopped.

## 2. Results per test case

### TC1 — Account and ordinary profile persistence · **Pass** (OAuth Blocked)
| Check | Result |
|---|---|
| Register, save Chicken (fav) + Mushroom (ordinary dislike), remove Mushroom | Pass (HTTP 201/200/200/200) |
| Sign-out → profile request refused | Pass (401) |
| Wrong password refused; sign back in works | Pass (401 / 200) |
| Fav persisted, removed dislike stays removed | Pass |
| Account B cannot read A's profile | Pass |
| Password stored as salted `scrypt$32768$8$1$…` hash only | Pass |
| Session token stored hashed (raw cookie value not in DB) | Pass |
| Session cookie `__Host-yn_session`: `Secure; HttpOnly; SameSite=lax` | Pass |
| Google OAuth sign-in | **Blocked**: no `GOOGLE_CLIENT_ID`; the friendly fallback redirect works |

### TC2 — Menu upload · **Partial**
| Check | Result |
|---|---|
| Valid JPG and PNG accepted | Pass (201) |
| Zero-byte file → "The photo is empty." | Pass (400) |
| Text renamed `.jpg` → "Use a JPG, PNG or WebP photo." | Pass (415) |
| 8 MiB + 1 byte → "Use a photo under 8 MB." | Pass (413) |
| Rejected files create no image row | Pass |
| Two pages analysed together, both contribute dishes | Not run (needs OCR) |

### TC3 — Separate sensitive-profile opt-in · **Pass**
No health flag on a fresh profile. Allergy and doctor-advised writes through the direct API are refused with **403 CONSENT_REQUIRED** before opt-in, and nothing is stored. An ordinary fav needs no health consent. The `health-data` opt-in is recorded. After opt-in, allergy and doctor items save and can be deleted. *(The plan's "known gap" for TC3 is now fixed in code.)*

### TC4 — Terms, privacy and disclaimer gate · **Pass**
`/api/ai/analyze` returns **403 CONSENT_REQUIRED** in four situations: no acceptances, Terms missing, Privacy missing, or AI Disclaimer missing. It also refuses when all three are at an outdated version (`0.0-old`). Acceptance records hold user, document, version, timestamp and action. The server stamps the version and user itself and ignores the values the client sends.

### TC5 — Own-server OCR and data minimisation · **Not run**
This case needs the OCR service so traffic can be captured. Note from the code: a `photo-reading` (OCR.space) consent and provider switch now exist. With `NEXT_PUBLIC_OCR_PROVIDER=ocrspace`, photos go to a third party, so TC5's expected result must be re-checked against that mode.

### TC6 — Consent withdrawal takes effect · **Pass**
- **Health consent:** can be withdrawn. The withdrawal shows in the history with user, version, timestamp and action.
- **After withdrawal:** all allergy and doctor reasons are deleted from the DB, and the foods stay on the Avoid list without a reason. New sensitive writes are refused (403). Ordinary prefs still work.
- **Terms:** can't be withdrawn on its own (400), as designed. *(The plan's "known gap" for TC6 is now fixed.)*

### TC7 — OCR parser and guide lookup · **Fail** (8/9)
| Check | Result |
|---|---|
| Names pair with row prices; tilted rows | Pass |
| Inline `ผัดกะเพราหมูสับ 60` | Pass |
| Missing price stays `null`; lone `บาท` is not a dish | Pass |
| Same input → same exact guide match | Pass |
| Tone-mark OCR error (`ข้าวผัดกุ่ง`) → Fried Rice with shrimp | Pass |
| Fuzzy match carries an uncertainty note | Pass |
| Missing protein → "doesn't say which meat" note | Pass |
| Unlisted dish keeps Thai + price with **no** English or ingredients | **Fail → R1-01** (rule since changed by PO decision D1) |

Observation, not a failure: `หมูกรอบผัดพริกเกลือสูตรเจ๊` fuzzy-matched **Crispy Sweet Noodles**, which is the wrong dish. It is still marked uncertain (🟡).

### TC8 — Upload-to-result latency · **Not run** (needs OCR)

### TC9 — Profile matching and uncertainty · **Pass**
- **60-pair set:** 20 listed sensitive conflicts (allergy/doctor across peanut, shellfish, egg, fish, gluten, milk), 20 no-conflict controls, and 20 uncertainty/ordinary-dislike pairs. All pairs use real guide dishes.
  - **Missed conflicts 0/20 (0%, target ≤ 5%)**
  - **False conflict warnings 0/20 (0%, target ≤ 10%)**
  - Unexpected Check First among the 20 controls: 0
  - Uncertain dishes shown as Top Pick: 0
- **12 rule cases:** all passed. These cover listed vs common, the shellfish group via oyster sauce, a fav never lifting an Avoid dish, an all-uncertain menu leaving Top Pick empty, every meat choice being in conflict, and spice.
- **Sweep of all 247 guide dishes × 3 profiles (741 results):** 0 missed conflicts.
- **Limit:** the plan requires the expected labels to be **frozen with the Product Owner** before TC9 runs. This set was built by the tester from the plan's rules and still needs PO sign-off.

### TC10 — Unreadable menu and OCR failure · **Not run** (needs OCR and a fault stub)

### TC11 — Explainable results and safety wording · **Partial**
The checks that were run all passed:
- Every 🟡/🔴 conflict note across 741 results contains "confirm with restaurant staff".
- No "safe / certified / guarantee / 100% / doctor-approved" claims and no percentages appear in generated results.
- In UI source, the only matches are negations ("not a guarantee", "not that a dish is safe") and CSS `safe-area`.

**Not run:** a walk-through of the cards and detail sheets in a browser.

### TC12 — Select dishes and order in Thai · **Not run** (E2E needs the OCR service)

### TC13 — Processing record reproduces result · **Not run**
Note from the code: `MenuAnalysis` stores dishes (before categorisation), `preferencesSnapshot`, the guide version as `model`, and the timestamp. The category is computed on the client and is **not** stored. Check against LR10 when this case runs.

### TC14 — Content deletion and traffic retention · **Pass** (cleanup-window part Blocked)
- **Deletion:** needs the password again (wrong password → 422). Delete → 204. User, preferences, images, analyses, consents and sessions all drop to 0 rows.
- **Access log:** rows survive the deletion (4 → 6). The log holds only `id, userId, ip, method, path, status, createdAt`.
- **Retention:** set to 120 days (≥ 90) in `lib/server/access-log.ts`. Not exercised with a test clock.
- **Blocked:** the session cleanup window for abandoned photos.

### TC15 — Real-menu extraction and English quality · **Blocked**
The 20 annotated real menu photos (≥ 150 rows) and the Thai-literate review have not been collected.

## 3. Defects

| ID | Sev (1–4) | TC | Description | Requirement |
|---|---|---|---|---|
| R1-01 | 2 minor | TC7 | Unlisted dish `ปลาหมึกย่างซอสเจ๊แดง` gets a rough English name ("Grilled squid") and 4 "may contain" ingredients; the plan's fallback was Thai + price only. Still 🟡 with "ask staff". **Resolved by spec change:** [PO decision D1](../01-requirements/05-log/20261117-po-decisions.md) now allows rough names marked as rough. Retest TC7 against the new F7. | F7, F8 |

IDs here use `R1-` so they don't clash with the [issue log](03-issue-log.md), where `DEF-01` is a different defect.

## 4. Remaining work for Run 2
1. Start the OCR service (`npm run ocr`), then run TC2 (multi-page), TC5, TC8, TC10, TC12, TC13 and TC11 (browser part).
2. Collect and annotate the 20-photo corpus → TC15.
3. Have the Product Owner freeze the TC9 labels. Set the image cleanup window (TC14). Add Google credentials (TC1 OAuth).

## 5. Evidence
Scripts, raw output and test images: [evidence/2026-11-17-api-and-sweep/](evidence/2026-11-17-api-and-sweep/README.md).
The separate Vitest unit run of TC7/TC9 (23/23 pass) is in [02-test-execution-log.md](02-test-execution-log.md).

---

## Run 2 — 17 Nov 2026: OCR run (TC5, TC10, TC12, TC13)

**Build:** `main` @ `4d7d737` (app code unchanged), `next dev` on port 3100 · **OCR:** our own PaddleOCR service (`npm run ocr`, PaddleOCR 3.7.0, `PP-OCRv5_mobile_det` + `th_PP-OCRv5_mobile_rec`), `NEXT_PUBLIC_OCR_PROVIDER=local` — **not** OCR.space; `GET http://127.0.0.1:8765/health` → `{"ok":true,…}`
**Environment:** throwaway PostgreSQL cluster on `127.0.0.1:5544` (all migrations, deleted after the run), one disposable `@example.test` account, synthetic profile: fav Chicken; Peanut = allergy (after the health-data opt-in); Shrimp added later as an ordinary dislike. Photos are synthetic. Optional Gemini helper **not** accepted.
**Executed by:** Claude Code, in the built-in browser plus database and traffic captures. No real users.
**Evidence:** [evidence/2026-11-17-ocr-run/](evidence/2026-11-17-ocr-run/README.md) (README, captures, records, scripts, 11 screenshots).

### R2.1 Summary

| TC | Status | One line |
|---|---|---|
| TC5 | **Pass** | OCR received only the photo bytes; no outside calls from server or browser during the scan; no secrets in the client build |
| TC10 | **Fail** (1 assertion) | Blurred / OCR-down / OCR-unreachable all handled cleanly and retry works with the same photo; but an English-only menu showed a guide dish that is not on the menu as Top Pick (R2-01) |
| TC12 | **Pass** | Order and Order in Thai show exactly the selection; a preference change re-sorts the menu with no new scan; empty order is clear |
| TC13 | **Pass**, defect logged | Record has every required field and reproduces the shown categories 8/8 after a profile edit; the category and rule version are not stored (R2-02, logged as the plan requires) |

### R2.2 TC5 — Own-server OCR and data minimisation · **Pass**

Capture: a logging proxy between the app and PaddleOCR ([`ocr-capture.jsonl`](evidence/2026-11-17-ocr-run/ocr-capture.jsonl)); every outbound socket and `fetch()` from the Next.js server ([`net-log.jsonl`](evidence/2026-11-17-ocr-run/net-log.jsonl)); the browser network log ([summary](evidence/2026-11-17-ocr-run/tc5-browser-requests.txt)).

| Check (plan) | Actual result | Result |
|---|---|---|
| OCR receives only image bytes + protocol headers | `POST /ocr`, body 65 471 bytes, SHA-256 `880ed34a…` = the uploaded `menu1.jpg` byte for byte (JPEG `ffd8ffe0`). Headers: `host, connection, content-type: image/jpeg, accept, accept-language, sec-fetch-mode, user-agent: node, accept-encoding, content-length`. No `cookie`, no `authorization`, no email, name, profile or token field. All 6 OCR requests in the run matched their fixture's SHA-256 | Pass |
| No other outside calls (server) | During the TC5 scan the server opened connections only to the test DB (`127.0.0.1:5544`) and the OCR proxy (`127.0.0.1:8766`). No Gemini, OCR.space or Google call. *(At start-up, `next dev` fetched `registry.npmjs.org/-/package/next/dist-tags`: its own version check, dev tooling, not app code.)* | Pass |
| Browser calls only app APIs | No `https://` request at all; all requests to `http://localhost:3100` (APIs, pages, chunks, self-hosted fonts, `/_next/image`). The only other host was `127.0.0.1:8767`, the test harness loading the fixture | Pass |
| No secrets / private OCR address in client assets | Production `next build` (real `.env` present): 54 files, 1.4 MB in `.next/static`. Absent: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GEMINI_API_KEY`, `OCR_SPACE_API_KEY` values; `OCR_SERVICE_URL` and `127.0.0.1:8765`; the secret variable names. ([scan](evidence/2026-11-17-ocr-run/tc5-client-secret-scan.txt)) | Pass |

Limits: `next dev`, not `next start`; `OCR_SERVICE_TOKEN` was empty, so the `Authorization: Bearer` header for a public OCR host was not exercised. The OCR.space mode (D4) was not part of this case.

### R2.3 TC10 — Unreadable menu and OCR failure recovery · **Fail** (1 assertion)

| Check | Actual result | Evidence | Result |
|---|---|---|---|
| Blurred photo (`blurred-menu1.jpg`) | "Couldn't read the menu — We couldn't find readable menu text in this photo. Try a clearer, well-lit photo taken straight on." + **Try again** / **Back to Home**. No dishes, no raw error | screenshot 07 | Pass |
| Non-Thai photo (`english-only-menu.jpg`: Cheeseburger, French Fries, Caesar Salad, Club Sandwich, Chocolate Shake) | Read as a menu: 4 items "Not in our dish guide yet — ask staff" (Check First). **"Chocolate Shake" was shown as Top Pick "Iced Cocoa / โกโก้เย็น"** with "On the menu: Chocolate Shake": a guide dish that is not on this menu, with no uncertainty. No message that this is not a Thai menu | screenshot 08, [probe](evidence/2026-11-17-ocr-run/r2-01-english-alias-probe-output.txt) | **Fail → R2-01** |
| OCR stopped (PaddleOCR killed, proxy up → HTTP 502) | "We couldn't read this photo. Please try again." No raw error (server log only: `[ocr] HTTP 502`). No dishes | screenshot 09 | Pass |
| OCR unreachable (PaddleOCR and proxy down → connection refused) | "The menu reader isn't available right now. Please try again in a moment." No raw error | screenshot 10 | Pass |
| Retry with the same photo after restarting OCR | **Try again** → 8 dishes. Same `MenuImage` row (status FAILED → PROCESSED), no new `POST /api/images`; the photo bytes were kept on failure and deleted after the successful read | screenshot 11, [`server-api-log.txt`](evidence/2026-11-17-ocr-run/server-api-log.txt) | Pass |
| Photo reviewable / croppable through failure (DEF-04) | The **failure screen itself** offers only Try again / Back to Home. **Back to Home** still lists the photo with **Crop or rotate** and **Remove** buttons, so it can be reviewed and cropped without a new photograph (one extra tap) | rendered-pages.txt | Partly (see DEF-04) |
| OCR timeout, malformed response, empty text | — | — | Not run |
| Scheduled availability ≥ 95 % | — | — | Not run |

Note: the 502 case says "We couldn't read **this photo**", which points at the photo although the service was down. Users may retake a good photo needlessly. Not counted as a failure.

### R2.4 TC12 — Select dishes and order in Thai · **Pass**

| Check | Actual result | Evidence | Result |
|---|---|---|---|
| Select two, deselect one | Selected Holy Basil + Green Curry ("2 dishes selected"), removed Holy Basil → "1 dish selected" | screenshot 02 | Pass |
| My Order = exactly the selection | Green Curry with chicken · แกงเขียวหวานไก่ · ฿90 · Total ฿90 | screenshot 03 | Pass |
| Order in Thai = exactly the selection, in Thai | "รายการที่ต้องการสั่ง" · **แกงเขียวหวานไก่ · 90 บาท** · รวม 90 บาท, plus staff cards for the peanut allergy | screenshot 04 | Pass |
| Edit an ordinary preference, return, categories update with no OCR rerun | Added Shrimp ("Just don't like it") on My Taste → back to the menu: Fried Rice, Pad Thai, Tom Yum, Green Curry and Cashew Nut now Check First with "Shrimp in your Avoid list"; Som Tam stays Avoid. The selection was kept. **No** `POST /api/ai/analyze`, `POST /api/images` or OCR request after the change (counts 1 / 1 / unchanged) | screenshot 05, server-api-log.txt | Pass |
| Empty selection | Removed the last dish → "No dishes selected yet." + **Browse Menu** | screenshot 06 | Pass |

### R2.5 TC13 — Processing record reproduces displayed result · **Pass** (defect R2-02 logged)

Scan 1 (`MenuAnalysis cmwktdjre000xbnmjlnr8wndl`, `menu1.jpg`).

| Check | Actual result | Result |
|---|---|---|
| Timestamp | `createdAt 2026-11-17 14:55:09.386` (analysis), `processedAt` on the image | Pass |
| OCR model and OCR text | `MenuImage.ocrModel = paddleocr/PP-OCRv5_mobile_det+th_PP-OCRv5_mobile_rec`; `extractedText` (all 17 lines) and OCR boxes in `metadata.ocr`; image bytes deleted (`data` null) | Pass |
| Guide version | `MenuAnalysis.model = thai-dish-guide@2026-10-27c-draft` | Pass |
| English output | `result.dishes[*].nameEn` (8 dishes) + `result.items` / `otherLines` | Pass |
| Profile snapshot | `{"avoid":[{"name":"Peanut","reason":"allergy"}],"spice":null,"favorites":["Chicken"]}`, with no name or email | Pass |
| Record unchanged after a profile edit | Re-read after adding Shrimp: byte-identical (SHA-256 `44885df4…` both times) | Pass |
| Original shown result reproduced from the record | [`tc13-reproduce.ts`](evidence/2026-11-17-ocr-run/tc13-reproduce.ts): `categorizeDish(stored dish, stored snapshot)` → **8/8 equal** to the categories the browser showed (6 Top Pick, Pad Thai Check First, Som Tam Avoid). With the current profile, 4 dishes would differ, which confirms the snapshot, not the live profile, is what reproduces the original | Pass |
| Category / rule-version evidence | **Not stored**: no per-dish category in `result`, no version of the matching rules. Reproduction depends on today's `lib/matching.ts`. Also, the OCR model name lives only on `MenuImage`; when the user removes the photo from Home, that row is deleted and the analysis keeps its result, snapshot and guide version but not the OCR model name ([state after removal](evidence/2026-11-17-ocr-run/tc13-after-photo-removed.json)) | **Defect R2-02** (plan: "recorded as a defect") |

### R2.6 Defects found in Run 2

| ID | Sev (1–4) | TC | Description | Requirement |
|---|---|---|---|---|
| R2-01 | 3 major | TC10 | English menu lines containing "chocolate" are matched to the guide dish **Iced Cocoa (โกโก้เย็น)**. "Chocolate Shake" and "Iced Chocolate" match as exact, with no uncertainty, so they are shown as **Top Pick**, and the Thai name shown to staff is a different drink. "Chocolate Lava Cake" and "Chocolate Croissant" also become Iced Cocoa, but marked uncertain (Check First). | F7, F10, F27 (approximate match must be 🟡), LR12 |
| R2-02 | 2 minor | TC13 | The processing record does not store the category shown or the matching-rule version, and the OCR model name is lost when the photo is removed. The result can only be reproduced with the same matching code. | F27, LR10 |

Both are added to the [issue log](03-issue-log.md).

### R2.7 Also seen (not part of the four cases)

- The second scan sent both photos in the Home list (the first `menu1.jpg` was still there), so it analysed 2 pages and still showed 8 dishes. Both pages were the same image, so this is **not** TC2 multi-page evidence.
- On the menu page, Green Curry and Cashew Nut Stir-fry get "Shrimp in your Avoid list" (via shrimp paste / oyster sauce in the guide). This is consistent with the guide's allergen groups.

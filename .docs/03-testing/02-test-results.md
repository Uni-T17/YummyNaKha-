# YummyNaKha! — Test Results (Run 1)

**Run date:** 17 Nov 2026 · **Build:** `main` @ `befc0d0` (production build, `next start`) · **Plan:** [01-test-plan.md](01-test-plan.md) (TC1–TC15)
**Environment:** macOS laptop, Node (project lockfile, `npm ci`), PostgreSQL 17 in a disposable Docker container (all migrations applied), disposable `@example.test` accounts. Google OAuth, Gemini and OCR.space keys were **not** set.
**Executed by:** Claude Code. Scripts were run against the local app/API and the test database. No real users took part.

> Status values follow the plan: **Pass / Fail / Blocked / Not run**. A case is marked Pass only when every assertion that was run passed. A case is marked **Partial** when some assertions are still Not run.

## 1. Summary

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

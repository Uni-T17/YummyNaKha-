# Backlog — YummyNaKha!

Prioritised by MoSCoW. Every row traces to a requirement ID and a real survey
pain (or a legal requirement). Source spec:
[20260907-01-menu-scan-personalization.md](01-spec/20260907-01-menu-scan-personalization.md).

Pains (survey of 6 respondents, Sep 6–7 2026):
**P1** difficulty understanding unfamiliar Thai menu information ·
**P2** dependence on staff, friends, and translation tools ·
**P3** wanting help matching dishes to preferences and restrictions ·
**P4** accuracy and trust decide willingness to rely on the app ·
**P5** wanting a direct photo-based way to process a menu.

## Must

| # | Item | Traces to |
|---|------|-----------|
| B1 | Account and sign-in so a food profile persists — **OAuth + email/password**; OAuth provider **Google** (decided 2026-11-17) | F1, P3 |
| B2 | Food profile: favorite foods and ordinary preferences | F2, P3 |
| B3 | Allergy and doctor-advised restriction section, behind a separate opt-in | F3, P3 |
| B4 | View, edit, and delete any profile field, including the sensitive section | F4, P3 |
| B5 | Thai menu image upload (upload only — no live camera) | F5, P5, P2 |
| B6 | Dish name and price extraction from the uploaded photo | F6, P1 |
| B7 | English name for each extracted dish, taken from the Thai dish guide plus the protein/style on the menu; a dish not in the guide gets a **rough English name marked "rough"** (or its Thai name, marked "not translated yet") and is always 🟡 — *DEF-01, decided 2026-11-17* | F7, P1, P2 |
| B8 | Ingredients per dish from the reviewed Thai dish guide (not AI inference per scan), to enable matching | F8, P3 |
| B9 | Profile matching → 🟢 recommended / 🟡 check before ordering / 🔴 conflict | F9, P3 |
| B10 | Uncertainty rule: incomplete or unclear menu information — including a dish not in the guide, an approximate (possibly misread) name match, or an unstated protein — resolves to 🟡, never 🟢 | F10, P4 |
| B11 | Every 🟡 and 🔴 carries the confirm-with-restaurant-staff instruction | F11, P4 |
| B12 | Result basis shown: extracted dish text, translation, and the profile item that triggered 🟡 or 🔴 | F12, P4 |
| B13 | Dish selection from the categorized menu | F13, P1, P5 |
| B14 | Selected-menu page showing the chosen dishes back in Thai for ordering | F14, P2 |
| B15 | Terms + privacy notice + AI & Accuracy Disclaimer accepted before the first scan; the notice says where photos and profile are processed. *The separate transfer consent was retired 2026-10-27* | F15, P4 |
| B16 | Consent withdrawal | F16, LR9 |
| B17 | Account deletion removes profile, uploaded images, and results | F17, LR5 |
| B18 | Plain-language handling of an unreadable photo and of the OCR service being down or timing out | F18, P4 |
| B19 | Allergy / medical / doctor-advised data collected only under an explicit separate opt-in; ordinary preferences stay normal personal data | LR1 (PDPA §26) |
| B20 | Third-party transfer only with disclosure and consent: self-hosted, photos are read by our own OCR service; on the free deployment they go to **OCR.space — photo only, after a separate "Menu photo reading" consent** (*decided 2026-11-17*). The optional Gemini helper has its own consent. Matching always runs in the app; the old AI-transfer consent stays **retired**, earlier records kept for LR9 | LR2 (PDPA) |
| B21 | Minimisation to the OCR service — the request carries the image bytes only, no account email, real name, user ID, token, or profile data; the profile never leaves the app server; **OCR calls made from the backend only** | LR3 (PDPA) |
| B22 | Purpose limit on profile and menu data — no advertising, resale, or profiling without a separate opt-in | LR4 (PDPA) |
| B23 | Deletion handling; the uploaded image is kept **temporarily for the active scan session** for review, crop, and retry, photo bytes deleted **as soon as OCR has read them** (*decided 2026-11-17*); a photo that is never read stays until the user removes it or deletes the account. Never kept as permanent history | LR5 (PDPA) |
| B24 | No plaintext passwords — salted password hashing for email/password; OAuth stores a token only; tokens handled securely; **server-only configuration (OCR service address, secrets) never reaches the frontend** | LR6 (PDPA) |
| B25 | CCA §26 traffic data — account identifier, IP, timestamp — retained ≥ 90 days, stored separately from content, where the obligation applies | LR7 (CCA §26) |
| B26 | No over-retention: profiles, the temporary scan-session image, and selected dishes are **not** kept 90 days merely because of §26 | LR8 (CCA §26) |
| B27 | Retrievable, versioned acceptance and consent records — user ID, document version, timestamp, action — including every withdrawal | LR9 (ETA §9/26) |
| B28 | AI-processing records (OCR model and dish-guide version, OCR result, translation, profile snapshot, timestamp, recommendation) kept as an **internal quality measure**, not claimed as a statutory mandate | LR10 (internal) |
| B29 | No "certified", "nutritionist-approved", "doctor-approved", or "100% accurate" copy anywhere in the UI | LR11 (ETA §28) |
| B30 | Never state a dish is safe; no safety score or percentage; the three categories only | LR12 (product safety) |
| B38 | Uploaded image stays on screen during the scan for review, crop, and retry after a failed extraction | F26, P5, P4 |
| B39 | Thai dish guide: each dish with Thai spelling variants, English name, protein/style variants, and ingredients marked listed/common with allergen groups; tone-mark-insensitive, OCR-tolerant matching; guide version recorded per result; **Thai-literate review before user testing** | F27, P1, P3, P4 |
| B40 | Detailed ingredient view per dish — main and often-added ingredients with Thai names and notes, description, spice level, and a note that restaurants cook their own way | F28, P1, P3 |

## Should

| # | Item | Traces to |
|---|------|-----------|
| B31 | Upload more than one menu image in a single session | F19, P5 |
| B41 | "Report a problem" on a dish (wrong name / ingredients / price), reviewed by the team to fix the guide | F29, P4 |
| B42 | "Ask the staff" Thai phrase cards on Order in Thai, from the Avoid list and spice level | F30, P2 |
| B43 | Anonymous counter of dishes not in the guide, listed by `npm run guide:coverage` | F31, P1 |
| B44 | Spice level in My Taste; hotter dishes are 🟡 with the staff instruction | F32, P3 |
| B45 | Quantity per selected dish (− / +), carried to the Thai order and total | F33, P2 |
| B46 | Ready-made Thai request chips per dish (spice, "no …", allergy, no MSG, fried egg, take away) — picked, never typed | F34, P2, P3 |
| B47 | "Show to staff" full-screen Thai order that keeps the screen on | F35, P2 |
| B48 | Listen: the phone reads one Thai dish name aloud (device voice, nothing sent) | F36, P2 |
| B50 | Menu-order view with every line the scan read, and "Show on menu photo" for a dish | F38, P1, P5 |

## Could

| # | Item | Traces to |
|---|------|-----------|
| B33 | Rate a recommendation so the team can improve accuracy | F21, P4 |
| B49 | Search the results and sort by price | F37, P1 |
| B51 | Colour theme picker — result colours never change | F39, P4 (U4 ease of use) |
| B52 | Add to home screen (app icon, opens full screen) | F40, P5, P4 (U4) |

## Won't (this phase)

| # | Item | Traces to |
|---|------|-----------|
| B32 | Scan history — reopening a previously scanned menu. **Moved from Could to Won't, team decision 2026-09-07**; menu images are never kept as permanent history | F20, LR5 |
| B34 | Live camera scanning of a menu | F22 (Brief §8) |
| B35 | Voice output of results (reading the categorized menu or warnings aloud). *Narrowed 2026-11-17* — reading one dish name aloud is B48 | F23 (Brief §8) |
| B36 | Any language pair other than Thai → English | F24 (Brief §8) |
| B37 | Restaurant-side registration, setup, or supplied menu data | F25 (Brief §8) |

---

## Not backlog rows

**NFRs are not backlog items.** NFR1–NFR10 are verified as acceptance criteria
on the features they constrain (see `.docs/02-design/01-feature-list.md` once
written), not built as separate work. The mapping:

| NFR | Constrains |
|---|---|
| NFR1 project metric (`TBD`) | the whole workflow, B5 → B14 |
| NFR2 extraction accuracy | B6 |
| NFR3 translation quality | B7, B39 |
| NFR4 matching fidelity | B9, B10, B30 |
| NFR5 end-to-end latency | B5 → B9 |
| NFR6 usage / cost ceiling — 0 THB/month on free tiers (decided 2026-11-17) | B5 → B9 |
| LR5 temporary retention — deleted once OCR has read the photo (decided 2026-11-17) | B23, B38 |
| NFR7 availability | B18 |
| NFR8 ease of use (deferred 2026-11-17 — no usability test yet) | the whole workflow |
| NFR9 traffic-log retention | B25 |
| NFR10 Thai dish guide coverage (`TBD`) | B39, B10 |

## Blocked before the numbers can be committed

| Blocker | Blocks |
|---|---|
| Timed observation with real users — no baseline exists yet | NFR1 baseline and target |
| First guide-coverage measurement on the menu test set | NFR10 target |
| Thai-literate review of the dish guide (reviewer not yet named) | B39 done-ness, user testing |
| First usability test (NFR8 deferred 2026-11-17) | NFR8 |
| Automatic clean-up of photos whose OCR never succeeds | B23 (partly built) |

## Pain coverage

- **P1** → B6, B7, B13, B39, B40 · Should/Could: B49, B50
- **P2** → B5, B7, B14 · Should: B45, B46, B47, B48
- **P3** → B2, B3, B4, B8, B9, B39, B40 · Should: B46
- **P4** → B10, B11, B12, B15, B18, B38, B39 · Could: B51, B52 (U4 ease of use)
- **P5** → B5, B13, B31, B38 · Should/Could: B50, B52

Every pain is addressed by at least one Must row.

---

## Scope at sign-off — 17 Nov 2026

Status of every **Must** row against the code on `main`. **Built** = the feature
exists in the code and works in the deployed app; it does **not** mean its test
case has passed. Test status comes from the [test execution log](../03-testing/02-test-execution-log.md): only
**TC7** and **TC9 passed**, **TC8 and TC15 are partly run**, and the other 11
cases are **not run**.

| Row | Must item | Status | Code | Tests |
|---|---|---|---|---|
| B1 | Account and sign-in (email/password + Google) | Built | [`service.ts`](../../YummyNaKha_App/lib/server/auth/service.ts) · [`google.ts`](../../YummyNaKha_App/lib/server/auth/google.ts) | TC1 not run |
| B2 | Favourites and ordinary preferences | Built | [`taste-editor.tsx`](../../YummyNaKha_App/components/taste/taste-editor.tsx) · [`preferences API`](../../YummyNaKha_App/app/api/preferences/route.ts) | TC1 not run |
| B3, B19 | Allergy / doctor section behind a separate opt-in | Built | [`consent.ts`](../../YummyNaKha_App/lib/consent.ts) (`health-data`) · [`avoid-reason-sheet.tsx`](../../YummyNaKha_App/components/taste/avoid-reason-sheet.tsx) | TC3 not run |
| B4 | View, edit, delete the profile | Built | [`taste-editor.tsx`](../../YummyNaKha_App/components/taste/taste-editor.tsx) | TC1 not run |
| B5 | Menu photo upload | Built | [`menu-uploader.tsx`](../../YummyNaKha_App/components/home/menu-uploader.tsx) | TC2 not run |
| B6 | Dish name and price extraction | Built | [`parse-ocr.ts`](../../YummyNaKha_App/lib/server/menu/parse-ocr.ts) | **TC7 pass** · TC15 partly run |
| B7 | English names (guide + rough names, DEF-01) | Built | [`build-dishes.ts`](../../YummyNaKha_App/lib/server/menu/build-dishes.ts) | **TC7 pass** · TC15 partly run |
| B8 | Ingredients from the reviewed guide | Built | [`dishes.ts`](../../YummyNaKha_App/lib/server/thai-food/dishes.ts) | **TC7 pass** |
| B9 | Three categories | Built | [`matching.ts`](../../YummyNaKha_App/lib/matching.ts) | **TC9 pass** |
| B10 | Uncertainty → 🟡, never 🟢 | Built | [`matching.ts`](../../YummyNaKha_App/lib/matching.ts) · [`build-dishes.ts`](../../YummyNaKha_App/lib/server/menu/build-dishes.ts) | **TC9 pass** |
| B11 | "Confirm with restaurant staff" on every 🟡 / 🔴 | Built | [`matching.ts`](../../YummyNaKha_App/lib/matching.ts) | **TC9 pass** |
| B12 | Result basis shown | Built | [`dish-detail-sheet.tsx`](../../YummyNaKha_App/components/menu/dish-detail-sheet.tsx) | TC11 not run |
| B13 | Select dishes | Built | [`menu-results.tsx`](../../YummyNaKha_App/components/menu/menu-results.tsx) | TC12 not run |
| B14 | Order in Thai page | Built | [`thai-order.tsx`](../../YummyNaKha_App/components/order/thai-order.tsx) | TC12 not run |
| B15 | Terms, privacy, disclaimer before the first scan | Built | [`consent-form.tsx`](../../YummyNaKha_App/components/consent/consent-form.tsx) · [`consent.ts`](../../YummyNaKha_App/lib/consent.ts) | TC4 not run |
| B16 | Consent withdrawal (health data, optional helper) | Built | [`withdraw API`](../../YummyNaKha_App/app/api/consents/withdraw/route.ts) · [`service.ts`](../../YummyNaKha_App/lib/server/consent/service.ts) | TC6 not run |
| B17 | Account deletion removes everything | Built | [`service.ts`](../../YummyNaKha_App/lib/server/auth/service.ts) (cascade delete) | TC14 not run |
| B18 | Plain-language unreadable / OCR-down messages | Built | [`client.ts`](../../YummyNaKha_App/lib/server/ocr/client.ts) | TC10 not run |
| B20 | Third-party OCR only with consent | Built | [`ocrspace.ts`](../../YummyNaKha_App/lib/server/ocr/ocrspace.ts) · [`consent.ts`](../../YummyNaKha_App/lib/consent.ts) (`photo-reading`) | TC5 not run |
| B21 | Photo bytes only to OCR | Built | [`client.ts`](../../YummyNaKha_App/lib/server/ocr/client.ts) · [`ocrspace.ts`](../../YummyNaKha_App/lib/server/ocr/ocrspace.ts) | TC5 not run |
| B22 | Purpose limit | Built (no advertising or profiling code exists) | — | not tested |
| B23 | Temporary image retention | **Partly built** — never-read photos are not cleaned up automatically | [`process-image.ts`](../../YummyNaKha_App/lib/server/ai/process-image.ts) | TC14 not run |
| B24 | Hashed passwords; server-only secrets | Built | [`password.ts`](../../YummyNaKha_App/lib/server/auth/password.ts) | not tested |
| B25, B26 | CCA §26 logs ≥ 90 days, separate from content | Built | [`access-log.ts`](../../YummyNaKha_App/lib/server/access-log.ts) | TC14 not run |
| B27 | Versioned consent records | Built | [`service.ts`](../../YummyNaKha_App/lib/server/consent/service.ts) | TC4, TC6 not run |
| B28 | Processing record (guide version, profile snapshot) | Built | [`analyze-menu.ts`](../../YummyNaKha_App/lib/server/ai/analyze-menu.ts) | TC13 not run |
| B29, B30 | No unsupported claims; never "safe" | Built | [`matching.ts`](../../YummyNaKha_App/lib/matching.ts) | **TC9 pass** ("safe" check) · TC11 not run |
| B38 | Photo kept for review, crop and retry | Built | [`photo-editor.tsx`](../../YummyNaKha_App/components/home/photo-editor.tsx) | TC10 not run |
| B39 | Thai dish guide | **Partly built** — guide built; **Thai-literate review not done** | [`dishes.ts`](../../YummyNaKha_App/lib/server/thai-food/dishes.ts) | **TC7 pass** · TC15 partly run |
| B40 | Detailed ingredient view | Built | [`dish-detail-sheet.tsx`](../../YummyNaKha_App/components/menu/dish-detail-sheet.tsx) | TC11 not run |

**Summary:** 33 Must rows (B1–B30, B38–B40) — **31 built, 2 partly built (B23, B39), 0 not built**.
**Should / Could built:** B31 (multiple photos), B41–B48, B49–B52 (decided 2026-11-17). **Not built:** B33 (Could).
**Open before real users:** the Thai-literate review of the dish guide and the Thai phrases (B39, B42, B46), and the 11 test cases not yet run.


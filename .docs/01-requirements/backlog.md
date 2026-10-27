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
| B1 | Account and sign-in so a food profile persists — **OAuth + email/password**; OAuth provider name `TBD` | F1, P3 |
| B2 | Food profile: favorite foods and ordinary preferences | F2, P3 |
| B3 | Allergy and doctor-advised restriction section, behind a separate opt-in | F3, P3 |
| B4 | View, edit, and delete any profile field, including the sensitive section | F4, P3 |
| B5 | Thai menu image upload (upload only — no live camera) | F5, P5, P2 |
| B6 | Dish name and price extraction from the uploaded photo | F6, P1 |
| B7 | English name for each extracted dish, taken from the Thai dish guide plus the protein/style on the menu; a dish not in the guide gets no translation and is 🟡 | F7, P1, P2 |
| B8 | Ingredients per dish from the reviewed Thai dish guide (not AI inference per scan), to enable matching | F8, P3 |
| B9 | Profile matching → 🟢 recommended / 🟡 check before ordering / 🔴 conflict | F9, P3 |
| B10 | Uncertainty rule: incomplete or unclear menu information — including a dish not in the guide, an approximate (possibly misread) name match, or an unstated protein — resolves to 🟡, never 🟢 | F10, P4 |
| B11 | Every 🟡 and 🔴 carries the confirm-with-restaurant-staff instruction | F11, P4 |
| B12 | Result basis shown: extracted dish text, translation, and the profile item that triggered 🟡 or 🔴 | F12, P4 |
| B13 | Dish selection from the categorized menu | F13, P1, P5 |
| B14 | Selected-menu page showing the chosen dishes back in Thai for ordering | F14, P2 |
| B15 | Terms + privacy notice + AI & Accuracy Disclaimer accepted before the first scan; the notice says where photos and profile are processed. *The separate transfer consent was retired 2026-10-27* | F15, P4 |
| B16 | Consent withdrawal | F16 |
| B17 | Account deletion removes profile, uploaded images, and results | F17 |
| B18 | Plain-language handling of an unreadable photo and of the OCR service being down or timing out | F18, P4 |
| B19 | Allergy / medical / doctor-advised data collected only under an explicit separate opt-in; ordinary preferences stay normal personal data | LR1 (PDPA §26) |
| B20 | No third-party transfer: photos read by our own OCR service, matching in the app; the privacy notice says nothing is sent to an outside AI provider. The separate AI-transfer consent is **retired** (2026-10-27); earlier records are kept for LR9. Disclosure + consent before the first send returns if a third-party provider is ever reintroduced | LR2 (PDPA) |
| B21 | Minimisation to the OCR service — the request carries the image bytes only, no account email, real name, user ID, token, or profile data; the profile never leaves the app server; **OCR calls made from the backend only** | LR3 (PDPA) |
| B22 | Purpose limit on profile and menu data — no advertising, resale, or profiling without a separate opt-in | LR4 (PDPA) |
| B23 | Deletion handling; the uploaded image is kept **temporarily for the active scan session** for review, crop, and retry, then deleted when the session completes or is abandoned — duration `TBD`. Never kept as permanent history | LR5 (PDPA) |
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

## Could

| # | Item | Traces to |
|---|------|-----------|
| B33 | Rate a recommendation so the team can improve accuracy | F21, P4 |

## Won't (this phase)

| # | Item | Traces to |
|---|------|-----------|
| B32 | Scan history — reopening a previously scanned menu. **Moved from Could to Won't, team decision 2026-09-07**; menu images are never kept as permanent history | F20, LR5 |
| B34 | Live camera scanning of a menu | F22 (Brief §8) |
| B35 | Voice output of dishes or results | F23 (Brief §8) |
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
| NFR6 usage / cost ceiling — OCR hosting cost (`TBD`) | B5 → B9 |
| LR5 temporary-retention duration (`TBD`) | B23, B38 |
| NFR7 availability | B18 |
| NFR8 ease of use (`TBD`) | the whole workflow |
| NFR9 traffic-log retention | B25 |
| NFR10 Thai dish guide coverage (`TBD`) | B39, B10 |

## Blocked before the numbers can be committed

| Blocker | Blocks |
|---|---|
| Timed observation with real users — no baseline exists yet | NFR1 baseline and target |
| Hosting choice for the OCR service | NFR6 |
| First guide-coverage measurement on the menu test set | NFR10 target |
| Thai-literate review of the dish guide (reviewer not yet named) | B39 done-ness, user testing |
| First usability test | NFR8 |
| Choice of OAuth provider — the mechanism itself is settled | the provider-specific half of B1 |
| Temporary-retention duration for the scan-session image | B23, B38 |

## Pain coverage

- **P1** → B6, B7, B13, B39, B40
- **P2** → B5, B7, B14
- **P3** → B2, B3, B4, B8, B9, B39, B40
- **P4** → B10, B11, B12, B15, B18, B38, B39
- **P5** → B5, B13, B31, B38

Every pain is addressed by at least one Must row.

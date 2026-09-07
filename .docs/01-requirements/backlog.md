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
| B7 | Thai → English translation of the extracted menu | F7, P1, P2 |
| B8 | Ingredient inference per dish, to enable matching | F8, P3 |
| B9 | Profile matching → 🟢 recommended / 🟡 check before ordering / 🔴 conflict | F9, P3 |
| B10 | Uncertainty rule: incomplete or unclear menu information resolves to 🟡, never 🟢 | F10, P4 |
| B11 | Every 🟡 and 🔴 carries the confirm-with-restaurant-staff instruction | F11, P4 |
| B12 | Result basis shown: extracted dish text, translation, and the profile item that triggered 🟡 or 🔴 | F12, P4 |
| B13 | Dish selection from the categorized menu | F13, P1, P5 |
| B14 | Selected-menu page showing the chosen dishes back in Thai for ordering | F14, P2 |
| B15 | Terms + privacy notice + AI & Accuracy Disclaimer, and a **separate** transfer consent, before the first send to the provider | F15, P4 |
| B16 | Consent withdrawal | F16 |
| B17 | Account deletion removes profile, uploaded images, and results | F17 |
| B18 | Plain-language handling of an unreadable photo and of a provider outage or rate limit | F18, P4 |
| B19 | Allergy / medical / doctor-advised data collected only under an explicit separate opt-in; ordinary preferences stay normal personal data | LR1 (PDPA §26) |
| B20 | Transfer to the **Google Gemini API** disclosed, with consent obtained before the first send | LR2 (PDPA) |
| B21 | Outbound payload minimisation — menu text plus the profile flags the recommendation needs, no account email, real name, or other identifier; **all Gemini calls made from the backend**, never the frontend | LR3 (PDPA) |
| B22 | Purpose limit on profile and menu data — no advertising, resale, or profiling without a separate opt-in | LR4 (PDPA) |
| B23 | Deletion handling; the uploaded image is kept **temporarily for the active scan session** for review, crop, and retry, then deleted when the session completes or is abandoned — duration `TBD`. Never kept as permanent history | LR5 (PDPA) |
| B24 | No plaintext passwords — salted password hashing for email/password; OAuth stores a token only; tokens handled securely; **Gemini API key server-side only** | LR6 (PDPA) |
| B25 | CCA §26 traffic data — account identifier, IP, timestamp — retained ≥ 90 days, stored separately from content, where the obligation applies | LR7 (CCA §26) |
| B26 | No over-retention: profiles, the temporary scan-session image, and selected dishes are **not** kept 90 days merely because of §26 | LR8 (CCA §26) |
| B27 | Retrievable, versioned acceptance and consent records — user ID, document version, timestamp, action — including every withdrawal | LR9 (ETA §9/26) |
| B28 | AI-processing records (model/version, OCR result, translation, profile snapshot, timestamp, recommendation) kept as an **internal quality measure**, not claimed as a statutory mandate | LR10 (internal) |
| B29 | No "certified", "nutritionist-approved", "doctor-approved", or "100% accurate" copy anywhere in the UI | LR11 (ETA §28) |
| B30 | Never state a dish is safe; no safety score or percentage; the three categories only | LR12 (product safety) |
| B38 | Uploaded image stays on screen during the scan for review, crop, and retry after a failed extraction | F26, P5, P4 |

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

**NFRs are not backlog items.** NFR1–NFR9 are verified as acceptance criteria
on the features they constrain (see `.docs/02-design/01-feature-list.md` once
written), not built as separate work. The mapping:

| NFR | Constrains |
|---|---|
| NFR1 project metric (`TBD`) | the whole workflow, B5 → B14 |
| NFR2 extraction accuracy | B6 |
| NFR3 translation quality | B7 |
| NFR4 matching fidelity | B9, B10, B30 |
| NFR5 end-to-end latency | B5 → B9 |
| NFR6 usage / cost ceiling (`TBD`) | B5 → B9 |
| LR5 temporary-retention duration (`TBD`) | B23, B38 |
| NFR7 availability | B18 |
| NFR8 ease of use (`TBD`) | the whole workflow |
| NFR9 traffic-log retention | B25 |

## Blocked before the numbers can be committed

| Blocker | Blocks |
|---|---|
| Timed observation with real users — no baseline exists yet | NFR1 baseline and target |
| Gemini cost model and quota | NFR6 |
| First usability test | NFR8 |
| Choice of OAuth provider — the mechanism itself is settled | the provider-specific half of B1 |
| Temporary-retention duration for the scan-session image | B23, B38 |

## Pain coverage

- **P1** → B6, B7, B13
- **P2** → B5, B7, B14
- **P3** → B2, B3, B4, B8, B9
- **P4** → B10, B11, B12, B15, B18, B38
- **P5** → B5, B13, B31, B38

Every pain is addressed by at least one Must row.

# Feature List — YummyNaKha!

- Date: 2026-09-04 (W4, DISCOVER)
- Source spec: [20260904-01-menu-scan-personalization.md](../01-requirements/01-spec/20260904-01-menu-scan-personalization.md)
- Backlog: [backlog.md](../01-requirements/backlog.md)

Requirements say *what a user wants*; this list says *what gets built*. A
feature is Must if it contains any Must `F` item. Acceptance criteria are
written so a tester can pass/fail them.

---

## FE1 — Food Profile · **Must**

Covers **F1, F2** (+ F19 in FE7) · implements **LR1** · relieves **P2, P3**

| # | Acceptance criteria |
|---|---|
| AC1 | A user can save allergies, dietary restrictions, dislikes, preferences, and a preferred language in one profile |
| AC2 | The four categories are stored and processed distinctly — an allergy entry can never be evaluated with dislike weighting (F2) |
| AC3 | A new account has **no** allergy or restriction stored until an explicit, separate opt-in record exists; nothing is pre-ticked (LR1) |
| AC4 | A first-time profile is completed in under 3 minutes; adding one more entry takes under 10 seconds (NFR8) |
| AC5 | Every profile entry is editable and deletable by the user (LR1, F19) |
| AC6 | The saved profile is applied automatically to the next scan with no re-entry (F1, P3) |

## FE2 — Consent & Disclaimer Gate · **Must**

Covers **F14** · implements **LR1, LR2, LR8** · relieves **P2** (trust)

| # | Acceptance criteria |
|---|---|
| AC1 | Terms + the AI & Allergy Safety Disclaimer must be accepted before the first scan (F14) |
| AC2 | Consent to send the menu image and dietary flags to third-party services is a **separate** checkbox from Terms acceptance (LR2) |
| AC3 | The consent screen lists exactly what is sent and what is never sent, as a plain list rather than a legal block (LR2) |
| AC4 | Each acceptance and each withdrawal is stored with user id, timestamp, and version (LR8) |
| AC5 | Withdrawing consent disables scanning and is stored the same way the consent was (LR8) |
| AC6 | The disclaimer states plainly that the system reads a menu photo, cannot inspect a kitchen, and cannot determine allergy safety (LR10) |

## FE3 — Menu Capture & Extraction · **Must**

Covers **F3, F4, F5** (+ F17, F22) · implements **LR2, LR3** · relieves **P1**

| # | Acceptance criteria |
|---|---|
| AC1 | A user can add the menu as one still image — pick from the photo gallery or take a single in-app photo; there is no live/continuous camera scanning, and no restaurant-side setup of any kind is required (F3) |
| AC2 | ≥ 90% of dish entries are extracted with the correct dish name, with ≤ 5% spurious entries, on ≥ 50 real photographed Thai menus (NFR2) |
| AC3 | Where a price is printed, it is attached to the correct dish in ≥ 90% of cases (NFR3) |
| AC4 | The outbound request carries the menu image or extracted text plus dietary flags only — no email, name, phone, or device id (LR2) |
| AC5 | The raw image is deleted within 24 hours of successful extraction unless the user saves it, and can be deleted immediately by the user (LR3, NFR13) |
| AC6 | A user can correct a misread dish name or price in place without rescanning (F17) |

## FE4 — Translation & Dish Understanding · **Must**

Covers **F6, F7** · implements **LR9** · relieves **P1, P2**

| # | Acceptance criteria |
|---|---|
| AC1 | Every extracted dish name is translated into the user's preferred language (F6) |
| AC2 | ≥ 95% of translations are judged understandable and not misleading by a Thai-speaking evaluator over ≥ 200 dish names, and **0%** invert a dietary fact such as rendering a pork dish as chicken (NFR4) |
| AC3 | Each dish carries an ingredient list where every ingredient is tagged **Explicit**, **Inferred**, or **Unknown** (F7) |
| AC4 | An **Inferred** ingredient is never presented as a fact about the dish; the UI distinguishes it from an Explicit one (F7) |
| AC5 | The extracted text, translation, inferences, and evidence levels are stored for reproduction (LR9) |

## FE5 — Dietary Matching & Ranking · **Must**

Covers **F8, F9, F10, F11, F12** · implements **LR9, LR10** · relieves **P2, P3**

| # | Acceptance criteria |
|---|---|
| AC1 | A dish whose name explicitly contains a restricted ingredient is placed in **Conflict** — recall **100%** on ≥ 200 labelled dish/profile pairs; a miss is a release blocker (F8, NFR5) |
| AC2 | False-conflict rate stays low enough to keep the tool usable: precision ≥ 85% on the same set (NFR5) |
| AC3 | **100%** of dishes where the user's allergen is only inferred or unknown are placed in **Check Before Ordering**, never in Recommended (F9, NFR6) |
| AC4 | Dishes are ranked by preference match minus dislike penalty minus uncertainty penalty; hard restrictions and allergen warnings are **not** blended into that score (F10) |
| AC5 | Results are shown in exactly three categories with a single Top Match highlighted (F11) |
| AC6 | Every dish in every category shows a plain reason line ("chicken matches your preference", "contains pork") (F12) |
| AC7 | An automated copy scan finds **0** occurrences of `safe`, `allergy-safe`, `guaranteed`, `certified`, `verified`, `100% free`, or any safety percentage, on every build (NFR6, LR10) |
| AC8 | Categorised results appear in under 15 seconds at p90 for a 40-dish menu, with progress visible within 1 second (NFR7); the results screen renders in under 3 seconds (NFR12) |

## FE6 — Restaurant Communication · **Must**

Covers **F13** (Must) + **F15, F16** (Should) · implements **LR4e, LR9** · relieves **P4**

| # | Acceptance criteria |
|---|---|
| AC1 | For a chosen dish the system generates a Thai question about a declared allergen and a Thai order line with modifications (F13) |
| AC2 | The phrase is produced in under 3 seconds, and ≥ 95% are judged polite and understandable by a Thai-speaking evaluator over ≥ 100 phrases (NFR9) |
| AC3 | The user can show the phrase full-screen and copy it (F15) |
| AC4 | The user can play the phrase as speech (F16) |
| AC5 | A shown or shared phrase reveals only the dish and the one restriction being communicated — never the user's full allergy list (LR4e) |
| AC6 | The generated phrase, its language, its target dish, and the timestamp are stored as a retrievable record (LR9) |

## FE7 — History, Correction & Degraded Mode · **Should**

Covers **F17, F18, F19, F20** · implements **LR3, LR4c, LR6** · relieves **P1, P3**

| # | Acceptance criteria |
|---|---|
| AC1 | Past scans are saved and reopenable without rescanning (F20) |
| AC2 | A user can edit or delete the profile, any saved scan, and any uploaded menu photo (F19, LR4c) |
| AC3 | When OCR, translation, or analysis is unavailable, a plain-language notice and a retry appear within 5 seconds — never a raw error, and never a partial result presented as complete (F18, NFR10) |
| AC4 | Scanning is blocked server-side past 40 scans per user per month on the free tier, with an explanation rather than a failure (NFR11) |
| AC5 | Editing or deleting any of the above is logged and the log is kept ≥ 90 days (LR6) |

## FE8 — Compliance & Audit Layer · **Must** *(cross-cutting)*

Implements **LR3, LR4, LR5, LR6, LR7, LR9, LR10** · no single screen — it sits behind every feature

| # | Acceptance criteria |
|---|---|
| AC1 | Create / upload / edit / delete on any user content writes account id + IP + timestamp to a log store separate from the content (LR5, LR6) |
| AC2 | Logs are retained ≥ 90 days by explicit configuration, not cloud defaults (NFR14) |
| AC3 | A record can be flagged for extended retention up to 1 year without altering its content; the purge job skips it (LR7) |
| AC4 | Account deletion removes the profile, allergy list, saved scans, menu images, and generated phrases — logs excepted (LR4c) |
| AC5 | Login stores a verification token only, never a provider credential (LR4d) |
| AC6 | Given a scan id, the system returns the exact dish list, translations, evidence levels, categories, profile snapshot, and model version used (LR9) |
| AC7 | Admin removal/override of a result is append-only: decision, reasoning, timestamp, admin identity; updates are rejected (LR10) |
| AC8 | Optional restaurant name and geolocation are off by default and independently deletable (LR4b) |

## FE9 — Feedback & Reach · **Could** *(not committed this phase)*

Covers **F21, F22, F23** · relieves **P1, P2**

| # | Acceptance criteria |
|---|---|
| AC1 | A user can report a missed conflict or a false conflict on a specific dish, and the report is logged (F21) |
| AC2 | Angled, glossy, and low-light menu photos reach the NFR2 accuracy bar without staged capture (F22) |
| AC3 | A second source language beyond Thai works end to end (F23) |

---

## Not built this phase

| Excluded | Source |
|---|---|
| Restaurant registration, accounts, POS integration, booking, delivery, payment | F24 (Won't) |
| Nutrition / calorie calculation | F25 (Won't) |
| Maintained restaurant-menu database, social reviews, community-contributed menus | F25 (Won't) |
| Any allergy-safety guarantee, certification claim, or kitchen / cross-contamination verification | LR10, NFR6 |

## Month-2 BUILD commitment

**FE1 → FE2 → FE3 → FE4 → FE5 → FE6**, with FE8 running behind them.
That chain is the one core workflow — *Open → Scan → Decide → Order*.
FE7 follows if the chain lands early. Everything else waits.

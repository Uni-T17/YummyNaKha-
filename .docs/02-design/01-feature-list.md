# Feature List — YummyNaKha!

- Date: 2026-09-07 (W4, DISCOVER)
- Source spec: [20260907-01-menu-scan-personalization.md](../01-requirements/01-spec/20260907-01-menu-scan-personalization.md)
- Backlog: [backlog.md](../01-requirements/backlog.md)

Requirements say *what a user wants*; this list says *what gets built*. A
feature is **Must** if it contains any Must `F` item. Acceptance criteria are
written so a tester can pass or fail them.

Numbers carried from the spec keep their tag: `[engineering target]` means the
team proposed the figure for review, not a user-research result. `TBD` means the
value is not yet known and is **not** filled in by assumption.

---

## FE1 — Account & Food Profile · **Must**

Covers **F1, F2, F3, F4** · implements **LR1, LR6** · relieves **P3**

| # | Acceptance criteria |
|---|---|
| AC1 | A user can create an account and sign in, and the saved profile is present on the next session (F1). **Mechanism `TBD`** — this AC is verifiable once the team fixes it |
| AC2 | A user can save favorite foods and ordinary food preferences (F2) |
| AC3 | Allergies and doctor-advised restrictions are entered in a **separate section behind an explicit opt-in**, never as a silent default (F3, LR1) |
| AC4 | A new account has **no** allergy or medical flag set until an opt-in record exists (LR1) |
| AC5 | Ordinary preferences are **not** placed behind the sensitive-data opt-in — the two data classes are handled separately (LR1) |
| AC6 | A user can view, edit, and delete any profile field, including the allergy and medical section (F4, LR1) |
| AC7 | The credential store holds a verification token only, with no password field (LR6) |

## FE2 — Consent & Disclosure Gate · **Must**

Covers **F15, F16** · implements **LR2, LR9** · relieves **P4**

| # | Acceptance criteria |
|---|---|
| AC1 | Terms, privacy notice, and the AI & Accuracy Disclaimer must be accepted before the first menu is processed (F15) |
| AC2 | Consent to send data to the third-party OCR/AI provider is a **separate** action from accepting the Terms (F15, LR2) |
| AC3 | The consent screen states what is processed and that an external provider receives it (LR2) |
| AC4 | An account with no stored consent record cannot reach a categorized result (LR2) |
| AC5 | Each acceptance stores user ID, document and version, timestamp, and the acceptance action, and can be fetched back by user ID (LR9) |
| AC6 | A user can withdraw a consent, and the withdrawal is stored the same way and is equally retrievable (F16, LR9) |

## FE3 — Menu Capture & Extraction · **Must**

Covers **F5, F6** (Must) + **F19** (Should) · implements **LR3** · relieves **P5, P1**

| # | Acceptance criteria |
|---|---|
| AC1 | A user can upload a photo of a Thai-language menu (F5) |
| AC2 | Upload is the only input path — no live camera scanning (F22, Brief §8) |
| AC3 | Dish-name extraction accuracy is **≥ 90%** on the defined test set of readable Thai menu photographs (NFR2) `[engineering target]` |
| AC4 | Price extraction accuracy is **≥ 95%** where a clearly visible price is present (NFR2) `[engineering target]` |
| AC5 | The outbound request carries menu text and the needed profile flags only — no account email, real name, or other identifier (LR3) |
| AC6 | A user can upload more than one menu image in a single session (F19, Should) |

## FE4 — Menu Translation · **Must**

Covers **F7** · relieves **P1, P2**

| # | Acceptance criteria |
|---|---|
| AC1 | Extracted Thai dish names and menu descriptions are translated into English (F7) |
| AC2 | **≥ 90%** of extracted items are judged acceptably translated on the defined evaluation set (NFR3) `[engineering target]` |
| AC3 | Thai → English is the only supported direction (F24, Brief §8) |

## FE5 — Ingredient Inference & Profile Matching · **Must**

Covers **F8, F9, F10** · implements **LR12** · relieves **P3, P4**

| # | Acceptance criteria |
|---|---|
| AC1 | Likely ingredients are inferred for each extracted dish (F8) |
| AC2 | Every dish is checked against the saved profile and labelled 🟢 recommended, 🟡 check before ordering, or 🔴 conflict (F9) |
| AC3 | A dish whose menu information is incomplete or uncertain is labelled **🟡, never 🟢** (F10, LR12) |
| AC4 | Missed known conflicts are **≤ 5%** on the controlled test set, reported on their own as the safety-critical figure (NFR4) `[engineering target]` |
| AC5 | False conflict warnings are **≤ 10%** on the controlled test set, reported separately from AC4 (NFR4) `[engineering target]` |
| AC6 | The pipeline from upload to categorized result completes in **≤ 10 seconds for 90%** of supported scans under the defined test conditions (NFR5) `[engineering target]` |

## FE6 — Result Presentation & Safety Wording · **Must**

Covers **F11, F12** · implements **LR11, LR12** · relieves **P4**

| # | Acceptance criteria |
|---|---|
| AC1 | Every 🟡 and 🔴 result tells the user to confirm with restaurant staff (F11, LR12) |
| AC2 | No result states that a dish **is safe**; the only clear-result phrasing is that *no conflicting ingredient was detected from the available menu information* (F11, LR12) |
| AC3 | No safety score or percentage is shown to a user anywhere — the three categories only (LR12) |
| AC4 | A result shows what it was based on: the extracted dish text, its translation, and the profile item that caused a 🟡 or 🔴 (F12) |
| AC5 | A UI copy scan finds no "certified", "nutritionist-approved", "doctor-approved", or "100% accurate" claim (LR11) |

## FE7 — Selection & Order in Thai · **Must**

Covers **F13, F14** · relieves **P1, P2, P5**

| # | Acceptance criteria |
|---|---|
| AC1 | A user can select dishes from the categorized menu (F13) |
| AC2 | A separate page lists the selected dishes (F14) |
| AC3 | That page shows the selected dish names **in Thai**, legibly enough to be read by restaurant staff from the screen (F14) |
| AC4 | The page is reachable without re-processing the menu (F14) |
| AC5 | No voice output is used to order (F23, Brief §8) |

## FE8 — Failure & Degradation Handling · **Must**

Covers **F18** · relieves **P4**

| # | Acceptance criteria |
|---|---|
| AC1 | An unreadable or unusable menu photo produces a plain-language message telling the user what to do next, never a raw error (F18) |
| AC2 | A provider outage or rate limit produces a plain-language message, never a raw error (F18, NFR7) |
| AC3 | The app is available **≥ 95%** during scheduled user-testing and demo periods (NFR7) `[engineering target — MVP operational target, not a commercial SLA]` |
| AC4 | A photo that is not a Thai-language menu is reported as such rather than processed into meaningless results (F18, F24) |

## FE9 — Data Rights & Compliance Layer · **Must** *(cross-cutting)*

Covers **F17** · implements **LR4, LR5, LR7, LR8, LR10, LR11** · no single screen — it sits behind every feature

| # | Acceptance criteria |
|---|---|
| AC1 | Account deletion removes the food profile, uploaded menu images, extracted results, and any history (F17, LR5) |
| AC2 | A menu image is processed and then discarded by default; any temporary retention is time-bounded, technically justified, and disclosed (LR5) |
| AC3 | No data flow exists from the profile store to an advertising or profiling sink (LR4) |
| AC4 | Where the CCA §26 obligation applies, traffic data — account identifier, IP, timestamp — is retained **≥ 90 days** by explicit configuration and stored separately from content (LR7, NFR9) |
| AC5 | Deleting a menu image does not delete its traffic-log row before that row's retention period ends (LR7) |
| AC6 | Profiles, menu images, history, and selected dishes are **not** retained 90 days merely because of §26 — they follow the PDPA schedule (LR8) |
| AC7 | Given a scan ID, the stored AI-processing record reproduces what the user was shown: model/version, OCR result, translation, profile snapshot, timestamp, recommendation (LR10, internal quality measure) |

---

## Not built this phase

| Excluded | MoSCoW | Source |
|---|---|---|
| Scan history — reopen a previously scanned menu (F20, B32) | Could | Brief §5, outside core scope |
| Rate a recommendation (F21, B33) | Could | Brief §5 |
| Live camera scanning (F22, B34) | Won't | Brief §8 |
| Voice output (F23, B35) | Won't | Brief §8 |
| Any language pair other than Thai → English (F24, B36) | Won't | Brief §8 |
| Restaurant-side registration or supplied menu data (F25, B37) | Won't | Brief §8 |
| Any certification claim | — | LR11 |
| Any statement that a dish is safe, and any safety score | — | LR12 |

## Coverage check

| Requirement | Feature |
|---|---|
| F1, F2, F3, F4 | FE1 |
| F5, F6, F19 | FE3 |
| F7 | FE4 |
| F8, F9, F10 | FE5 |
| F11, F12 | FE6 |
| F13, F14 | FE7 |
| F15, F16 | FE2 |
| F17 | FE9 |
| F18 | FE8 |
| F20–F25 | not built — see table above |
| LR1, LR6 | FE1 |
| LR2, LR9 | FE2 |
| LR3 | FE3 |
| LR4, LR5, LR7, LR8, LR10 | FE9 |
| LR11 | FE6, FE9 |
| LR12 | FE5, FE6 |

Every Must `F` and every `LR` is covered by a feature.

Pain coverage: **P1** → FE3, FE4, FE7 · **P2** → FE4, FE7 · **P3** → FE1, FE5 ·
**P4** → FE2, FE5, FE6, FE8 · **P5** → FE3, FE7.

## Acceptance criteria that cannot be tested yet

| AC | Blocked by |
|---|---|
| FE1 AC1 (sign-in) | Authentication mechanism `TBD` |
| FE3 AC5, FE5 AC4–AC6 | OCR/AI provider undecided — the test set and conditions depend on it |
| No AC yet for NFR1 | Baseline time and steps not measured; the project metric has no target |
| No AC yet for NFR6 | Usage / cost cap `TBD` until provider and cost model are chosen |
| No AC yet for NFR8 | Usability target `TBD` until the first usability test |

## Month-2 BUILD commitment

**FE1 → FE2 → FE3 → FE4 → FE5 → FE6 → FE7**, with FE8 and FE9 running behind
them. That chain is the one core workflow: profile in → menu photo → extract +
translate → match against profile → three categories → order in Thai.
Everything else waits.

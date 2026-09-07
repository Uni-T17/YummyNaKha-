# User Journey — the one core workflow

- Date: 2026-09-07 (W4, DISCOVER)
- Source spec: [20260907-01-menu-scan-personalization.md](../01-requirements/01-spec/20260907-01-menu-scan-personalization.md)
- Feature list: [01-feature-list.md](01-feature-list.md)
- Workflow: **profile in → menu photo → extract + translate → match against
  profile → three categories → order in Thai**

## The diner in this journey

Not a named persona and not a single respondent. **"D"** is an anonymised
composite assembled only from traits the survey of Sep 6–7 2026 actually
recorded:

| Trait | Evidence |
|---|---|
| Eats Thai food several times a week or more | U1, U2, U5, U6 almost every day; U3 3–5×/week |
| Meets a menu they do not fully understand, sometimes to almost every time | U1 almost every time; U3 often; U2, U4, U5, U6 sometimes |
| Currently asks staff, asks a friend, looks at dish pictures, or uses Google Translate / Google Search | U1, U2, U4, U5, U6 |
| Sometimes orders anyway without resolving the uncertainty | U3 |
| Wants translation, menu prices, photo upload, and help matching dishes to preferences | translation 5/6 · prices 4/6 · photo upload 3/6 · preference or allergy help 3/6 |
| Will not rely on the result unless it seems accurate and trustworthy | U1 "Accuracy." · U2 "Is it really trustworthy and accurate?" · U4 hesitation statement |

**Not assumed about D:** nationality, residency, student status, occupation,
age, or whether D personally has an allergy or a doctor-advised restriction.
The survey captured none of these (spec §1.4).

---

## Step by step

| # | Screen | D does | System does | Traces | Pain relieved |
|---|--------|--------|-------------|--------|---------------|
| J1 | Sign-up & Terms | Creates an account with **OAuth or email/password**; accepts the Terms, privacy notice, and AI & Accuracy Disclaimer | Stores each acceptance with user ID, document version, timestamp, and action, retrievable later. Stores a salted password hash for email/password, or a token only for OAuth — never a plaintext password | F1, F15, LR6, LR9 | — (trust foundation) |
| J2 | Food profile | Saves favorite foods and ordinary preferences | Stores them as **normal** personal data — not behind the sensitive opt-in | F2, LR1 | **P3** |
| J3 | Allergy & restriction opt-in | Chooses whether to add allergies or doctor-advised restrictions, in a separate section | Nothing is set until D opts in explicitly; the section is editable and deletable afterwards | F3, F4, LR1 | **P3** |
| J4 | Menu upload | Photographs or uploads a Thai-language menu | Accepts the image; upload only, no live camera | F5 | **P5, P2** |
| J5 | Transfer consent *(first scan only)* | Reads what is sent and consents — separately from the Terms already accepted at J1 | Discloses that an external provider — the **Google Gemini API** — receives the data; sends menu text and the needed profile flags only, never account email or real name; the call is made from the backend, never the browser; stores the consent record | F15, LR2, LR3, LR6, LR9 | **P4** |
| J6 | Processing | Waits, with the uploaded photo still on screen | Keeps the image for the length of the scan session so it can be reviewed, cropped, or retried. Extracts each dish name and price → translates Thai → English → infers likely ingredients → checks every dish against the profile. Shows progress; completes within the latency target | F6, F7, F8, F9, F26, LR5, NFR2, NFR3, NFR5 | **P1** |
| J7 | Categorized result | Reads the menu in English, split three ways | Labels every dish 🟢 recommended / 🟡 check before ordering / 🔴 conflict. Anything uncertain or incomplete is 🟡, never 🟢. Every 🟡 and 🔴 carries the instruction to confirm with restaurant staff. Each result shows the extracted text, its translation, and the profile item behind a 🟡 or 🔴 | F9, F10, F11, F12, NFR4, LR12 | **P1, P3, P4** |
| J8 | Dish selection | Picks the dishes to order | Collects the selection | F13 | **P1, P5** |
| J9 | Order-in-Thai page | Opens the selected-menu page and shows the screen to restaurant staff | Lists the chosen dishes back **in Thai**, legibly, without re-processing the menu | F14 | **P2** |
| J10 | Ongoing control | Later: edits the profile, withdraws a consent, or deletes the account | Applies the edit; stores a withdrawal the same retrievable way as the consent; on deletion removes profile, any temporary image, and results — traffic logs excepted where CCA §26 applies. No scan history exists to delete, because none is kept | F4, F16, F17, F20, LR5, LR7, LR9 | — (data rights) |

The pain **P2** — depending on staff, a friend, or a translation app — is
relieved at two ends: D reads the menu without help at J7, and orders without a
shared language at J9.

## Alternate & failure paths

| # | Trigger | System behaviour | Traces |
|---|---|---|---|
| A1 | The photo is unreadable — blur, glare, angle, handwriting | Plain-language message saying what to do next, never a raw error. **The image stays on screen** so the diner can crop it or retry without photographing the menu again | F18, F26, LR5, FE8 AC1, AC5 |
| A2 | The image is not a Thai-language menu | Reported as such rather than processed into meaningless output | F18, F24, FE8 AC4 |
| A3 | The OCR/AI provider is down or rate-limited | Plain-language notice, never a raw error | F18, NFR7 |
| A4 | **No dish qualifies for 🟢** | Show the 🟡 and 🔴 lists as they are. The system must not promote a dish to 🟢 to fill an empty category | F10, LR12 |
| A5 | D declines the transfer consent at J5 | No menu or profile data is sent; no result is produced; the reason is explained | F15, LR2 |
| A6 | D withdraws consent after using the app | Processing stops; the withdrawal is stored the same retrievable way as the consent | F16, LR9 |
| A7 | D never opts in to the allergy section | Matching runs on ordinary preferences only. No allergy or restriction claim is made in either direction | F3, LR1, LR12 |
| A8 | The menu runs across several pages | D uploads more than one image in the session *(Should — F19)* | F19 |
| A9 | A dish is extracted but no price is visible on the menu | The price is left empty, never guessed | F6, NFR2 |
| A10 | D deletes the account | Profile, any temporary image, and results are removed; traffic logs are retained where CCA §26 applies, separately from content | F17, LR5, LR7, LR8 |
| A11 | D abandons the scan or closes the app mid-session | The temporary image is deleted when the session ends — duration `TBD` — and nothing is kept as history | F26, F20, LR5 |

## Drop-off risks

| Risk | Where | Mitigation | Traces |
|---|---|---|---|
| **Trust is the deciding factor** — 3 of 6 respondents named accuracy or trustworthiness as their main concern, so an unexplained result is not merely unhelpful, it stops adoption | J7 | Every result shows the extracted text, its translation, and the profile item behind a 🟡 or 🔴, so D can judge it | F12, P4 |
| The consent step reads as a wall and D abandons the first scan | J5 | State plainly what **is** and **is not** sent, as a short list rather than a legal blob | LR2, LR3 |
| **Too many 🟡.** Uncertain information must resolve to 🟡 (F10), and a menu photo rarely shows sauces, oil, or garnish — so a large 🟡 bucket is the expected case, not the exception. If almost everything is 🟡, the three-category split stops helping D decide | J7 | The 🟢 / 🟡 / 🔴 distribution on real photographed menus must be measured before the gate. **No target set — this is an open design risk, not a solved one** | F10, NFR4, LR12 |
| D was told "difficult to use" is a reason to hesitate | J1–J4 | Usability target is `TBD` until the first usability test — recorded, not guessed | NFR8, P4 (U4) |
| A silent wait at J6 reads as a hang and D closes the app | J6 | Progress shown during processing; ≤ 10 s for 90% of scans `[engineering target]` | NFR5 |
| D orders anyway without resolving the uncertainty — the behaviour U3 already reports | J7 | The confirm-with-staff instruction on every 🟡 and 🔴 is the only safeguard the app can offer; it cannot verify preparation or cross-contact | F11, LR12, P1 |

## Pain coverage check

- **P1** (understanding unfamiliar menu information) → J6, J7, J8
- **P2** (dependence on staff, friends, translation tools) → J4, J7, J9
- **P3** (matching dishes to preferences and restrictions) → J2, J3, J7
- **P4** (accuracy and trust decide willingness to rely on it) → J5, J7
- **P5** (wanting a direct photo-based route) → J4, J6, J8

Every pain is relieved at a named step. **P4 is relieved by how the result is
presented, not by a separate feature** — which is why J7 carries four
requirements at once.

## Not in this journey

Rating a recommendation (F21) is Could and outside the core workflow.
**Scan history (F20) is Won't this phase** — the uploaded image lives only for
the scan session and is never kept as history (LR5). Live camera scanning (F22),
voice output (F23), other language pairs (F24), and restaurant-side data (F25)
are Won't.

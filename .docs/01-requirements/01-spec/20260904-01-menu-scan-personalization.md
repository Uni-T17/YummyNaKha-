# Requirement Spec — Menu Scan & Personalization (YummyNaKha!)

- Date: 2026-09-04
- No: 01
- Topic: menu-scan-personalization
- Phase: DISCOVER (no production code)
- Charter: [YummyNaKha! - Charter.md](../../../YummyNaKha!%20-%20Charter.md)
- Brief: [YummyNaKha_Project_Brief.md](../../../YummyNaKha_Project_Brief.md)
- Legal source: [rule.md](../../../rule.md) (W2 legal & compliance rules)

> **Validation status:** the project is at problem-validation stage. Every pain
> below is marked **`(H)`** — a hypothesis taken from the Charter and the Brief,
> **not** from a user interview. No quote in this document is attributed to a
> real person. Before the W5 gate these must be confirmed (or refuted) by ≥15
> interviews and the `(H)` markers removed with an evidence row attached.

> **Terminology — "scan":** in this document and the backlog, a *scan* means
> **one still image of a menu — chosen from the device photo gallery or taken as
> a single photo with the in-app camera — run once through the pipeline**. There
> is no live or continuous camera scanning: the camera captures one photo,
> handled exactly like an uploaded one. "Scan", "scan history", "rescan", and
> "scan latency" are shorthand for this and nothing more.

## 1. Problem & users

### Users
- **Primary:** International students in Thailand who eat out regularly and
  cannot read a Thai-only menu.
- **Secondary:** Travellers and tourists making a one-off ordering decision in an
  unfamiliar restaurant.
- **Also affected:** Anyone with a food allergy, a religious or ethical dietary
  restriction, or a strong dislike, ordering in any language they don't read.
- **Not a user:** the restaurant. The system deliberately requires nothing from
  the restaurant side — no registration, no data entry, no QR code, no API.

### Interview pains

- **P1 (H) — Unreadable menu:** The menu is written in a script the user cannot
  read, so they cannot tell what dishes are on offer or what they cost.
  Translating the words alone still does not say what is in the dish.
- **P2 (H) — Hidden ingredient risk:** Menus do not list sauces, oils,
  garnishes, or common accompaniments, so a user avoiding pork or allergic to
  peanuts cannot tell from the menu whether a dish is a problem — and finding
  out the wrong way is costly.
- **P3 (H) — Slow one-by-one decision effort:** Translating dishes one at a
  time, searching unfamiliar dish names, holding one's own restrictions in mind,
  and comparing a dozen options takes a long time, and is repeated at every new
  restaurant.
- **P4 (H) — Communication barrier at the table:** Even after choosing, the user
  cannot ask staff whether a dish contains an ingredient, or request a
  modification ("no peanuts, less spicy"), in the restaurant's language.

## 2. Functional requirements

| ID | User story | MoSCoW | Traces |
|----|-----------|--------|--------|
| F1 | As a diner, I want to save a food profile once — allergies, dietary restrictions, dislikes, preferences, and preferred language — so that I do not re-enter it at every restaurant. | Must | solves P3 |
| F2 | As a diner, I want the four profile categories kept distinct (allergy / restriction / dislike / preference), so that a serious allergy is never treated like a mild dislike. | Must | solves P2 |
| F3 | As a diner, I want to provide the printed menu as a single still image — either picked from my photo gallery or captured as one photo with the in-app camera (no live camera scanning) — so that I can use the menu that is already on the table without the restaurant doing anything. | Must | solves P1 |
| F4 | As a diner, I want the system to extract the dish names from my menu photo, so that I get a structured list instead of a wall of unreadable text. | Must | solves P1 |
| F5 | As a diner, I want the price of each dish extracted alongside its name, so that I can choose within my budget. | Must | solves P1 |
| F6 | As a diner, I want each dish name translated into my preferred language, so that I can read what the dish is. | Must | solves P1 |
| F7 | As a diner, I want each dish mapped to its likely ingredients, labelled **Explicit** (stated in the menu text), **Inferred** (commonly true of this dish), or **Unknown**, so that I can tell what the system actually knows from what it is guessing. | Must | solves P2 |
| F8 | As a diner with restrictions, I want a dish flagged as a **Conflict** when a restricted ingredient is explicitly detected, with the reason shown, so that I can rule it out immediately. | Must | solves P2 |
| F9 | As a diner with an allergy, I want a dish flagged **Check Before Ordering** when my allergen is only *inferred* or unknown for that dish — never marked clear — so that I know to confirm with staff. | Must | solves P2 |
| F10 | As a diner, I want dishes ranked by how well they match my preferences and against my dislikes, so that the best options for me appear first instead of me comparing everything. | Must | solves P3 |
| F11 | As a diner, I want the menu returned in three categories — Recommended (with a Top Match), Check Before Ordering, and Conflict — so that a long menu becomes a short decision. | Must | solves P1, P3 |
| F12 | As a diner, I want a plain reason under every dish ("chicken matches your preference", "contains pork"), so that I can judge the recommendation instead of trusting it blindly. | Must | solves P2, P3 |
| F13 | As a diner, I want restaurant-ready text generated in the restaurant's language — a question about an ingredient, or my order with modifications — so that I can show or read it to staff. | Must | solves P4 |
| F14 | As a user, I want to accept the Terms and the AI & Allergy Safety Disclaimer and give explicit consent for my allergy data and for sending my menu photo to the analysis services, before my first scan, so that I know what is shared and why. | Must | solves P2 (trust), LR1, LR2, LR8 |
| F15 | As a diner, I want to show the generated Thai text full-screen and copy it, so that a staff member can read it across a noisy table. | Should | solves P4 |
| F16 | As a diner, I want the generated text spoken aloud (text-to-speech), so that I can order even when showing a screen is awkward. | Should | solves P4 |
| F17 | As a diner, I want to correct a misread dish name or price without rescanning the whole menu, so that one OCR error does not waste the scan. | Should | solves P1 |
| F18 | As a diner, I want to be told clearly when extraction, translation, or analysis is unavailable, and be able to retry, so that I never face a raw error while standing in a restaurant. | Should | solves P1, P3 |
| F19 | As a diner, I want to edit or delete my profile, my saved scans, and my uploaded menu photos, so that I stay in control of my data. | Should | solves P2, LR3 |
| F20 | As a diner, I want my past scans saved so I can reopen a previous restaurant's results without rescanning. | Should | solves P3 |
| F21 | As a diner, I want to report a wrong classification (a missed conflict or a false conflict), so that the rule engine improves. | Could | solves P2 |
| F22 | As a diner, I want to scan a menu photographed at an angle or in low light and still get usable results, so that I do not have to stage the shot. | Could | solves P1 |
| F23 | As a diner, I want languages beyond Thai→English, so that the app works outside Thailand. | Could | solves P1 |
| F24 | As a user, I do not need restaurant registration, restaurant accounts, POS integration, table booking, food delivery, or payment in this phase. | Won't | out of scope |
| F25 | As a user, I do not need exact nutrition or calorie calculation, a large restaurant/menu database, social reviews, or a community-contributed menu database in this phase. | Won't | out of scope |

## 3. Non-functional requirements

- **NFR1 (the project metric):** In a before/after test with real users on the
  same Thai-only menu, median **time to choose a suitable dish drops by ≥ 50%**
  versus the user's current method (Google Translate / a generic AI assistant /
  asking someone), and the median **number of user interactions drops from
  baseline to ≤ 5** (open, scan, read, pick, order). Measured on **≥ 15 users ×
  ≥ 2 real menus** each. Secondary: self-reported confidence in the ordering
  decision rises by **≥ 2 points on a 5-point scale**.
- **NFR2 (dish extraction accuracy):** On a held-out test set of **≥ 50 real
  photographed Thai menus**, **≥ 90%** of dish entries are extracted with the
  correct dish name, and **≤ 5%** of extracted entries are spurious (text that is
  not a dish).
- **NFR3 (price extraction accuracy):** Where a price is printed next to a dish,
  the correct price is attached to the correct dish in **≥ 90%** of cases on the
  same test set.
- **NFR4 (translation quality):** On a set of **≥ 200 dish names** reviewed by a
  Thai-speaking evaluator, **≥ 95%** of translations are judged "understandable
  and not misleading about the dish", and **0%** invert a dietary fact (e.g.
  rendering a pork dish as chicken).
- **NFR5 (explicit-conflict detection — the blocking one):** For dishes whose
  name explicitly contains a restricted ingredient, conflict-detection
  **recall = 100%** on a labelled set of **≥ 200 dish/profile pairs**. A missed
  explicit conflict is a release blocker. False-conflict rate (precision) must
  be **≥ 85%** so the tool does not rule out most of the menu.
- **NFR6 (allergen uncertainty behaviour):** For **100%** of dishes where the
  user's allergen is only *inferred* or *unknown*, the dish is placed in **Check
  Before Ordering** and never in Recommended. **0** occurrences of safety wording
  (`safe`, `allergy-safe`, `guaranteed`, `certified`, `100% free`) or any safety
  percentage anywhere in the product, verified by an automated copy scan on every
  build.
- **NFR7 (end-to-end scan latency):** From photo submitted to categorised
  results shown, **under 15 seconds at the 90th percentile** for a menu of up to
  40 dishes; visible progress appears within **1 second** of submission.
- **NFR8 (profile setup time):** A first-time user completes a usable food
  profile in **under 3 minutes**, and adding one more item to any profile
  category takes **under 10 seconds**.
- **NFR9 (restaurant-phrase generation):** The Thai phrase for a chosen dish is
  produced in **under 3 seconds**, and **≥ 95%** of generated phrases are judged
  "polite and understandable to a Thai restaurant worker" by a Thai-speaking
  evaluator on a set of **≥ 100 phrases**.
- **NFR10 (availability & degradation):** The app is available **≥ 99.0%** per
  calendar month; when OCR, translation, or analysis fails or is rate-limited,
  the app shows a plain-language notice and a retry within **5 seconds** and
  never shows a raw error or a partial result presented as complete.
- **NFR11 (cost ceiling):** Menu analysis stays within a budget of **≤ 40 scans
  per user per month** on the free tier, enforced server-side.
- **NFR12 (results render):** The categorised results screen for a 40-dish menu
  renders in **under 3 seconds** on a mid-range phone over a typical mobile
  connection.
- **NFR13 (raw image retention):** A raw menu photo is deleted within **24 hours**
  of successful extraction unless the user explicitly saves it, and is deletable
  by the user immediately (PDPA / bystander data).
- **NFR14 (log retention):** Access/action logs are retained for **≥ 90 days**,
  configured explicitly and not left at cloud defaults.

## 4. Legal requirements (from rule.md)

### PDPA
- **LR1 (PDPA — sensitive allergy/dietary data, explicit consent):** Allergies
  and dietary restrictions that can reveal health or religion (peanut/shellfish
  allergy, coeliac, diabetic, halal, no pork, no beef) must be collected under an
  explicit, separate opt-in, never as a silent default or a pre-ticked box, and
  must be editable and deletable by the user. *Testable: a new account has no
  allergy or restriction stored until an opt-in record exists.*
- **LR2 (PDPA — third-party OCR/AI transfer, disclosure + minimisation):**
  Before the first scan the system must disclose that the menu image and dietary
  flags are sent to third-party OCR/translation/AI services and obtain consent;
  each request must carry **only** the menu image or extracted menu text and the
  dietary flags — never account email, real name, phone number, or device
  identifiers. *Testable: capture the outbound request payload → contains no
  identifier fields.*
- **LR3 (PDPA — menu photos contain more than the menu):** Raw menu images may
  incidentally capture faces, receipts, or name cards. The system must not use
  incidental personal data for any purpose, must delete the raw image within the
  stated window once extraction succeeds (NFR13), and must let the user delete
  the raw image while keeping the extracted dish list. *Testable: after
  extraction + 24h, the image blob is gone while the dish list remains.*
- **LR4 (PDPA — purpose limit, deletion, credentials, sharing):** (a) Profile
  and scan data are used only for analysing that user's menus, showing their own
  history, and improving extraction quality — no advertising, resale, restaurant
  profiling, or building a public menu database without separate opt-in.
  (b) Optional restaurant name or geolocation on a scan is off by default and
  independently deletable. (c) On account deletion, the food profile, allergy
  list, saved scans, menu images, and generated phrases are deleted, including
  from backups within the stated window (CCA §26 logs excepted). (d) Social/email
  login stores only a verification token, never the provider password. (e) A
  shared result or generated order must not reveal the user's full allergy list
  beyond the single dish and restriction being communicated. *Testable: delete
  account → no user rows remain except retained logs; token store holds no
  credential; a shared phrase contains one restriction, not the profile.*

### Computer Crime Act §26
- **LR5 (CCA §26 — creation/upload log):** Every user-created or uploaded item
  (menu photo, corrected dish name or price, saved scan, custom phrase, feedback
  report) is logged with account ID, IP address, and timestamp, stored separately
  from the content itself. *Testable: each uploaded menu photo has a matching log
  row with all three fields.*
- **LR6 (CCA §26 — edit/delete log, 90-day retention):** Every edit or delete of
  a food profile, saved scan, corrected dish, or generated phrase is logged with
  actor identity, IP, and timestamp; the log is retained **≥ 90 days even after
  the content is deleted**. *Testable: delete a scan → its log is still
  retrievable internally at day 89.*
- **LR7 (CCA §26 — authority hold / takedown retention):** The system can flag a
  record for extended retention (up to 1 year) without altering its content, and
  content removed from view after a complaint or a safety report is still
  retained internally with its log. *Testable: set hold flag → content unchanged,
  purge job skips it.*

### Electronic Transactions Act §9 / 26 / 28
- **LR8 (ETA §9/26 — acceptance & consent records):** Clicking "I agree" on the
  Terms / **AI & Allergy Safety Disclaimer**, and each explicit consent (LR1
  allergy data, LR2 third-party transfer), is stored as a retrievable record with
  user ID, timestamp, and version; **withdrawal of consent is stored the same
  way**. *Testable: fetch by user ID returns version + timestamp for each
  acceptance and for any withdrawal.*
- **LR9 (ETA §9/26 — reproducible analysis record):** For every menu analysis
  shown to a user the system stores the extracted menu text, the translation
  shown, the ingredient inferences **with their evidence level**, the category
  assigned to each dish, the food-profile snapshot used, the model/version, and
  the timestamp — plus the generated restaurant phrase with its language and
  target dish — so the exact result the user relied on can be reproduced in a
  later dispute (e.g. a reported allergic reaction). Action confirmations
  ("profile saved", "scan complete") are stored as retrievable records, not
  transient UI notices. *Testable: given a scan ID, return the exact dish list,
  categories, evidence levels, profile snapshot, and model version used.*
- **LR10 (ETA §26/28 — unalterable overrides; no certification or safety
  language):** Admin removal or override of a result (e.g. a dish wrongly placed
  in Recommended that contains a declared allergen) is stored with decision,
  reasoning, timestamp, and approving admin in append-only form, with no silent
  edits afterward. Separately, the product must never use "certified",
  "nutritionist-approved", or CA-backed language unless a licensed Certification
  Authority or real certified professional is involved — and because the system
  reads a photographed menu and cannot inspect a kitchen, **no allergy-safety
  assertion is permitted at all**. *Testable: attempt to update a decision row →
  rejected, history preserved; automated copy scan finds no safety or
  certification claims (see NFR6).*

## 5. Scope

### In scope
- Food profile with four distinct categories and preferred language (F1, F2, LR1).
- Menu input as one still image — gallery pick or a single in-app photo, no live scanning (F3).
- Dish name and price extraction from the photo (F4, F5).
- Translation into the preferred language (F6).
- Ingredient understanding with Explicit / Inferred / Unknown evidence levels (F7).
- Dietary rule engine: explicit conflicts, allergen uncertainty (F8, F9).
- Preference/dislike ranking and the three result categories with reasons
  (F10, F11, F12).
- Restaurant-ready Thai communication for questions and modified orders (F13).
- Consent & terms gate before the first scan (F14, LR1, LR2, LR8).
- Logging, ≥90-day retention, reproducible analysis records, admin override
  store, raw-image deletion (LR3–LR10).
- Should-haves: full-screen/copy, text-to-speech, manual correction, degraded-mode
  notice, edit/delete, scan history (F15–F20).

### Out of scope
- Restaurant registration, restaurant accounts, POS integration, table booking,
  delivery, payment (F24).
- Exact nutrition/calorie calculation, a maintained restaurant/menu database,
  social reviews, community-contributed menus (F25).
- Could-haves not committed this phase: wrong-classification feedback (F21),
  hardened low-light/angled capture (F22), languages beyond Thai→English (F23).
- **Any claim of allergy safety, guarantee, or certification** — explicitly
  excluded by LR10 and NFR6. The system does not verify kitchens and never says
  it does.
- Cross-contamination detection and kitchen verification — physically outside
  what a menu photo can support.

### The ONE core workflow this phase builds end-to-end
A diner saves a food profile once → photographs a Thai restaurant menu → the
system extracts dish names and prices, translates them, infers likely
ingredients with an evidence level, and checks each dish against the profile →
the menu comes back as Recommended (with a Top Match) / Check Before Ordering /
Conflict, each with a plain reason → the diner picks a dish and gets
restaurant-ready Thai text to ask about an ingredient or order it with
modifications.

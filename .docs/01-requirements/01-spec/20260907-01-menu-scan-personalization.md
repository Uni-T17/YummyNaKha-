# Requirement Spec — Menu Scan & Personalization (YummyNaKha!)

- Date: 2026-09-07
- No: 01
- Topic: menu-scan-personalization
- Phase: DISCOVER (W1–W5) — no production code
- Revised: 2026-10-27 — scan pipeline rebuilt (see *Team decisions 2026-10-27*)
- Charter: [YummyNaKha! - Charter.md](../../../YummyNaKha!%20-%20Charter.md)
- Brief: [YummyNaKha_Project_Brief.md](../../../YummyNaKha_Project_Brief.md)
- Legal source: [rule.md](../../../rule.md) (5-Idiots legal & compliance rules)

> **How to read this spec.** Three kinds of statement are kept apart on purpose:
> **(a) validated user evidence** — the survey of Sep 6–7 2026, §1;
> **(b) team-defined engineering targets** — proposed numbers in §3, marked
> `[engineering target]`, not derived from user research;
> **(c) `TBD`** — not yet known. Nothing is filled in by assumption.
> Team decisions are dated and name their source. A team decision is **not**
> user evidence and never creates a new pain (`P<n>`).

## Team decisions confirmed 2026-09-07

| Decision | Settled | Still open |
|---|---|---|
| Authentication | **OAuth + email/password**. Passwords stored only as a salted hash, never plaintext; OAuth/session tokens handled securely (F1, LR6) | The **OAuth provider name** |
| External AI provider | ~~**Google Gemini API**, called from the **backend only** — the API key is never exposed to the frontend (LR3, LR6)~~ **Superseded 2026-10-27** — see below | ~~Cost model and usage cap (NFR6)~~ |
| Menu image handling | Kept **temporarily for the active scan session** so the user can review, crop, or retry after a failure; deleted when the session completes or is abandoned (F26, LR5) | The retention **duration** |
| Scan history | **Won't this phase.** Menu images are never kept as permanent history (F20, LR5) | — |
| Project metric | — | NFR1 baseline and target stay `TBD` until real timed observations exist |

## Team decisions 2026-10-27

**Source: course teacher feedback** at the W11 Beta Review preparation, plus
the team's own measurement that a scan took 1–2 minutes against NFR5. This is
a team/course decision, **not** a user-interview or survey finding — no new
pain is added.

| Decision | Settled | Still open |
|---|---|---|
| Scan pipeline | The Google Gemini API and Hugging Face pipeline is **removed**. Menu photos are read by the team's **own PaddleOCR service** (Thai model) running next to the app on our server; dish names, English names and ingredients come from a **team-curated Thai dish guide** (F27). No menu or profile data is sent to any third-party AI provider (LR2, LR3) | Where the OCR service is hosted for user testing |
| Scope | Narrowed to **menus of Thai-cuisine restaurants**. Each dish shows a **detailed ingredient view** — main ingredients and often-added ones, with Thai names (F28) | — |
| Dishes not in the guide | Shown with the Thai name and price but **no English name and no ingredients**, and always labelled **🟡 check before ordering** (F10, F27) | Guide coverage on real menus (NFR10) |
| Transfer consent | The separate "send data to AI providers" consent is **retired** because nothing is sent. Records already given are **kept** so a user's history stays complete (LR9) | — |
| Guide review | The guide is **DRAFT** and must be reviewed by a Thai-literate team member **before user testing** (F27) | Reviewer name and review date |

---

## 1. Problem & users

### 1.1 Users

**As defined by the Charter and Brief** (product-scoping decision, *not* a
survey finding):

- **Primary:** people who cannot easily read Thai restaurant menus — the
  Charter names international students and foreigners in Thailand.
- **Secondary:** people with food allergies or doctor-advised food
  restrictions who need to check a menu before ordering.

**As observed in the survey:** six respondents (U1–U6) who eat at Thai
restaurants and encounter menus they do not fully understand. The survey did
**not** record nationality, residency, student status, or whether any
respondent personally has an allergy or medical restriction — see §1.4. The
Charter's audience definition therefore remains a team assumption awaiting
validation, not a result.

### 1.2 Evidence base

- **Source:** YummyNaKha! user survey, collected **2026-09-06 – 2026-09-07**.
- **n = 6**, anonymised **U1–U6**. No respondent email or identifying
  information is recorded here.
- Free-text answers are quoted verbatim. Checkbox and rating answers are
  paraphrased and identified as survey responses, never as quotations.

| Ref | Eats Thai food | Menu problem occurs | Current method(s) *(survey response)* | Requested feature(s) *(survey response)* | Free-text concern *(verbatim)* |
|---|---|---|---|---|---|
| U1 | almost every day | almost every time | asks restaurant staff | translate menu items into preferred language; show menu prices | "Accuracy." |
| U2 | almost every day | sometimes | asks restaurant staff; asks a friend; looks at pictures of the dish | take/upload a menu photo; translation; recommendations based on favorite foods; menu prices | "Is it really trustworthy and accurate?" |
| U3 | 3–5 times per week | often | sometimes orders anyway | menu translation; highlighting detected allergen concerns; menu prices | — |
| U4 | 1–2 times per week | sometimes | looks at pictures of dishes | menu translation | "I would hesitate if the information is inaccurate, there are not enough reviews, or the app is difficult to use." |
| U5 | almost every day | sometimes | Google Translate; Google Search; asks a friend; looks at pictures; chooses another dish already known | menu-photo upload; translation; possible allergy warnings; saved favorite foods; menu prices | — |
| U6 | almost every day | sometimes | asks restaurant staff | take/upload a menu photo | — |

Feature demand across the six responses: **translation 5/6** (U1–U5) ·
**menu prices 4/6** (U1, U2, U3, U5) · **menu-photo upload 3/6** (U2, U5, U6) ·
**preference- or allergy-related help 3/6** (U2, U3, U5).

### 1.3 Pains

Each pain below is derived only from the table in §1.2.

- **P1 — Difficulty understanding unfamiliar Thai menu information without
  assistance.** All six respondents report encountering the menu problem — U1
  almost every time, U3 often, U2/U4/U5/U6 sometimes. Five of six requested
  menu translation and four of six requested menu prices, so *price* is part of
  the information gap, not a separate nicety. U3 reports sometimes ordering
  anyway, i.e. a decision made without resolving the gap.
  *Evidence: U1, U2, U3, U4, U5, U6.*

- **P2 — Users depend on external people and tools to make an ordering
  decision.** Reported methods are asking restaurant staff (U1, U2, U6), asking
  a friend (U2, U5), looking at pictures of the dish (U2, U4, U5), Google
  Translate and Google Search (U5), and falling back on a dish already known
  (U5). *Evidence: U1, U2, U4, U5, U6.*

- **P3 — Users want help deciding whether an unfamiliar dish matches their food
  preferences or restrictions.** Expressed as requested features: recommendations
  based on favorite foods (U2), saved favorite foods and possible allergy
  warnings (U5), highlighting detected allergen concerns (U3). *Evidence: U2,
  U3, U5. Note: the survey did not record whether these respondents personally
  have an allergy or a doctor-advised restriction — the request is for the
  capability, not a self-reported medical status.*

- **P4 — Accuracy and trust decide whether a user will rely on AI-generated
  menu information.** U1's stated main concern is "Accuracy." U2's is "Is it
  really trustworthy and accurate?" U4 stated: "I would hesitate if the
  information is inaccurate, there are not enough reviews, or the app is
  difficult to use." *Evidence: U1, U2, U4. U4's statement also raises ease of
  use and social proof alongside accuracy.*

- **P5 — Users want a direct, photo-based way to process an unfamiliar menu.**
  Three of six respondents requested taking or uploading a menu photo (U2, U5,
  U6); U6 requested nothing else. *Evidence: U2, U5, U6.*

### 1.4 What the survey did not capture

Recorded so no later document treats these as known:

| Not captured | Consequence |
|---|---|
| Dish-selection completion time | NFR1 baseline is `TBD` — §3 |
| Number of interaction steps / lookups | NFR1 secondary baseline is `TBD` — §3 |
| Respondent nationality, residency, or student status | The Charter's "international students and foreigners" audience is unvalidated — §1.1 |
| Whether any respondent has an allergy or doctor-advised restriction | The secondary user group is unvalidated — §1.1 |
| Device, connection, or in-restaurant usage context | No environment-based NFR can be set yet |
| Any free text beyond the three statements quoted in §1.2 | No other wording may be quoted |

U5's report of using five separate methods is qualitative evidence of
interaction effort. It **must not** be converted into a numeric baseline.

---

## 2. Functional requirements

MoSCoW. Every **Must** stays inside the one core workflow of §5.

| ID | User story | MoSCoW | Traces |
|----|-----------|--------|--------|
| F1 | As a diner, I want to create an account and sign in, so that my food profile is saved and available the next time I use the app. | Must | enables P3; LR1, LR6, LR9. Authentication is **OAuth + email/password**; only the **OAuth provider name is `TBD`** |
| F2 | As a diner, I want to save my favorite foods and ordinary food preferences, so that the app can recommend dishes that suit my taste. | Must | solves P3 (U2, U5) |
| F3 | As a diner, I want to record my allergies and doctor-advised food restrictions under a separate, explicit opt-in, so that dishes that may conflict with them are flagged. | Must | solves P3 (U3, U5); LR1 |
| F4 | As a diner, I want to view, edit, and delete any part of my food profile, including the allergy and medical-restriction section, so that I stay in control of my own data. | Must | LR1, LR5 |
| F5 | As a diner, I want to upload a photo of a Thai-language menu, so that I do not have to look dishes up one by one. | Must | solves P5, P2 (U2, U5, U6) |
| F6 | As a diner, I want each dish name and its price extracted from the uploaded menu photo, so that I can see what is offered and what it costs. | Must | solves P1 (U1, U2, U3, U5 requested prices) |
| F7 | As a diner, I want each extracted dish shown with an English name, so that I can read the menu myself. | Must | solves P1, P2 (U1–U5). *Revised 2026-10-27:* the English name comes from the Thai dish guide (F27) plus any protein/style named on the menu. A dish **not in the guide gets no translation** — it is shown in Thai with its price and labelled 🟡 (F10) |
| F8 | As a diner, I want the likely ingredients of each dish identified, so that dishes can be checked against my profile. | Must | solves P3. *Revised 2026-10-27:* ingredients come from **reviewed Thai dish guide data** (F27), not from AI inference per scan, so the same dish always gets the same ingredients |
| F9 | As a diner, I want every dish checked against my saved profile and labelled 🟢 recommended / 🟡 check before ordering / 🔴 conflict, so that I can see at a glance which dishes suit me. | Must | solves P3 (U2, U3, U5) |
| F10 | As a diner, I want a dish whose menu information is incomplete or uncertain to be labelled 🟡 rather than 🟢, so that a gap in the information is never shown to me as a recommendation. | Must | solves P4; LR12; NFR4. *2026-10-27:* "uncertain" includes a dish **not in the Thai dish guide**, a name matched only approximately (possible OCR misread), and a dish whose meat or seafood is not stated |
| F11 | As a diner, I want every 🟡 and 🔴 result to tell me to confirm with restaurant staff — and never to tell me a dish is safe — so that I understand the limit of what the app can know from a photo. | Must | solves P4; LR12 |
| F12 | As a diner, I want to see what a result was based on — the extracted dish text, its translation, and the profile item that caused a 🟡 or 🔴 — so that I can judge for myself whether to trust it. | Must | solves P4 (U1, U2, U4). *2026-10-27:* also the reason a dish is 🟡 (not in the guide, possible misread, protein not stated) |
| F13 | As a diner, I want to select dishes from the categorized menu, so that I can collect what I intend to order. | Must | solves P1, P5 |
| F14 | As a diner, I want a separate page showing my selected dishes back in Thai, so that I can order by showing the screen to restaurant staff. | Must | solves P2 (U1, U2, U6 depend on staff or a friend) |
| F15 | As a diner, I want to accept the Terms, privacy notice, and AI & Accuracy Disclaimer before my first menu is processed, and to be told plainly where my menu photo and profile are processed, so that I know what is shared and why. | Must | solves P4; LR2, LR9. *Revised 2026-10-27:* the separate third-party transfer consent is **retired** — no data leaves our server (LR2). It returns if a third-party provider is ever reintroduced |
| F16 | As a diner, I want to withdraw a consent I previously gave, so that I can stop the processing I agreed to. | Must | LR9 |
| F17 | As a diner, I want to delete my account and have my food profile, uploaded images, and results removed, so that nothing of mine is kept after I leave. | Must | LR5 |
| F18 | As a diner, I want a plain-language message when a menu photo cannot be read or the menu-reading (OCR) service is unavailable or too slow, so that I know what to do next instead of seeing a raw error. | Must | solves P4 (U4 usability); NFR7 |
| F19 | As a diner, I want to upload more than one menu image in one session, so that a multi-page menu is handled in one go. | Should | Charter §5 #10; solves P5 |
| F20 | Scan history — keeping past scans so a menu can be reopened later. | Won't | Team decision 2026-09-07: **not part of the MVP this phase**. Menu images are never kept as permanent history (LR5) |
| F21 | As a diner, I want to rate a recommendation, so that the team can improve accuracy. | Could | Brief §5; relates to P4 |
| F22 | Live camera scanning of a menu. | Won't | Brief §8 — upload only |
| F23 | Voice output of dishes or results. | Won't | Brief §8 |
| F24 | Any language pair other than Thai → English. | Won't | Brief §8 |
| F25 | Restaurant-side registration, setup, or supplied menu data. | Won't | Brief §8 |
| F26 | As a diner, I want the menu photo I just uploaded kept on screen during the scan so that I can review it, crop it, or retry when extraction fails, instead of taking the photo again. | Must | solves P5, P4; LR5. *Added 2026-09-07 with the temporary-image-retention decision; numbered after F25 so existing traces stay valid* |
| F27 | As a diner, I want each dish on the menu matched to a reviewed Thai dish guide — the dish, its usual Thai spellings, the protein or style named on the menu, and its ingredients — so that the English name and ingredients I see are consistent and checked by a person, not guessed per scan. | Must | solves P1, P3, P4 (U1, U2 accuracy). *Team decision 2026-10-27 (teacher feedback).* The guide records, per dish: canonical Thai name and spelling variants; English name; protein/style variants (e.g. ผัดกะเพรา + หมูสับ); ingredients each marked **listed** (standard recipe) or **common** (often added), each with its **allergen groups** (e.g. shrimp paste → shellfish). Matching ignores tone marks and tolerates small OCR slips; an approximate match is 🟡. A dish not in the guide is 🟡 (F10). The guide must be **reviewed by a Thai-literate team member before user testing**, and its version is recorded with every result (LR10) |
| F28 | As a diner, I want to open a dish and see its ingredients in detail — main ingredients and often-added ones, each with its Thai name and any note — together with a short description and spice level, so that I understand what the dish is before I order. | Must | solves P1, P3 (U3, U5 allergen highlighting). *Team decision 2026-10-27 (teacher feedback).* The view states the ingredients come from the guide's usual recipe and that each restaurant cooks its own way; it never says a dish is safe (LR12) |

---

## 3. Non-functional requirements

Each NFR is tagged with where its number comes from. `[engineering target]`
means the team proposed it for review; it is **not** a user-research result.

- **NFR1 — the project metric.** `TBD`. With **15+ real users**, measure the
  time to find and select suitable dishes from a Thai menu using the user's
  current method versus YummyNaKha!, with the number of interaction steps as
  the secondary measure.
  - Baseline time: **`TBD` — not yet measured.**
  - Baseline steps: **`TBD` — not yet measured.**
  - Target improvement: **`TBD` until a baseline exists.** No percentage
    improvement may be claimed without baseline evidence (§1.4).

- **NFR2 — extraction accuracy.** `[engineering target]` On the project's
  defined test set of **readable** Thai menu photographs: dish-name extraction
  accuracy **≥ 90%**; price extraction accuracy **≥ 95%** where a clearly
  visible price is present. *Traces: F6, P1.*

- **NFR3 — translation quality.** `[engineering target]` **≥ 90%** of extracted
  Thai dish names judged acceptably translated into English on the defined
  evaluation set. *Revised 2026-10-27:* measured on dishes matched to the Thai
  dish guide (F27); dishes not in the guide get no translation and are counted
  under NFR10 instead. *Traces: F7, F27, P1.*

- **NFR4 — matching fidelity.** `[engineering target]` On the controlled test
  set: **missed known conflicts ≤ 5%** and **false conflict warnings ≤ 10%**,
  reported separately. Uncertain or incomplete information is classified
  **🟡 check before ordering**, never automatically 🟢 recommended. The missed-
  conflict figure is the safety-critical direction and is reported on its own.
  *Traces: F9, F10, LR12, P3.*

- **NFR5 — end-to-end latency.** `[engineering target]` **≤ 10 seconds** for
  **90%** of supported menu scans under the defined test conditions, measured
  from upload to categorized result. *Traces: F5–F9, P5.*
  - *2026-10-27 single engineering measurement — not a user-test result and not
    evidence that the target is met:* about **6 s end-to-end** for **one
    generated 16-dish test menu** on an **M3 Pro laptop** running the local OCR
    service. The Gemini/Hugging Face pipeline it replaced took 1–2 minutes. The
    p90 over the defined test set is still to be measured (TC-ST-10).

- **NFR6 — usage / cost ceiling.** *Revised 2026-10-27:* there is **no
  third-party AI per-call cost or quota** any more — the OCR service runs on our
  own server. The remaining cost is hosting that service, **`TBD`** until the
  hosting choice for user testing is made. No scans-per-user cap is invented
  here. *Traces: Charter §6 (AI cost & availability).*

- **NFR7 — availability.** `[engineering target — MVP operational target, not a
  commercial SLA]` **≥ 95%** availability during scheduled user-testing and demo
  periods. When the OCR service is unavailable or times out the app shows a
  plain-language message and never a raw error (F18). *Traces: F18, P4.*

- **NFR8 — ease of use.** **`TBD`.** U4 named "difficult to use" as a reason to
  hesitate, so a usability target is warranted, but the survey collected no
  usability measurement. The target is set from the first usability test.
  *Traces: P4 (U4).*

- **NFR9 — traffic-log retention.** Where the CCA §26 service-provider
  obligation applies, computer traffic data is retained **≥ 90 days** by explicit
  configuration, not left at a cloud default. *Source: `rule.md`, CCA §26 — a
  legal figure, not a team proposal. Traces: LR7.*

- **NFR10 — Thai dish guide coverage.** **`TBD`.** The share of dishes on real
  Thai-restaurant menu photos that match a guide entry, measured on the menu
  test set and reported alongside the share of 🟡 results it causes. No target
  is set until a first measurement exists; a low figure means most dishes land
  in 🟡 (F10). *Added 2026-10-27. Traces: F27, F10, P1.*

### Open numeric targets

| Item | Status | Unblocked by |
|---|---|---|
| NFR1 baseline time and steps | `TBD` | Timed observation with real users |
| NFR1 target improvement | `TBD` | The baseline above |
| NFR6 hosting cost | `TBD` | Hosting choice for the OCR service |
| NFR10 guide coverage target | `TBD` | First coverage measurement on the menu test set |
| NFR8 usability target | `TBD` | First usability test |
| F1 OAuth provider name | `TBD` | Team decision — the auth **mechanism** (OAuth + email/password) is settled; only which OAuth provider is open |
| LR5 temporary-image retention duration | `TBD` | Team decision on the temporary-retention rule |

`/audit-backlog` flags an NFR with no number. NFR1, NFR6, NFR8, and NFR10 are
expected hits and are deliberate — they are recorded above rather than filled by
assumption.

---

## 4. Legal requirements (from rule.md)

### PDPA

- **LR1 (PDPA §26 — sensitive health data, explicit opt-in).** Allergies,
  medical conditions, and doctor-advised food restrictions are treated as
  potentially sensitive health data: collected only under an explicit, separate
  opt-in, never as a silent default, and editable and deletable by the user.
  Ordinary food preferences — favorite foods, dislikes, spicy level, soft/hard
  food — are normal personal data and are not placed behind the sensitive-data
  opt-in. *Testable: a new account has no allergy or medical flag set until an
  explicit opt-in record exists.*

- **LR2 (PDPA — third-party transfer disclosure and consent).** *Revised
  2026-10-27.* Menu photos are read by our **own OCR service on our server**,
  and dish matching runs in the app itself, so **no profile or menu data is sent
  to a third-party OCR/AI provider**. The privacy notice says so plainly. The
  separate AI-transfer consent is therefore **retired**; consent records
  already given under it are **kept** and stay retrievable (LR9). If a
  third-party provider is ever reintroduced, the system must again tell the
  user what is processed and by whom and obtain consent **before the first
  send**. *Testable: during a full scan no request leaves our server for an
  external OCR/AI host; a new account cannot reach a categorized result without
  accepted Terms, privacy notice, and AI & Accuracy Disclaimer records.*

- **LR3 (PDPA — data minimisation).** *Revised 2026-10-27.* The OCR service
  receives **only the image bytes** of the menu photo — no account email, real
  name, user ID, session token, or profile data. The food profile never leaves
  the app server: matching against it runs in the app. The OCR service is
  called from the **backend only** and is not reachable from the browser (see
  LR6). *Testable: capture the request to the OCR service → its body is the
  image and its headers carry no identifier; no OCR request originates from the
  client.*

- **LR4 (PDPA — purpose limitation).** Profile and menu data are used only for
  menu understanding and personalized recommendation — not for advertising,
  resale, or profiling — unless the user opts in separately. *Testable: no data
  flow exists from the profile store to an advertising or analytics-profiling
  sink.*

- **LR5 (PDPA — deletion and temporary image retention).** An uploaded menu
  image is **kept temporarily for the duration of the active scan session**, so
  the user can review it, crop it, or retry when extraction or processing fails
  (F26). It is **not** discarded immediately after the first processing attempt.
  The temporary copy is deleted when the scan session **completes or is
  abandoned**, under a defined temporary-retention rule (**duration `TBD`**).
  Menu images are **never** kept as permanent scan history — scan history is
  Won't this phase (F20). On account deletion the food profile, any temporary
  image, and extracted results are removed within the stated retention window.
  *Testable: complete or abandon a scan → the temporary image is gone within the
  defined window; no image store outlives a scan session; delete account → no
  profile, image, or result row remains.*

- **LR6 (PDPA — credential and key protection).** Authentication is OAuth plus
  email/password. (a) An email/password account **never stores a plaintext
  password** — only a salted, computationally hard password hash. (b) OAuth
  login stores only a verification or session token, never a provider password
  or credential. (c) Session and OAuth tokens are transmitted and stored
  securely. (d) Server-side configuration — the OCR service address and any
  secret — is **held server-side only** and never shipped to, embedded in, or
  reachable from the frontend. *(Revised 2026-10-27: the Gemini and Hugging
  Face API keys no longer exist.)* *Testable: the credential store holds no
  plaintext password field; a frontend bundle scan finds no API key or
  server-only variable; every OCR call originates from the backend.*

### Computer Crime Act §26

- **LR7 (CCA §26 — traffic data, ≥ 90 days).** Where the service-provider
  obligation applies, the required computer traffic data — account identifier,
  IP/network information, and timestamp — is retained for **at least 90 days**
  and kept **separate from the content** it describes. *Testable: a login or
  upload action has a matching traffic-log row stored apart from the menu image;
  deleting the image does not remove that row before its retention period ends.*

- **LR8 (CCA §26 — no over-retention).** Food profiles, menu images including
  the temporary scan-session image, and selected dishes are **not** retained
  for 90 days merely because
  of §26. Their retention follows their own purpose and LR4/LR5. *Testable: the
  purge job deletes profile and image data on the PDPA schedule regardless of
  the traffic-log schedule.*

### Electronic Transactions Act §9 / 26 / 28

- **LR9 (ETA §9/26 — retainable, retrievable acceptance and consent records).**
  Acceptance of the Terms, privacy notice, and AI & Accuracy Disclaimer, and
  each consent (LR1 sensitive data; LR2 third-party transfer while it was in
  use — retired 2026-10-27, earlier records kept), is stored so it
  can be retained and retrieved: user/account identifier, document and version
  accepted, timestamp, and the acceptance action. A **withdrawal** of consent is
  stored the same way. *Testable: fetch by user ID returns the version and
  timestamp of every acceptance and of every withdrawal.*

- **LR10 (internal quality measure — AI-processing records).** The system keeps
  AI-processing records — model/version (the OCR model and the Thai dish
  guide version), OCR result, translation, profile snapshot, timestamp, and the
  recommendation shown — for auditability and
  troubleshooting. This is an **internal quality measure**; the project does not
  state that ETA §§9/26/28 mandate an AI audit log. *Testable: given a scan ID,
  the stored record reproduces what the user was shown.*

- **LR11 (ETA §28 — no unsupported claims).** The UI must not say "certified
  safe", "nutritionist approved", "doctor approved", "100% accurate", or
  similar, unless a real certifying party or professional is actually involved.
  *Testable: a UI copy scan finds no such claim.*

### Product safety rule

- **LR12 (product safety — never claim a dish is safe).** No screen, message, or
  result may state that a dish **is safe** for a user's allergy or medical
  restriction based on menu information. The only permitted clear-result
  phrasing is that **no conflicting ingredient was detected from the available
  menu information**. No safety score or percentage is ever shown — the three
  categories only. Every 🟡 and 🔴 result tells the user to confirm with
  restaurant staff. *Testable: a UI copy scan finds no "safe", "guaranteed", or
  "allergy-free" claim and no user-facing safety score; every 🟡 and 🔴 result
  string contains the confirm-with-staff instruction.*

---

## 5. Scope

### In scope

- Account and sign-in so a profile persists — **OAuth + email/password**;
  OAuth provider name `TBD` (F1, LR6).
- Food profile: favorite foods and ordinary preferences (F2); allergies and
  doctor-advised restrictions under a separate opt-in (F3); view/edit/delete
  (F4).
- Menus of **Thai-cuisine restaurants** only (team decision 2026-10-27).
- Thai menu image upload (F5), dish and price extraction by our own OCR service
  (F6), English names (F7) and ingredients (F8) from the reviewed Thai dish
  guide (F27), and the detailed ingredient view (F28).
- Profile matching into 🟢 / 🟡 / 🔴, with uncertainty resolved to 🟡 (F9, F10),
  the confirm-with-staff instruction (F11), and the shown basis of a result
  (F12).
- Dish selection (F13) and the selected-menu page in Thai for ordering (F14).
- Terms, privacy notice, and disclaimer before the first scan (F15); consent
  withdrawal (F16); account deletion (F17).
- Plain-language failure handling for unreadable photos and an OCR service
  that is down or too slow (F18), with the uploaded image kept on screen for review, crop, or retry for
  the length of the scan session (F26, LR5).
- The legal duties LR1–LR12.
- Should-have: multiple menu images per session (F19).

### Out of scope this phase

- Recommendation rating (F21) — Could, not core.
- Won't-haves, explicitly: **scan history (F20)**, live camera scanning (F22),
  voice output (F23), any language pair other than Thai → English (F24), and
  restaurant-side registration or supplied menu data (F25).
- Any permanent storage of menu images — excluded by LR5.
- Menus of restaurants that are not Thai-cuisine restaurants, and English for
  dishes not in the Thai dish guide — team decision 2026-10-27.
- Any third-party OCR/AI provider for menu reading, translation, or ingredient
  inference — removed 2026-10-27 (LR2, LR3).
- Any "certified", "doctor-approved", or "100% accurate" claim — excluded by
  LR11.
- Any statement that a dish is safe, and any safety score or percentage —
  excluded by LR12.

### The ONE core workflow this phase builds end-to-end

A diner saves a food profile once — favorite foods, plus allergies and
doctor-advised restrictions under a separate opt-in → uploads a photo of a
Thai-restaurant menu → the system reads it with our own OCR service, extracts
each dish name and price, and matches each dish to the reviewed Thai dish guide
for its English name and ingredients → checks every dish against the profile → presents the menu as 🟢 recommended / 🟡 check before
ordering / 🔴 conflict, with every 🟡 and 🔴 telling the diner to confirm with
restaurant staff → the diner selects dishes and opens a separate page showing
those dishes back in Thai for ordering.

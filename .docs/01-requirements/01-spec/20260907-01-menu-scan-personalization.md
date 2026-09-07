# Requirement Spec — Menu Scan & Personalization (YummyNaKha!)

- Date: 2026-09-07
- No: 01
- Topic: menu-scan-personalization
- Phase: DISCOVER (W1–W5) — no production code
- Charter: [YummyNaKha! - Charter.md](../../../YummyNaKha!%20-%20Charter.md)
- Brief: [YummyNaKha_Project_Brief.md](../../../YummyNaKha_Project_Brief.md)
- Legal source: [rule.md](../../../rule.md) (5-Idiots legal & compliance rules)

> **How to read this spec.** Three kinds of statement are kept apart on purpose:
> **(a) validated user evidence** — the survey of Sep 6–7 2026, §1;
> **(b) team-defined engineering targets** — proposed numbers in §3, marked
> `[engineering target]`, not derived from user research;
> **(c) `TBD`** — not yet known. Nothing is filled in by assumption.

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
| F1 | As a diner, I want to create an account and sign in, so that my food profile is saved and available the next time I use the app. | Must | enables P3; LR1, LR6, LR9. **Authentication mechanism `TBD`** — not fixed by the Brief or Charter |
| F2 | As a diner, I want to save my favorite foods and ordinary food preferences, so that the app can recommend dishes that suit my taste. | Must | solves P3 (U2, U5) |
| F3 | As a diner, I want to record my allergies and doctor-advised food restrictions under a separate, explicit opt-in, so that dishes that may conflict with them are flagged. | Must | solves P3 (U3, U5); LR1 |
| F4 | As a diner, I want to view, edit, and delete any part of my food profile, including the allergy and medical-restriction section, so that I stay in control of my own data. | Must | LR1, LR5 |
| F5 | As a diner, I want to upload a photo of a Thai-language menu, so that I do not have to look dishes up one by one. | Must | solves P5, P2 (U2, U5, U6) |
| F6 | As a diner, I want each dish name and its price extracted from the uploaded menu photo, so that I can see what is offered and what it costs. | Must | solves P1 (U1, U2, U3, U5 requested prices) |
| F7 | As a diner, I want the extracted menu translated from Thai into English, so that I can read the menu myself. | Must | solves P1, P2 (U1–U5) |
| F8 | As a diner, I want the app to infer the likely ingredients of each dish, so that dishes can be checked against my profile. | Must | solves P3 |
| F9 | As a diner, I want every dish checked against my saved profile and labelled 🟢 recommended / 🟡 check before ordering / 🔴 conflict, so that I can see at a glance which dishes suit me. | Must | solves P3 (U2, U3, U5) |
| F10 | As a diner, I want a dish whose menu information is incomplete or uncertain to be labelled 🟡 rather than 🟢, so that a gap in the information is never shown to me as a recommendation. | Must | solves P4; LR12; NFR4 |
| F11 | As a diner, I want every 🟡 and 🔴 result to tell me to confirm with restaurant staff — and never to tell me a dish is safe — so that I understand the limit of what the app can know from a photo. | Must | solves P4; LR12 |
| F12 | As a diner, I want to see what a result was based on — the extracted dish text, its translation, and the profile item that caused a 🟡 or 🔴 — so that I can judge for myself whether to trust it. | Must | solves P4 (U1, U2, U4) |
| F13 | As a diner, I want to select dishes from the categorized menu, so that I can collect what I intend to order. | Must | solves P1, P5 |
| F14 | As a diner, I want a separate page showing my selected dishes back in Thai, so that I can order by showing the screen to restaurant staff. | Must | solves P2 (U1, U2, U6 depend on staff or a friend) |
| F15 | As a diner, I want to accept the Terms, privacy notice, and AI & Accuracy Disclaimer, and to give a separate consent before any menu or profile data is sent to a third-party OCR/AI provider, so that I know what is shared and why. | Must | solves P4; LR2, LR9 |
| F16 | As a diner, I want to withdraw a consent I previously gave, so that I can stop the processing I agreed to. | Must | LR9 |
| F17 | As a diner, I want to delete my account and have my food profile, uploaded images, and results removed, so that nothing of mine is kept after I leave. | Must | LR5 |
| F18 | As a diner, I want a plain-language message when a menu photo cannot be read or the AI service is unavailable, so that I know what to do next instead of seeing a raw error. | Must | solves P4 (U4 usability); NFR7 |
| F19 | As a diner, I want to upload more than one menu image in one session, so that a multi-page menu is handled in one go. | Should | Charter §5 #10; solves P5 |
| F20 | As a diner, I want past scans kept in a history, so that I can reopen a menu I scanned before. | Could | Brief §5; **outside core scope this phase** |
| F21 | As a diner, I want to rate a recommendation, so that the team can improve accuracy. | Could | Brief §5; relates to P4 |
| F22 | Live camera scanning of a menu. | Won't | Brief §8 — upload only |
| F23 | Voice output of dishes or results. | Won't | Brief §8 |
| F24 | Any language pair other than Thai → English. | Won't | Brief §8 |
| F25 | Restaurant-side registration, setup, or supplied menu data. | Won't | Brief §8 |

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
  Thai dish names and menu descriptions judged acceptably translated into
  English on the defined evaluation set. *Traces: F7, P1.*

- **NFR4 — matching fidelity.** `[engineering target]` On the controlled test
  set: **missed known conflicts ≤ 5%** and **false conflict warnings ≤ 10%**,
  reported separately. Uncertain or incomplete information is classified
  **🟡 check before ordering**, never automatically 🟢 recommended. The missed-
  conflict figure is the safety-critical direction and is reported on its own.
  *Traces: F9, F10, LR12, P3.*

- **NFR5 — end-to-end latency.** `[engineering target]` **≤ 10 seconds** for
  **90%** of supported menu scans under the defined test conditions, measured
  from upload to categorized result. *Traces: F5–F9, P5.*

- **NFR6 — usage / cost ceiling.** **`TBD`** after the OCR/AI provider and cost
  model are selected. No scans-per-user cap is invented here. *Traces: Charter
  §6 (AI cost & availability).*

- **NFR7 — availability.** `[engineering target — MVP operational target, not a
  commercial SLA]` **≥ 95%** availability during scheduled user-testing and demo
  periods. When the OCR/AI service is unavailable or rate-limited the app shows
  a plain-language message and never a raw error (F18). *Traces: F18, P4.*

- **NFR8 — ease of use.** **`TBD`.** U4 named "difficult to use" as a reason to
  hesitate, so a usability target is warranted, but the survey collected no
  usability measurement. The target is set from the first usability test.
  *Traces: P4 (U4).*

- **NFR9 — traffic-log retention.** Where the CCA §26 service-provider
  obligation applies, computer traffic data is retained **≥ 90 days** by explicit
  configuration, not left at a cloud default. *Source: `rule.md`, CCA §26 — a
  legal figure, not a team proposal. Traces: LR7.*

### Open numeric targets

| Item | Status | Unblocked by |
|---|---|---|
| NFR1 baseline time and steps | `TBD` | Timed observation with real users |
| NFR1 target improvement | `TBD` | The baseline above |
| NFR6 usage cap | `TBD` | Provider + cost-model decision |
| NFR8 usability target | `TBD` | First usability test |
| F1 authentication mechanism | `TBD` | Team technical decision |
| OCR/AI provider | Undecided | Team technical decision — requirements stay provider-neutral until then |

`/audit-backlog` flags an NFR with no number. NFR1, NFR6, and NFR8 are expected
hits and are deliberate — they are recorded above rather than filled by
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

- **LR2 (PDPA — third-party transfer disclosure and consent).** Before any
  profile or menu data is sent to a third-party OCR/AI provider, the system
  tells the user what is processed and that an external provider receives it,
  and obtains consent before the first send. *Testable: a new account cannot
  reach a categorized result without a stored consent record.*

- **LR3 (PDPA — data minimisation).** Each outbound request to the provider
  carries only the menu/dish text and the profile flags the recommendation
  needs. It carries no account email, real name, or other identifier the
  recommendation does not require. *Testable: capture the outbound payload → it
  contains no identifier field.*

- **LR4 (PDPA — purpose limitation).** Profile and menu data are used only for
  menu understanding and personalized recommendation — not for advertising,
  resale, or profiling — unless the user opts in separately. *Testable: no data
  flow exists from the profile store to an advertising or analytics-profiling
  sink.*

- **LR5 (PDPA — deletion).** On account deletion the food profile, uploaded
  menu images, extracted results, and any history are removed within the stated
  retention window. By default a menu image is processed and then **discarded
  after processing**; any temporary retention must be technically justified,
  time-bounded, and disclosed. Permanent menu-image storage is not an MVP
  requirement. *Testable: delete account → no profile, image, or result row
  remains; a completed scan leaves no stored image beyond the stated window.*

- **LR6 (PDPA — credential protection).** If social or email login is used, only
  a verification token is stored, never a provider password or credential.
  *Testable: the credential store holds no password field.*

### Computer Crime Act §26

- **LR7 (CCA §26 — traffic data, ≥ 90 days).** Where the service-provider
  obligation applies, the required computer traffic data — account identifier,
  IP/network information, and timestamp — is retained for **at least 90 days**
  and kept **separate from the content** it describes. *Testable: a login or
  upload action has a matching traffic-log row stored apart from the menu image;
  deleting the image does not remove that row before its retention period ends.*

- **LR8 (CCA §26 — no over-retention).** Food profiles, menu images, scan
  history, and selected dishes are **not** retained for 90 days merely because
  of §26. Their retention follows their own purpose and LR4/LR5. *Testable: the
  purge job deletes profile and image data on the PDPA schedule regardless of
  the traffic-log schedule.*

### Electronic Transactions Act §9 / 26 / 28

- **LR9 (ETA §9/26 — retainable, retrievable acceptance and consent records).**
  Acceptance of the Terms, privacy notice, and AI & Accuracy Disclaimer, and
  each consent (LR1 sensitive data, LR2 third-party transfer), is stored so it
  can be retained and retrieved: user/account identifier, document and version
  accepted, timestamp, and the acceptance action. A **withdrawal** of consent is
  stored the same way. *Testable: fetch by user ID returns the version and
  timestamp of every acceptance and of every withdrawal.*

- **LR10 (internal quality measure — AI-processing records).** The system keeps
  AI-processing records — model/version, OCR result, translation, profile
  snapshot, timestamp, and the recommendation shown — for auditability and
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

- Account and sign-in so a profile persists; mechanism `TBD` (F1).
- Food profile: favorite foods and ordinary preferences (F2); allergies and
  doctor-advised restrictions under a separate opt-in (F3); view/edit/delete
  (F4).
- Thai menu image upload (F5), dish and price extraction (F6), Thai → English
  translation (F7), ingredient inference (F8).
- Profile matching into 🟢 / 🟡 / 🔴, with uncertainty resolved to 🟡 (F9, F10),
  the confirm-with-staff instruction (F11), and the shown basis of a result
  (F12).
- Dish selection (F13) and the selected-menu page in Thai for ordering (F14).
- Terms, disclaimer, and separate transfer consent before the first send (F15);
  consent withdrawal (F16); account deletion (F17).
- Plain-language failure handling for unreadable photos and provider outages
  (F18).
- The legal duties LR1–LR12.
- Should-have: multiple menu images per session (F19).

### Out of scope this phase

- Scan history (F20) and recommendation rating (F21) — Could, not core.
- Won't-haves, explicitly: live camera scanning (F22), voice output (F23), any
  language pair other than Thai → English (F24), restaurant-side registration or
  supplied menu data (F25).
- Any "certified", "doctor-approved", or "100% accurate" claim — excluded by
  LR11.
- Any statement that a dish is safe, and any safety score or percentage —
  excluded by LR12.

### The ONE core workflow this phase builds end-to-end

A diner saves a food profile once — favorite foods, plus allergies and
doctor-advised restrictions under a separate opt-in → uploads a photo of a
Thai-language menu → the system extracts each dish name and price and translates
the menu Thai → English → infers likely ingredients and checks every dish
against the profile → presents the menu as 🟢 recommended / 🟡 check before
ordering / 🔴 conflict, with every 🟡 and 🔴 telling the diner to confirm with
restaurant staff → the diner selects dishes and opens a separate page showing
those dishes back in Thai for ordering.

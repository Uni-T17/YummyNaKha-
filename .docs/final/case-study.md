# Case Study — YummyNaKha!

*Team 5-Idiots · SE Case Studies 1305493 · semester 1/2569*

**Live app:** [URL]
**Prototype:** [Figma Make — "Execute action", Version 7](https://www.figma.com/make/NEV4YbRQ9WN1m3MDkAdZsp/Execute-action)
**Source code:** [YummyNaKha_App/](../../YummyNaKha_App/README.md)

> Every number in this document links to the file in this repository that it
> comes from. Where the repository has no data, the document says so instead of
> giving a number.

---

## 1. Problem

People who cannot read Thai struggle to choose suitable food from a Thai-only
menu. Translation alone does not tell them whether a dish fits their taste, or
whether it may contain something they must avoid for an allergy or a
doctor-advised restriction ([Charter §2](../../YummyNaKha!%20-%20Charter.md)).

What our users told us — a survey of
[**6** respondents, U1–U6, 6–7 Sep 2026](../01-requirements/01-spec/20260907-01-menu-scan-personalization.md#12-evidence-base):

- All [**6 of 6**](../01-requirements/01-spec/20260907-01-menu-scan-personalization.md#12-evidence-base)
  meet menus they do not fully understand.
- [**5 of 6**](../01-requirements/01-spec/20260907-01-menu-scan-personalization.md#12-evidence-base)
  asked for translation, **4 of 6** for prices, **3 of 6** for menu-photo upload,
  **3 of 6** for preference or allergy help.
- [**3**](../01-requirements/01-spec/20260907-01-menu-scan-personalization.md#13-pains)
  free-text answers were about accuracy and trust (P4).

This became [**5** pains, P1–P5](../01-requirements/01-spec/20260907-01-menu-scan-personalization.md#13-pains).
No interviews are on file, so a
[secondary evidence review](../01-requirements/02-secondary-review.md) adds
[**6**](../01-requirements/02-secondary-review.md#evidence-items) published
sources (allergic travellers, restaurant allergy practice, menu English in
Thailand, menu OCR). Each states what it does **not** prove.

---

## 2. Process

### Discover (W1–W5)

| Output | File |
|---|---|
| Charter and Brief — one core workflow: *profile → menu photo → read + translate → match → three categories → order in Thai* | [Charter](../../YummyNaKha!%20-%20Charter.md) · [Brief](../../YummyNaKha_Project_Brief.md) |
| Legal rules from **3** Thai laws (PDPA, Computer Crime Act §26, Electronic Transactions Act) plus a product safety rule | [rule.md](../../rule.md) |
| Requirement spec — now [**40** functional requirements F1–F40](../01-requirements/01-spec/20260907-01-menu-scan-personalization.md#2-functional-requirements), [**10** NFRs](../01-requirements/01-spec/20260907-01-menu-scan-personalization.md#3-non-functional-requirements), [**12** legal requirements LR1–LR12](../01-requirements/01-spec/20260907-01-menu-scan-personalization.md#4-legal-requirements-from-rulemd) | [spec](../01-requirements/01-spec/20260907-01-menu-scan-personalization.md) |
| MoSCoW backlog, every row traced to an F/LR id and a pain | [backlog.md](../01-requirements/backlog.md) |
| Lean canvas | [03-lean-canvas.md](../01-requirements/03-lean-canvas.md) |
| Design: feature list, user journey, prototype with [**12** screens S1–S12](../02-design/03-prototype.md#screens), diagrams (context, use case, architecture, activity, ER, analyse sequence) | [02-design/](../02-design/03-prototype.md) · [04-diagrams/](../02-design/04-diagrams/) |
| Honest gap list: [prototype-vs-spec gaps G1–G9](../02-design/03-prototype.md#prototype-vs-requirements--open-gaps) | [prototype](../02-design/03-prototype.md) |

Key design decisions:

- **Three categories, no score.** Top Picks 🟢 / Check First 🟡 / Avoid 🔴. No
  percentage and no "safe" wording ([LR12](../01-requirements/01-spec/20260907-01-menu-scan-personalization.md#product-safety-rule)).
- **Uncertain means 🟡, never 🟢** ([F10](../01-requirements/01-spec/20260907-01-menu-scan-personalization.md#2-functional-requirements)).
- **Every conflict names its cause** — e.g. "Peanuts in your Avoid list"
  ([F12](../01-requirements/01-spec/20260907-01-menu-scan-personalization.md#2-functional-requirements)).
- **Order in Thai** — a bare, large-type screen to show staff
  ([S10a](../02-design/03-prototype.md#s10a--order-in-thai--covers-fe7-f14)).

### Build (W6–W11)

**v1 (Sep 2026):** Next.js app; photos read and analysed by Google Gemini and
Hugging Face from the server.

**The pivot (27 Oct 2026):** after course-teacher feedback and a measured scan
time of 1–2 minutes against the NFR5 target, the team replaced the AI pipeline
([spec — Team decisions 2026-10-27](../01-requirements/01-spec/20260907-01-menu-scan-personalization.md#team-decisions-2026-10-27)):

- photos are read by **OCR** (our own PaddleOCR, or OCR.space on the free
  deployment);
- each dish is matched to a **team-curated Thai dish guide** that gives the
  English name and ingredients (F27, F28) — the same answer every time, not
  guessed per scan;
- a dish not in the guide gets a rough English name and is always 🟡
  ([PO decision D1](../01-requirements/05-log/20261117-po-decisions.md#d1--names-of-dishes-not-in-the-dish-guide-def-01-in-my-request)).

**v2 (final)** — [YummyNaKha_App/README.md](../../YummyNaKha_App/README.md):

- Consent gate before the first scan, separate health-data consent, consent
  withdrawal in *Privacy & consents*, account deletion, 90-day access log
  ([lib/consent.ts](../../YummyNaKha_App/lib/consent.ts),
  [access-log.ts](../../YummyNaKha_App/lib/server/access-log.ts)).
- Ordering help added after Beta: quantity, Thai request chips, full-screen
  staff view, listen to a dish name in Thai, search and sort, menu-order view
  ([F33–F40, PO decision D5](../01-requirements/05-log/20261117-po-decisions.md#d5--features-built-after-beta-added-to-scope)).
- Hosting cost: [**0 THB/month**](../01-requirements/05-log/20261117-po-decisions.md#d3--open-values-in-the-spec)
  on free tiers.

### Test (W9–W11)

Source: [test execution log](../03-testing/02-test-execution-log.md) and
[v1-vs-v2 evidence](../03-testing/evidence/2026-11-16-v1-vs-v2/README.md).

| What | Result | File |
|---|---|---|
| Unit tests (TC7 parser, TC9 matching) | [**23 of 23** passed](../03-testing/02-test-execution-log.md#run-1--17-nov-2026-tc7-and-tc9-unit-tests) | execution log |
| Missed allergy / doctor conflicts (NFR4, target ≤ 5%) | [**0 of 20**](../03-testing/02-test-execution-log.md#tc9--profile-matching-and-uncertainty--pass) | execution log |
| False Avoid (target ≤ 10%) | [**0 of 20**](../03-testing/02-test-execution-log.md#tc9--profile-matching-and-uncertainty--pass) | execution log |
| Uncertain dishes shown as Top Pick | [**0 of 20**](../03-testing/02-test-execution-log.md#tc9--profile-matching-and-uncertainty--pass) | execution log |
| Dishes found, generated menus (target ≥ 90%) | [**94 of 96** (97.9%)](../03-testing/evidence/2026-11-16-v1-vs-v2/README.md#results) | evidence |
| Prices correct, generated menus (target ≥ 95%) | [**93 of 96** (96.9%)](../03-testing/evidence/2026-11-16-v1-vs-v2/README.md#results) with OCR.space | evidence |
| Real café menu, PaddleOCR | [**26 of 26** dishes and prices](../03-testing/evidence/2026-11-16-v1-vs-v2/README.md#results) | evidence |
| Real café menu, OCR.space | [**21 of 26** found, **19 of 26** prices](../03-testing/evidence/2026-11-16-v1-vs-v2/README.md#results) — missed the salad price column | evidence |
| Average scan time, v1 Gemini → v2 OCR.space | [**33.6 s → 2.1 s**](../03-testing/evidence/2026-11-16-v1-vs-v2/README.md#results) | evidence |
| Same photo × 3, identical ingredients | [**6 of 16** (v1) → **16 of 16** (v2)](../03-testing/evidence/2026-11-16-v1-vs-v2/README.md#results) | evidence |
| Test cases run | [**2** passed, **2** partly run, **11** not run](../03-testing/02-test-execution-log.md#status-of-all-15-test-cases) | execution log |

**Real users:** [no real-user test was run](../../test/no-real-user-test.md).
The project metric — time and steps to choose dishes with the user's current
method vs YummyNaKha!, over [**15+** users](../../YummyNaKha!%20-%20Charter.md)
(NFR1) — has **no result**. The
[before/after table](comparison-table.md) marks every user measure
"Not measured".

---

## 3. Outcome

What the repository shows:

- The one core workflow works end to end in code
  ([user journey](../02-design/02-user-journey.md),
  [app](../../YummyNaKha_App/README.md)).
- The safety rule holds in tests: every conflict note tells the user to confirm
  with restaurant staff, and no result uses the word "safe"
  ([TC9](../03-testing/02-test-execution-log.md#tc9--profile-matching-and-uncertainty--pass)).
- The pivot traded a little reading accuracy for speed and consistency:
  **~16× faster** and the same ingredients every time
  ([evidence](../03-testing/evidence/2026-11-16-v1-vs-v2/README.md#what-it-means)).

What is **not** shown yet:

- Any real-user result (NFR1 time, steps, usability) —
  [no-real-user report](../../test/no-real-user-test.md).
- Enough real menus: [**1** real photo, not the planned **20**](../03-testing/02-test-execution-log.md#tc15--real-menu-extraction--partly-run).
- A Thai-literate review of the dish guide and Thai phrases
  ([PO follow-ups](../01-requirements/05-log/20261117-po-decisions.md#follow-ups-i-am-asking-for)).
- Open defects in the [issue log](../03-testing/03-issue-log.md).

### Lessons

- A small survey (n = 6) shaped the product but could not set a metric
  baseline. Timed sessions should have started in Discover.
- An AI model that gives different ingredients for the same photo is a safety
  problem, not only an accuracy problem. A reviewed guide is slower to build but
  predictable.
- Writing gaps down (G1–G9, "Not measured") kept claims honest.
- Safety wording had to be designed as carefully as the screens.

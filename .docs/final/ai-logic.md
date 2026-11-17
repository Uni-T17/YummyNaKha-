# AI Logic — Where, How, Prove, Measure

Every number below links to a file in this repo. If no file exists for a claim, it is marked **Not measured**.

## 1. Where AI is used

| # | Where | What it does | Kind |
|---|---|---|---|
| A1 | **Menu photo reading (OCR)**: [`ocr-service/server.py`](../../YummyNaKha_App/ocr-service/server.py) | Reads each text box and its position from the menu photo. | ML model: PaddleOCR `PP-OCRv5_mobile_det` + `th_PP-OCRv5_mobile_rec` (Thai), on our own server. An optional switch ([`lib/ocr-provider.ts`](../../YummyNaKha_App/lib/ocr-provider.ts)) uses the OCR.space API instead, with its own consent. |
| A2 | **Optional Menu helper**: [`lib/server/ai/pair-meats.ts`](../../YummyNaKha_App/lib/server/ai/pair-meats.ts) | When a menu lists dishes and meats separately (ข้าวผัด + หมู 50 / กุ้ง 60), Google Gemini pairs the lines. | LLM. Runs only with the user's `ai-transfer` consent, and is sent menu text only. |
| A3 | **AI-assisted engineering**: [`.claude/agents/`](../../.claude/agents), [`.claude/skills/`](../../.claude/skills), [`CLAUDE.md`](../../CLAUDE.md) | Claude Code agents turn interview notes into specs, check spec/backlog/design sync, and help write tests and docs. | Development tool, not part of the running app |

**What is *not* AI, by design:** the steps that decide safety are deterministic code.
- **Parsing:** [`parse-ocr.ts`](../../YummyNaKha_App/lib/server/menu/parse-ocr.ts) pairs each dish name with its price.
- **Dish lookup:** [`thai-food/match.ts`](../../YummyNaKha_App/lib/server/thai-food/match.ts) looks each dish up in a hand-written Thai dish guide (247 dishes, version `2026-10-27c-draft`). Ingredients come from that guide, never from a model.
- **Categorising:** [`lib/matching.ts`](../../YummyNaKha_App/lib/matching.ts) sorts each dish into 🟢 / 🟡 / 🔴.

## 2. How it was built and why: v1 → v2

- **v1 (Sep 2026, commit `f20bdaa`):** Gemini read the photo and produced names, prices and ingredients in one step.
- **v2 (current):** OCR → parser → Thai dish guide → rules.

We switched because v1's ingredients changed from scan to scan, which is unsafe for allergy checks (evidence in §3). In v2:

- **Same input, same output.** Identical text always gives the identical result, so a diner sees the same warning every time.
- **Uncertainty is 🟡, never 🟢.** A fuzzy OCR match, a dish not in the guide, or a menu that doesn't name the meat always lands in Check First. This follows the README's "How a menu is analysed" step 4 and spec F10.
- **Every 🟡 / 🔴 note tells the diner to confirm with restaurant staff** (rule.md, LR12).
- **Gemini (A2) only pairs lines.** Its answer is checked against a schema. Prices still come from the menu and ingredients from the guide. On any problem (no key, timeout, unexpected answer) it returns `null` and the app shows a "choose your meat" list instead.

## 3. Prove: test sets, baseline and eval scripts

| Test set | Baseline | Script / log | Result |
|---|---|---|---|
| **v1 vs v2:** 7 images (6 generated menus, 96 dishes; 1 real 2-page café menu, 26 dishes), scored against answer keys | v1 Gemini | [`eval-harness.ts`, `run.log`, `results*.json`](../03-testing/evidence/2026-11-16-v1-vs-v2/README.md) | See §4 |
| **TC7 + TC9 unit tests (Vitest)**: 16 parser checks plus 60 dish/profile pairs, with labels written from the spec before the first run | Spec rules | [execution log](../03-testing/02-test-execution-log.md), [`tests/unit/`](../../YummyNaKha_App/tests/unit), [`tc9-results.json`](../../YummyNaKha_App/tests/results/tc9-results.json) | 23/23 pass |
| **Second TC9 set + guide sweep**: another 60 pairs, plus all 247 guide dishes × 3 profiles = 741 results | Spec rules | [`evidence/2026-11-17-api-and-sweep/`](../03-testing/evidence/2026-11-17-api-and-sweep/README.md) | 60/60 pairs; 0 missed conflicts in 741 results |
| **Guide data checks**: duplicate spellings, unused ingredients | — | `npm run guide:check` ([`scripts/guide-check.ts`](../../YummyNaKha_App/scripts/guide-check.ts)) | Exits 0, per the [test results](../03-testing/02-test-results.md) |

## 4. Measure

| Measure | v1 Gemini | v2 (current) | Source |
|---|---|---|---|
| **Same ingredients on 3 scans of one photo** | **6/16 (37.5 %)** | **16/16 (100 %)** (OCR.space) | [v1-vs-v2](../03-testing/evidence/2026-11-16-v1-vs-v2/README.md) |
| Dishes found, all 122 | 122 (100 %) | 120 (98.4 %) PaddleOCR · 115 (94.3 %) OCR.space | same |
| Prices correct, all 122 | 122 (100 %) | 118 (96.7 %) PaddleOCR · 112 (91.8 %) OCR.space | same |
| Made-up dishes | 0 | 0 | same |
| Average time per scan | 33.6 s | 6.1 s PaddleOCR · 2.1 s OCR.space | same |
| Missed listed allergy / doctor conflicts (target ≤ 5 %, NFR4) | Not measured | **0/20 (0 %)** in both 60-pair sets; 0 in the 741-result sweep | [execution log](../03-testing/02-test-execution-log.md), [sweep](../03-testing/evidence/2026-11-17-api-and-sweep/README.md) |
| False Avoid warnings (target ≤ 10 %) | Not measured | **0/20 (0 %)** in both sets | same |
| Uncertain dish shown as Top Pick | Not measured | **0** | same |
| English name quality (Thai-literate review, TC15) | Not measured | **Not measured** | [test results](../03-testing/02-test-results.md) |
| Time for a diner to choose dishes (the core metric) | Not measured | **Not measured with real users**; see [no-real-user-test.md](../../test/no-real-user-test.md) | — |

**The trade-off:** v2 reads slightly worse than Gemini (94–98 % of dishes found against 100 %). In exchange it is consistent, 5–16× faster, and every ingredient can be traced to the guide. For an allergy app, consistency matters more.

## 5. Limitations and bias

- **Small test set.** 7 images, and only 1 real menu. The generated menus are cleaner than real photos. The real-menu answer key still needs a Thai reader's check ([evidence README](../03-testing/evidence/2026-11-16-v1-vs-v2/README.md)).
- **The guide describes the usual recipe, not this kitchen.** Hidden sauces, oil and cross-contact can't be seen from a menu. That is why no result ever says "safe", and the clearest result is "no conflicting ingredient detected" ([`lib/consent.ts`](../../YummyNaKha_App/lib/consent.ts), AI & Accuracy Disclaimer).
- **The guide's coverage is biased toward common central-Thai dishes.** Regional and restaurant-special dishes fall back to 🟡.
- **Known defects:**
  - **DEF-01** ([issue log](../03-testing/03-issue-log.md)): on the real café menu, OCR.space missed 5 salad prices.
  - **Unlisted dishes get a rough English name.** The [PO decision D1](../01-requirements/05-log/20261117-po-decisions.md) accepts this when the name is marked "Rough translation" and the dish stays 🟡.
  - **A misread protein word** (ต้มยำกุ้ม) loses shrimp from the ingredient list. The dish is still 🟡 with "ask staff", not 🔴 ([execution log](../03-testing/02-test-execution-log.md), observations).
- **TC9 labels** were written from the spec by the team. Product Owner review is recorded in [PO decisions](../01-requirements/05-log/20261117-po-decisions.md).

## 6. What happens when AI fails

| Failure | What the user sees |
|---|---|
| Photo unreadable / no dishes found | "We couldn't find any dishes in this photo. Try a clearer photo" (`MENU_UNREADABLE`). No dishes are invented. |
| OCR misreads a name | Fuzzy match → 🟡 with "we may have misread the name, check with staff". |
| Dish not in the guide | 🟡 with "ask restaurant staff what's in it". |
| Gemini unavailable or no consent | The same menu, with a "choose your meat" list instead of separate cards. |
| OCR service down | The analysis fails with a readable error. Not yet tested (TC10 Not run). |

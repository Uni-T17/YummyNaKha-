# YummyNaKha! — Test Execution Log

Results of running cases from the [test plan](01-test-plan.md). Each number below links to the file it came from. Nothing here is estimated.

---

## Run 1 — 17 Nov 2026: TC7 and TC9 (unit tests)

| | |
|---|---|
| **Build** | commit `0dae776` (app code unchanged by this run — only test files added) |
| **Tools** | Node v24.18.1 · Vitest 3.2.4 (run with `npx`, not added to the project) |
| **Command** | `cd YummyNaKha_App && npx vitest@3.2.4 run` |
| **Files** | [`vitest.config.mts`](../../YummyNaKha_App/vitest.config.mts) · [`tests/unit/tc7-ocr-parser.test.ts`](../../YummyNaKha_App/tests/unit/tc7-ocr-parser.test.ts) · [`tests/unit/tc9-profile-matching.test.ts`](../../YummyNaKha_App/tests/unit/tc9-profile-matching.test.ts) · results [`tests/results/tc9-results.json`](../../YummyNaKha_App/tests/results/tc9-results.json) |
| **Result** | **2 test files passed · 23 of 23 tests passed** (16 TC7 + 7 TC9) — first run |

### TC7 — OCR parser and deterministic guide lookup → **Pass**

Hand-made OCR boxes `{text, score, box}` through `parseMenuLines`, `matchMenuLine` and `buildDishes`.

| # | Check | Result |
|---|---|---|
| 1 | Names paired with the price on their own row (ผัดกะเพราหมูสับ 60, ต้มยำกุ้ง 120, ข้าวผัดปู 80) | Pass |
| 2 | Tilted photo: each price box 18 px lower than its name → still paired correctly | Pass |
| 3 | Price in the same box with dot leaders and บาท ("ผัดกะเพราหมูสับ ....... 60 บาท") → name + 60 | Pass |
| 4 | Missing price stays null (never guessed) | Pass |
| 5 | A lone "บาท" box is not a dish | Pass |
| 6 | Thai digits "๖๐" → 60 | Pass |
| 7 | Item numbers and stars removed ("1. ผัดไทยกุ้งสด 70", "★ 5.ต้มยำกุ้ง 120") | Pass |
| 8 | Phone line "โทร. 095-849-1234" is not a dish or a price | Pass |
| 9 | Thai menu: English copy without a price dropped; "Carbonara 125" kept as a dish | Pass |
| 10 | Same input twice → identical output | Pass |
| 11 | ผัดกะเพราหมูสับ: quality "exact", in guide, a listed ingredient "minced pork" in group "pork", no uncertainties | Pass |
| 12 | Spaces inside the Thai name don't change the matched dish | Pass |
| 13 | Tone marks / common spelling are the same dish by design (ต้มยำกุง = ต้มยำกุ้ง, ผัดกะเพาหมูสับ = ผัดกะเพราหมูสับ) | Pass |
| 14 | Real OCR letter error ข้าวมันไท่ → ข้าวมันไก่, quality "fuzzy", uncertainty contains "misread" | Pass |
| 15 | ผัดกะเพรา (no meat named) → uncertainty about the meat | Pass |
| 16 | Unlisted หมูนุ่มซอสเชฟ 99 → Thai name and price kept, not in guide, no listed ingredients, has an uncertainty | Pass |

### TC9 — Profile matching and uncertainty → **Pass**

60 dish/profile pairs, each built with `buildDishes([{name, price}])` and labelled with `categorizeDish`. Expected labels were written from the spec rules before the first run.

| Group | Pairs | Avoid | Check First | Top Pick | Measure | Threshold (NFR4 / F10 / LR12) | Result |
|---|---|---|---|---|---|---|---|
| **A** — listed allergy / doctor conflict | 20 | **20** | 0 | 0 | Missed conflicts **0 / 20 (0 %)** | ≤ 1 (5 %) | Pass |
| **B** — allergy to something not in the dish | 20 | **0** | 2 | 18 | False Avoid **0 / 20 (0 %)** | ≤ 2 (10 %) | Pass |
| **C** — dislike, no reason, too spicy, not in guide, meat not named, OCR misread | 20 | 0 | **20** | **0** | Top Pick 0; dislikes never Avoid | 0 Top Pick | Pass |

| Check | Result |
|---|---|
| Every conflict note contains "confirm with restaurant staff" | Pass |
| No result contains the word "safe" | Pass |

**Test changes and reasons:** no expected label was changed. After the first passing run, two lint-only edits were made: an `eslint-disable` line explaining why the test files use `// @ts-nocheck` (Vitest runs with `npx` and is not a project dependency, so its globals have no types, and `next build` must not type-check them), and the config object assigned to a variable before export. Tests re-run: still 23 of 23.

**Observations**

- **Group B, 2 Check First (not failures):** ปลาทอดกระเทียม and ปลาหมึกทอดกระเทียม are not in the dish guide, so they are Check First by design (F10), whatever the allergy.
- **Possible gap — ต้มยำกุ้ม (OCR misread of ต้มยำกุ้ง):** the dish is matched to Tom Yum with a "special version" uncertainty, so it is correctly Check First. But **shrimp is not in its ingredient list**, because the misread word กุ้ม isn't recognised as shrimp. A diner with a shrimp **allergy** would see Check First (with "ask staff"), not Avoid. Suggested follow-up: when a protein word is misread, treat the dish's usual protein as "may contain". Not a TC9 failure (Group C only requires "not Top Pick"), but worth a TC9 pair in the next run.
- Both TC9 conflicts via allergen groups work: shellfish → shrimp/crab, pork (doctor) → "minced pork".

---

## Run 2 — 16 Nov 2026: TC8 and TC15 (from the v1-vs-v2 evidence)

Source folder: [`evidence/2026-11-16-v1-vs-v2/`](evidence/2026-11-16-v1-vs-v2/README.md) — `results.json` (v2 with OCR.space, the live site), `results-v2-paddleocr.json` (v2 with our own PaddleOCR server), `truth-generated.json`, `truth-real.json`, `run.log`. Final v2 pipeline = OCR → parser → Thai dish guide. Missing rows count as errors.

### TC15 — Real-menu extraction → **Partly run**

"Dish found" = a returned dish whose name is ≥ 85 % the same as the answer key, ignoring spaces, item numbers and tone marks (the guide matches the same way). "Exact name" = identical apart from spaces. Price = equal price on a found dish, out of all answer-key rows.

| Set | Engine | Dishes | Dish found (target ≥ 90 %) | Exact name | Price correct (target ≥ 95 %) | Made-up (target 0) |
|---|---|---|---|---|---|---|
| Generated menus (6 images) | OCR.space | 96 | **94 (97.9 %)** ✅ | 80 (83.3 %) | **93 (96.9 %)** ✅ | **0** ✅ |
| Generated menus (6 images) | PaddleOCR | 96 | **94 (97.9 %)** ✅ | 76 (79.2 %) | **92 (95.8 %)** ✅ | **0** ✅ |
| Real café menu (1 image) | OCR.space | 26 | **21 (80.8 %)** ❌ | 20 (76.9 %) | **19 (73.1 %)** ❌ | **0** ✅ |
| Real café menu (1 image) | PaddleOCR | 26 | **26 (100 %)** ✅ | 14 (53.8 %) | **26 (100 %)** ✅ | **0** ✅ |

- **Real menu with OCR.space:** every dish name was read, but the salad section's whole price column was not, so 5 salads had no price and appeared under "Other text on the menu" instead of as dishes.
- **Exact names** are well under 90 % because OCR drops or swaps Thai tone marks (e.g. ตำ → ต่ำ). The guide is tone-insensitive by design, so "dish found" is the measure the product relies on — but the Thai shown on the staff card can carry the misread spelling.
- **Why "Partly run":** the plan needs **20 real photos / ≥ 150 dish rows**; we have **1 real photo (26 rows)** plus 96 generated rows. English quality and guide coverage were not judged by a Thai-literate reviewer, and the real-menu answer key was transcribed from the photo and still needs a Thai reader's check.

### TC8 — Upload-to-result latency → **Partly run**

v2 scan times from `run.log` (OCR + parser + guide, per image):

| Engine | Scan times (s) | Within 10 s | p90 (nearest rank) |
|---|---|---|---|
| OCR.space (live) | 2.1, 1.8, 2.0, 1.8, 2.1, 2.0, 3.0 | **7 of 7** | **3.0 s** |
| PaddleOCR (own server, MacBook) | 7.1, 5.0, 5.0, 5.0, 5.0, 5.0, 11.0 | **6 of 7** | **11.0 s** |

- Target: ≥ 18 of 20 scans within 10 s (p90 ≤ 10 s). OCR.space meets it on these 7; PaddleOCR's 11.0 s was the 2-page real menu.
- **Why "Partly run":** only **7 scans per engine, not 20**; and the timer covered the server pipeline only, **not upload + queue + rendering in the browser** as TC8 requires. No cold-start or multi-page split was recorded.

### Slide numbers vs. files

| Slide claim | File value | Match |
|---|---|---|
| 96 dishes | 96 (16 × 6) | ✅ |
| Names 97.9 % (94/96) | 94 / 96 **found** | ✅ number — but it is "dishes found", not "names read exactly" (exact = 80/96, 83.3 %). Label it "dishes found". |
| Prices 96.9 % (93/96) | 93 / 96 | ✅ |
| v2 2.0 s avg (1.8–2.1) | 1.96 s avg, 1.8–2.1 | ✅ (OCR.space) |
| v1 Gemini 33.3 s avg (12.5–64.4) | 33.28 s avg, 12.5–64.4 | ✅ (generated menus only; 33.6 s over all 7 images) |
| Slide 12: real menu 23 → 26 dishes, "Unlisted dish" 10 → 0, Carbonara 0 → 1 | **No file has a before-fix run.** The evidence folder holds after-fix runs only. Those numbers came from runs during development on 16 Nov that were not saved. To give them a source, run the same photo through commit `3aa0a13` (before) and `2e04d26` (after) with the same OCR engine and save both outputs. | ❌ no source yet |

---

## Status of all 15 test cases

| TC | Case | Level | Status | Evidence |
|---|---|---|---|---|
| **TC1** | Account and ordinary profile persistence | Integration | **Pass** | [02-test-results.md](02-test-results.md) (Google OAuth assertion Blocked: no credentials in test env) |
| **TC2** | Menu upload, including multiple pages | E2E | **Partly run** | [02-test-results.md](02-test-results.md): upload checks pass; multi-page analysis Not run (needs OCR) |
| **TC3** | Separate sensitive-profile opt-in | Integration | **Pass** | [02-test-results.md](02-test-results.md) |
| **TC4** | Terms, privacy and disclaimer gate | Integration | **Pass** | [02-test-results.md](02-test-results.md) |
| TC5 | Own-server OCR and data minimisation | Integration | Not run | OCR service unavailable at `127.0.0.1:8765` on 17 Nov 2026; no rerun |
| **TC6** | Consent withdrawal takes effect | Integration | **Pass** | [02-test-results.md](02-test-results.md) |
| **TC7** | OCR parser and deterministic guide lookup | Unit | **Pass** | Run 1 |
| **TC8** | Upload-to-result latency | Integration | **Partly run** | Run 2; requested rerun not possible because OCR service was unavailable at `127.0.0.1:8765` on 17 Nov 2026 |
| **TC9** | Profile matching and uncertainty | Unit | **Pass** | Run 1 |
| TC10 | Unreadable menu and OCR failure recovery | Integration | Not run | OCR service unavailable at `127.0.0.1:8765` on 17 Nov 2026; no rerun |
| **TC11** | Explainable results and ingredient detail | E2E | **Partly run** | [02-test-results.md](02-test-results.md) |
| TC12 | Select dishes and order in Thai | E2E | Not run | OCR service unavailable at `127.0.0.1:8765` on 17 Nov 2026; no rerun |
| TC13 | Processing record reproduces displayed result | Integration | Not run | OCR service unavailable at `127.0.0.1:8765` on 17 Nov 2026; no rerun |
| **TC14** | Content deletion and separate traffic retention | Integration | **Pass** | [02-test-results.md](02-test-results.md) (session-end photo cleanup window still open: DEF-05) |
| **TC15** | Real-menu extraction, English quality and coverage | Integration | **Partly run** | Run 2 |

**Summary (combined, all runs):** passed **TC1, TC3, TC4, TC6, TC7, TC9, TC14** · partly run **TC2, TC8, TC11, TC15** · not run **TC5, TC10, TC12, TC13**.
Runs 1–2 are above; the API and logic run of 17 Nov is in [02-test-results.md](02-test-results.md); the real-user test of 16 Nov (n = 16, self-ratings and SUS) is in [user-test/README.md](user-test/README.md).

## Limits

- **TC9 labels need Product Owner review.** They were written from the spec rules before running, but the test plan asks for them to be frozen with the Product Owner.
- **TC7 uses hand-made OCR boxes**, not boxes from real photos. Real photos are covered by TC15.
- **TC8 / TC15 use a small set:** 7 images, 1 real menu. Generated menus are cleaner than real photos.
- **Tests were drafted with AI (Claude Code)** and checked by running them. The team should review the test code and the expected labels.

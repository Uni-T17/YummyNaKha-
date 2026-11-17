# v1 (Gemini only) vs. v2 (OCR + Thai dish guide) — 16 Nov 2026

**What:** the same 7 menu images, run through both versions, scored against the same answer keys with the same rules.

- **v1** = commit `f20bdaa` (22 Sep 2026), replayed with its original prompts, schema, temperatures and its own "drop dishes not in the OCR text" filter. Gemini models used today: `gemini-3.5-flash-lite` (fallback `gemini-3.1-flash-lite`). These may be newer than the model used in September; that can only help v1.
- **v2** = the final code (OCR → parser → Thai dish guide), with **OCR.space** (live site) and with **PaddleOCR** (our own server).
- **Test set:** 6 generated Thai menus (3 menus × clean / tilted-blurred "phone photo", 96 dishes) + 1 real 2-page café menu (26 dishes). Answer keys: `truth-generated.json`, `truth-real.json` (the real-menu key was transcribed from the photo — have a Thai reader confirm it).
- **Scoring** (`eval-harness.ts`): *found* = a returned dish name ≥ 85 % similar to the menu's (spaces, numbering and tone marks ignored); *exact* = identical apart from spaces; *price* = price equal on a found dish; *made-up* = a result < 60 % similar to every real dish. *Consistency* = the same photo (`menu0-photo`) scanned 3 times.

## Results

| | v1 Gemini | v2 OCR.space (live) | v2 PaddleOCR (own server) |
|---|---|---|---|
| **Generated menus, 96 dishes** — found | 96 (100 %) | 94 (97.9 %) | 94 (97.9 %) |
| exact name | 92 (95.8 %) | 80 (83.3 %) | 76 (79.2 %) |
| price correct | 96 (100 %) | 93 (96.9 %) | 92 (95.8 %) |
| **Real café menu, 26 dishes** — found | 26 (100 %) | 21 (80.8 %) | 26 (100 %) |
| exact name | 24 (92.3 %) | 20 (76.9 %) | 14 (53.8 %) |
| price correct | 26 (100 %) | 19 (73.1 %) | 26 (100 %) |
| **All 122 dishes** — found | 122 (100 %) | 115 (94.3 %) | 120 (98.4 %) |
| price correct | 122 (100 %) | 112 (91.8 %) | 118 (96.7 %) |
| Made-up dishes (all 7 images) | 0 | 0 | 0 |
| **Average time per scan (7 images)** | **33.6 s** (12.5–64.4 s) | **2.1 s** (1.8–3.0 s) | **6.1 s** (5.0–11.0 s) |
| **Same photo × 3 — dishes in all 3 runs** | 15 / 16 | 16 / 16 | — |
| **Same photo × 3 — identical ingredients all 3 times** | **6 / 16 (37.5 %)** | **16 / 16 (100 %)** | — |

## What it means

- **Reading:** Gemini reads slightly better. v2 finds 94–98 % of dishes, against v1's 100 %.
- **Speed:** v2 is about **16× faster** with OCR.space, and 5–6× faster with PaddleOCR.
- **Consistency:** v1 gave the **same ingredients on only 6 of 16 dishes** across 3 scans of the same photo. v2 gives the same ingredients every time (100 %). This is the main safety reason for the change.
- **Real menu:**
  - OCR.space read every dish name but **skipped the salad section's price column** (7 prices). Five of those dishes then showed under "Other text on the menu" instead of as dishes.
  - PaddleOCR found all 26 dishes with correct prices, but with more tone-mark slips in names (the dish guide tolerates these).
- **Limits:** a small test set (7 images, 1 real menu). Generated menus are cleaner than real ones. The real-menu answer key needs a Thai reader's check.

## Files

`run.log` (console output) · `results.json` (v1 + v2 OCR.space, with consistency runs) · `results-v2-paddleocr.json` · `raw-outputs.json` (every model / OCR output) · `images/` (the 7 test images) · `eval-harness.ts` (the script; it needs the app code and `.env` keys to re-run).

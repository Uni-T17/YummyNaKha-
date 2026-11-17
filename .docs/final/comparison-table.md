# Before / After Comparison Table

Only values backed by repository evidence are shown. “Not measured” means the
required test or user study was not completed, or the execution log says the
underlying file does not exist.

| Item | Before | After | Change | Measured with | Evidence |
|---|---|---|---|---|---|
| B1 Account and sign-in | Not measured — TC1 not run | Not measured — TC1 not run | Not measured | TC1 | [test plan](../03-testing/01-test-plan.md) |
| B2 Ordinary food profile | Not measured — TC1 not run | Not measured — TC1 not run | Not measured | TC1 | [test plan](../03-testing/01-test-plan.md) |
| B3 Separate sensitive opt-in | Not measured — TC3 not run | Not measured — TC3 not run | Not measured | TC3 | [execution log](../03-testing/02-test-execution-log.md) |
| B4 Profile view/edit/delete | Not measured — TC1/TC3 not run | Not measured — TC1/TC3 not run | Not measured | TC1, TC3 | [execution log](../03-testing/02-test-execution-log.md) |
| B5 Thai menu upload | Not measured — TC2 not run | Not measured — OCR unavailable for rerun | Not measured | TC2 | [execution log](../03-testing/02-test-execution-log.md) |
| B6 Dish and price extraction | Not measured — no saved before-fix run | Generated: 94/96 dishes and 93/96 prices; real café PaddleOCR: 26/26 and 26/26 | Partly measured; corpus incomplete | TC15 | [evidence](../03-testing/evidence/2026-11-16-v1-vs-v2/README.md) |
| B7 English dish names | Not measured | Not measured — Thai-literate review not completed | Not measured | TC15 | [execution log](../03-testing/02-test-execution-log.md) |
| B8 Guide ingredients | Not measured — integration not run | TC7 guide lookup checks passed; full requirement not measured | Not measured overall | TC7, TC15 | [execution log](../03-testing/02-test-execution-log.md) |
| B9 Three recommendation categories | Not measured — E2E not run | Not measured — E2E not run | Not measured | TC9 unit only | [execution log](../03-testing/02-test-execution-log.md) |
| B10 Uncertainty to Check First | Not measured | TC9: 20/20 uncertainty cases avoided Top Pick | Partly measured | TC9 | [execution log](../03-testing/02-test-execution-log.md) |
| B11 Staff-confirmation instruction | Not measured | TC9: every conflict note contained staff confirmation | Partly measured | TC9 | [execution log](../03-testing/02-test-execution-log.md) |
| B12 Result basis | Not measured — TC11 not run | Not measured — TC11 not run | Not measured | TC11 | [test plan](../03-testing/01-test-plan.md) |
| B13 Dish selection | Not measured — TC12 not run | Not measured — OCR unavailable for rerun | Not measured | TC12 | [execution log](../03-testing/02-test-execution-log.md) |
| B14 Thai order page | Not measured — TC12 not run | Not measured — OCR unavailable for rerun | Not measured | TC12 | [execution log](../03-testing/02-test-execution-log.md) |
| B15 Terms/privacy/disclaimer gate | Not measured — TC4 not run | Not measured — TC4 not run | Not measured | TC4 | [execution log](../03-testing/02-test-execution-log.md) |
| B16 Consent withdrawal | Not measured — TC6 not run | Not measured — TC6 not run | Not measured | TC6 | [execution log](../03-testing/02-test-execution-log.md) |
| B17 Account deletion | Not measured — TC14 not run | Not measured — TC14 not run | Not measured | TC14 | [execution log](../03-testing/02-test-execution-log.md) |
| B18 Unreadable/OCR-down handling | Not measured — TC10 not run | Not measured — OCR unavailable for rerun | Not measured | TC10 | [execution log](../03-testing/02-test-execution-log.md) |
| B19 Sensitive data legal handling | Not measured — TC3 not run | Not measured — TC3 not run | Not measured | TC3 | [test plan](../03-testing/01-test-plan.md) |
| B20 No third-party transfer | Not measured — TC5 not run | Not measured — OCR unavailable for rerun | Not measured | TC5 | [execution log](../03-testing/02-test-execution-log.md) |
| B21 OCR minimisation/backend-only calls | Not measured — TC5 not run | Not measured — OCR unavailable for rerun | Not measured | TC5 | [execution log](../03-testing/02-test-execution-log.md) |
| B22 Purpose limitation | Not measured — TC5 not run | Not measured — OCR unavailable for rerun | Not measured | TC5 | [test plan](../03-testing/01-test-plan.md) |
| B23 Temporary scan-image retention | Not measured — TC14 not run | Not measured — TC14 not run | Not measured | TC14 | [execution log](../03-testing/02-test-execution-log.md) |
| B24 Credential/configuration protection | Not measured — TC1/TC5 not run | Not measured — TC1/TC5 not run | Not measured | TC1, TC5 | [test plan](../03-testing/01-test-plan.md) |
| B25 Traffic retention | Not measured — TC14 not run | Not measured — TC14 not run | Not measured | TC14 | [execution log](../03-testing/02-test-execution-log.md) |
| B26 No over-retention | Not measured — TC14 not run | Not measured — TC14 not run | Not measured | TC14 | [execution log](../03-testing/02-test-execution-log.md) |
| B27 Versioned acceptance records | Not measured — TC4/TC6 not run | Not measured — TC4/TC6 not run | Not measured | TC4, TC6 | [execution log](../03-testing/02-test-execution-log.md) |
| B28 AI-processing records | Not measured — TC13 not run | Not measured — OCR unavailable for rerun | Not measured | TC13 | [execution log](../03-testing/02-test-execution-log.md) |
| B29 No unsupported safety/certification claims | Not measured — E2E not run | TC9 found no “safe” result wording | Partly measured | TC9 | [execution log](../03-testing/02-test-execution-log.md) |
| B30 No safety claim/score; three categories | Not measured — E2E not run | TC9 found no “safe” wording; category behavior partly measured | Partly measured | TC9 | [execution log](../03-testing/02-test-execution-log.md) |
| B38 Review/crop/retry image | Not measured — TC10 not run | Not measured — TC10 not run | Not measured | TC10 | [execution log](../03-testing/02-test-execution-log.md) |
| B39 Thai dish guide and coverage | Not measured — reviewer/corpus incomplete | TC7 deterministic checks passed; coverage target not measured | Partly measured | TC7, TC15 | [execution log](../03-testing/02-test-execution-log.md) |
| B40 Detailed ingredient view | Not measured — TC11 not run | Not measured — TC11 not run | Not measured | TC11 | [execution log](../03-testing/02-test-execution-log.md) |
| AI / TC9 missed conflicts | Not measured before unit run | 0/20 missed conflicts (0%); false Avoid 0/20 (0%) | Measured unit result | TC9 | [execution log](../03-testing/02-test-execution-log.md) |

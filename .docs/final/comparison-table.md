# Before / After Comparison Table

Only values backed by repository evidence are shown. “Not measured” means the
required test or user study was not completed, or the execution log says the
underlying file does not exist.

| Item | Before | After | Change | Measured with | Evidence |
|---|---|---|---|---|---|
| B1 Account and sign-in | Not measured | Email/password: register, sign-in, wrong-password refusal, sign-out all pass. Google OAuth **Blocked** (no credentials in test env) | Measured (pass/fail), OAuth Blocked | TC1 | [Run 1 results](../03-testing/02-test-results.md) |
| B2 Ordinary food profile | Not measured | Fav and dislike save, edit, remove and persist after sign-out/in; account B can't read A's profile | Measured (pass/fail) | TC1 | [Run 1 results](../03-testing/02-test-results.md) |
| B3 Separate sensitive opt-in | Source review 27 Oct: no separate opt-in gate (DEF-02) | Allergy/doctor writes refused (403) before `health-data` opt-in, nothing stored; allowed after | Gap closed (fix `5f62231`) | TC3 | [Run 1 results](../03-testing/02-test-results.md) · [issue log](../03-testing/03-issue-log.md) |
| B4 Profile view/edit/delete | Not measured | Ordinary and sensitive items can be edited and deleted; the deletions persist | Measured (pass/fail) | TC1, TC3 | [Run 1 results](../03-testing/02-test-results.md) |
| B5 Thai menu upload | Not measured | JPG/PNG accepted; empty, fake `.jpg` and 8 MiB + 1 byte files rejected with readable errors and no stored row. Multi-page analysis Not run (needs OCR) | Partly measured | TC2 | [Run 1 results](../03-testing/02-test-results.md) |
| B6 Dish and price extraction | Not measured — no saved before-fix run | Generated: 94/96 dishes and 93/96 prices; real café PaddleOCR: 26/26 and 26/26 | Partly measured; corpus incomplete | TC15 | [evidence](../03-testing/evidence/2026-11-16-v1-vs-v2/README.md) |
| B7 English dish names | Not measured | Not measured — Thai-literate review not completed | Not measured | TC15 | [execution log](../03-testing/02-test-execution-log.md) |
| B8 Guide ingredients | Not measured — integration not run | TC7 guide lookup checks passed; full requirement not measured | Not measured overall | TC7, TC15 | [execution log](../03-testing/02-test-execution-log.md) |
| B9 Three recommendation categories | Not measured — E2E not run | Not measured — E2E not run | Not measured | TC9 unit only | [execution log](../03-testing/02-test-execution-log.md) |
| B10 Uncertainty to Check First | Not measured | TC9: 20/20 uncertainty cases avoided Top Pick | Partly measured | TC9 | [execution log](../03-testing/02-test-execution-log.md) |
| B11 Staff-confirmation instruction | Not measured | TC9: every conflict note contained staff confirmation | Partly measured | TC9 | [execution log](../03-testing/02-test-execution-log.md) |
| B12 Result basis | Not measured — TC11 not run | Not measured — TC11 not run | Not measured | TC11 | [test plan](../03-testing/01-test-plan.md) |
| B13 Dish selection | Not measured — TC12 not run | Not measured — OCR unavailable for rerun | Not measured | TC12 | [execution log](../03-testing/02-test-execution-log.md) |
| B14 Thai order page | Not measured — TC12 not run | Not measured — OCR unavailable for rerun | Not measured | TC12 | [execution log](../03-testing/02-test-execution-log.md) |
| B15 Terms/privacy/disclaimer gate | Not measured | Analysis refused (403 `CONSENT_REQUIRED`) when any of the 3 documents is missing or outdated; allowed when all are current | Measured (pass/fail) | TC4 | [Run 1 results](../03-testing/02-test-results.md) |
| B16 Consent withdrawal | Source review 27 Oct: no withdrawable consent (DEF-03) | Health consent withdrawal recorded; allergy reasons deleted; new sensitive writes refused | Gap closed (fix `5f62231`) | TC6 | [Run 1 results](../03-testing/02-test-results.md) · [issue log](../03-testing/03-issue-log.md) |
| B17 Account deletion | Source review 27 Oct: no deletion mechanism found (DEF-05) | Deletion asks for the password again; user, profile, photos, results, consents and sessions all at 0 rows afterwards | Gap closed (fix `5f62231`) | TC14 | [Run 1 results](../03-testing/02-test-results.md) |
| B18 Unreadable/OCR-down handling | Not measured — TC10 not run | Not measured — OCR unavailable for rerun | Not measured | TC10 | [execution log](../03-testing/02-test-execution-log.md) |
| B19 Sensitive data legal handling | Not measured | Health data only stored with separate consent; deleted on withdrawal (TC3 + TC6 pass) | Measured (pass/fail) | TC3, TC6 | [Run 1 results](../03-testing/02-test-results.md) |
| B20 No third-party transfer | Not measured — TC5 not run | Not measured — OCR unavailable for rerun | Not measured | TC5 | [execution log](../03-testing/02-test-execution-log.md) |
| B21 OCR minimisation/backend-only calls | Not measured — TC5 not run | Not measured — OCR unavailable for rerun | Not measured | TC5 | [execution log](../03-testing/02-test-execution-log.md) |
| B22 Purpose limitation | Not measured — TC5 not run | Not measured — OCR unavailable for rerun | Not measured | TC5 | [test plan](../03-testing/01-test-plan.md) |
| B23 Temporary scan-image retention | Not measured — TC14 not run | Not measured — TC14 not run | Not measured | TC14 | [execution log](../03-testing/02-test-execution-log.md) |
| B24 Credential/configuration protection | Not measured | Passwords stored as salted scrypt hash; session tokens stored hashed; cookie `HttpOnly; Secure; SameSite=lax`. Client-bundle secret check (TC5) Not run | Partly measured | TC1 (TC5 not run) | [Run 1 results](../03-testing/02-test-results.md) |
| B25 Traffic retention | Source review 27 Oct: no separate retention (DEF-05) | Access-log rows (account ID, IP, method, path, status, time) survive account deletion; retention set to 120 days in code (not run with a test clock) | Partly measured | TC14 | [Run 1 results](../03-testing/02-test-results.md) |
| B26 No over-retention | Not measured — TC14 not run | Not measured — TC14 not run | Not measured | TC14 | [execution log](../03-testing/02-test-execution-log.md) |
| B27 Versioned acceptance records | Not measured | Every acceptance and withdrawal stores user, document, version, timestamp and action; the server ignores version/user sent by the client | Measured (pass/fail) | TC4, TC6 | [Run 1 results](../03-testing/02-test-results.md) |
| B28 AI-processing records | Not measured — TC13 not run | Not measured — OCR unavailable for rerun | Not measured | TC13 | [execution log](../03-testing/02-test-execution-log.md) |
| B29 No unsupported safety/certification claims | Not measured — E2E not run | TC9 found no “safe” result wording | Partly measured | TC9 | [execution log](../03-testing/02-test-execution-log.md) |
| B30 No safety claim/score; three categories | Not measured — E2E not run | TC9 found no “safe” wording; category behavior partly measured | Partly measured | TC9 | [execution log](../03-testing/02-test-execution-log.md) |
| B38 Review/crop/retry image | Not measured — TC10 not run | Not measured — TC10 not run | Not measured | TC10 | [execution log](../03-testing/02-test-execution-log.md) |
| B39 Thai dish guide and coverage | Not measured — reviewer/corpus incomplete | TC7 deterministic checks passed; coverage target not measured | Partly measured | TC7, TC15 | [execution log](../03-testing/02-test-execution-log.md) |
| B40 Detailed ingredient view | Not measured — TC11 not run | Not measured — TC11 not run | Not measured | TC11 | [execution log](../03-testing/02-test-execution-log.md) |
| AI consistency: same photo × 3, identical ingredients | v1 Gemini: 6/16 (37.5%) | v2 OCR + dish guide: 16/16 (100%) | +62.5 points | v1 vs v2 eval harness | [evidence](../03-testing/evidence/2026-11-16-v1-vs-v2/README.md) · [ai-logic.md](ai-logic.md) |
| AI / TC9 missed conflicts | Not measured before unit run | 0/20 missed conflicts (0%); false Avoid 0/20 (0%), in two separate 60-pair sets; 0 missed in a 741-result sweep of the whole guide | Measured unit result | TC9 | [execution log](../03-testing/02-test-execution-log.md) · [Run 1 results](../03-testing/02-test-results.md) |

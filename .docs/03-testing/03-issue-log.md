# Issue Log

Severity: 4 catastrophic, 3 major, 2 minor, 1 cosmetic.

| ID | Severity 1–4 | TC | Description | Fix commit | Retest result |
|---|---:|---|---|---|---|
| DEF-01 | 3 | TC15 | On the real café menu, OCR.space found 21/26 dish rows and paired 19/26 prices; five salad prices were missing and appeared as other text. The case was only partly run. | open | open |
| DEF-02 | 4 | TC3 | Source review found that the Avoid-reason selector is not a separate recorded sensitive-data opt-in gate. | `5f62231` (27 Oct: `health-data` consent + server check `hasHealthConsent`) | **Pass**, 17 Nov: allergy/doctor writes refused with 403 before opt-in, nothing stored; allowed after opt-in. [Run 1 results](02-test-results.md) TC3 |
| DEF-03 | 4 | TC6 | Source review found no current withdrawable consent document/flow. | `5f62231` (27 Oct: withdrawable `health-data` document) | **Pass**, 17 Nov: withdrawal recorded with version and timestamp; stored allergy reasons deleted; new sensitive writes refused. [Run 1 results](02-test-results.md) TC6 |
| DEF-04 | 3 | TC10 | Source review found the failure screen lacks photo review/cropping for retry after OCR failure. TC10 was not executed. | open | open |
| DEF-05 | 4 | TC14 | Source review found no confirmed session-end cleanup or separate traffic-log retention mechanism. | `5f62231` (27 Oct: account deletion, separate `AccessLog` kept 120 days) | **Partly fixed**, 17 Nov: account deletion removes all content; access-log rows survive deletion (Pass). Session-end photo cleanup window still not set (**Blocked**), so it stays open. [Run 1 results](02-test-results.md) TC14 |
| R1-01 | 2 | TC7 | An unlisted dish (`ปลาหมึกย่างซอสเจ๊แดง`) gets a rough English name and "may contain" ingredients; the test plan expected Thai + price only. Still 🟡 with "ask staff". | No code change: spec changed by [PO decision D1](../01-requirements/05-log/20261117-po-decisions.md) | **Closed**: behaviour now matches the spec. Retest TC7 against the new F7 wording. |

Retest results for DEF-02, DEF-03, DEF-05 and R1-01 come from the API run on 17 Nov ([evidence](evidence/2026-11-17-api-and-sweep/README.md)).

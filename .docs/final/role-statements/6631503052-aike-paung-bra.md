# Role Statement — Aike Paung Bra (6631503052)

I owned QA and testing evidence for YummyNaKha! as the project QA / Tester. My
scope covered translating the test plan into executable checks, reviewing the
core menu-scan workflow against the stated safety and privacy requirements,
tracking defects, and keeping the final report honest about what was and was
not measured. The team’s executed evidence includes the TC7 OCR/parser checks
and TC9 profile-matching checks, while TC8 and TC15 remain partly run because
the planned corpus and browser-level measurements were incomplete. I also
checked the local OCR service before the requested reruns; it was not reachable,
so the OCR-dependent cases remain Not run with that reason recorded.

My evidence files are the [real-user test results](../../03-testing/user-test/README.md),
[execution log](../../03-testing/02-test-execution-log.md),
[issue log](../../03-testing/03-issue-log.md), and
[comparison table](../comparison-table.md). The planned scenarios and metrics
come from the [test plan](../../03-testing/01-test-plan.md). Relevant existing
evidence is tied to commits `0dae776`, `a1ba9b4`, `3aa0a13`, and `2e04d26` in
the execution log and evidence folder; no new commit was made for this report.

AI disclosure: the test drafts and documentation structure were prepared with
AI assistance, then checked against repository files and recorded test output.
No invented participant data, SUS score, or before/after real-user result is
reported.

## Reflection

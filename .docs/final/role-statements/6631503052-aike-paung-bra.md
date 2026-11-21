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

Working as the QA / Tester for YummyNaKha! helped me understand how important testing is in software development. My main responsibility was to check whether the system worked correctly, especially the menu scanning, OCR, and profile-matching features. Through this project, I learned how to follow a test plan, record test results, identify issues, and document testing evidence.

One challenge I faced was that some tests could not be completed because the OCR service was unavailable and some required test data was incomplete. This taught me that testing does not always go as planned, and it is important to report the actual results instead of assuming everything works.

I also used AI to help prepare test drafts and organize documentation, but I reviewed the information to make sure it matched the real evidence. This experience improved my attention to detail, problem-solving skills, and understanding of software quality assurance.

Overall, this project taught me that good testing is not only about finding bugs, but also about providing honest and reliable evidence of software quality. In future projects, I want to improve my test planning, prepare test environments earlier, and complete more automated tests.
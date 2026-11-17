# No Real-User Test Report

Date: 17 November 2026  
QA / Tester: Aike Paung Bra (6631503052)

## Why no real-user test was reported

The testing records do not contain real-user session logs coded `U01` through
`U15`, and there are no completed Forms A/B results in the repository. The
team therefore has no defensible real-user sample, before/after decision-time
pair, step-count comparison, or SUS score to report. The planned study requires
15+ distinct users, so team members' own testing cannot be relabelled as
real-user evidence.

## What was tested instead

The team-owned evidence is recorded in
[`02-test-execution-log.md`](../.docs/03-testing/02-test-execution-log.md):

- TC7 OCR parsing and deterministic guide lookup: 16 checks passed.
- TC9 profile matching and uncertainty: 23/23 unit tests passed overall; all
  20 known-conflict pairs were labelled Avoid, so missed conflicts were 0/20
  (0%). False Avoid was 0/20 (0%). Every conflict note required restaurant
  confirmation and no result used “safe”.
- TC8 latency and TC15 extraction were only partly run. The evidence contains
  seven generated scans per engine and one real café menu, not the planned 20
  photos / 150+ rows. The strongest recorded results are generated-menu
  extraction of 94/96 dishes and 93/96 prices with OCR.space, and the real
  café menu result of 26/26 dishes and 26/26 prices with PaddleOCR. These are
  engineering results, not real-user outcomes.
- No `PROXY` user records were found. No participant observations or proxy-user
  findings are claimed.

The team also performed source/heuristic review. It identified the missing
separate sensitive-profile opt-in, missing withdrawable consent flow, missing
photo review/crop recovery path, and unverified deletion/traffic-retention
mechanisms. These are review findings, not participant findings.

No before/after user numbers are available. The execution log explicitly says
the claimed “23 → 26 dishes” development comparison has no saved before-fix
file, so it is not used here. The only before/after numbers retained are
engineering comparisons whose evidence files exist, such as the generated
OCR-space/PaddleOCR results in
[`evidence/2026-11-16-v1-vs-v2/`](../.docs/03-testing/evidence/2026-11-16-v1-vs-v2/).

## Ready-to-run real-user plan

Recruit at least 15 distinct participants. Use coded IDs `U01`…`U15`, fresh
synthetic accounts, fictional food preferences, and no participant health
information. Obtain research consent separately from in-app consent. Use a
moderator and note-taker; do not coach timed tasks. Use two reviewed menus of
matched difficulty and alternate menu assignment across participants.

Run these tasks in order, exactly as written in
[`01-test-plan.md`](../.docs/03-testing/01-test-plan.md):

1. **T1:** Set up the account with chicken as a favourite and mushrooms as an
   ordinary dislike.
2. **T2:** Use the supplied Thai menu to find its dishes and prices.
3. **T3:** Explain a Check First dish, its usual ingredients, and why staff
   confirmation is needed.
4. **T4:** Choose two suitable dishes and prepare the Thai order screen.
5. **T5:** Change chicken to an ordinary dislike, reconsider the current menu,
   and update the selection without rescanning.

For each participant record independent success, time, steps, errors,
assistance, abandonment, build, device, network, and menu assignment. Run the
paired baseline with the participant’s usual method before the app condition.
Measure before/app decision time continuously from menu reveal or T2 start to
the two-dish decision; record Thai-screen preparation separately. Report
medians, per-user reductions, number faster with the app, unsuccessful pairs,
and reasons. Do not invent an improvement target.

Immediately after T5, administer the ten-question SUS instrument from the test
plan and report each valid score, mean, and median. Keep SUS separate from
accuracy and allergy-safety claims.

# Real-user test — 16 Nov 2026

**What:** 16 people who struggle with Thai menus (mostly international students) did a moderated session: choose two dishes from a Thai menu with their **own usual method**, then with **YummyNaKha!**, using the same fictional preference card (no mushrooms, mild). Then they filled in the tester survey (Google Form): ratings for both methods, the SUS questionnaire and three open questions.

**Files**
- [sessions.csv](sessions.csv) — every response, participant codes U01…U16, no names or emails.
- [sus-results.md](sus-results.md) — SUS per participant and summary.

**Who took part (n = 16)** — Thai reading: 8 "not at all", 4 "a few words", 2 "some dishes", 1 "most of a menu", 1 "fluently". Usual method (multi-select): Google Lens 12 · typed Google Translate 10 · pictures 7 · ask staff 5 · ask a friend 5 · order something known 2 · guess 1.

## Before (own method) vs after (YummyNaKha!)

Each participant rated three statements 1–5 for each method. "Agree" = 4 or 5.

| Statement | Before: agree · median · mean | After: agree · median · mean | Change (agree) | Participants higher / same / lower |
|---|---|---|---|---|
| Choosing dishes was easy | 8/16 · 3.5 · 3.38 | 13/16 · 5 · 4.31 | +5 | 9 / 6 / 1 |
| I was confident my two dishes fit the card | 4/16 · 3 · 3.12 | 11/16 · 4 · 4.12 | +7 | 10 / 5 / 1 |
| I understood what was in the dishes I chose | 7/16 · 3 · 3.12 | 15/16 · 4.5 · 4.44 | +8 | 11 / 4 / 1 |

**Limits — say these when presenting:** these are **self-ratings**, not measured time or steps. Decision time and steps (moderator log, Form A) are **not in the repo**, so NFR1 (time / steps) is not shown here — if Form A was filled in, export it and add it. Own method was always first (learning effect possible).

## Other results

| Measure | Result |
|---|---|
| SUS (0–100) | mean **72.5**, median 72.5, range 50–87.5, 12/16 at or above the 68 average |
| Would rather use in a real restaurant | **14/16 YummyNaKha!** · 1 usual method · 1 no preference |
| Would trust the Order-in-Thai screen (1–5) | mean 3.62 · 7/16 agree |
| Knew "Check First" means *ask staff before ordering* | **7/16** — 8/16 read it as "the dish is safe for me", 1 as "the dish is not on the menu" → issue to fix |

## Insight → fix
- **"Check First" misunderstood by 9/16** — a safety-relevant wording problem. Fix: show "Ask staff before ordering" under every Check First label; retest.
- Open feedback: extra steps and hard to go back · a little confused by the UI · show the menu photo again when ordering · photos must be under 8 MB · AI voice hard for staff to understand · clear short guide notes would help.

## Data notes
- Tester numbers in the sheet were **renumbered in time order (T01…T16) on 17 Nov** by the sheet owner. As first entered, the numbers had a duplicate (T13 twice) and a gap (no T03). Only the numbers changed; every answer is identical. `sessions.csv` keeps both: `Participant` (current) and `Tester no. as first entered`.
- U16 (23:56, 16 Nov) was submitted after the slides' first count (15 responses at 23:04).

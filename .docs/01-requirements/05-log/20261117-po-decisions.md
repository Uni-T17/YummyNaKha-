# Product Owner decisions — 2026-11-17

**Decided by:** Tay Zar Tun (6631503089), Product Owner · **Context:** sign-off before the
final presentation (Wed 18 Nov 2026). These are team decisions, not user evidence: no
new pain (`P#`) is added. Applied to the
[spec](../01-spec/20260907-01-menu-scan-personalization.md) (*Team decisions 2026-11-17*)
and the [backlog](../backlog.md) (rows changed are listed with each decision).

---

## D1 — Names of dishes not in the dish guide ("DEF-01" in my request)

**Decision:** show a **rough English name** built from the words the app recognises,
marked *"Rough translation — not in our dish guide"*. When no word is recognised, the
Thai name is the title, marked *"Not translated yet — ask staff"*. These dishes are
**always 🟡 Check First**. This replaces the 27 Oct rule "Thai name only, no
translation".

**Reasons**
- On a real café menu (16 Nov), "Thai only" gave 10 dishes the title "Unlisted dish",
  which made the results hard to use. The rough names ("Caesar salad", "Pork neck
  steak") are understandable, and the note says they are not from the guide.
- Safety is unchanged: the dish is still Check First with "confirm with restaurant
  staff", and its ingredients stay "may contain" (TC9 Group C: 20 of 20 Check First).

**Changed:** spec F7 and NFR3 (rough names are excluded from the translation-quality
measure), the 27 Oct decision row marked superseded · backlog B7.

**ID note:** in the [issue log](../../03-testing/03-issue-log.md), `DEF-01` is a
*different* defect (OCR.space missed 5 salad prices on the real menu). This decision is
recorded here as **D1** to avoid a clash.

## D2 — TC9 label set: approved

**Decision:** I approve all **60** dish/profile labels in
[`tc9-profile-matching.test.ts`](../../../YummyNaKha_App/tests/unit/tc9-profile-matching.test.ts)
as written: Group A (20 listed allergy / doctor conflicts → Avoid), Group B (20
unrelated allergies → not Avoid), Group C (20 dislikes, missing reason, spice, not in
guide, meat not named, OCR misread → Check First, never Top Pick).

**Reasons:** each label follows the spec rules F9, F10, LR12 and NFR4; the run of 17 Nov
met every threshold (A 0 missed, B 0 false Avoid, C 0 Top Pick)
([execution log](../../03-testing/02-test-execution-log.md)).

**Noted, not blocking:** a misread like ต้มยำกุ้ม loses shrimp from its ingredients, so
a shrimp allergy shows Check First instead of Avoid. It is a follow-up for the parser,
not a label error.

## D3 — Open values in the spec

| Item | Decision | Reason |
|---|---|---|
| **F1 OAuth provider** | **Google** | Built and deployed; the Google client is set up for the live site |
| **LR5 image clean-up window** | Photo bytes **deleted as soon as OCR has read them**. A photo that is never read stays until the user removes it or deletes the account | This is what the code does ([`process-image.ts`](../../../YummyNaKha_App/lib/server/ai/process-image.ts)). Automatic clean-up of never-read photos is open (B23 **partly built**) |
| **NFR6 hosting cost** | **0 THB per month** | The free deployment uses Vercel Hobby, Neon free and OCR.space free (500 scans a day), enough for user testing |
| **NFR8 usability target** | **Deferred** | No real-user usability test (SUS) has been run, so any number would be invented |

**Changed:** spec F1, LR5, NFR6, NFR8, the open-targets table and the scope list ·
backlog B1, B23, the NFR mapping and the blocked list.

## D4 — Third-party OCR on the free deployment (LR2)

**Decision:** the spec now matches the deployed app. Self-hosted, photos are read by our
own PaddleOCR. On the free deployment they are read by **OCR.space — photo only, after a
separate "Menu photo reading" consent** before the first scan. The optional Gemini
helper keeps its own separate consent.

**Reasons:** our OCR could not be hosted for free (the planned host turned out to be
paid). LR2 already allowed a provider to be reintroduced with disclosure and consent
before the first send, and the app does exactly that.

**Changed:** spec LR2 and the 27 Oct transfer-consent row · backlog B20.
**Still open:** teacher approval of OCR.space.

## D5 — Features built after Beta added to scope

**Decision:** add the features built on 15–17 Nov as requirements, and narrow F23.

| New | Item | Priority | Traces |
|---|---|---|---|
| F33 / B45 | Quantity per dish | Should | P2 |
| F34 / B46 | Thai request chips per dish | Should | P2, P3 |
| F35 / B47 | "Show to staff" full screen, screen kept on | Should | P2 |
| F36 / B48 | Listen to a Thai dish name (device voice) | Should | P2 |
| F37 / B49 | Search and sort by price | Could | P1 |
| F38 / B50 | Menu-order view, every line kept, show dish on photo | Should | P1, P5 |
| F39 / B51 | Colour themes | Could | P4 (U4, ease of use) |
| F40 / B52 | Add to home screen | Could | P5, P4 (U4) |

**F23 / B35** is narrowed to "voice output of **results**" (Won't); reading one dish name
aloud is F36.

**Reasons:** they all serve the one core workflow's last step (ordering in Thai) or make
the results easier to follow; none starts a second workflow. Themes and install trace
only to ease of use (U4), so they are Could. The Thai request and staff-card phrases
still need the Thai-literate review.

## Follow-ups I am asking for

1. **Aike (QA):** re-check issue-log `DEF-02`, `DEF-03` and `DEF-05`. They come from an
   earlier source review, but the current code has a separate `health-data` consent that
   can be withdrawn ([`lib/consent.ts`](../../../YummyNaKha_App/lib/consent.ts),
   [`withdraw API`](../../../YummyNaKha_App/app/api/consents/withdraw/route.ts)) and
   90-day access-log retention ([`access-log.ts`](../../../YummyNaKha_App/lib/server/access-log.ts)).
   Close them only after TC3, TC6 and TC14 are run.
2. **Team:** the Thai-literate review of the dish guide and the Thai phrases (B39, B42,
   B46) before real users.
3. **Charter:** it has all 5 members with IDs and roles, but **no team rules section**
   (communication, decisions, deadlines). I chose not to add one in this pass.

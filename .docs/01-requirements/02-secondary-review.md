# Secondary Evidence Review — YummyNaKha!

- Date: 2026-11-17
- Prepared by: Yoon Nadi (6631503099), Designer
- Related spec: [20260907-01-menu-scan-personalization.md](01-spec/20260907-01-menu-scan-personalization.md)

## Why this file exists

The pains P1–P5 in the spec come from **one source**: the YummyNaKha! user
**survey** of 2026-09-06 – 2026-09-07, **n = 6** (U1–U6), recorded in spec §1.2.

Check result (2026-11-17):

| Check | Result |
|---|---|
| Do P1–P5 trace to recorded user evidence in the repo? | **Yes.** Every pain cites U1–U6 rows in spec §1.2 |
| Are those records interviews? | **No.** They are survey responses (checkbox, rating, short free text) |
| Are raw survey exports or interview notes stored in the repo? | **No.** The spec table in §1.2 is the only record |
| Number of real interviews on file | **0** (fewer than 5) |

Because fewer than 5 interviews are on file, this review adds **published,
secondary evidence** to support (or limit) the pains. Nothing here is a
YummyNaKha! user. **No quotes or users are invented**; every item is labelled
**SECONDARY** and linked to its source.

---

## Evidence items

### S1 — Allergic travellers find eating abroad hard, and language is part of it

**SECONDARY** · Barnett J, Botting N, Gowland MH, Lucas JS (2012). *The strategies
that peanut and nut-allergic consumers employ to remain safe when travelling
abroad.* Clinical and Translational Allergy.
<https://pmc.ncbi.nlm.nih.gov/articles/PMC3480958>

- **Method:** qualitative semi-structured interviews, 32 UK adults with peanut or
  tree-nut allergy.
- **Finding:** participants described travel abroad as difficult and risky; they
  used translated allergy cards, learned the local word for the allergen to read
  menus, stuck to familiar or plain food, and some preferred English-speaking
  destinations.
- **Supports:** P3 (wanting help judging whether a dish fits a restriction) and
  P2 (relying on workarounds such as translation cards).
- **Does NOT prove:** anything about Thailand, Thai menus, or non-allergic
  diners; it is small, UK-only, nut-allergy-only, and from 2012. It does not show
  that an app would help.

### S2 — Restaurants are a major setting for serious allergic reactions, and staff knowledge is uneven

**SECONDARY** · Radke TJ et al. (2017). *Restaurant Food Allergy Practices — Six
Selected Sites, United States, 2014.* CDC MMWR 66(15):404–407.
<https://www.cdc.gov/mmwr/volumes/66/wr/mm6615a2.htm>

- **Method:** survey of 278 US restaurants; interviews with managers, food
  workers and servers.
- **Finding:** the report notes that nearly half of fatal food-allergy reactions
  over a 13-year period were linked to food from restaurants or food-service
  establishments. Only 44.4% of managers, 40.8% of food workers and 33.3% of
  servers reported food-allergy training.
- **Supports:** the product safety rule (LR12) and F11 — a menu photo cannot
  confirm preparation, and asking staff is necessary but not a guarantee. It
  justifies **🟡 / 🔴 + "confirm with restaurant staff"** rather than any "safe"
  wording.
- **Does NOT prove:** that Thai restaurants behave the same way (US data only),
  or that foreign diners in Thailand experience more reactions.

### S3 — English on Thai menus is not always understood by foreign tourists

**SECONDARY** · Srisongka N, Yanasugondha V (2019). *Intelligibility of English in
Thai Street Food Menus Perceived by East Asian Tourists.* LEARN Journal 12(2),
107–121.
<https://so04.tci-thaijo.org/index.php/LEARN/article/view/207826>

- **Method:** 100 tourists from China, Japan and South Korea rated English menu
  text from five Bangkok street-food areas.
- **Finding:** some kinds of "Thai English" on menus (lexico-semantic features,
  e.g. unusual word choices for dishes) were harder to understand than others.
- **Supports:** P1 — even when a menu has an English line, it may not be
  understandable; this is the gap a translation-plus-explanation step targets.
- **Does NOT prove:** difficulty with **Thai-only** menus (the study is about
  existing English text), or anything about Western or Myanmar diners, or about
  allergies.

### S4 — Menu OCR + translation by AI vision models is a recognised, still-imperfect problem

**SECONDARY** · Wu Z et al. (2025). *Evaluating Menu OCR and Translation: A
Benchmark for Aligning Human and Automated Evaluations in Large Vision-Language
Models* (MOTBench). arXiv:2504.13945.
<https://arxiv.org/abs/2504.13945>

- **Finding:** researchers built a dedicated benchmark because reading each
  dish, price and unit from complex menu layouts, then translating it, is hard
  enough to need its own evaluation; results differ between models.
- **Supports:** P4 (accuracy and trust) and the Charter risk "Extraction
  Accuracy"; supports keeping NFR2/NFR3 as measured targets, F12 (show what a
  result was based on), and the team's 27 Oct 2026 move from a Gemini-only
  pipeline to OCR plus a reviewed Thai dish guide (F27).
- **Does NOT prove:** any accuracy figure for **Thai** menus or for our OCR +
  dish-guide pipeline — MOTBench covers Chinese and English menus. Our own
  figures are in
  [the v1-vs-v2 evidence](../03-testing/evidence/2026-11-16-v1-vs-v2/README.md).

### S5 — The potential audience in Thailand is large (scale, not pain)

**SECONDARY** · Ministry of Tourism and Sports year-end figures, as reported by
Bangkok Post (Jan 2025): about **35.5 million** international arrivals in 2024.
<https://www.bangkokpost.com/thailand/general/2931152/kingdom-of-thailand-welcomed-35m-in-2024>

**SECONDARY** · ICEF Monitor (Apr 2024), citing Thailand's Ministry of Higher
Education, Science, Research and Innovation: **30,000+** international students
in Thai universities in 2022, up from 25,100 in 2019.
<https://monitor.icef.com/2024/04/the-rise-of-alternative-destinations-thailand-poland-and-the-philippines/>

- **Supports:** the Charter's choice of target users (foreigners and
  international students in Thailand) as a real, sizeable group.
- **Does NOT prove:** that these people cannot read Thai menus, how often they
  face the problem, or that they would use the app. Many arrivals are from
  countries whose travellers may use their own translation tools. Arrival counts
  are a **market size**, not a pain.

### S6 — Allergy charities already recommend translated "chef cards" as a workaround

**SECONDARY** · FARE — tips for international travel:
<https://www.foodallergy.org/resources/tips-international-travel> ·
Allergy UK — travelling with an allergy:
<https://www.allergyuk.org/living-with-an-allergy/traveling/>

- **Finding:** both organisations advise carrying an allergy card written in the
  local language to show restaurant staff.
- **Supports:** P2 (people already rely on manual workarounds) and the design of
  the **Order in Thai** screen (F14) — showing a screen in Thai to staff mirrors
  an existing, recommended behaviour.
- **Does NOT prove:** that chef cards work, or that the app is better than them.
  These are advice pages, not studies.

---

## Summary — what secondary evidence adds and what it cannot replace

| Pain | Survey (n=6) | Secondary support | Still unproven |
|---|---|---|---|
| P1 Thai menu hard to understand | U1–U6 | S3 | Thai-only menus specifically |
| P2 Depend on people and tools | U1, U2, U4, U5, U6 | S1, S6 | How many steps / how much time |
| P3 Help matching preferences/restrictions | U2, U3, U5 | S1, S2 | Whether our users actually have allergies |
| P4 Accuracy and trust | U1, U2, U4 | S2, S4 | Our pipeline's real accuracy on Thai menus |
| P5 Photo-based way to process a menu | U2, U5, U6 | — | — |

Secondary evidence **does not replace** real user evidence. It does not fill:

- the NFR1 baseline (time and steps with the user's current method) —
  still `TBD` in the spec;
- respondents' nationality and allergy status (spec §1.4);
- interviews — still **0** on file.

**Recommendation:** record at least 5 short interviews (or timed sessions) with
real target users and store the anonymised notes under
`.docs/01-requirements/` before claiming user validation beyond the survey.

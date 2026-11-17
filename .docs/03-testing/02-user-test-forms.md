# YummyNaKha! — User Test Forms (before vs. after)

Two Google Forms for the moderated user test in the [test plan §3.2–4](01-test-plan.md):

| Form | Filled in by | Purpose |
|---|---|---|
| **Form A — Moderator log** | a team member, one response per tester | The **measured** numbers: decision time, steps, correct choices, task success — before (own method) and after (YummyNaKha!) |
| **Form B — Tester survey** | the tester, on their own phone | Consent, background, how each method felt, **SUS**, and open feedback |

Time and steps are **measured by the moderator** (Form A), never estimated by the tester. These are the numbers for the "before vs. after" slide; their source is the Form A response sheet.

Goal: **15+ distinct real users** (pilot excluded), as required by NFR1 and the Charter.

---

## 0. Prepare before the first session

1. **Two Thai menus, A and B**, printed. Match them for number of dishes, price visibility and difficulty. Write an **answer key** for each: the dishes that fit the preference card, and the dishes that clash with it (contain mushrooms, or are very spicy). The answer key is checked by a Thai-literate team member.
2. **Preference card** (fictional — testers never share their own health data):

   > **You like:** chicken · **You avoid:** mushrooms · **Spice:** mild only

3. **Menu order** — swap menus to reduce learning effects:
   - **Odd tester numbers (T01, T03 …):** own method on **Menu A**, then YummyNaKha! on **Menu B**.
   - **Even tester numbers (T02, T04 …):** own method on **Menu B**, then YummyNaKha! on **Menu A**.
   - Always own method **first**, then the app (test plan: before-then-after).
4. A **fresh test account** per tester (or reset My Taste), the app open on the test phone, a stopwatch.
5. Tester numbers: T01, T02, … (no names anywhere).
6. Run **one pilot** session first; it does not count.

### Google Forms settings (both forms)
- Settings → Responses → **Collect email addresses: Do not collect**.
- **Limit to 1 response: Off** (it would force a Google sign-in and record the account).
- Presentation → **Show progress bar: On**.
- Responses → **Link to Sheets**, so each form fills a spreadsheet (this is your evidence).
- Do not add file-upload questions (they collect the tester's Google account).

### What counts as a "step" (same rule for both methods)
Count one step for each: photo taken · text typed or selected to translate · app or tab switched · a search · a question asked to the "staff" facilitator · a screen opened in YummyNaKha! (results, details, order) · a dish selected. Do **not** count scrolling or reading.

### Timing rule
- **Start** when the menu is handed over (own method) or when the tester starts the scan (app).
- **Stop** when the tester says their **two chosen dishes** out loud.
- **Cap: 5 minutes.** If reached, record 300 s and tick "Did not finish".
- Do not subtract waiting time (slow network or scan) — it is part of the real experience.

---

## Form A — Moderator log

**Title:** YummyNaKha! user test — Moderator log
**Description:** One response per tester. Fill in during the session. Times in seconds.

### Section 1 — Session
| # | Question | Type | Options / notes | Required |
|---|---|---|---|---|
| A1 | Tester number | Short answer | Validation: regex `^T\d{2}$` (e.g. T07) | Yes |
| A2 | Moderator (team member) | Dropdown | Tay Zar Tun · Aike Paung Bra · Chan Nyein Thu · Thiri Kyaw Khaing · Yoon Nadi | Yes |
| A3 | Date | Date | | Yes |
| A4 | App build / version | Short answer | e.g. Vercel deploy date or git commit | Yes |
| A5 | Test phone | Multiple choice | iPhone · Android · Other | Yes |
| A6 | Menu order | Multiple choice | Own method on A, app on B (odd tester) · Own method on B, app on A (even tester) | Yes |
| A7 | Pilot session? | Multiple choice | No — counts · Yes — pilot, exclude from results | Yes |

### Section 2 — BEFORE: tester's own method
Read aloud: *"You are at a Thai restaurant and can't read this menu. Using whatever you normally use, choose two dishes that fit this card. Say them out loud when you have decided."*

| # | Question | Type | Options / notes | Required |
|---|---|---|---|---|
| A8 | Method(s) used | Checkboxes | Google Lens / camera translate · Google Translate (typed) · Looked at pictures · Asked the "staff" facilitator · Asked a friend · Guessed · Other… | Yes |
| A9 | Decision time (seconds) | Short answer | Number, 0–300 | Yes |
| A10 | Steps counted | Short answer | Number | Yes |
| A11 | Finished within 5 minutes? | Multiple choice | Yes · No — did not finish (time = 300) | Yes |
| A12 | Dish 1 chosen (as written on the menu) | Short answer | | No |
| A13 | Dish 2 chosen | Short answer | | No |
| A14 | How many of the 2 chosen dishes clash with the card? (check answer key) | Multiple choice | 0 · 1 · 2 | Yes |
| A15 | Did the tester say they were unsure about ingredients? | Multiple choice | Yes · No | Yes |
| A16 | Notes / problems seen | Paragraph | Record quotes only if actually said | No |

### Section 3 — Setup in YummyNaKha! (T1, not timed for the comparison)
| # | Question | Type | Options / notes | Required |
|---|---|---|---|---|
| A17 | T1 — Saved "likes chicken" and "avoids mushrooms" (no allergy flag) | Multiple choice | Success alone · Success with help · Failed | Yes |
| A18 | T1 time (seconds) | Short answer | Number | No |

### Section 4 — AFTER: YummyNaKha! (T2 → T4, timed as one decision)
Read aloud, one at a time, T2 → T3 → T4 (test plan wording). **The stopwatch runs from the start of T2 until the tester says their two dishes in T4.**

| # | Question | Type | Options / notes | Required |
|---|---|---|---|---|
| A19 | Decision time T2 → T4 (seconds) | Short answer | Number, 0–300 | Yes |
| A20 | Steps counted | Short answer | Number | Yes |
| A21 | Finished within 5 minutes? | Multiple choice | Yes · No — did not finish (time = 300) | Yes |
| A22 | Scan time: upload → results shown (seconds) | Short answer | Number | No |
| A23 | T2 — Found the designated dish and its price correctly | Multiple choice | Success alone · Success with help · Failed | Yes |
| A24 | T3 — Explained why a dish is Check First and that staff must confirm | Multiple choice | Success alone · Success with help · Failed | Yes |
| A25 | T4 — How many of the 2 chosen dishes clash with the card? | Multiple choice | 0 · 1 · 2 | Yes |
| A26 | T4 — Thai order screen showed exactly the 2 dishes | Multiple choice | Yes · No | Yes |
| A27 | Thai-screen preparation time after deciding (seconds) | Short answer | Recorded separately, not in A19 | No |

### Section 5 — Change of mind (T5)
| # | Question | Type | Options / notes | Required |
|---|---|---|---|---|
| A28 | T5 — Moved chicken to Avoid and re-chose without rescanning | Multiple choice | Success alone · Success with help · Failed | Yes |
| A29 | T5 time (seconds) | Short answer | Number | No |

### Section 6 — Problems
| # | Question | Type | Options / notes | Required |
|---|---|---|---|---|
| A30 | Errors seen | Checkboxes | Wrong dish selected · Misread price · Missed a warning · Misunderstood consent · Got lost in navigation · App/scan failure · None | Yes |
| A31 | Worst problem — severity | Linear scale 1–4 | 1 cosmetic · 4 critical (safety/privacy) | No |
| A32 | Describe the problem, cause if known, and suggested fix | Paragraph | | No |

---

## Form B — Tester survey

**Title:** YummyNaKha! — Help us test our app
**Description:** Thank you for helping our SE Case Studies project. This takes about 5 minutes. We do **not** collect your name or email. Please answer honestly — there are no wrong answers.

### Section 1 — Consent
| # | Question | Type | Options / notes | Required |
|---|---|---|---|---|
| B1 | Your tester number (the moderator will tell you) | Short answer | Validation: regex `^T\d{2}$` | Yes |
| B2 | I understand that: my answers are anonymous and used only for this course project (SE Case Studies, 1/2569); I used a fictional preference card, not my own health information; I can stop at any time. | Multiple choice | I agree · I do not agree | Yes |

Set **"Go to section based on answer"** on B2: *I do not agree* → **Submit form**.

### Section 2 — About you
| # | Question | Type | Options / notes | Required |
|---|---|---|---|---|
| B3 | How well can you read Thai? | Multiple choice | Not at all · A few words · Some dishes · Most of a menu · Fluently | Yes |
| B4 | How often do you eat where the menu is only in Thai? | Multiple choice | Almost never · Monthly · Weekly · Several times a week · Daily | Yes |
| B5 | What do you usually do with a Thai menu you can't read? | Checkboxes | Google Lens / camera translate · Google Translate (typed) · Look at pictures · Ask staff · Ask a friend · Order something I already know · Guess · Other… | Yes |
| B6 | How long have you been in Thailand? | Multiple choice | Less than 3 months · 3–12 months · 1–3 years · More than 3 years · I'm Thai | No |

Do **not** ask about the tester's own allergies or medical conditions (PDPA — sensitive data; the test uses the fictional card).

### Section 3 — Your usual method (BEFORE)
*Think about the first round, when you used your own method.*

| # | Question | Type | Options / notes | Required |
|---|---|---|---|---|
| B7 | Choosing dishes with my usual method was easy. | Linear scale 1–5 | 1 Strongly disagree · 5 Strongly agree | Yes |
| B8 | I was confident my two dishes fit the card (no mushrooms, mild). | Linear scale 1–5 | same labels | Yes |
| B9 | I understood what was in the dishes I chose. | Linear scale 1–5 | same labels | Yes |

### Section 4 — YummyNaKha! (AFTER)
*Think about the second round, with YummyNaKha!.*

| # | Question | Type | Options / notes | Required |
|---|---|---|---|---|
| B10 | Choosing dishes with YummyNaKha! was easy. | Linear scale 1–5 | 1 Strongly disagree · 5 Strongly agree | Yes |
| B11 | I was confident my two dishes fit the card (no mushrooms, mild). | Linear scale 1–5 | same labels | Yes |
| B12 | I understood what was in the dishes I chose. | Linear scale 1–5 | same labels | Yes |
| B13 | What does **Check First** mean? | Multiple choice | The dish is safe for me · I should ask the restaurant staff before ordering · The dish is not on the menu · I don't know | Yes |
| B14 | I would trust the Order in Thai screen to order from staff. | Linear scale 1–5 | same labels | Yes |

B11/B12 mirror B8/B9 so each tester gives a self-reported before vs. after. B13 checks the safety message was understood (correct answer: *ask the restaurant staff*).

### Section 5 — Usability (SUS)
Section description: *"This system" means YummyNaKha!. Answer quickly with your first impression.*

Ten **Linear scale 1–5** questions (1 Strongly disagree · 5 Strongly agree), all **required**, wording **unchanged**, in this order:

| # | Statement |
|---|---|
| S1 | I think that I would like to use this system frequently. |
| S2 | I found the system unnecessarily complex. |
| S3 | I thought the system was easy to use. |
| S4 | I think that I would need the support of a technical person to be able to use this system. |
| S5 | I found the various functions in this system were well integrated. |
| S6 | I thought there was too much inconsistency in this system. |
| S7 | I would imagine that most people would learn to use this system very quickly. |
| S8 | I found the system very cumbersome to use. |
| S9 | I felt very confident using the system. |
| S10 | I needed to learn a lot of things before I could get going with this system. |

### Section 6 — Your opinion
| # | Question | Type | Options / notes | Required |
|---|---|---|---|---|
| B15 | Which would you rather use in a real restaurant? | Multiple choice | My usual method · YummyNaKha! · No preference | Yes |
| B16 | What was hardest in YummyNaKha!? | Paragraph | | No |
| B17 | What did the warnings (Check First / Avoid) mean to you? | Paragraph | | No |
| B18 | What would you change before using it in a restaurant? | Paragraph | | No |

---

## Results sheet formulas (Google Sheets)

Link both forms to Sheets, then add these columns.

**SUS score (0–100)** — Form B sheet, if S1…S10 are in columns **K…T** (adjust the letters to your sheet):

```
=2.5*((K2-1)+(5-L2)+(M2-1)+(5-N2)+(O2-1)+(5-P2)+(Q2-1)+(5-R2)+(S2-1)+(5-T2))
```

Score only complete rows. Report the **mean and median**; 68 is an average score (test plan §4).

**Decision-time reduction per tester** — Form A sheet, before time in **I**, app time in **S** (adjust):

```
=IF(OR(I2="",S2="",I2=0),"",(I2-S2)/I2)
```

Format as a percentage. Report the **median before**, **median after**, the **median of the per-tester reductions**, and **how many testers were faster with the app** (`=COUNTIF(<reduction column>,">0")`). Leave out pilot rows (A7) and report "did not finish" rows separately.

**Clashing dishes picked:** sum of A14 (before) vs. sum of A25 (after), out of 2 × number of testers.

### Slide row → source
| Slide number | Comes from |
|---|---|
| Time to choose (median, before vs. after) | Form A: A9 vs. A19 |
| Steps (median) | Form A: A10 vs. A20 |
| Clashing dishes picked | Form A: A14 vs. A25 |
| SUS | Form B: S1–S10, formula above |
| Understood "Check First" | Form B: B13, % answering "ask the restaurant staff" |
| Self-reported ease / confidence | Form B: B7–B9 vs. B10–B12 |

---

## Read-aloud script for the moderator

1. *"Thank you for helping. We're testing the app, not you. Please think aloud — tell us what you're looking at and why. You can stop at any time."*
2. Ask them to open **Form B** and answer Sections 1–2 (consent and about you).
3. Hand over the **preference card**. *"For this test, pretend these are your food preferences."*
4. **Before:** hand over the first menu (by tester number). Read the Section 2 instruction, start the stopwatch, count steps. Fill in Form A Section 2.
5. **App setup (T1):** read T1. Fill in Section 3.
6. **After (T2 → T4):** hand over the second menu. Read T2, start the stopwatch; then T3; then T4. Stop when they say their two dishes. Fill in Section 4.
7. **T5:** read T5. Fill in Section 5.
8. Ask them to finish **Form B** (Sections 3–6) without help.
9. Fill in Form A Section 6. Thank them.

Do not coach or explain the app during timed tasks. If the tester is stuck, note "with help" and only then assist.

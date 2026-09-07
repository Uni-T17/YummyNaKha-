---
name: capture-requirement
description: >-
  Capture raw interview and survey pain notes for YummyNaKha! and turn them into
  a numbered requirement spec (P/F/NFR/LR/Scope) plus backlog rows. Use when the
  team comes back from user interviews with messy notes, or when a new feature
  area needs specifying.
---

# Capture Requirement

Turn messy interview notes into a structured spec, then sync the backlog.

## Step 1 — collect the inputs

Ask the user for, and do not proceed without:

1. The **raw pain notes** (paste, or a file path). Who said it, and when.
2. A **topic name** for the file slug (e.g. `food-profile`,
   `menu-image-upload`, `dish-price-extraction`, `menu-translation`,
   `ingredient-inference`, `dietary-matching`, `recommendation-categories`,
   `order-in-thai`).
3. Confirmation that every pain came from a **real user interview or survey** —
   if one did not, stop and ask before writing it into the spec.

If anything is unclear, **ask and offer at least 3 options. Never guess.**
Never invent an interviewee, a quote, or a pain.

## Step 2 — hand off to the agent

Invoke the `requirement-writer` subagent with the pains and the topic. It
writes `.docs/01-requirements/01-spec/{YYYYMMDD}-{no}-{topic}.md` with the five
required parts:

1. Problem & users (P1, P2…)
2. Functional (F1, F2… + MoSCoW + `solves P<n>`)
3. Non-functional (NFR1… each with a number)
4. Legal (LR1… from [rule.md](../../../rule.md), each citing its law)
5. Scope (in / out / the ONE core workflow)

## Step 3 — sync and verify

1. The agent adds a backlog row for every **Must** `F` and every `LR`.
2. Run `/audit-backlog` and fix anything it reports.
3. Append a line to `.docs/01-requirements/05-log/{YYYYMMDD}-log.md`.
4. Report the files created or changed and suggest a commit message — for
   example:

```
Requirements: <topic> spec + backlog sync
```

**Never run `git commit` or `git push`.** The user reviews, stages, commits,
and pushes.

## Product reminders

- **Must** requirements stay inside the one core workflow: profile in → menu
  photo → extract + translate → match against profile → three categories →
  order in Thai.
- Every NFR needs a number (seconds, %, count) — "fast" and "accurate" fail
  review. Cover the project metric (time and steps to find and select suitable
  dishes vs the user's current method), extraction accuracy, translation
  quality, matching fidelity (missed conflicts stated separately from false
  alarms), latency, and cost / availability.
- Ordinary food preferences and dislikes are **normal** personal data under
  PDPA. Allergies, medical conditions, and doctor-advised restrictions are
  **potentially sensitive health data** — any spec touching them needs an
  explicit separate-opt-in LR.
- Any spec that sends menu images or profile data to a third-party OCR/AI
  provider needs a transfer-disclosure and data-minimisation LR.
- **Never** write a requirement or acceptance criterion saying a dish *is safe*.
  The only permitted clear-result phrasing is that no conflicting ingredient was
  detected from the available menu information. No safety scores or
  percentages — the three categories only.

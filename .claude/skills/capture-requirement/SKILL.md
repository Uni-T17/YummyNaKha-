---
name: capture-requirement
description: >-
  Capture raw interview pain notes for YummyNaKha! and turn them into a numbered
  requirement spec (P/F/NFR/LR/Scope) plus backlog rows. Use when the team comes
  back from user interviews with messy notes, or when a new feature area needs
  specifying.
---

# Capture Requirement

Turn messy interview notes into a structured spec, then sync the backlog.

## Step 1 — collect the inputs

Ask the user for, and do not proceed without:

1. The **raw pain notes** (paste, or a file path). Who said it, and when.
2. A **topic name** for the file slug (e.g. `food-profile`, `menu-extraction`,
   `dietary-rule-engine`, `recommendation-ranking`,
   `restaurant-communication`).
3. Confirmation that every pain came from a **real user interview** — if one did
   not, it must be written as a hypothesis marked `(H)`, never as a quote.

If anything is unclear, **ask and offer at least 3 options. Never guess.**
Never invent an interviewee, a quote, or a pain.

## Step 2 — hand off to the agent

Invoke the `requirement-writer` subagent with the pains and the topic. It
writes `.docs/01-requirements/01-spec/{YYYYMMDD}-{no}-{topic}.md` with the five
required parts:

1. Problem & users (P1, P2… ; unvalidated ones marked `(H)`)
2. Functional (F1, F2… + MoSCoW + `solves P<n>`)
3. Non-functional (NFR1… each with a number)
4. Legal (LR1… from [rule.md](../../../rule.md), each citing its law)
5. Scope (in / out / the ONE core workflow)

## Step 3 — sync and verify

1. The agent adds a backlog row for every **Must** `F` and every `LR`.
2. Run `/audit-backlog` and fix anything it reports.
3. Append a line to `.docs/01-requirements/05-log/{YYYYMMDD}-log.md`.
4. Commit and push:

```bash
git add . && git commit -m "Requirements: <topic> spec + backlog sync" && git push
```

## Product reminders

- **Must** requirements stay inside the one core workflow: food profile → menu
  photo → dish + price extraction → translation → dietary matching → three
  categories → restaurant-ready order text.
- Every NFR needs a number (seconds, %, count) — "accurate" and "fast" fail
  review. Extraction accuracy, conflict-detection recall, and scan latency all
  need figures.
- Allergies and dietary restrictions can reveal health or religion → sensitive
  data under PDPA, so any spec touching them needs an explicit-consent LR.
- Any spec that sends a menu photo or extracted text to a third-party OCR/AI
  service needs a transfer disclosure + data-minimisation LR, a bystander-data
  LR (menu photos capture more than the menu), and a reproducible-analysis-record
  LR.
- **No safety claims.** A requirement may never state or imply that a dish is
  safe, allergy-safe, guaranteed, or certified, and may never output a safety
  percentage. An Inferred allergen produces *Check Before Ordering*.
- Reject anything that needs a restaurant to register, upload data, or maintain
  a menu — that breaks the project's core constraint.

---
name: audit-design
description: >-
  Check the W4 design draft against the requirement spec before the W5 User
  Validation Gate. Verifies all four diagrams exist, every Must requirement is
  covered by a feature, every design element traces to an F, P, or LR id, and
  no screen claims allergy safety. Run after editing anything in
  .docs/02-design/.
---

# Audit Design

Verify that `.docs/02-design/` and `.docs/01-requirements/` agree, and that the
design draft meets the W5 gate criteria for **YummyNaKha!**.

## Steps

1. Read the spec(s) in `.docs/01-requirements/01-spec/` and `backlog.md`.
   Collect every `F`, `P`, `NFR`, and `LR` id with its MoSCoW priority.
2. Read every file in `.docs/02-design/`.
3. Report these lists:
   - **Missing diagrams** — the gate requires all four: context, use case,
     architecture, activity. Name any that is absent or empty.
   - **Uncovered Must requirements** — Must `F` items no feature covers, and
     `LR` items that appear in no design document.
   - **Orphan design elements** — features, journey steps, screens, or diagram
     nodes with no `F`/`P`/`LR` id behind them.
   - **Spec drift** — a feature whose MoSCoW priority disagrees with its F
     items, or a journey step describing behaviour no requirement states.
4. Gate-specific checks:
   - The **activity diagram** must show the consent step (LR1/LR2), the three
     evidence levels (Explicit / Inferred / Unknown) driving the category
     choice, the explicit-conflict branch, the allergen-uncertainty branch, and
     the OCR/AI-outage fallback.
   - The **architecture diagram** must state **one explicit trade-off**, and
     must show the dietary rule engine, uncertainty logic, and ranking as
     team-built components separate from the AI gateway.
   - The **user journey** must cover the one core workflow end to end: food
     profile → menu photo → extraction → translation → dietary matching → three
     categories → restaurant-ready order text, finishing at the table.
   - Every pain `P1`–`P4` must be relieved at some named journey step.
5. **Safety-copy check — any hit is an automatic fail.** Grep every design file
   for `safe`, `allergy-safe`, `guaranteed`, `certified`, `verified`, `100%
   free`, and safety percentages. The only permitted phrasings are *"No
   conflicting ingredient was detected from the available menu information."*
   and *"This dish may contain or commonly be served with your allergen. Please
   confirm with restaurant staff."* Also fail any design that shows a numeric
   safety score instead of the four categories.
6. If two items look like the same thing but are worded differently, **do not
   merge them silently — ask**, and offer at least 3 options.

## Output

A short pass/fail summary, then the lists above with exact ids and file names.
Do not edit any file unless the user asks you to fix a specific gap.

## Rule

If anything is unclear, ask and offer at least 3 options. Never guess.

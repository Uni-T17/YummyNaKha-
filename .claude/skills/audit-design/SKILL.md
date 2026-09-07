---
name: audit-design
description: >-
  Check the W4 design draft for YummyNaKha! against the requirement spec before
  the W5 User Validation Gate (Sep 9 2026). Verifies all four diagrams exist,
  every Must requirement is covered by a feature, every design element traces to
  an F, P, or LR id, and no screen claims a dish is allergy-safe. Run after
  editing anything in .docs/02-design/.
---

# Audit Design

Verify that `.docs/02-design/` and `.docs/01-requirements/` agree, and that the
design draft meets the W5 gate criteria.

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
   - The **activity diagram** must show the consent step before menu or profile
     data reaches the third-party OCR/AI provider, and the **uncertainty
     branch** that decides between 🟢 recommended / 🟡 check before ordering /
     🔴 conflict.
   - The **architecture diagram** must state **one explicit trade-off**.
   - The **user journey** must cover the one core workflow end to end: profile
     in → menu photo → extract + translate → match against profile → three
     categories → order in Thai.
   - Every pain (`P1`, `P2`, …) must be relieved at some named journey step.
   - The **prototype** must have a screen for each Must feature, and a linked
     placeholder or real link for the Designer's visual file.
5. **Safety-wording check** — no screen, acceptance criterion, journey step, or
   diagram node may claim a dish **is safe**, or show a safety score or
   percentage. Grep for `safe`, `guaranteed`, `certified`,
   `nutritionist-approved`, `doctor-approved`, `100% accurate`, `allergy-free`.
   Confirm every 🟡 and 🔴 result in the design tells the user to check with
   restaurant staff. Report every hit with file and line.
6. If two items look like the same thing but are worded differently, **do not
   merge them silently — ask**, and offer at least 3 options.

## Output

A short pass/fail summary, then the lists above with exact ids, file names, and
line numbers. Do not edit any file unless the user asks you to fix a specific
gap.

## Rule

If anything is unclear, ask and offer at least 3 options. Never guess.

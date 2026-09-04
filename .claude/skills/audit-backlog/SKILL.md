---
name: audit-backlog
description: >-
  Check that the requirement specs and the backlog are in sync. Every
  Must-priority functional requirement and every legal requirement (LR) must
  have a backlog row, and every backlog row must trace to a real requirement
  ID. Run after editing any spec or the backlog.
---

# Audit Backlog

Verify that `.docs/01-requirements/backlog.md` and the specs in
`.docs/01-requirements/01-spec/` agree, for **YummyNaKha!**.

## Steps

1. Read every spec file in `.docs/01-requirements/01-spec/`. Collect:
   - every functional requirement ID and its MoSCoW priority (`F1 Must`, …)
   - every legal requirement ID (`LR1`, `LR2`, …)
   - every interview pain ID (`P1`, `P2`, …) and whether it carries `(H)`
2. Read `.docs/01-requirements/backlog.md`. Collect every row and its
   `Traces to:` references.
3. Report five lists:
   - **Missing** — Must `F` items and every `LR` with no backlog row.
   - **Orphan** — backlog rows whose `Traces to:` points to an ID that does
     not exist in any spec, or is empty.
   - **Priority mismatch** — a backlog row placed under the wrong MoSCoW
     heading versus the spec.
   - **Untraced pain** — a pain (`P<n>`) no functional requirement solves.
   - **Unvalidated pains** — every pain still marked `(H)`, listing the Must
     rows built on it. A warning before W5; a **failure at the W5 gate**.
4. **Scope creep check** — every **Must** row must belong to the one core
   workflow: food profile → menu photo → dish + price extraction → translation →
   dietary matching → three categories → restaurant-ready order text. Flag any
   Must row that starts a second workflow.
5. **Product-rule check** — grep the specs and backlog and fail on:
   - safety wording: `safe`, `allergy-safe`, `guaranteed`, `certified`,
     `verified`, `100% free`, or any safety percentage
   - any row requiring restaurant registration, POS integration, QR setup, or
     admin-maintained menu data
   - any row that lets an **Inferred** ingredient produce a clear verdict on an
     allergen instead of *Check Before Ordering*
6. If two items look like the same thing but are worded differently, **do not
   merge them silently — ask**, and offer at least 3 options (merge / keep
   separate / rename one).

## Output

A short pass/fail summary, then the lists above with the exact IDs.
Do not edit any file unless the user asks you to fix a specific gap.

## Rule

If anything is unclear, ask and offer at least 3 options. Never guess.

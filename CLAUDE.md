# CLAUDE.md

Project context for Claude Code. Loaded automatically at the start of every session.

## Project

**YummyNaKha!** — a personalized multilingual restaurant menu understanding and
recommendation system. A diner saves a food profile once (allergies, dietary
restrictions, dislikes, preferences, preferred language), then photographs a
restaurant menu written in a language they cannot read. The system extracts dish
names and prices, translates them, infers likely ingredients, checks every dish
against the profile, and returns the menu split into **Recommended /
Check Before Ordering / Conflict** — then generates restaurant-ready Thai text
for asking about an ingredient or ordering with a modification.

> Don't just translate the menu. Find what's yummy for you.

Team: **_TBD_** (SE Case Studies, 1305493, 1/2569).
Source of truth for vision, roles, and scope:
[YummyNaKha! - Charter.md](YummyNaKha!%20-%20Charter.md).
Original product brief: [YummyNaKha_Project_Brief.md](YummyNaKha_Project_Brief.md).

Course phase: **DISCOVER** (W1–W5). No production code yet — the work right now
is requirements, backlog, design, and compliance, ending at the User Validation
Gate (W5, Sep 9 2026).

## The safety rule that outranks everything

YummyNaKha! analyses a **photograph of a menu**. It cannot see the sauce, the
cooking oil, the garnish, the recipe variation, or the kitchen. Therefore:

- **Never** write, generate, design, or approve copy that says a dish is
  "safe", "allergy-safe", "guaranteed", "certified", or "100% free of X".
- The only permitted phrasing for a clear result is:
  *"No conflicting ingredient was detected from the available menu information."*
- The only permitted phrasing for an uncertain allergen is:
  *"This dish may contain or commonly be served with your allergen. Please
  confirm with restaurant staff."*
- Keep the three evidence levels structurally separate — **Explicit** (in the
  menu text), **Inferred** (commonly true of the dish), **Unknown** (no
  information). An Inferred ingredient may never produce a clear verdict on an
  allergen; it produces *Check Before Ordering*.
- Never show a safety percentage. Categories only: **Top Match / Recommended /
  Check Before Ordering / Conflict**.

This rule applies to requirements, acceptance criteria, wireframe copy, diagram
labels, and any generated text — not just to the shipped UI.

## Legal & compliance rules — always apply

All agent behaviour and every requirement must comply with the team's legal
rules in **[rule.md](rule.md)** (from Week 2). It covers three Thai laws:

- **PDPA** — allergies and dietary restrictions reveal health/religion and are
  **sensitive data** needing explicit, separate opt-in; disclose and consent
  before sending menu images or dietary flags to a third-party OCR/AI service
  and send minimum fields only; menu photos may capture bystanders, so raw
  images are retained no longer than extraction needs and are separately
  deletable; scan history used only for the user's own history and extraction
  quality; full delete on account deletion; store only login tokens, never
  credentials.
- **Computer Crime Act §26** — keep access/traffic logs (account ID, IP,
  timestamp) for ≥90 days for user-created content (uploaded menu photos,
  corrected dish names, saved scans, custom phrases, feedback reports), retained
  even after the item is edited or deleted.
- **Electronic Transactions Act §9 / 26 / 28** — retrievable acceptance records
  for Terms / AI & Allergy Safety Disclaimer and for consent (and withdrawal);
  reproducible analysis records (extracted text, translation, ingredient
  inferences with evidence levels, categories, profile snapshot, model version,
  timestamp) and the generated restaurant phrase; admin overrides stored
  unalterably; no "certified" or allergy-safety language, ever.

When writing a requirement spec, fold the Must-have rules above into the spec
as numbered legal requirements (LR1, LR2, LR3…). Do not leave `rule.md` as a
separate file only.

## Product guardrails (from the Charter)

- **One core workflow** this semester: *food profile in → menu photo → dish +
  price extraction → translation → dietary matching → three categories →
  restaurant-ready Thai order out.* Anything outside that chain is
  Should/Could/Won't.
- **Open → Upload menu → Decide → Order.** If a proposed feature adds a step to
  that line, it needs a strong reason.
- **No restaurant-side dependency.** No restaurant registration, POS
  integration, QR setup, admin-maintained menu data, or community-contributed
  menu database. The first user must get full value from their first scan.
- **Not an AI API wrapper.** OCR and the language model produce *structured
  input*; the dish normalisation, dietary rule engine, uncertainty logic, and
  ranking are team-built and testable on their own. A requirement that just says
  "ask the AI" is not a requirement.
- **Measurable metric** — before/after time-to-decide and number of steps for a
  real user choosing from a Thai-only menu, versus their current method.
- Known risks to respect in every requirement: hidden ingredients, AI
  hallucination, OCR quality on real photographed menus, false confidence,
  competition from generic AI assistants, third-party cost/availability, and
  self-reported measurement.

## Repository structure

```
.claude/
  agents/
    requirement-writer.md      # raw pain notes -> requirement spec + backlog update
    backlog-auditor.md         # read-only sync check between specs and backlog
    design-writer.md           # spec -> feature list, journey, prototype, 4 diagrams
  skills/
    capture-requirement/SKILL.md  # invoke: /capture-requirement
    audit-backlog/SKILL.md        # invoke: /audit-backlog
    audit-design/SKILL.md         # invoke: /audit-design
.docs/
  01-requirements/
    01-spec/{YYYYMMDD}-{no}-{topic}.md   # one requirement spec per topic
    backlog.md                           # prioritised backlog, MoSCoW
    05-log/{YYYYMMDD}-log.md             # work log
  02-design/                             # W4 design draft
    01-feature-list.md                   # FE1..FEn, acceptance criteria
    02-user-journey.md                   # the one core workflow, step by step
    03-prototype.md                      # low-fi wireframes (no code)
    04-diagrams/                         # context, use case, architecture, activity
CLAUDE.md
rule.md                                  # legal/compliance rules (from W2)
YummyNaKha! - Charter.md                 # W1 company charter
YummyNaKha_Project_Brief.md              # original product brief
```

### Requirement spec files (`.docs/01-requirements/01-spec/`)

Filename: `{YYYYMMDD}-{no}-{topic}.md`
(e.g. `20260904-01-menu-scan-personalization.md`). Each spec has five parts:

1. **Problem & users** — who is affected + interview pains (P1, P2, P3…)
2. **Functional** — F1, F2… as user stories (`As a…, I want…, so that…`) with
   MoSCoW priority (Must / Should / Could / Won't)
3. **Non-functional** — NFR1, NFR2… each measurable (time, count, %) — never
   "fast" or "accurate"
4. **Legal** — LR1, LR2… pulled from `rule.md`
5. **Scope** — in / out, and the ONE core workflow this phase builds

### Backlog (`.docs/01-requirements/backlog.md`)

Every backlog row traces back to a requirement ID and a real interview pain
(`Traces to: F1, P1`). No made-up requirements with no source.

### Validation status — read before writing any spec

The project is at **problem-validation** stage. The pains in the current spec
are marked **`(H)` — hypothesis, not yet evidenced**, drawn from the Charter and
the Brief, **not** from interviews. They are placeholders that must be replaced
or confirmed by ≥15 real user interviews before the W5 gate.

- A pain marked `(H)` may never be quoted as if a user said it.
- When a real interview confirms a pain, drop the `(H)` and add the evidence row
  (interviewee, date, quote) to the evidence log.
- If interviews contradict a hypothesis, delete it and everything that traced to
  it — do not keep a requirement whose reason has disappeared.

## Working rules

- If anything is unclear, **ask and offer at least 3 options. Never guess.**
- Never fabricate interview pains or user quotes. Every un-flagged `P<n>` in a
  spec comes from a real user interview; hypotheses carry `(H)`.
- Never write copy that claims allergy safety — see the safety rule above.
- Keep the spec and the backlog in sync — run `/audit-backlog` after changes.
- Commit and push after any change under `.claude/` or `.docs/`
  (`git add .` → `git commit -m "…"` → `git push`).

# CLAUDE.md

Project context for Claude Code. Loaded automatically at the start of every
session.

## Project

**YummyNaKha!** — a personalized menu app for people who cannot easily read
Thai restaurant menus. A user saves a food profile once (favorite foods,
allergies, doctor-advised food restrictions), then uploads a photo of a
Thai-language menu. The system extracts each dish name and price, translates the
menu Thai → English, infers likely ingredients, checks every dish against the
profile, and splits the menu into three categories — **🟢 recommended**,
**🟡 check before ordering**, **🔴 conflict**. The user selects dishes and opens
a separate page that shows those dishes back in Thai for ordering. Goal: a diner
decides faster and with fewer steps than translating a menu line by line.

Team: **5-Idiots** (SE Case Studies, 1305493, 1/2569).
Source of truth for vision, roles, and scope:
[YummyNaKha! - Charter.md](YummyNaKha!%20-%20Charter.md) and
[YummyNaKha_Project_Brief.md](YummyNaKha_Project_Brief.md).

## Course phase

**DISCOVER** (W1–W5). No production code yet — the work right now is
requirements, backlog, design, and compliance, ending at the User Validation
Gate.

### Course milestones

- **W5 — Sep 9, 2026:** User Validation Gate — Project Discover Gate
- **W6 — Sep 16, 2026:** Scope Lock / Sprint 0
- **W8 — Oct 7, 2026:** Alpha Demo Day — Project Build Gate
- **W11 — Oct 28, 2026:** Beta Review Day — Project Test Gate
- **W12 — Nov 4, 2026:** Real-user Validation and Sign-off
- **W13–W14 — Nov 11–18, 2026:** Final Project Presentations

## Legal & compliance rules — always apply

All agent behaviour and every requirement must comply with the team's legal
rules in **[rule.md](rule.md)** (three Thai laws, plus a product safety rule):

- **PDPA** — ordinary food preferences (spicy level, soft/hard food, favourites,
  dislikes) are normal personal data; **allergies, medical conditions, and
  doctor-advised restrictions** are potentially sensitive health data needing an
  explicit, separate opt-in and staying editable/deletable. Disclose the
  transfer and get consent before sending profile or menu data to a third-party
  OCR/AI provider, and send **minimum fields only** (menu text + relevant
  profile flags, never account email or real name). Profile and menu data are
  used only for menu understanding and recommendation. Full delete on account
  deletion. Store only login tokens, never provider credentials.
- **Computer Crime Act §26** — where the service-provider obligation applies,
  keep traffic/access logs (account ID, IP, timestamp) for **≥ 90 days**,
  separate from content. Do **not** retain food profiles, menu images, scan
  history, or selected dishes for 90 days merely because of §26 — their
  retention follows their own purpose and the PDPA rules.
- **Electronic Transactions Act §9 / 26 / 28** — retrievable, versioned
  acceptance records for the Terms / AI & Accuracy Disclaimer and for each
  consent **and its withdrawal**. AI-processing records (model version, OCR
  result, translation, profile snapshot, timestamp, recommendation) are kept as
  an **internal quality measure**, not claimed as a statutory mandate. No
  "certified", "nutritionist-approved", "doctor-approved", or "100% accurate"
  language in the UI.
- **Product safety rule** — never state a dish is *safe* for an allergy or
  medical restriction from menu information alone. The only clear-result
  phrasing is that **no conflicting ingredient was detected from the available
  menu information**. No safety score or percentage — the three categories only.
  Every 🟡 and 🔴 result tells the user to confirm with restaurant staff.

When writing a requirement spec, fold the Must-have rules above into the spec as
numbered legal requirements (LR1, LR2, LR3…). Do not leave `rule.md` as a
separate file only.

## Product guardrails (from the Charter & Brief)

- **One core workflow** this semester: *profile in → menu photo → extract +
  translate → match against profile → three categories → order in Thai.*
  Anything outside that chain is Should / Could / Won't.
- **Measurable metric** — before/after **time to find and select suitable
  dishes** from a Thai menu (user's current method vs YummyNaKha!), with number
  of steps as a secondary measure, over **15+ real users**.
- Known risks to respect in every requirement: extraction accuracy from photos,
  incomplete menu information (hidden sauces/oil/garnish), AI ingredient-
  inference errors, unverifiable restaurant preparation and cross-contact,
  careful safety wording for allergy/medical results, third-party AI cost and
  availability, and the difficulty of a self-reported / task-timed metric.

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
rule.md                                  # legal / compliance rules
YummyNaKha! - Charter.md                 # W1 project charter
YummyNaKha_Project_Brief.md              # original product brief
```

### Requirement spec files (`.docs/01-requirements/01-spec/`)

Filename: `{YYYYMMDD}-{no}-{topic}.md`
(e.g. `20260907-01-menu-scan-personalization.md`). Each spec has five parts:

1. **Problem & users** — who is affected + interview pains (P1, P2, P3…)
2. **Functional** — F1, F2… as user stories (`As a…, I want…, so that…`) with
   MoSCoW priority (Must / Should / Could / Won't)
3. **Non-functional** — NFR1, NFR2… each measurable (time, count, %) — never
   "fast" or "good"
4. **Legal** — LR1, LR2… pulled from `rule.md`
5. **Scope** — in / out, and the ONE core workflow this phase builds

### Backlog (`.docs/01-requirements/backlog.md`)

Every backlog row traces back to a requirement ID and a real interview pain
(`Traces to: F1, P1`). No made-up requirements with no source.

## Working rules

- If anything is unclear, **ask and offer at least 3 options. Never guess.**
- Never fabricate interview pains or user quotes. Every `P<n>` in a spec comes
  from a real user interview or survey.
- Keep the spec and the backlog in sync — run `/audit-backlog` after changes.
- Keep the design draft in sync with the spec — run `/audit-design` after
  changes under `.docs/02-design/`.

## Git and documentation rules

- Treat `.docs/`, `.claude/`, `CLAUDE.md`, and `rule.md` as version-controlled
  project documentation, kept synchronized with approved requirements, design
  decisions, scope changes, and implementation updates.
- Claude may create, edit, move, or delete project files when the user's task
  requires it.
- Claude may use read-only Git commands (`git status`, `git diff`, `git log`) to
  inspect repository state.
- Claude must **never** run `git commit` or `git push`.
- Claude must not run `git pull`, `git merge`, `git rebase`, `git reset`,
  force-push, or any other command that rewrites history or syncs with a remote,
  unless the user explicitly instructs it.
- After a meaningful change, Claude summarizes which files were created,
  modified, moved, or deleted, and may suggest a commit message — but must not
  execute the commit.
- The user is solely responsible for reviewing, staging, committing, and
  pushing. Do not assume a completed file change has been committed or pushed.

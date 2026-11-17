# YummyNaKha! — Final Hand-in Index

Team **5-Idiots** · SE Case Studies 1305493, 1/2569 · Repo: `Uni-T17/YummyNaKha-`
Everything is on **`main`** unless a branch is named. What's on each other branch: [branches.md](branches.md). Only `kit` has commits that aren't on `main`, and it holds an old copy of the Charter and Brief.

Labels: **MISSING** = not in the repo. **SECONDARY** = published or public evidence, not our users. **PROXY** = people outside the team, not target users.

## Team

| Name | Student ID | Role | Git author names | Role statement |
|---|---|---|---|---|
| Tay Zar Tun | 6631503089 | Product Owner | `Uni-T17` (GitHub repo owner) | [6631503089-tay-zar-tun.md](role-statements/6631503089-tay-zar-tun.md) |
| Aike Paung Bra | 6631503052 | QA / Tester | `Aike Paung Bra`, `paung29` | [6631503052-aike-paung-bra.md](role-statements/6631503052-aike-paung-bra.md) |
| Chan Nyein Thu | 6631503055 | AI Lead | `CHAN NYEIN THU` | [6631503055-chan-nyein-thu.md](role-statements/6631503055-chan-nyein-thu.md) |
| Thiri Kyaw Khaing | 6631503093 | Tech Lead | `thiri-kyaw-khaing` | [6631503093-thiri-kyaw-khaing.md](role-statements/6631503093-thiri-kyaw-khaing.md) |
| Yoon Nadi | 6631503099 | Designer | `Yoon Nadi`, `Yoon03-cloud` | [6631503099-yoon-nadi.md](role-statements/6631503099-yoon-nadi.md) |

Commit counts don't show all the work. Some members' work was committed through another account; each role statement links that person's own files.

## 1. Discover

| Item | Link |
|---|---|
| Company Charter (members, roles, team rules) | [YummyNaKha! - Charter.md](../../YummyNaKha!%20-%20Charter.md) · [Project Brief](../../YummyNaKha_Project_Brief.md) · [Proposal (PDF)](../../YummyNaKha_Project_Proposal.pdf) |
| Real-user interviews (≥ 5) and pains | **MISSING:** 0 interview records on file. The pains P1… come from survey responses summarised in the [spec §1](../01-requirements/01-spec/20260907-01-menu-scan-personalization.md); the raw survey export is not in the repo. |
| SECONDARY review of the problem | [02-secondary-review.md](../01-requirements/02-secondary-review.md) |
| Lean Canvas (optional) | [03-lean-canvas.md](../01-requirements/03-lean-canvas.md) |
| Requirements (spec: P / F / NFR / LR / Scope) | [20260907-01-menu-scan-personalization.md](../01-requirements/01-spec/20260907-01-menu-scan-personalization.md) |
| Product Backlog (MoSCoW, MUST marked) | [backlog.md](../01-requirements/backlog.md) · PO decisions: [20261117-po-decisions.md](../01-requirements/05-log/20261117-po-decisions.md) · work log: [20260907-log.md](../01-requirements/05-log/20260907-log.md) |
| PDPA and legal requirements | [rule.md](../../rule.md), folded into the spec as LR1… |
| How the team uses AI | [CLAUDE.md](../../CLAUDE.md) (*How our team uses AI*) · agents [`.claude/agents/`](../../.claude/agents) · skills [`.claude/skills/`](../../.claude/skills) |

## 2. Build

| Item | Link |
|---|---|
| Use case diagram | [02-use-case.md](../02-design/04-diagrams/02-use-case.md) |
| Activity diagram | [04-activity.md](../02-design/04-diagrams/04-activity.md) |
| Sequence diagram (menu analysis) | [06-sequence-analyze.md](../02-design/04-diagrams/06-sequence-analyze.md) |
| ER diagram | [05-er-diagram.md](../02-design/04-diagrams/05-er-diagram.md) |
| Context diagram | [01-context.md](../02-design/04-diagrams/01-context.md) |
| Architecture | [03-architecture.md](../02-design/04-diagrams/03-architecture.md) · [v2 proposal](../02-design/05-architecture-v2-proposal.md) |
| Design: features, journey, prototype | [01-feature-list.md](../02-design/01-feature-list.md) · [02-user-journey.md](../02-design/02-user-journey.md) · [03-prototype.md](../02-design/03-prototype.md) · screens [images/](../02-design/images) · [YummyNaKha! Design.zip](../../YummyNaKha!%20Design.zip) |
| Source code | [YummyNaKha_App/](../../YummyNaKha_App) (Next.js app) · [ocr-service/](../../YummyNaKha_App/ocr-service) (PaddleOCR) |
| Our own tests | [tests/unit/](../../YummyNaKha_App/tests/unit) (Vitest: TC7, TC9) · [API checks + TC9 sweep](../03-testing/evidence/2026-11-17-api-and-sweep/README.md) · [v1 vs v2 eval harness](../03-testing/evidence/2026-11-16-v1-vs-v2/README.md) |
| How to run (setup, .env.example, test account) | [YummyNaKha_App/README.md](../../YummyNaKha_App/README.md) · [.env.example](../../YummyNaKha_App/.env.example) · test user seed [scripts/seed-test-user.ts](../../YummyNaKha_App/scripts/seed-test-user.ts) |
| No secrets | No `.env` files tracked; only `.env.example` files. The secret check is in [Thiri's role statement](role-statements/6631503093-thiri-kyaw-khaing.md). |

## 3. Test

| Item | Link |
|---|---|
| Test Plan | [01-test-plan.md](../03-testing/01-test-plan.md) |
| Test execution and results | [02-test-execution-log.md](../03-testing/02-test-execution-log.md) (Vitest TC7/TC9: 23/23) · [02-test-results.md](../03-testing/02-test-results.md) (API and logic run: TC1, TC3, TC4, TC6, TC9, TC14 pass) |
| Real-user session logs (U01…) | [sessions.csv](../03-testing/user-test/sessions.csv): U01–U16, real-user test 16 Nov 2026 (n = 16) · summary [user-test/README.md](../03-testing/user-test/README.md) |
| Before / After for every MUST task | [comparison-table.md](comparison-table.md): partly measured; unmeasured rows say "Not measured" |
| SUS | [sus-results.md](../03-testing/user-test/sus-results.md): mean **72.5**, n = 16 · forms: [02-user-test-forms.md](../03-testing/02-user-test-forms.md) |
| Issue log (severity, fix commit, retest) | [03-issue-log.md](../03-testing/03-issue-log.md) |

## 4. Deliver

| Item | Link |
|---|---|
| Case study (Problem, Process, Outcome, live URL) | [case-study.md](case-study.md) · live app: https://yummy-na-kha.vercel.app |
| AI logic (Where, How, Prove, Measure) | [ai-logic.md](ai-logic.md) |
| Comparison table (incl. AI row) | [comparison-table.md](comparison-table.md) · AI before/after: [ai-logic.md §4](ai-logic.md#4-measure) |
| Role statements | [role-statements/](role-statements): all 5 members |

## 5. Other supporting documents

| Item | Link |
|---|---|
| AI in the system (data, pipeline, evaluation, limits, failure handling) | [ai-logic.md](ai-logic.md) · [v1 vs v2 evaluation](../03-testing/evidence/2026-11-16-v1-vs-v2/README.md) |
| User guide | [user-guide.md](user-guide.md) |
| Data sources and permissions | [data-sources.md](data-sources.md) (items marked **TO CONFIRM** still need a licence or permission check) |
| Branch report | [branches.md](branches.md) |
| Deployment notes | [DEPLOY.md](../../YummyNaKha_App/DEPLOY.md) · [DEPLOY-FREE.md](../../YummyNaKha_App/DEPLOY-FREE.md) |
| Thai dish guide (data source, draft) | [lib/server/thai-food/](../../YummyNaKha_App/lib/server/thai-food) · checks: `npm run guide:check` |

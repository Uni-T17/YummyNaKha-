# Role Statement — Chan Nyein Thu (6631503055)

**Role:** AI Lead · Team 5-Idiots · YummyNaKha!

> **DRAFT — Chan to check before committing.** The lines marked ⚠ are claims from the Charter that git can't confirm on its own. Keep them only if they are true, and say how the work reached the repo.

I was AI Lead. I owned the team's AI tooling and governance, and the evidence for the AI parts of the product.

**What I owned**
- **AI evaluation and test evidence.** I ran the API and logic checks for TC1, TC3, TC4, TC6, TC9 and TC14: 47/47 API checks, a 60-pair TC9 set with 0/20 missed conflicts, and a sweep of 741 results. Results: [02-test-results.md](../../03-testing/02-test-results.md) · scripts and raw output: [evidence/2026-11-17-api-and-sweep/](../../03-testing/evidence/2026-11-17-api-and-sweep/README.md).
- **AI documentation.** [ai-logic.md](../ai-logic.md) covers where AI is used, why we moved from Gemini-only (v1) to OCR + dish guide (v2), the evidence, the measures and the failure handling. I also wrote the *How our team uses AI* section of [CLAUDE.md](../../../CLAUDE.md).
- **Final hand-in index.** [README.md](../README.md) links every rubric item and marks what is MISSING.
- ⚠ **Claude Code agents and skills:** [`.claude/agents/`](../../../.claude/agents) and [`.claude/skills/`](../../../.claude/skills), plus the requirement spec and backlog (Charter: "builds the agents and skills, the spec and backlog"). These were committed under the `Uni-T17` account (`dad8658`, `973050c`, `9cf668b`). *Confirm that you wrote them, or remove this line.*
- **My own commits:** `b16dcb7` and `9a115ed` (use case diagram upload, 8 Sep) and `1c42ddf` (Hugging Face client error handling, 22 Sep).

**AI disclosure**
I used Claude Code (Claude) to run the tests, write the test scripts, and draft ai-logic.md, the index, the CLAUDE.md section and this statement. I chose what to test, checked the results against the files, and approved each change. Claude did not commit or push. Every number above links to a file in the repo.

## Reflection

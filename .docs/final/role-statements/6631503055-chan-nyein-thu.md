# Role Statement — Chan Nyein Thu (6631503055)

**Role:** AI Lead · Team 5-Idiots · YummyNaKha!

I was AI Lead. I owned the team's AI tooling and governance, and the evidence for the AI parts of the product.

**What I owned**
- **AI evaluation and test evidence.** I ran the API and logic checks for TC1, TC3, TC4, TC6, TC9 and TC14: 47/47 API checks, a 60-pair TC9 set with 0/20 missed conflicts, and a sweep of 741 results. Results: [02-test-results.md](../../03-testing/02-test-results.md) · scripts and raw output: [evidence/2026-11-17-api-and-sweep/](../../03-testing/evidence/2026-11-17-api-and-sweep/README.md).
- **AI documentation.** [ai-logic.md](../ai-logic.md) covers where AI is used, why we moved from Gemini-only (v1) to OCR + dish guide (v2), the evidence, the measures and the failure handling. I also wrote the *How our team uses AI* section of [CLAUDE.md](../../../CLAUDE.md).
- **Final hand-in index.** [README.md](../README.md) links every rubric item and marks what is MISSING.
- **Claude Code agents and skills (shared work):** [`.claude/agents/`](../../../.claude/agents) and [`.claude/skills/`](../../../.claude/skills), with the requirement spec and backlog they produce. I worked on these together with the team; they were committed under the shared `Uni-T17` account (`dad8658`, `973050c`, `9cf668b`).
- **My own commits:** `b16dcb7` and `9a115ed` (use case diagram upload, 8 Sep) and `1c42ddf` (Hugging Face client error handling, 22 Sep).

**AI disclosure**
I used Claude Code (Claude) to run the tests, write the test scripts, and draft ai-logic.md, the index, the CLAUDE.md section and this statement. I chose what to test, checked the results against the files, and approved each change. Claude did not commit or push. Every number above links to a file in the repo.

## Reflection

**1. Lessons learned.** Building YummyNaKha! with AI changed every stage. In requirements and design, our Claude Code agents turned interview notes into specs, backlog rows and diagrams in minutes, but we had to check that every item traced to a real pain and never invent one. In coding, AI helped us build fast, but our first version, where Gemini read the photo and guessed ingredients in one step, gave the same ingredients on only 6 of 16 repeat scans. For an allergy app that is unsafe, so we moved to OCR plus a fixed Thai dish guide, which was consistent on 16 of 16.

*What got better:* testing. AI wrote the scripts that let me run 47 API checks and a sweep of 741 results in one day, far more than we could run by hand.

*What got worse:* trust and review. AI-drafted text sounds confident even when it is wrong, so every number and claim needed checking against the repo. Our user test also showed that 8 of 16 testers read "Check First" as "safe for me". Quality and safety wording still needs people. On teamwork, shared AI rules in CLAUDE.md kept everyone consistent, but some work was committed under one shared account, which made ownership harder to show.

**2. Where I stand.** I see myself as an AI-assisted builder. I use AI every day, but my value is not typing code faster. It is deciding what to build, testing what AI produces, and catching where it is wrong. Junior developers who only generate code will be easy to replace; those who can verify, test and take responsibility will not.

**3. My plan.** Next year I want an internship or co-op in software engineering, where I can work on a real production codebase and learn code review, testing and deployment from experienced engineers. In five years I want to be a senior software engineer who builds reliable systems with AI tools, and who can lead a small team and set good rules for how it uses AI, like we did in this project.

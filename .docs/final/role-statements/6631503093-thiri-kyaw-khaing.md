# Role Statement — Thiri Kyaw Khaing (6631503093)

I was Tech Lead for YummyNaKha!. I set up the app's technical foundation: the
Next.js + TypeScript + Tailwind project
([`91360fe`](https://github.com/Uni-T17/YummyNaKha-/commit/91360fe)), the
server-side HTTP error handling and request-validation utilities that every API
route uses ([`6d9e049`](https://github.com/Uni-T17/YummyNaKha-/commit/6d9e049)),
and the first OCR provider selection
([`09663a2`](https://github.com/Uni-T17/YummyNaKha-/commit/09663a2)). This work was
built on my branch [`kyaw-khaing`](https://github.com/Uni-T17/YummyNaKha-/tree/kyaw-khaing)
and reached `main` through PR #1. In DISCOVER I added the context and activity
diagrams (`2c3e3d1`, `360fec6`) and the team details in the Charter (`44728dd`,
`305548e`).

For the final hand-in I took charge of repository readiness: the
[branch report](../branches.md), the "how to run" guide and test-account seed
script (`YummyNaKha_App/README.md`, `scripts/seed-test-user.ts`), a secret scan
of every branch and the full history, and the ER and sequence diagrams
(`.docs/02-design/04-diagrams/05-er-diagram.md`, `06-sequence-analyze.md`) drawn
from the real schema and code.

AI disclosure: the final-week items above — the branch report, README, seed
script, secret scan, both diagrams, a first draft of this statement and the wording of the Reflection
(written from answers I chose) — were
prepared with AI assistance (Claude Code) and checked against the repository and
its git history.

## Reflection

**1. Lessons learned.** Building YummyNaKha! with AI changed every stage of our
process. Requirements and design moved faster because Claude Code agents turned
our survey pains into a traced spec, backlog and diagrams. Coding was quicker,
but every change still had to be reviewed against our legal and safety rules.
The clearest improvement was testing. AI drafted the unit tests, API checks and
the v1-vs-v2 evaluation harness, and we ran them: 23 of 23 unit tests passed and
0 of 20 known allergy conflicts were missed. Testing became evidence, not a plan
on paper. The clearest problem was AI inside the product. Our first version
asked Gemini for the ingredients on every scan, and it gave the same ingredients
for only 6 of 16 dishes across three scans of one photo. For an allergy app,
that inconsistency is a safety risk. We replaced it with our own OCR and a
reviewed Thai dish guide, which gives identical results every time (16 of 16).
My lesson is that AI output, in code or in a product, must be measured before
it is trusted. In teamwork, AI helped us produce more, but ownership and review
needed clear rules.

**2. Where I stand.** I am an entry-level engineer at a time when AI can write
much of the code. My value is not typing code faster. It is judgement:
understanding the user's problem, writing clear requirements, testing, and
checking what AI produces. AI makes juniors faster; it does not make them
responsible. I am responsible for what I ship.

**3. My plan.** In 2027 I will complete my January–April co-operative
internship, ideally in a software development role, and graduate. I want to
strengthen testing, security and data modelling in real production work. In
five years, I aim to be a senior full-stack engineer or tech lead who builds
reliable, well-tested systems and uses AI responsibly within a team.

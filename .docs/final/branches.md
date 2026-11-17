# Branches — what is on each branch that is not on `main`

Checked 2026-11-17 against `main` at `c300afc` (Merge PR #4 from `paung-dev`).
Read-only: nothing was merged, fetched, pulled or pushed. Remote heads come from
`git ls-remote --heads origin`; commit lists from `git log main..<branch>` and file
changes from `git diff --stat main...<branch>` (changes on the branch since it
split from `main`).

## Summary

| Branch | Tip | Last commit | Commits not on `main` | Commits on `main` not on it | Verdict |
| --- | --- | --- | --- | --- | --- |
| `main` | `c300afc` | 2026-11-17 | — | — | Current release line |
| `kit` | `ab5539a` | 2026-09-07 | **3** | 59 | Old DISCOVER snapshot; nothing worth merging |
| `kit-dev-1` | `85971cc` | 2026-11-15 | **0** | 13 | Fully merged (PR #2, PR #3) |
| `kyaw-khaing` | `8ac4de8` | 2026-10-27 | **0** | 16 | Fully merged (PR #1; tip is the PR #2 merge) |
| `paung-dev` *(also on the remote)* | `df956f5` | 2026-11-17 | **0** | 1 (the merge commit) | Fully merged (PR #4) |

Only `kit` has commits that `main` does not. All other branches can be deleted on
GitHub without losing work, if the team wants to tidy up (team decision — not done here).

## `main`

The integrated branch. Merge history:

| PR | From | Merge commit | Date |
| --- | --- | --- | --- |
| #1 | `kyaw-khaing` | `369ae06` | 2026-09-22 |
| #2 | `kit-dev-1` | `8ac4de8` | 2026-10-27 |
| #3 | `kit-dev-1` | `796c2aa` | 2026-11-15 |
| #4 | `paung-dev` | `c300afc` | 2026-11-17 |

## `kit` — 3 commits not on `main`

```
ab5539a  2026-09-07  Uni-T17  add                                                     (.DS_Store only)
47a15fd  2026-09-07  Uni-T17  Add project charter and brief for YummyNaKha! application
ef9afcb  2026-09-07  Uni-T17  Delete
```

`git diff --stat main...origin/kit` — 23 files, +211 / −3,185:

- `ef9afcb` deletes the whole DISCOVER set that `main` still has: `.claude/agents/*`,
  `.claude/skills/*`, `CLAUDE.md`, `rule.md`, the requirement spec, backlog and log,
  and every file in `.docs/02-design/` (feature list, journey, prototype, 4 diagrams).
- `47a15fd` re-adds a shorter `YummyNaKha! - Charter.md` (130 lines) and
  `YummyNaKha_Project_Brief.md` (91 lines).
- `.DS_Store` is added (a macOS file; should not be in git).

Compared with today's `main` directly, `kit` holds only three files (`.DS_Store`,
the Charter and the Brief). The Charter and Brief on `kit` match `main` except for a
missing newline at the end of the file, so **no content on `kit` is missing from
`main`**. Merging `kit` would delete the app, `.docs/` and `.claude/` — do not merge it.

## `kit-dev-1` — 0 commits not on `main`

Not present as `origin/kit-dev-1` in this clone (it was never fetched), but its tip
`85971cc` is in local history because PR #3 merged it. `git log main..85971cc` is
empty. Its last four commits, all already on `main`:

```
85971cc  2026-11-15  feat: add spice level preference and reporting system for dish issues
1c8e5ec  2026-10-28  feat: Enhance menu analysis with optional AI pairing and unlisted dish descriptions
4e61597  2026-10-27  feat: implement Google sign-in functionality and update user authentication flow
5f62231  2026-10-27  feat: add English menu support and access logging
```

## `kyaw-khaing` — 0 commits not on `main`

Local branch and `origin/kyaw-khaing` both at `8ac4de8` — the PR #2 merge commit that is
already on `main` (the branch was moved up to it after PR #1). Everything on it reached
`main` through PR #1 and PR #2. It carries Thiri Kyaw Khaing's
frontend/backend foundation commits (`91360fe`, `6d9e049`, `09663a2`, 2026-09-22) —
see the [role statement](role-statements/6631503093-thiri-kyaw-khaing.md).

## Commands used

```bash
git ls-remote --heads origin
git log --oneline main..origin/kit
git diff --stat main...origin/kit
git log --oneline main..85971cc          # kit-dev-1 tip
git log --oneline main..origin/kyaw-khaing
git merge-base --is-ancestor df956f5 main && echo merged   # paung-dev
```

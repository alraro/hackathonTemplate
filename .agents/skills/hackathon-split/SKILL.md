---
name: hackathon-split
description: Slice the build into Lane-safe Build issues balanced against each teammate's hours, record them in `hackathon/09-split.md`, then merge `hackathon/setup` into `main`. Use when the Router reaches Phase 10/13 (Task split), or when `09-split.md` is `draft` or `stale`.
---

# Hackathon split (Task split)

Phase 10/13 · Task split. Turn the Demo script, Requirements and Contracts into Build issues, one Lane each, so every teammate builds in parallel from the first minute.

Canonical copy: `.agents/skills/hackathon-split/SKILL.md`. Never edit `.claude/skills/` or `.github/skills/`; `make sync` produces them.

## Artifact

`hackathon/09-split.md`, started from `.agents/skills/hackathon-split/template.md` with `status: draft` and its step checklist. Tick each item and commit after each step. Resume: the Router sees `draft` and runs the first unchecked step.

Free-form Changes to this artifact are applied here. Any other Change points to `.agents/skills/hackathon/CHANGES.md`.

## Slicing rules

Consult these in steps 2 and 3; they are decided, apply them as written.

- **Slice**: one issue = one Screen or one resource/subpackage × one Lane. It cites its Beats and is demoable inside its Lane against the Contract stubs or fixtures.
- **Order**: Spine pass first (every Beat believable on screen as early as possible, Wow moment first), then Depth pass (Real behaviour plus the polish in `hackathon/07-design.md`).
- **Files owned**: each path belongs to exactly one open issue. Registration files (routes and nav, API router, `features.json`, mobile `tabs.ts`) belong to the scaffold commit, so Build issues own only their own folders.
- **Weight**, from observable traits, with a one-line reason; the team may override it:
  - 1: one folder, Faked or fixtures, no Seam, no signature effect.
  - 2: Real against a Contract, or 2+ folders, or a signature effect.
  - 3: a new piece outside the Catalog, a Seam with producer logic (llm, data, scoring), or the Wow moment.
- **Tier** on every issue: `any`, `mid` or `strong`. Weight 3 is `strong`. `any` fits a weak agent only when the issue spans one folder, has at most 4 acceptance criteria and adds no new Seam.
- **Balance**: Σ Weight per person is proportional to their hours. Weight 3 goes to a `strong` agent; to a weaker one only with a ⚠ warning in the Lanes table. The pitch goes to the Presenter. Strengths break ties. The Driver is just another teammate.
- **Agent**: code goes only to teammates whose agent works in the repo. Everyone else gets `Agent: no-repo` issues (pitch, assets, content), delivered as issue comments that the consuming Lane commits.
- **New Lanes**: a new piece gets its own `lane:<x>` only with 2+ issues and a free person; otherwise it joins the closest Lane.
- **Blocking**: native edges only for real code dependencies (Depth ← Spine, detail ← list). Seams never block, because the Contract stub stands in. Leave the `blocked` label off at creation.
- **Issue body**: `.agents/skills/hackathon-split/issue-template.md`, English headings, prose in event language (Beats, Wow moment, Requirements by `R<n>`). Spine acceptance criteria say "visible on screen with believable data"; Depth acceptance criteria name the Real behaviour and the polish.

## Steps

### 1. Announce and gather

**Read**: `GLOSSARY.md`, `hackathon/00-kickoff.md` (Team roster, Event logistics), `hackathon/02-requirements.md`, `hackathon/05-pitch.md` (Demo script, Beats, Wow moment), `hackathon/07-design.md`, `hackathon/08-contracts.md`, `features.json`, `CATALOG.md`, the `MODULE.md` of every kept Module.
**Do**:
1. Say: "Phase 10/13 · Task split. I will slice the build into Build issues, one Lane each, balanced against your hours, scaffold every folder they need, create and assign the issues, and merge setup into main. First, a few questions in one message."
2. Create `hackathon/09-split.md` from `template.md` as `draft`.
3. Send the Ask below as a single message, listing only the roster values still `unknown`.
4. Record the answers in `## Inputs`; commit.
**Done when**: every teammate has hours, agent Tier, whether their agent works in the repo, and strengths in `## Inputs`, and the pitch team is named.
**Ask**: one message: the `unknown` Team roster values; who leaves early or arrives late; Lane or task preferences; who joins the Presenter on the pitch.

### 2. Draft the split

**Read**: `## Inputs`, the files from step 1, **Slicing rules**.
**Do**:
1. List the Lanes from the kept Modules plus any New Lanes.
2. Write one row per issue in `## Issues` in frontier order (Spine pass, Wow moment first, then Depth pass), `#` left blank, each with Weight and its reason, Tier, Files owned and Beats.
3. Assign owners and fill `## Lanes` (Σ Weight against Hours, ⚠ on any imbalance or Weight 3 below `strong`).
4. Fill `## Coverage`: every Beat → its issues, every Seam → producer issue and consumer issue, ⚠ on each gap.
5. Commit.
**Done when**: every Beat has an issue, every Seam has a producer and a consumer issue, no path appears in two rows' Files owned, every row has Weight, reason, Tier and owner, and each person's Σ Weight share matches their hours share or carries a ⚠.
**Ask**: none.

### 3. Review with the team

**Read**: `hackathon/09-split.md`.
**Do**: Show `## Lanes`, `## Issues`, `## Coverage` and `## New Lanes`; apply each requested edit by re-running the checks of step 2's Done when; commit after the ok.
**Done when**: the user said ok to the current draft.
**Ask**: "Ok to create these issues? ok / changes".

### 4. Scaffold commit

**Read**: `## Issues` (Files owned), each kept Module's `MODULE.md` (its registration points).
**Do**:
1. On `hackathon/setup`, create every missing `screens/<id>/` and `resources/<id>/` placeholder named in Files owned.
2. Register each one in every registration point: routes and nav, API router, `features.json`, mobile `tabs.ts`.
3. Run `make check`; fix until it passes.
4. Commit as `chore(split): scaffold Build folders`.
**Done when**: every folder in Files owned exists and is registered, and `make check` passes.
**Ask**: none.

### 5. Labels

**Read**: `docs/agents/triage-labels.md`, `gh label list`.
**Do**: Create each missing label with `gh label create`: `lane:<x>` for every Lane in `## Lanes`, `tier:any`, `tier:mid`, `tier:strong`, `ready-for-agent`. Commit.
**Done when**: `gh label list` shows every label above.
**Ask**: none.

### 6. Create the issues

**Read**: `## Issues`, `issue-template.md`, `.agents/skills/hackathon-tickets/SKILL.md`.
**Do**:
1. Run `hackathon-tickets` steps 4 and 5 with `## Issues` as its approved tickets: create every issue from `issue-template.md`, then wire the native blocking edges in a second pass.
2. Create the Phase issue *Integrate & Polish* (unassigned) and the Phase issue *Demo*, both with the Phase name in the title.
3. Fill `#` in `## Issues` and `## Coverage`; commit.
**Done when**: every row has an issue number, every blocking edge shows as `blocked-by` in `gh issue view`, and both Phase issues exist.
**Ask**: none.

### 7. Assign

**Read**: `## Issues`, `## Lanes`, the Team roster's GitHub users.
**Do**: Assign each Build issue to its owner with `gh issue edit <n> --add-assignee`, assign *Demo* to the Presenter, leave *Integrate & Polish* unassigned; commit.
**Done when**: `gh issue list --json number,assignees` matches `## Issues`, *Demo* is assigned to the Presenter, *Integrate & Polish* has no assignee.
**Ask**: none.

### 8. Merge and hand off

**Read**: `hackathon/09-split.md`.
**Do**:
1. Set `status: done`, tick the checklist, commit and push `hackathon/setup`.
2. Open a PR `hackathon/setup` → `main` with `gh pr create` and merge it with `gh pr merge --squash`.
3. Print the Handoff line, with `<N>` the number of Build issues, spoken in the teammate's chat language (`/hackathon` and paths stay literal): `✅ Task split saved to hackathon/09-split.md: <N> issues created. Everyone: pull main, open a fresh session and run /hackathon.`
**Done when**: the PR is merged, `status: done` is on `main`, and the Handoff line is the last output.
**Ask**: none.

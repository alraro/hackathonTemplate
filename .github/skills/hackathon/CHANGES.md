# Change intake

Canonical copy: `.agents/skills/hackathon/CHANGES.md`. Never edit `.claude/skills/` or `.github/skills/`; `make sync` produces them.

The single source of how a Change is applied. The Router reads this file only after classifying a message as a Change (its step 6) and naming its kind from the Change kinds table. Phase skills edit only their own artifact and point here for everything else.

Use `GLOSSARY.md` terms (Change, Patch, Pivot, Gate, Lane, Files owned, Weight, Tier, Contract, Code freeze).

## Steps

Run the steps once per Change. A Question runs step 1 only, then gets its answer, with no write and no Handoff. Several Changes in one message: one numbered list, one confirmation in step 3, then steps 4-5 for each in order and one Handoff at the end.

Resume: a Change writes nothing before the user's ok, so an interrupted run before step 4 restarts from step 1. After step 4, the resume point is an open branch `hackathon/change-<slug>` (or an unmerged PR from it): continue at step 5.

### 1. Load the context

**Read**, and nothing more:
- the frontmatters of `hackathon/[0-9][0-9]-*.md` (the Router already has them);
- the owning artifact named for the kind under **Kinds** below;
- `grep -n` of the affected IDs and terms (`R<n>`, Module, Feature, Lane, endpoint, teammate login) in every later artifact;
- after the merge: `gh issue list --state open --json number,title,assignees,labels`, plus only the `Files owned` and `Weight` lines of the issues the Change touches.

**Do**: list what the Change alters and every place that cites it. Code stays unread: the artifacts and issues describe it.
**Done when**: every hit of the grep is listed as affected or not affected.
**Ask**: only a fact no file holds (who, when, which issue).

### 2. Propose the level

**Read**: **Levels** below.
**Do**: propose Note, Patch or Pivot, with the files and issues each one touches. Run the **Gate check** and the **Code freeze** check.
**Done when**: one level is proposed and both checks have run.
**Ask**: none yet; the confirmation is in step 3.

### 3. Announce and confirm

**Read**: the result of steps 1-2.
**Do**: print, in the teammate's chat language, `↪ Change · <kind> → <skill or artifact> · <why in one sentence>`, then a short summary: level, each file or issue and the exact edit, any Gate warning.
**Done when**: the user said ok (with corrections applied and re-shown).
**Ask**: ok, or corrections? Gate warning: the explicit confirmation it requires.

### 4. Write

**Read**: the rules for the kind under **Kinds**.
**Do**: make exactly the edits from the confirmed summary, following **Git**.
**Done when**: every confirmed edit is made and committed with a `change: <summary>` message.
**Ask**: none.

### 5. Ship and hand off

**Read**: **Git**, the Router's Phase table and fixed lines.
**Do**: push and merge as **Git** says, then print the Handoff: `✅ Change saved to <path or #n>. Reply "ok" to continue with <Next Phase> in this session.` when the Phase the Router would pick next is in the current session block and is not Build; otherwise `✅ Change saved to <path or #n>. Open a fresh session and run /hackathon.` A Pivot names the reopened Phase as `<Next Phase>`.
**Done when**: the Change is on `hackathon/setup` or merged into `main` (or applied on GitHub), and the Handoff line is the last output.
**Ask**: none.

## Levels

The Router proposes, the user confirms.

- **Note**: edit the owning artifact only.
- **Patch**: edit the owning artifact and every later artifact or open issue that cites it, found by the grep of step 1. No Phase is redone.
- **Pivot**: the reopened Phase's artifact and every later artifact get `status: stale`; the Router then redoes them in order, each using its stale artifact as reference. After the merge, open issues stay open and the redone Task split decides each. `stale` is set only by a Pivot.

## Kinds

Anything matching no kind is a Question: answer it and ask the user to rephrase if they meant a Change.

**Event** → Event logistics in `hackathon/00-kickoff.md` (deadlines, demo format, judges, resources); Brief or Rubric text → `hackathon/01-brief.md`, the line tagged `(heard: <who>/<when>)`. A moved deadline moves the checkpoints, which the Router computes live.

**Requirement** → `hackathon/02-requirements.md`: a new `R<n>` with the next free number, `Source: heard: <who>, <when>`, `Gate`, `Rubric` and 1-3 acceptance criteria `R<n>.<m>`. Existing `R<n>` keep their numbers; a dropped one is marked `dropped: <reason>`, never deleted. Patch: add it to `## Coverage` in `05-pitch.md` and, after the merge, propose the issue that covers it (Issue rules).

**Team** → Team roster in `hackathon/00-kickoff.md` plus reassignment.
- Leaving, or out of plan: redistribute their not-started issues with the **Task split rules**; reassign in-progress ones, and the new assignee resumes from the draft PR. Still present without an agent: label their remaining issues `no-repo` (no code).
- Joining: ask the Kickoff roster questions (GitHub user, chat language, agent and plan tier, hours available, strengths, devices), add the row, run `make invite`, then help the most loaded (Issue).

**Pivot** → the reopened Phase (Levels: Pivot). Switching Aesthetic preset is a Pivot of Design.

**Feature/Module**
- Feature on/off: flip it in `features.json`, run `make sync` (Catalog). A lighter Patch: only artifacts that name the Feature.
- Restore a Module (Patch): `python scripts/prune.py --restore <module> --sha <pre-Prune SHA from 06-prune.md>`; regenerate (`make theme` if Design is `done`, `make openapi api-client`, `make sync` for the Catalog); `make check`; update `hackathon/06-prune.md`; if Task split is `done`, propose the restored Lane's issues (Issue rules).

**Issue** (reassign, split, create, close, help the most loaded) → GitHub issues plus the Issues table of `hackathon/09-split.md`, using the **Task split rules**. Anyone may request it. Touching someone else's issue leaves a comment with the reason, mentioning the old and new assignee. Help the most loaded: take the last not-started issue of the teammate with the most pending Weight.

**Registration** → the registration file: `web/src/app/routes.tsx` (route and nav), `backend/api/core/app.py` (API router), `mobile/src/app/tabs.ts`. See **Ownerless files**.

**Design** → `theme.json` plus the Never/Always lists in `hackathon/07-design.md`. During Build it is a Patch: edit both, run `make theme`, run `make design-lint` and fix every contrast warning before merging (blocking here), merge at once.

**Contract** → the Contracts rules and `hackathon/08-contracts.md`.
- Additive, requested by a consumer: comment the exact change on the producer Lane's issue; the producer applies it (`make openapi api-client` + a Change log line).
- Breaking: stop, show every issue that consumes the Contract, and continue only on an explicit ok from the team; then add a Change log line in `08-contracts.md` and run `make openapi api-client`.

**Question** → answer from the context of step 1; write nothing.

## Rules

**Task split rules**: match pending Weight to each teammate's hours left; Weight 3 goes to a `strong` Tier agent; code issues go only to teammates with a repo agent.

**Gate check**: if the Change leaves a `Gate: yes` Requirement covered by no Beat and no open issue, show `⚠️ This leaves R<n> (Gate) uncovered: disqualifies` and require an explicit confirmation. It warns, never blocks.

**Code freeze**: after the Demo checkpoint, merge only fixes for failures seen in rehearsal. Say so and stop for any other Change that would merge.

**Git**
- Before the merge: commit on `hackathon/setup` and push.
- After the merge: every Change that writes files goes on a branch `hackathon/change-<slug>` from `origin/main`, then a PR and `gh pr merge --squash --delete-branch` at once, with no review.
- GitHub-only Changes (assign, label, comment, close) make no branch.
- Every commit message starts `change: `; that history is the change log.

**Ownerless files**: after the scaffold, the registration files and `theme.json` belong to no issue. Only this intake edits them, additively, in a minimal PR merged at once.

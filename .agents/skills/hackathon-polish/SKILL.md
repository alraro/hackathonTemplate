---
name: hackathon-polish
description: Audit the integrated live product against the Demo script and Gates, then dispatch polish issues (Phase 12/13, Integrate & Polish). Run from the Polish checkpoint via `/hackathon`.
disable-model-invocation: true
---

# Hackathon polish (Integrate & Polish)

Canonical copy: `.agents/skills/hackathon-polish/SKILL.md`. Never edit `.claude/skills/` or `.github/skills/`; `make sync` produces them.

Announce `Phase 12/13 · Integrate & Polish`, then say what you will do (walk the Demo script on the live stack, write the audit, dispatch polish issues) and what you will ask (who claims, then each Beat result). Ask for everything you need up front. Accept free-form changes: edit your own artifact here; for anything else point to `.agents/skills/hackathon/CHANGES.md`.

Offered from the Polish checkpoint to whoever runs `/hackathon` and has tokens. The Integrator is never assumed to be the Driver.

## Artifact

`hackathon/10-polish.md`, started from `.agents/skills/hackathon-polish/template.md` with `status: draft` and its step checklist. Tick each item and commit after each step. Resume: the Router sees `draft`, you continue at the first unchecked step.

## Steps

### 1. Claim

**Read**: the Integrate & Polish Phase issue (`gh issue list --search "Integrate & Polish in:title"`), `hackathon/00-kickoff.md` (Team roster).
**Do**: Assign the Phase issue to the user's GitHub user, re-read its assignees, create `hackathon/10-polish.md` from `template.md`, commit.
**Done when**: the Phase issue has exactly one assignee and the artifact exists as `draft`. Two assignees: stop and let the humans settle it.
**Ask**: none.

### 2. Bring up the live product

**Read**: `.env.example`, `make help`.
**Do**: Branch `hackathon/polish`, set `VITE_API_MODE=live`, run `make db-reset`, run `make up`, open the printed web URL.
**Done when**: `make up` reports healthy and the web URL loads real API data.
**Ask**: none.

### 3. Walk the Demo script

**Read**: the Beat table of the Demo script (`hackathon/05-pitch.md`), `hackathon/02-requirements.md`.
**Do**: Go Beat by Beat: read the Beat aloud, the human clicks it at phone width then desktop, record pass or fail with a one-line note in `## Beat results`.
**Done when**: every Beat has a pass or fail at both widths.
**Ask**: for each Beat, did it work as written (phone and desktop)?

### 4. Gate checklist

**Read**: `hackathon/02-requirements.md`, `## Beat results`.
**Do**: List every Requirement marked `Gate: yes`, plus every acceptance criterion (AC) no Beat covers, in `## Gate checklist` with pass or fail.
**Done when**: each such `R<n>` and AC has a row with pass or fail and evidence (Beat number or what the human tried).
**Ask**: for each AC no Beat covers, did it pass when tried?

### 5. Visual QA

**Read**: `hackathon/07-design.md` (Never and Always lists), `web/src/design/`.
**Do**: Run `make design-lint` (warn-only), then check each Never and Always item by eye with the human. Check every QueryState (loading, empty, error, success) on each Beat's screen. Note unbelievable seed rows from `make db-reset`. Screenshots are an optional bonus.
**Done when**: `## Visual QA`, `## QueryState` and `## Seed rows` each hold findings or an explicit "none found".
**Ask**: does anything look off against Never and Always?

### 6. Features worth switching on

**Read**: `CATALOG.md`, `features.json`.
**Do**: List each `off` Feature that would strengthen a Beat or a Rubric criterion in `## Features`.
**Done when**: every `off` Feature is judged "switch on" or "leave off".
**Ask**: none.

### 7. Decide changes

**Read**: the whole artifact.
**Do**: Give every failure and finding one change in `## Changes`: fine as is, promote to a Gate, switch Feature on, or cut Beat N.
**Done when**: every failure and finding has one change and the human approved the list.
**Ask**: do you approve these changes?

### 8. Switch showcase off and merge

**Read**: `features.json`.
**Do**: Switch the `showcase` Feature off, run `make sync`, confirm the web app still loads, set `status: done` in the artifact, open a PR from `hackathon/polish`, merge it.
**Done when**: the PR is merged to `main` and `showcase` is `off`.
**Ask**: none.

### 9. Dispatch polish issues

**Read**: `## Changes`, `hackathon/09-split.md` (Lane owners), the Build issue template (`.github/ISSUE_TEMPLATE/`).
**Do**: Create one polish issue per change that needs work, from the Build template, Files owned inside one Lane, assigned to that Lane's owner (use the `hackathon-tickets` skill if installed, else `gh issue create`). Record issue numbers in `## Changes`, commit, then print the Handoff line.
**Done when**: every change that needs work has an issue number in the artifact, and the Handoff line is the last output.
**Ask**: none.

Handoff: `Polish audit done and polish issues dispatched. Open a fresh session and run /hackathon.` Speak it in the teammate's chat language; keep `/hackathon` literal.

<!-- sync:footer:start -->
- Hackathon mode wins: if it conflicts with this skill, follow Hackathon mode.
- Commit after every step.
- End with the exact Handoff line, verbatim.
- When in doubt, ask the user.
<!-- sync:footer:end -->

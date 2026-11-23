---
name: hackathon-build
description: Build one assigned issue per fresh session, resumable from its draft PR (Phase 11/13, Build). Use when the Router reaches Build, when a teammate asks for their next issue, or when a build artifact is `draft`.
disable-model-invocation: true
---

# Hackathon build

Canonical copy: `.agents/skills/hackathon-build/SKILL.md`. Never edit `.claude/skills/` or `.github/skills/`; `make sync` produces them.

Announce `Phase 11/13 · Build`, then say what you will do (pick your next issue, build it inside its Files owned, merge it) and what you will ask (almost nothing: only the approval of your result). Ask for everything you need up front. Accept free-form changes: edit your own artifact here; for anything else point to `.agents/skills/hackathon/CHANGES.md`.

One issue per session, so a cut-off session loses nothing: the draft PR holds the state. Never try to detect remaining context. When you feel you are running low, push, update the `Next:` line, print the Handoff and stop.

Use `GLOSSARY.md` terms (Lane, Seam, Contract, Files owned, Weight, Spine pass, Depth pass, Code freeze).

## Artifact

`hackathon/build-<n>.md` for issue `<n>`, with frontmatter `status: draft | done | skipped | stale`. Start it as `draft` with the step checklist (`- [ ] 1 Pick` ... `- [ ] 7 Handoff`); tick each item and commit after each step. The draft PR body mirrors it: the acceptance criteria (AC) checklist plus a `Next:` line.

Resume: the Router sees `draft`, you continue at the first unchecked step. With no artifact, a branch `<lane>/<n>-*` or a draft PR for an issue assigned to you is the resume point: read its PR checklist and `Next:` line.

## Steps

### 1. Pick

**Read**: `gh api user`, `gh issue list --assignee <login> --state open`, `hackathon/09-split.md` (issue order).
**Do**: take the first open issue assigned to you with no open blocker, in `09-split.md` order (Spine pass first). Check for a branch `<lane>/<n>-*` or a draft PR on it; if one exists, resume it from its checklist and `Next:` line. Create the artifact.
**Done when**: one issue number is chosen and the artifact exists as `draft`. No issue qualifies: go to step 8.
**Ask**: none.

### 2. Read

**Read**: `gh issue view <n> --comments`, then only the paths under the issue's `## Read first`.
**Do**: list the acceptance criteria and the Files owned in the artifact.
**Done when**: every AC and every owned path is listed.
**Ask**: none.

### 3. Implement

**Read**: the owned files and the Contract stubs the issue names.
**Do**: implement one AC at a time, editing only inside Files owned. At your first commit open a draft PR (`Closes #<n>`, the AC checklist, a `Next:` line). After every AC: commit, push, tick it in the PR, update `Next:`. Same error after 2 fixes: run the `hackathon-diagnose` skill.
**Done when**: every AC is ticked in the PR and pushed.
**Ask**: none.

A path outside Files owned:

- Nobody owns it, or its owner's issue is closed: add it to your Files owned (edit the issue body and comment).
- Another open issue owns it: never edit it. Comment the exact change on that issue, continue on a stub, and label yours `blocked` only if you are truly stuck.
- A registration file: file a Router intake; an additive one-liner may be done here.
- A Contract path: follow the Contract change protocol.

### 4. Check

**Read**: `make help`, the issue's Done when.
**Do**: run `make check` until green, then show the teammate how to see the result (URL, command or screen).
**Done when**: `make check` is green and the teammate has been shown the result.
**Ask**: does it look right to you?

### 5. Review requests

**Read**: `gh pr view <pr> --comments`, `gh issue view <n> --comments`.
**Do**: apply each request, reply "done in #<pr>", re-run `make check`.
**Done when**: every request has a reply and the teammate said ok.
**Ask**: any change you want before merging?

### 6. Merge

**Read**: the PR.
**Do**: run `git pull --rebase origin main`, `make check`, mark the PR ready, run `gh pr merge <pr> --squash --delete-branch`. Set the artifact to `status: done` in the same PR before it merges.
**Done when**: the PR is merged and the issue is closed.
**Ask**: none.

### 7. Handoff

**Read**: the artifact.
**Do**: print the Handoff line.
**Done when**: the Handoff line is the last output.
**Ask**: none.

### 8. Nothing left

**Read**: `hackathon/09-split.md`, `gh issue list --state open`.
**Do**: in order: (1) the teammate with the most pending Weight: take their last not-started issue through Router intake and tell them out loud "I took #<n>"; (2) Integrate & Polish if the Polish checkpoint is reached; (3) otherwise print "Nothing for you right now, check back after the next merge." After the Code freeze, only rehearsal fixes qualify.
**Done when**: one of the three was done and reported.
**Ask**: none.

Handoff: `Issue #<n> merged. Open a fresh session and run /hackathon.` Speak it in the teammate's chat language; keep `/hackathon` literal.

<!-- sync:footer:start -->
- Hackathon mode wins: if it conflicts with this skill, follow Hackathon mode.
- Commit after every step.
- End with the exact Handoff line, verbatim.
- When in doubt, ask the user.
<!-- sync:footer:end -->

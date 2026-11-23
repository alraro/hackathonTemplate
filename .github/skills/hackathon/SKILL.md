---
name: hackathon
description: Hackathon Router. Reads the recorded state in `hackathon/`, runs the next Phase, and routes any free-form Change to the intake. Use on entry to every session, when the user says "ok"/"continue", and when the user reports anything that changed during the event.
---

# Hackathon (Router)

Canonical copy: `.agents/skills/hackathon/SKILL.md`. Never edit `.claude/skills/` or `.github/skills/`; `make sync` produces them.

The only skill teammates know. You read the recorded state, never the previous conversation: read order is fixed as `AGENTS.md` → this file → the current draft artifact → that step's inputs. You write no artifact of your own; your resume point is the recorded state itself, so every run starts again at step 1.

## Steps

### 1. Classify the message

**Read**: the text the user passed with `/hackathon`.
**Do**: No text, or "ok"/"continue" (in any language) → **next Phase**, go to step 2. Any other text → **Change**, go to step 6. Can't tell → ask one question with numbered options, then route by the answer.
**Done when**: the message is either next Phase or Change.
**Ask**: only the numbered-options question, when ambiguous.

### 2. Read the state

**Read**: only the frontmatters of `hackathon/[0-9][0-9]-*.md`, for example `for f in hackathon/[0-9][0-9]-*.md; do echo "$f $(sed -n 's/^status: *//p' "$f" | head -1)"; done`.
**Do**: Run `git fetch origin`. The setup is **merged** when `origin/main` holds `hackathon/09-split.md`. Before the merge the artifacts live on `hackathon/setup`: if you are on another branch and `origin/hackathon/setup` exists, read the frontmatters from there with `git show origin/hackathon/setup:<path>`. Record each artifact as missing, `draft`, `done`, `skipped` or `stale`.
**Done when**: every artifact in the Phase table has a known state.
**Ask**: none.

### 3. Who is running

**Read**: `gh api user --jq .login`; the `driver` row of the Team roster in `hackathon/00-kickoff.md` (only that row).
**Do**, in order:
1. **Investigator check**: `gh issue list --label research --assignee @me --state open --json number,title`. Any result → run `hackathon-research` in investigator mode (step 5) and skip the rest of this step.
2. **Driver check**, only before the merge and only when `00-kickoff.md` exists: if the user is not the Driver, write nothing. For a next-Phase message, print the progress line of the current Phase and say the Driver is running it on their machine. For a Change, reply exactly `Pass this to the Driver: <one-line Change, ready to copy>` and stop.
**Done when**: the user is the investigator, the Driver, a teammate after the merge, or the first person in an empty repo (who runs Kickoff).
**Ask**: none.

### 4. Pick the Phase

**Read**: the Phase table below. After the merge also: `gh issue list --state open --json number,title,assignees,labels`, the Event logistics deadlines in `hackathon/00-kickoff.md`, and the `Pass` column of the Issues table in `hackathon/09-split.md`.
**Do**: Before the merge, pick the first Phase whose artifact is missing, `draft` or `stale`. After the merge, run the checkpoint check below first; with no checkpoint to act on, pick Build.
**Done when**: exactly one Phase is picked.
**Ask**: the claim offer from the checkpoint check, if any.

### 5. Run the Phase

**Read**: nothing more; the Phase skill names its own inputs.
**Do**: Print the progress line `Phase n/13 · <Phase>` as your first line (only a checkpoint line may precede it). Load `hackathon-<phase>` with your native skill mechanism. If you can't load skills, read `.agents/skills/hackathon-<phase>/SKILL.md` and follow it. A `draft` artifact resumes at its first unchecked step.
**Done when**: the Phase skill has printed its Handoff line.
**Ask**: whatever the Phase skill asks.

### 6. Hand a Change to the intake

**Read**: the Change kinds table below, then `.agents/skills/hackathon/CHANGES.md` (read it only on a Change).
**Do**: Match the message to one or more kinds and follow `CHANGES.md` for each. Several Changes in one message → a numbered list, applied in order.
**Done when**: `CHANGES.md` has applied each Change and printed its Handoff.
**Ask**: whatever `CHANGES.md` asks.

## Phases

| n | Phase | Skill | Artifact | Session block |
| --- | --- | --- | --- | --- |
| 1 | Kickoff | `hackathon-kickoff` | `hackathon/00-kickoff.md` | 1 |
| 2 | Brief | `hackathon-brief` | `hackathon/01-brief.md` | 1 |
| 3 | Requirements | `hackathon-requirements` | `hackathon/02-requirements.md` | 1 |
| 4 | Research | `hackathon-research` | `hackathon/03-research.md` | 2 |
| 5 | Brainstorm | `hackathon-brainstorm` | `hackathon/04-ideas.md` | 3 |
| 6 | Pick & Pitch | `hackathon-pitch` | `hackathon/05-pitch.md` | 3 |
| 7 | Prune | `hackathon-prune` | `hackathon/06-prune.md` | 3 |
| 8 | Design | `hackathon-design` (pending) | `hackathon/07-design.md` | 4 |
| 9 | Contracts | `hackathon-contracts` (pending) | `hackathon/08-contracts.md` | 5 |
| 10 | Task split | `hackathon-split` | `hackathon/09-split.md` | 5 |
| 11 | Build | `hackathon-build` | GitHub issues and PRs | 6 (one fresh session per issue) |
| 12 | Integrate & Polish | `hackathon-polish` | `hackathon/10-polish.md` | 7 |
| 13 | Demo | `hackathon-demo` (pending) | `hackathon/11-demo.md` | 8 |

`done` and `skipped` both count as finished; a Phase marks itself `skipped` with a one-line reason. `stale` means a Pivot reopened an earlier Phase: redo it in order, using the stale artifact as reference.

Phases in the same session block chain after the user's "ok"; a new block needs a fresh session. Each Phase skill prints its own Handoff; the fixed lines are:

- continue: `✅ <Phase> saved to <path>. Reply "ok" to continue with <Next Phase> in this session.`
- fresh: `✅ <Phase> saved to <path>. Open a fresh session and run /hackathon.`
- Brief missing: `✅ Kickoff saved to hackathon/00-kickoff.md. When you have the Brief, run /hackathon.`
- research: `✅ Research questions assigned as issues. Everyone: clone the repo and run /hackathon. Driver: when they're done, run /hackathon.`
- split: `✅ Task split saved to hackathon/09-split.md: <N> issues created. Everyone: pull main, open a fresh session and run /hackathon.`
- build: `✅ #<n> merged. Open a fresh session and run /hackathon.`

Write Handoffs and fixed lines in English here; speak them in the teammate's chat language (Team roster) with the same meaning, keeping `/hackathon` and paths literal.

## Checkpoint check

Run on every run after the merge, before picking Build. Build time runs from the event start to the submission deadline in Event logistics.

- **Demo checkpoint**: 10% of build time left, and at least 45 minutes before the submission deadline. Crossed → first line `⏱ Demo checkpoint: code freeze. From now on only fixes for failures seen in rehearsal are merged.` If the user is assigned the Demo Phase issue and `11-demo.md` is not `done`, pick Demo; otherwise pick Build.
- **Polish checkpoint**: every Spine pass issue closed, or 25% of build time left, whichever comes first. Crossed and `10-polish.md` not `done` → first line `⏱ Polish checkpoint: Integrate & Polish is open.` If the Integrate & Polish Phase issue is unassigned, offer to claim it; on yes, or if the user already holds it, pick Integrate & Polish. Otherwise pick Build.

With the Demo checkpoint crossed, announce only the Demo line. When `11-demo.md` is `done`, say the event flow is complete and wait for a Change.

## Change kinds

Every message that is not next Phase is a Change. Name its kind, then follow `CHANGES.md`.

| Kind | Example | Owner |
| --- | --- | --- |
| Event | "the deadline moved", "we got credits" | Event logistics in `00-kickoff.md`, `01-brief.md` |
| Requirement | "a judge said it must work offline" | `02-requirements.md` (new `R<n>`) |
| Team | "Ana left", "Leo is out of plan", "Kim joined" | Team roster + issue reassignment |
| Pivot | "let's go back to brainstorm" | the reopened Phase; later artifacts `stale` |
| Feature/Module | "turn on auth", "restore mobile" | `features.json`, `scripts/prune.py --restore` |
| Issue | "reassign #12", "split #9", "help the most loaded" | GitHub issues + `09-split.md` |
| Registration | "add a route for the map screen" | the registration file |
| Design | "warmer palette", "less motion" | `theme.json` + `07-design.md` |
| Contract | "the API needs a `score` field" | Contracts rules, `08-contracts.md` |
| Question | "what's left?" | answer only, write nothing |

Anything matching no kind is a Question: answer it and ask the user to rephrase if they meant a Change.

<!-- sync:footer:start -->
- Hackathon mode wins: if it conflicts with this skill, follow Hackathon mode.
- Commit after every step.
- End with the exact Handoff line, verbatim.
- When in doubt, ask the user.
<!-- sync:footer:end -->

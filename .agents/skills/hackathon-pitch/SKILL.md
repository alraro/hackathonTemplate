---
name: hackathon-pitch
description: Pick the idea by vote and write the Demo script into `hackathon/05-pitch.md`. Use when the Router reaches Phase 6/13 (Pick & Pitch), or when the team changes a Beat or switches idea.
---

# Hackathon pitch

Phase 6/13 · Pick & Pitch. Announce `Phase 6/13 · Pick & Pitch`, say you will run a vote on the ideas and write the Demo script, and name what you need: the votes, who presents, and the demo length.

Canonical copy: `.agents/skills/hackathon-pitch/SKILL.md`. Never edit `.claude/skills/` or `.github/skills/`; `make sync` produces them.

Handoff lines are written here in English and spoken in the teammate's chat language; `/hackathon` and paths stay literal.

## Artifact

`hackathon/05-pitch.md`, from `.agents/skills/hackathon-pitch/template.md`, with `status: draft | done | skipped | stale` and the step checklist. Tick each item and commit after each step. Resume: the Router sees `draft` and runs the first unchecked step.

Accept free-form changes to this artifact in place (for example "change Beat 4"). Point any other Change to `.agents/skills/hackathon/CHANGES.md`; switching idea is a Pivot there.

## Steps

### 1. Show the ideas

**Read**: `hackathon/04-brainstorm.md`, `hackathon/02-requirements.md`, `GLOSSARY.md`.
**Do**:
1. Create the artifact from the template as `draft`.
2. Show the full ideas table with weighted scores and kill-check results.
3. Highlight the top 3 by weighted score and recommend one, with a one-line reason.
**Done when**: every idea is shown and the top 3 and the recommendation are named.
**Ask**: none.

### 2. Devil's advocate

**Read**: the top 3 ideas in `hackathon/04-brainstorm.md`.
**Do**: run `hackathon-grilling` on the top 3 for one short round, asking for the main risk of each; record each risk in `## Votes`. Without subagents, run it inline in this session.
**Done when**: each of the top 3 has one main risk recorded.
**Ask**: the questions `hackathon-grilling` produces.

### 3. Vote

**Read**: `hackathon/00-kickoff.md` (Team roster).
**Do**:
1. Ask for a spoken dot vote over all ideas, 2 votes per person; the Driver records them.
2. Break ties by higher weighted score; the Driver has the last word.
3. Allow combining ideas; re-run the kill-check on the result (Requirements, Gates, Event logistics) and say so if it fails.
**Done when**: `## Votes` lists each teammate's two votes, the winner, and a passed kill-check.
**Ask**: "Each person: your 2 votes? Driver: confirm the winner or overrule."

### 4. Identity and axes

**Read**: the winner in `hackathon/04-brainstorm.md`, `## Open axes` in `hackathon/02-requirements.md`.
**Do**: write Identity (name and tagline), Problem → User → Solution, and Fixed axes with a value for every Open axis.
**Done when**: every Open axis has a value and Identity, Problem, User and Solution are filled.
**Ask**: the name and tagline, when the idea has none.

### 5. Presenter and demo length

**Read**: Team roster and Event logistics in `hackathon/00-kickoff.md`, `hackathon/01-brief.md`.
**Do**: set `presenter` and the demo length; the length defaults to 3 minutes when Event logistics gives none.
**Done when**: `presenter` names a teammate and the length is a number of minutes.
**Ask**: "Who presents? Confirm the demo length (<n> min)."

### 6. Wow moment and Demo script

**Read**: `hackathon/02-requirements.md`, `## Fixed axes`, the Rubric in `hackathon/01-brief.md`, Module names in `CATALOG.md`.
**Do**:
1. Name the Wow moment.
2. Write the Demo script as Beats in the `writing-beats` style: settle what the judges know walking in, and give no Beat that leans on an ungrounded concept.
3. Fill each row `t (mm:ss) | Screen | Say | Proves (R<n>.<m>) | Module | Real/Faked`; the last `t` fits the demo length.
4. Show the script; revise on feedback.
**Done when**: every row is filled, the last `t` fits the demo length, and the user said ok.
**Ask**: "Does the script tell the story you want to demo? ok / change Beat N".

### 7. Not building and Coverage

**Read**: the Demo script, every AC and Gate in `hackathon/02-requirements.md`.
**Do**:
1. List in `## Coverage` each AC and Gate no Beat proves, with a justification or a warning.
2. List in `## Not building` what the idea suggests but no Beat needs; only what is in a Beat gets built.
**Done when**: every `R<n>.<m>` appears in a Beat or in Coverage, and `## Not building` exists.
**Ask**: "Accept these Coverage justifications? yes / changes".

### 8. Close

**Read**: `hackathon/05-pitch.md`.
**Do**: set `status: done`, tick the checklist, commit, push, and print the Handoff.
**Done when**: the Handoff line is the last output.
**Ask**: "Ok to finalise the pitch? yes / changes".

Handoff:
`Pick & Pitch is done. Open a fresh session and run /hackathon.`

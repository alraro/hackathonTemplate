---
name: hackathon-requirements
description: Turn the Brief and what was heard into stable, checkable Requirements in `hackathon/02-requirements.md`, without proposing ideas. Use when the Router reaches Phase 3/13 (Requirements), when the Brief's Rubric or the organisers' words change, or when `02-requirements.md` is `draft` or `stale`.
---

# Hackathon requirements

Phase 3/13 · Requirements. Extract Requirements from the Brief, add what the team heard, infer a few more, and record them as `R<n>`. Requirements say what the result must satisfy; ideas belong to Brainstorm.

Canonical copy: `.agents/skills/hackathon-requirements/SKILL.md`. Never edit `.claude/skills/` or `.github/skills/`; `make sync` produces them.

## Artifact

`hackathon/02-requirements.md`, built from `.agents/skills/hackathon-requirements/template.md`, with frontmatter `status: draft | done | skipped | stale`. Start it as `draft` with the step checklist; tick each item and commit after each step. Resume: the Router sees `draft` and runs the first unchecked step.

IDs form one sequence and are never renumbered. A dropped Requirement keeps its ID with `Status: dropped: <reason>`.

Free-form Changes to this artifact are applied here. Any other Change points to `.agents/skills/hackathon/CHANGES.md`.

## Steps

### 1. Announce and extract from the Brief

**Read**: `hackathon/01-brief.md`, `GLOSSARY.md` (Requirement, Gate, Rubric, Open axis).
**Do**:
1. Say: "Phase 3/13 · Requirements. I will turn the Brief into checkable Requirements, ask what was said aloud, then list what is left open."
2. Create `hackathon/02-requirements.md` from `template.md` as `draft`.
3. Write one `R<n>` per obligation in the Brief, with `Source: brief: "<quote>"`, `Gate`, `Rubric` (criteria names from the Brief) and 1-3 acceptance criteria `R<n>.<m>`.
4. Write the summary table, Gates first, one line per R.
5. Show the draft; commit.
**Done when**: every obligation sentence in the Brief maps to an R; every R has 1-3 acceptance criteria that are idea-agnostic and checkable in the demo or submission.
**Ask**: none.

### 2. Add what was heard

**Read**: `hackathon/02-requirements.md`, the Rubric in `hackathon/01-brief.md`.
**Do**:
1. Ask the question below.
2. Add each answer as an R with `Source: heard: <who>, <when>`; set `Gate: yes` for anything that could disqualify.
3. When an answer changes a priority, edit the Rubric in `hackathon/01-brief.md`, tag the line `(heard: who/when)`, and show the diff.
4. Update the table; commit.
**Done when**: the user answered all three parts (or said "nothing"), every answer is an R or a tagged Rubric edit, and the table matches the sections.
**Ask**: "Was anything said aloud that isn't in the Brief? What do the judges care about most? Anything that could disqualify us?"

### 3. Confirm inferred Requirements

**Read**: `hackathon/02-requirements.md`.
**Do**:
1. Propose at most 5 inferred Requirements (`Source: inferred: <reason>`), one at a time.
2. Add an R only after the user confirms it.
3. Update the table; commit.
**Done when**: each proposal has a yes or no, and the inferred count is 5 or fewer.
**Ask**: for each proposal, "Add R<n> · <title> (<reason>)? yes / no".

### 4. Open axes and Open questions

**Read**: `hackathon/02-requirements.md`, `GLOSSARY.md` (Open axis).
**Do**:
1. List `## Open axes` (domain, target user, platform, product type, data, plus any the Brief leaves free), each `Free` or `Constrained: R<n>`.
2. List `## Open questions`, each with a working assumption and the affected R; an open question never blocks this Phase.
3. Offer to export the questions with `hackathon-questionnaire`; run it only if the user says yes.
4. Commit.
**Done when**: every axis is `Free` or `Constrained: R<n>`; every question names an assumption and an affected R.
**Ask**: "Export the open questions for the organisers with `hackathon-questionnaire`? yes / no".

### 5. Confirm and hand off

**Read**: `hackathon/02-requirements.md`.
**Do**:
1. Show the final table, Open axes and Open questions.
2. After the user's ok, set `status: done`, tick the checklist, commit and push.
3. Print the Handoff line, spoken in the teammate's chat language (`/hackathon` stays literal): "Requirements are recorded. Open a fresh session and run `/hackathon`."
**Done when**: `status: done`, the push succeeded, and the Handoff line is the last output.
**Ask**: "Ok to finalise these Requirements? yes / changes".

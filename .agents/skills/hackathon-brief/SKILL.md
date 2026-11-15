---
name: hackathon-brief
description: Capture the Brief verbatim with its Rubric into `hackathon/01-brief.md`. Use when the Router runs Phase 2/13 (Brief), or when the Driver pastes, attaches, links or points to the Brief.
---

# Hackathon Brief

Phase 2/13. Announce `Phase 2/13 · Brief`, say you will keep the Brief verbatim and extract its Rubric, and name what you need: the Brief itself.

## Artifact

`hackathon/01-brief.md`, started from `.agents/skills/hackathon-brief/template.md` with `status: draft` and its step checklist. Tick each item and commit after each step. Resume at the first unchecked item.

Accept free-form changes to this artifact in place. Point any other Change to `.agents/skills/hackathon/CHANGES.md`.

## Steps

### 1. Collect the Brief

**Read**: `hackathon/00-kickoff.md`, `hackathon/01-brief.md` if it exists.
**Do**: Accept pasted text, a file (PDF or image), a URL, or a path. Copy each original into `hackathon/sources/` (save fetched pages and pasted text as `.md`). Create `hackathon/01-brief.md` from the template and list every source in `## Sources`.
**Done when**: every original sits in `hackathon/sources/` and each has a `## Sources` row.
**Ask**: "Paste the Brief, give me the file or URL, or tell me where it's saved." Ask only when no Brief was given. Ask again for any source you cannot read.

### 2. Write Verbatim

**Read**: every file in `hackathon/sources/`.
**Do**: Copy the Brief text into `## Verbatim` exactly as published, transcribing PDFs and images character for character. Mark any illegible span `[illegible]`.
**Done when**: `## Verbatim` holds the whole Brief with every sentence unaltered, and nothing from outside the sources.
**Ask**: none.

### 3. Write Rubric

**Read**: `## Verbatim`.
**Do**: List each judging criterion with its weight, as stated. When the Brief states criteria without weights, or no criteria, infer them and tag the row `(inferred)`. Leave Requirements to the Requirements Phase.
**Done when**: every criterion named in `## Verbatim` has a row, and every row without a stated weight or source is tagged `(inferred)`.
**Ask**: "Did the organisers say anything aloud about how judging works?" Add answers as rows tagged `(heard: <who>, <when>)`.

### 4. Fill Event logistics

**Read**: `## Verbatim`, the Event logistics section of `hackathon/00-kickoff.md`.
**Do**: Fill each `unknown` field the Brief answers (deadline, demo format and length, submission format, judges, resources). Show the diff of `hackathon/00-kickoff.md` before saving; this edit is the stated exception to the hard prohibition on editing other artifacts. Leave every field already filled untouched.
**Done when**: no `unknown` field that the Brief answers remains, and the diff was shown.
**Ask**: "Apply this diff to `hackathon/00-kickoff.md`?" Skip when the Brief fills no field.

### 5. Close

**Read**: `hackathon/01-brief.md`.
**Do**: Ask the user to confirm the Rubric. On "ok", set `status: done`, commit, push, and print the continue Handoff, spoken in the teammate's chat language.
**Done when**: the Handoff line is the last output.
**Ask**: "Does the Rubric match the Brief? Reply ok to save."

Handoff:
`✅ Brief saved to hackathon/01-brief.md. Reply "ok" to continue with Requirements in this session.`

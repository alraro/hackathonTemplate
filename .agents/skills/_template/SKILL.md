---
name: example-skill
description: One sentence naming what the skill does, then "Use when" with each distinct trigger. Front-load the leading word.
---

# Example skill

Header for adapted Matt Pocock skills (delete otherwise): `Adapted from mattpocock/skills v1.3.1 <path> (MIT)`

Canonical copy: `.agents/skills/<name>/SKILL.md`. Never edit `.claude/skills/` or `.github/skills/`; `make sync` produces them.

## Artifact

Write `docs/<artifact>.md` with frontmatter `status: draft | done | skipped | stale`. Start it as `draft` with a step checklist (`- [ ] 1 <step name>`); tick each item and commit after each step.

## Steps

### 1. Example step name

**Read**: the exact files this step needs (paths, not descriptions).
**Do**: the actions, in order, one imperative sentence each.
**Done when**: a checkable, exhaustive condition (for example "every Requirement has an `R<n>` row").
**Ask**: the only questions for the user, for facts no file holds. Write `none` if there are none.

### 2. Last step

**Read**: the artifact.
**Do**: set `status: done`, commit, then print the exact Handoff line.
**Done when**: the Handoff line is the last output.
**Ask**: none.

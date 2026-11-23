---
name: hackathon-brainstorm
description: Build a wide, scored idea list in `hackathon/04-ideas.md`, team ideas first. Use when the Router reaches Phase 5/13 (Brainstorm), when the team adds, kills or re-scores an idea, or when `04-ideas.md` is `draft` or `stale`.
---

# Hackathon brainstorm

Phase 5/13 · Brainstorm. Announce `Phase 5/13 · Brainstorm`, say you will collect the team's ideas first, then add, score and rank a list of about 10 to 12, and name what you need: the team's ideas, anything vetoed or loved, and which roster strength to show off. Ask for everything the skill needs; accept free-form changes: edits to this artifact are handled here, every other Change points to `.agents/skills/hackathon/CHANGES.md`.

Canonical copy: `.agents/skills/hackathon-brainstorm/SKILL.md`. Never edit `.claude/skills/` or `.github/skills/`; `make sync` produces them.

Handoff lines are written here in English and spoken in the teammate's chat language; `/hackathon` and paths stay literal.

## Artifact

`hackathon/04-ideas.md`, from `.agents/skills/hackathon-brainstorm/template.md`, with frontmatter `status: draft | done | skipped | stale`. Start it as `draft` with the step checklist (`- [ ] 1 <step name>`); tick each item and commit after each step. Resume point: the Router sees `draft` and re-enters at the first unchecked step.

## Rules

- **Team first**: the team's ideas enter the list before the agent proposes any, so humans are never anchored by the agent.
- **Origin tag** on every idea: `team`, `agent` or `team+agent`. The agent may improve a team idea (variant next to the original), merge, endorse or propose.
- **Spread**: about 10 to 12 ideas across **fit** (safe, strong on the Rubric), **twist** (a familiar idea with a surprising angle) and **moonshot** (ambitious, high Wow moment); each varies the Open axes differently.
- **Idea card**: provisional name, one line, axis values (one per Open axis), Wow moment, R covered.
- **Warn, never filter**: the kill-check marks ideas, scoring orders them; every idea stays in the full ranked table.
- **Feasibility** counts new pieces absent from `CATALOG.md` (every Feature counts as present), never hours.

## Steps

### 1. Collect the team's ideas

**Read**: `hackathon/01-brief.md` (Rubric), `hackathon/02-requirements.md` (Open axes), `hackathon/03-research.md` (So what for Brainstorm), `hackathon/00-kickoff.md` (Team roster), `CATALOG.md`, `GLOSSARY.md`.
**Do**: create the artifact as `draft` from the template; summarise the Open axes and the research "So what" in three lines; ask the Ask questions; record each team idea as a card tagged `team`, and the vetoes and loves under "Heard".
**Done when**: the artifact and its committed checklist exist, every idea the team gave is a card, and "Heard" holds the answers (or `nothing`).
**Ask**: the team's ideas, even half-formed; anything vetoed or loved; which roster strength to show off.

### 2. Widen the list

**Read**: the artifact, the research file, `CATALOG.md`.
**Do**:
1. Improve weak team ideas as a variant card next to the original; merge duplicates; endorse strong ones with a one-line reason.
2. Propose `agent` cards until the list has about 10 to 12 ideas and every kind (fit, twist, moonshot) appears at least twice.
3. Fill every card's fields; give each Open axis a value that differs across ideas.
**Done when**: every card has all five fields, each kind appears at least twice, and the user confirmed the list.
**Ask**: add, drop, reword or merge?

### 3. Kill-check

**Read**: the cards, `hackathon/02-requirements.md` (active R, Gates), the Landscape section of `hackathon/03-research.md`.
**Do**: put `⚠ <reason>` on each idea that covers no active R, or that exists already without a difference per Landscape; put `⛔ <reason>` only on a clear Gate violation.
**Done when**: every idea is checked and each flag carries a reason.
**Ask**: none.

### 4. Score

**Read**: the cards, the Rubric in `hackathon/01-brief.md`, `CATALOG.md`.
**Do**:
1. Score each idea 1 to 5 per Rubric criterion, multiply by the Weights, and add Demo-ability (1 to 5).
2. Set Feasibility to `0`, `1-2` or `3+` new pieces, listing each piece not in `CATALOG.md`.
3. Write a one-line reason for every score.
4. Sort by total, with `⚠` and `⛔` ideas at the bottom.
**Done when**: every idea has every score with a reason, and Feasibility lists its pieces.
**Ask**: none.

### 5. Review the ranking

**Read**: the artifact.
**Do**: show the full ranked table, flagged ideas included, and say "resurrect N" revives a flagged idea; apply each change, re-sort, and note overrides as `heard`:
- add an idea (run steps 2 to 4 for it);
- change a Weight (edit the Rubric in `hackathon/01-brief.md`, show the diff, re-score);
- kill or resurrect an idea;
- override a score.
**Done when**: the user said the ranking is ok.
**Ask**: "Ranking ok? Or: add an idea, change a weight, kill or resurrect N, override a score."

### 6. Close

**Read**: the artifact.
**Do**: set `status: done`, tick the checklist, commit, push, print the continue Handoff.
**Done when**: the Handoff line is the last output.
**Ask**: none.

Handoff: `✅ Brainstorm saved to hackathon/04-ideas.md. Reply "ok" to continue with Pick & Pitch in this session.`

<!-- sync:footer:start -->
- Hackathon mode wins: if it conflicts with this skill, follow Hackathon mode.
- Commit after every step.
- End with the exact Handoff line, verbatim.
- When in doubt, ask the user.
<!-- sync:footer:end -->

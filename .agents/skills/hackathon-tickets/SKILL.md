---
name: hackathon-tickets
description: Break the chosen plan into tracer-bullet GitHub issues with native blocking edges, one Lane each. Use when a Phase skill (Task split) calls it to create issues; users never run it.
---

# Hackathon tickets

Adapted from mattpocock/skills v1.3.1 skills/engineering/to-tickets/SKILL.md (MIT)

Canonical copy: `.agents/skills/hackathon-tickets/SKILL.md`. Never edit `.claude/skills/` or `.github/skills/`; `make sync` produces them.

Tool skill: a Phase skill calls it, the user never does. Hackathon mode wins on any conflict. Use `GLOSSARY.md` terms (Lane, Seam, Contract, Files owned, Weight, Tier, Spine pass, Depth pass).

A **tracer bullet** ticket is **vertical**: demoable within its Lane against stubs or fixtures from the Contracts, never crossing Lanes. Each ticket declares the tickets that **block** it. The **frontier** is every ticket whose blockers are all done.

## Artifact

Write `docs/tickets.md` with frontmatter `status: draft | done | skipped | stale`. Start it as `draft` with the step checklist (`- [ ] 1 Gather` ... `- [ ] 5 Wire edges`); tick each item and commit after each step. Resume: first unchecked item.

Announce what you will do and what you will ask before step 1, and accept free-form edits to this artifact at any point.

## Steps

### 1. Gather

**Read**: the calling Phase's inputs (idea, Requirements, Contracts, Team roster, `features.json`, the Catalog).
**Do**: list the Beats and Requirements the tickets must cover.
**Done when**: every Requirement and Beat appears in the list with its Lane.
**Ask**: none.

### 2. Draft vertical slices

**Read**: the list from step 1 and the Contracts.
**Do**: write one ticket per slice: title, Lane, Files owned, Weight (1 to 3), Tier, what it delivers, acceptance criteria, blockers. Order the Spine pass first (Wow moment first), then the Depth pass. Put prefactoring first. Size each ticket to one fresh context window. Express a Seam as a blocker on the Contract ticket, never on the other Lane's implementation.
**Done when**: every Requirement and Beat is covered by a ticket, no two open tickets share a file in Files owned, and every ticket is demoable inside its Lane against stubs or fixtures.
**Ask**: none.

### 3. Quiz the team

**Read**: the draft in `docs/tickets.md`.
**Do**: show a numbered list (title, Lane, blocked by, what it delivers); iterate on the answers.
**Done when**: the user approved the breakdown.
**Ask**: is the granularity right (too coarse or fine), are the blocking edges the genuine gates, should any ticket merge or split?

### 4. Create the issues

**Read**: `docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md`.
**Do**: create one issue per approved ticket with `gh issue create` (blockers first), labelled `ready-for-agent` plus its Lane and Tier labels, body without "Blocked by" text. Record each issue number in the artifact.
**Done when**: every ticket has an issue number in the artifact.
**Ask**: none.

### 5. Wire edges

**Read**: the artifact's ticket-to-number table.
**Do**: in a second pass, add each blocking edge as a native GitHub dependency (`gh api` on `issues/<n>/dependencies/blocked_by`), then list the frontier. Set `status: done`, commit.
**Done when**: `gh issue view <n>` shows `blocked-by` for every ticket with blockers, and the frontier is listed in the artifact.
**Ask**: none.

Handoff: tell the calling Phase skill the frontier and stop; it prints the Handoff line.

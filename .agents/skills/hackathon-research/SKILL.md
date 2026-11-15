---
name: hackathon-research
description: Research the Brief, split into Research questions across teammates, and synthesise them into `hackathon/03-research.md`. Use when the Router reaches the Research Phase, or when a teammate has an assigned `research` issue (investigator mode).
---

# Hackathon research

Phase 4/13 · Research. Announce this, what the skill will do and what it will ask, before step 1. Ask for everything the skill needs; accept free-form changes: edits to this artifact are handled here, every other Change points to `.agents/skills/hackathon/CHANGES.md`.

Canonical copy: `.agents/skills/hackathon-research/SKILL.md`. Never edit `.claude/skills/` or `.github/skills/`; `make sync` produces them.

Handoff lines are written here in English and spoken in the teammate's chat language; `/hackathon` and paths stay literal.

## Mode

Pick the mode from the Router's finding: assigned open `research` issues for the current GitHub user mean **investigator mode** (see the end); otherwise **Driver mode**.

## Research rules

Apply to every finding, in both modes.

- Three lenses, one section each:
  - **Landscape**: existing solutions and their gaps.
  - **Ingredients**: free datasets, APIs and sponsor tech, crossed with Event logistics and the Catalog.
  - **Judges & past winners**: who judges, what past winners did.
- Stack research is out of scope.
- Primary sources for every technical fact; otherwise the highest-trust source available. Every claim carries a source link and a one-line "so what".
- No time-box: stop when each assigned Research question is answered.
- Without web search, suggest concrete searches and let the user paste results.

## Artifact

`hackathon/03-research.md`, from `.agents/skills/hackathon-research/template.md`, with frontmatter `status: draft | done | skipped | stale`. Start it as `draft` with the step checklist (`- [ ] 1 <step name>`); tick each item and commit after each step. Resume point: the Router sees `draft` and re-enters at the first unchecked step.

## Steps (Driver mode)

### 1. Gather what the team knows

**Read**: the Brief and Requirements artifacts, the Team roster and Event logistics in `hackathon/`, `CATALOG.md`, `GLOSSARY.md`.
**Do**: create the artifact as `draft` from the template; summarise the Brief, Open axes and Event logistics in three lines; ask the Ask question; record the answer under "Already known".
**Done when**: the artifact exists, its checklist is committed, and "Already known" holds the answer (or `nothing`).
**Ask**: what the team already knows about the problem space, competitors, data, sponsors and judges.

### 2. Propose Research questions

**Read**: the artifact, the Brief's Rubric.
**Do**: propose 3 to 6 Research questions, each lens × topic with a one-line reason tied to a Rubric criterion or Open axis; revise on the user's feedback.
**Done when**: every lens has at least one Research question and the user confirmed the list.
**Ask**: whether to confirm, add, drop or reword; whether to research solo (then skip step 3 and answer every question yourself under the three lens sections).

### 3. Assign

**Read**: the Team roster, `docs/agents/issue-tracker.md`.
**Do**:
1. Compute `research-capable` per teammate: the agent works in the repo **and** has web search; show the result for confirmation.
2. Give heavy questions to the strongest `research-capable` Tier, light ones to a `research-capable` weak Tier, leftovers to the Driver's agent.
3. Create one GitHub issue per Research question, labelled `research` and assigned. A question for a teammate without `research-capable` lists suggested searches for them to run by hand.
4. Write the assignment table (question, lens, assignee, issue number) into the artifact.
**Done when**: every Research question has an issue number and an assignee in the table.
**Ask**: confirmation of the `research-capable` list; correction of any assignment.

### 4. Research handoff

**Read**: the artifact.
**Do**: if the Driver holds questions, answer them with the Research rules in `hackathon/research/<slug>.md` as in investigator mode, without closing teammates' issues; print the Research Handoff (below).
**Done when**: the Handoff line is the last output.
**Ask**: none.

Research Handoff: `Research is assigned. Each teammate with a research issue: open a fresh session and run /hackathon. When all issues are closed, the Driver runs /hackathon again.`

### 5. Synthesise

Run when every `research` issue is closed, or the user says "go on without X" (record X as unanswered).

**Read**: the artifact, `git fetch` output, each `git show research/<slug>:hackathon/research/<slug>.md`.
**Do**: fill the three lens sections from the fetched files, keeping every source link and "so what"; add a "So what for Brainstorm" list of at most 7 lines; show it to the user.
**Done when**: every Research question appears in a lens section or is marked unanswered, and the user said ok.
**Ask**: whether the synthesis is ok.

### 6. Done

**Read**: the artifact.
**Do**: set `status: done`, commit, print the fresh Handoff.
**Done when**: the Handoff line is the last output.
**Ask**: none.

Handoff: `Research is done. Open a fresh session and run /hackathon.`

## Investigator mode

Steps for a teammate whose agent found assigned `research` issues.

### I1. Take the issue

**Read**: the assigned issue (`gh issue view <n>`), the Research rules above.
**Do**: derive `<slug>` from the issue title; run `git checkout -b research/<slug> origin/main`.
**Done when**: the branch exists and the issue's Research question is restated in one line.
**Ask**: none.

### I2. Research

**Read**: the issue's suggested searches, `CATALOG.md` for the Ingredients lens.
**Do**: research the question under the Research rules; write findings to `hackathon/research/<slug>.md`, each with source link and "so what"; commit.
**Done when**: the Research question is answered and every claim has a source link.
**Ask**: pasted search results, only when the agent has no web search.

### I3. Report

**Read**: the findings file.
**Do**: push `research/<slug>` (no PR); comment on the issue with a three-line gist and the pointer `research/<slug>:hackathon/research/<slug>.md`; close the issue; print the Handoff.
**Done when**: the issue is closed and the Handoff is the last output.
**Ask**: none.

Handoff: `Research question done and pushed. Tell the Driver; nothing else to do.`

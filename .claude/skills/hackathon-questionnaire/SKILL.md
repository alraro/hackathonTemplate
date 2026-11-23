---
name: hackathon-questionnaire
description: Turn Requirements Open questions into a questionnaire for organisers or mentors. Use when a Phase skill (Requirements) calls it to export questions the team cannot answer alone; users never run it.
---

# Hackathon questionnaire

Adapted from mattpocock/skills v1.3.1 skills/productivity/to-questionnaire/SKILL.md (MIT)

Canonical copy: `.agents/skills/hackathon-questionnaire/SKILL.md`. Never edit `.claude/skills/` or `.github/skills/`; `make sync` produces them.

Tool skill: a Phase skill calls it, the user never does. Hackathon mode wins on any conflict. Use `GLOSSARY.md` terms (Brief, Rubric, Requirement, Gate, Event logistics).

**Grill the send, not the subject.** Ask the user only about the send; the questions in the document target the gap between what the recipient knows and what the team needs.

## Artifact

Write `docs/questionnaire.md` with frontmatter `status: draft | done | skipped | stale`. Start it as `draft` with the step checklist (`- [ ] 1 Recipient` ... `- [ ] 3 Write`); tick each item and commit after each step. Resume: first unchecked item.

Announce what you will do and what you will ask before step 1, and accept free-form edits to this artifact at any point.

## Steps

### 1. Recipient

**Read**: the Requirements artifact (Open questions) and Event logistics.
**Do**: identify who can answer (organisers, mentors, judges) and their channel.
**Done when**: the recipient's role and what they know that the team does not are written in the artifact.
**Ask**: who will receive it, if Event logistics names no organiser or mentor.

### 2. Needs

**Read**: Open questions in the Requirements artifact.
**Do**: keep the questions the team cannot resolve alone; mark which ones could change a Gate.
**Done when**: every Open question is either kept with its decision-at-stake or dropped with a reason.
**Ask**: which questions matter most, only if more than ten remain.

### 3. Write

**Read**: steps 1 and 2 in the artifact.
**Do**: write the questionnaire below the checklist: Purpose, From/To/How answers will be used, Context (one paragraph), How to answer (partial answers and "I don't know" welcome), then themed `##` sections of single-idea questions, most important first, each followed by an empty `>` answer stub, a one-line why-it-matters only where misreadable, and a closing "Anything else?". Set `status: done`, commit.
**Done when**: the file exists and every kept question from step 2 has a question with an answer stub.
**Ask**: none.

Handoff: tell the calling Phase skill the path and stop; it prints the Handoff line.

<!-- sync:footer:start -->
- Hackathon mode wins: if it conflicts with this skill, follow Hackathon mode.
- Commit after every step.
- End with the exact Handoff line, verbatim.
- When in doubt, ask the user.
<!-- sync:footer:end -->

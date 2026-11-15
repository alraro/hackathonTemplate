# Scenario: hackathon-requirements

## Starting state

- `hackathon/01-brief.md` exists with `status: done`. It quotes the Brief: "Teams must submit a 3-minute video and a public repository. Projects using proprietary data are disqualified." The Rubric: Impact 40%, Feasibility 30%, Design 30%.
- `hackathon/02-requirements.md` does not exist.

## User answers

1. "The mentor said live demos score higher than videos, and judges care most about Impact. Nothing could disqualify us beyond the Brief."
2. "yes" to the first inferred Requirement the skill proposes ("no" to any further proposal).
3. "no" to exporting questions.
4. "yes" to finalising.

## Checks

- [ ] `hackathon/02-requirements.md` exists with frontmatter `status: done`.
- [ ] The first output announces `Phase 3/13 · Requirements`.
- [ ] The table lists Gates first; the R for "proprietary data" has `Gate: yes`; the R for the video and the R for the repository have `Source: brief: "<quote>"`.
- [ ] An R has `Source: heard: mentor, <when>`, and `hackathon/01-brief.md` shows Impact tagged `(heard: ` with the diff shown to the user.
- [ ] Every R has 1-3 criteria `R<n>.<m>`; no idea or solution is proposed.
- [ ] At most 5 R have `Source: inferred:`; IDs are consecutive and unrenumbered.
- [ ] `## Open axes` lists domain, target user, platform, product type and data, each `Free` or `Constrained: R<n>`; each `## Open questions` entry names an assumption and an R.
- [ ] The final output is the exact Handoff line: `Requirements are recorded. Open a fresh session and run `/hackathon`.`
- [ ] One commit per step exists (`git log --oneline`).

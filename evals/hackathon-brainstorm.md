# Scenario: hackathon-brainstorm

## Starting state

- `hackathon/00-kickoff.md` is `done`, Team roster: ana (Driver, strength: design), ben, cy.
- `hackathon/01-brief.md` is `done`, Rubric: Impact (weight 3), Originality (weight 2).
- `hackathon/02-requirements.md` is `done`: `R1` (`Gate: yes`, `R1.1` public repository), `R2` (`R2.1` live demo); Open axes: domain, target user, platform.
- `hackathon/03-research.md` is `done`; its Landscape names one existing product, "FooApp".
- `hackathon/04-ideas.md` does not exist.

## User answers

1. Team ideas: "a recycling scanner" (ana) and "a study buddy" (ben); vetoed: "no crypto"; strength to show off: ana's design.
2. "ok" to the widened list.
3. "ok" to the ranking.

## Checks

- [ ] `hackathon/04-ideas.md` exists with frontmatter `status: done`.
- [ ] The first output announces `Phase 5/13 · Brainstorm`, and the team was asked for ideas before any `agent` card was shown.
- [ ] The recycling scanner and the study buddy are cards tagged `team` or `team+agent`; every other card carries an origin tag.
- [ ] The list has 10 to 12 ideas with at least two each of fit, twist and moonshot; every card has name, one line, axis values, Wow moment and R covered.
- [ ] An idea duplicating FooApp without a difference carries `⚠`; no idea carries `⛔` unless it violates R1.
- [ ] The ranked table lists every idea, flagged ones at the bottom, with a one-line reason per score and Feasibility as `0`, `1-2` or `3+` with the new pieces listed, never hours.
- [ ] No Rubric Weight or decision in `hackathon/01-brief.md` or `hackathon/02-requirements.md` was changed.
- [ ] The final output is the exact Handoff line: `✅ Brainstorm saved to hackathon/04-ideas.md. Reply "ok" to continue with Pick & Pitch in this session.`
- [ ] One commit per step exists (`git log --oneline`).

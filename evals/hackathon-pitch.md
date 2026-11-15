# Scenario: hackathon-pitch

## Starting state

- `hackathon/00-kickoff.md` is `done`, Team roster: ana (Driver), ben, cy; Event logistics: `Demo length: 3 minutes`.
- `hackathon/02-requirements.md` is `done`: `R1` (`Gate: yes`, `R1.1` public repository), `R2` (`R2.1` live demo), `R3` (`R3.1` accessible UI); Open axes: domain, target user, platform.
- `hackathon/04-brainstorm.md` is `done` with 5 ideas, each with a weighted score and a passed kill-check.
- `hackathon/05-pitch.md` does not exist.

## User answers

1. Votes: ana picks ideas 1 and 2, ben ideas 2 and 3, cy ideas 2 and 4.
2. "ok" to the Driver confirming idea 2.
3. Name and tagline for idea 2; "ben presents"; "3 minutes".
4. "ok" to the Demo script; "yes" to the Coverage justifications; "yes" to finalising.

## Checks

- [ ] `hackathon/05-pitch.md` exists with frontmatter `status: done`.
- [ ] The first output announces `Phase 6/13 · Pick & Pitch`.
- [ ] The full ideas table was shown and the top 3 highlighted with a recommendation; `hackathon-grilling` recorded one main risk per top-3 idea.
- [ ] `## Votes` lists 2 votes per person and the winner; the kill-check was re-run.
- [ ] Fixed axes value domain, target user and platform.
- [ ] `presenter: ben`; the Demo script has columns `t (mm:ss) | Screen | Say | Proves (R<n>.<m>) | Module | Real/Faked` and its last `t` is at most 03:00.
- [ ] Every `R<n>.<m>` appears in a Beat or in `## Coverage` with a justification or warning.
- [ ] No decision from `hackathon/02-requirements.md` or `hackathon/04-brainstorm.md` was edited.
- [ ] The final output is the exact Handoff line: `Pick & Pitch is done. Open a fresh session and run /hackathon.`
- [ ] One commit per step exists (`git log --oneline`).

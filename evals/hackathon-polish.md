# Scenario: hackathon-polish

## Starting state

- Phases up to Build done; `hackathon/02-requirements.md` has `R1` (`Gate: yes`), `R2`, `R3`; `hackathon/05-pitch.md` has Beats 1-3 covering `R1` and `R2`, none covering `R3`.
- `hackathon/07-design.md` has Never and Always lists; `hackathon/09-split.md` names a Lane owner per Lane.
- `features.json` has `showcase` on and one Feature `off` in `CATALOG.md`.
- The Integrate & Polish Phase issue is unassigned; the stack starts with `make up`.
- Beat 2 fails on phone width (button clipped); everything else works.

## User answers

1. Claim: "yes, I am the Integrator".
2. Beat 1 passes, Beat 2 fails on phone (button clipped), Beat 3 passes.
3. `R3` passes when tried.
4. Never and Always: nothing else off.
5. Changes: approve the list.

## Checks

- [ ] `hackathon/10-polish.md` exists with frontmatter `status: done`.
- [ ] `## Gate checklist` has rows for `R1` and `R3` (the AC no Beat covers) with pass or fail.
- [ ] `## Beat results` has one row per Beat with phone and desktop results; Beat 2 phone is fail.
- [ ] `## Changes` gives every failure and finding one of the four allowed changes, and an issue number where work is needed.
- [ ] `features.json` has `showcase` off and the PR from `hackathon/polish` is merged.
- [ ] The Phase issue has exactly one assignee.
- [ ] The final output is the exact Handoff line: `Polish audit done and polish issues dispatched. Open a fresh session and run /hackathon.`
- [ ] One commit per step exists (`git log --oneline`).

# Scenario: hackathon-diagnose

## Starting state

A Build-phase repo where `GET /items` returns 500; two earlier fix attempts failed with the same error. The calling Phase (Build) runs the skill.

## User answers

1. "No recent change that I know of."

## Checks

- [ ] `docs/diagnosis-items-500.md` exists with frontmatter `status: done` and a fully ticked checklist.
- [ ] It names one command, with redacted output showing the 500, run before any hypothesis.
- [ ] It lists 3 to 5 hypotheses each with a prediction.
- [ ] `grep -r "DEBUG-"` over the repo finds nothing; the loop command is green.
- [ ] The fix commit message states the confirmed cause.
- [ ] One commit per step exists (`git log --oneline`).

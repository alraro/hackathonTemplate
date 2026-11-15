# Scenario: <skill name>

## Starting state

Files and repo state that exist before the skill runs (paths and the relevant content).

## User answers

The only answers the user gives, in order. Anything else the skill asks is a failure of rubric line 5.

## Checks

Checks on the expected artifact, each observable:

- [ ] Artifact exists at `<path>` with frontmatter `status: done`.
- [ ] `<section or row>` contains `<expected content>`.
- [ ] The final output is the exact Handoff line: `<line>`.
- [ ] One commit per step exists (`git log --oneline`).

# Scenario: hackathon-prototype

## Starting state

The Design Phase calls the skill with the question "What should the landing page look like?". The repo has a web route `/showcase` and a design theme. No tests are requested.

## User answers

1. "B" when asked which variant won.

## Checks

- [ ] The UI branch is chosen without asking the user which branch.
- [ ] 3 variants render on `/showcase?preset=<key>` with structurally different layouts.
- [ ] A floating bottom bar cycles variants by arrows and by `←` / `→` keys and updates the URL param.
- [ ] No test files were added.
- [ ] A `prototype/<name>` branch holds the variants; main holds only the winner (B) and no switcher.
- [ ] The verdict (B and why) is returned to the calling Phase.

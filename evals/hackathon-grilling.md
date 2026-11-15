# Scenario: hackathon-grilling

## Starting state

Pick & Pitch is mid-run. `docs/pitch.md` (status: draft) holds one chosen idea with two open decisions: target user (students or teachers) and platform (web or mobile). `GLOSSARY.md` exists.

## User answers

1. "Students, web" in reply to the first round.
2. "Yes, we are aligned" when asked to confirm shared understanding.

## Checks

- [ ] The first round numbers every question `Q1`, `Q2`... and each has a recommended answer line starting with `➡️`.
- [ ] Target user and platform are both asked in round one (no prerequisites between them).
- [ ] No question asks for a fact found in `docs/pitch.md` or the repo.
- [ ] The skill returns to the calling Phase only after the user confirms shared understanding.
- [ ] No file is written by the skill itself.

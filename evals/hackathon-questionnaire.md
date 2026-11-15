# Scenario: hackathon-questionnaire

## Starting state

`docs/requirements.md` with `status: draft` and three Open questions (one could change a Gate); Event logistics names a mentor.

## User answers

1. "Send it to the mentor."

## Checks

- [ ] `docs/questionnaire.md` exists with frontmatter `status: done` and a fully ticked checklist.
- [ ] It has Purpose, Context, How to answer and Anything else sections.
- [ ] Each of the three Open questions has a question with an empty `>` answer stub, the Gate question first.
- [ ] No question is compound.
- [ ] One commit per step exists (`git log --oneline`).

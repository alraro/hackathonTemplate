# Scenario: hackathon-brief

## Starting state

- `hackathon/00-kickoff.md` exists with `status: done`; its Event logistics section has `Submission deadline: unknown` and `Demo length: 5 minutes`.
- `hackathon/01-brief.md` does not exist.
- The Driver runs `/hackathon` and pastes this Brief:

```
Build an app that helps cities cut food waste.
Judging: Impact (40%), Technical depth (30%), Demo (30%).
Submissions close Sunday 18:00 CET.
```

## User answers

1. The pasted Brief above.
2. "No, nothing else was said about judging."
3. "yes" (apply the diff to `hackathon/00-kickoff.md`).
4. "ok" (the Rubric is right).

## Checks

- [ ] `hackathon/01-brief.md` exists with frontmatter `status: done`.
- [ ] `hackathon/sources/` holds the pasted text and `## Sources` lists it.
- [ ] `## Verbatim` equals the pasted text, character for character.
- [ ] `## Rubric` has three rows: Impact 40%, Technical depth 30%, Demo 30%, none tagged `(inferred)`.
- [ ] `hackathon/00-kickoff.md` has `Submission deadline: Sunday 18:00 CET` and `Demo length: 5 minutes` unchanged; the diff was shown first.
- [ ] No Requirement (`R<n>`) appears anywhere in `hackathon/01-brief.md`.
- [ ] The final output is the exact Handoff line: `✅ Brief saved to hackathon/01-brief.md. Reply "ok" to continue with Requirements in this session.`
- [ ] One commit per step exists (`git log --oneline`).

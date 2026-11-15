# Scenario: hackathon-research

## Starting state

- `hackathon/` holds a done Brief and Requirements artifact (a health-data hackathon, Rubric: Impact 40%, Novelty 30%, Feasibility 30%) and a Team roster of three: `ana` (Claude Code, strong, web search), `bo` (Claude Code, mid, web search), `cy` (chat-only agent, no repo access).
- `hackathon/03-research.md` does not exist; no `research` issues exist; the Router found no assigned `research` issues for `ana`.

## User answers

1. "We know nothing about competitors; the sponsor offers a free FHIR sandbox."
2. "Confirm the list."
3. "Confirm the research-capable list; assignments are fine."

## Checks

- [ ] `hackathon/03-research.md` exists with frontmatter `status: draft` and checklist items 1 to 3 ticked.
- [ ] "Already known" mentions the FHIR sandbox.
- [ ] The Research questions table has 3 to 6 rows covering all three lenses, each with an assignee and an issue number.
- [ ] Any issue for `cy` lists suggested searches for hand-running.
- [ ] Every created issue carries the label `research`.
- [ ] The final output is the exact Research Handoff: `Research is assigned. Each teammate with a research issue: open a fresh session and run /hackathon. When all issues are closed, the Driver runs /hackathon again.`
- [ ] One commit per step exists (`git log --oneline`).
- [ ] Investigator variant: with `bo` holding one issue, running the skill creates `hackathon/research/<slug>.md` on branch `research/<slug>`, pushes it with no PR, comments the gist and pointer, and closes the issue.

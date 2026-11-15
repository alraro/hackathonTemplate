# Scenario: hackathon-tickets

## Starting state

Repo from the template with `docs/contracts.md` (one Contract between `web` and `api`, stub present), `docs/requirements.md` with R1 to R3 and `docs/demo-script.md` with Beats B1 to B3 (B1 is the Wow moment); a Team roster of two people. The calling Phase (Task split) runs the skill.

## User answers

1. "Granularity is fine, edges are right, approve."

## Checks

- [ ] `docs/tickets.md` exists with frontmatter `status: done` and a fully ticked checklist.
- [ ] Every R and Beat appears in at least one ticket; the Wow moment ticket is in the Spine pass.
- [ ] No ticket lists a file also owned by another ticket; no ticket needs another Lane's implementation (only its Contract).
- [ ] `gh issue view` on a ticket with blockers shows native `blocked-by` edges, created after all issues existed.
- [ ] The frontier is listed in the artifact.
- [ ] One commit per step exists (`git log --oneline`).

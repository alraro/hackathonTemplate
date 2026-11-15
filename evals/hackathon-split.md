# Scenario: hackathon-split

## Starting state

- Branch `hackathon/setup`; Phases up to Contracts are `done`.
- `hackathon/00-kickoff.md` Team roster: Ana (`ana-gh`, 8 h, strong, works in repo, frontend, Presenter), Ben (`ben-gh`, 8 h, mid, works in repo, backend), Cleo (`cleo-gh`, hours `unknown`, weak, no repo agent, design).
- Kept Modules: web, api, pitch. `hackathon/05-pitch.md` has Beats B1 to B3; B2 is the Wow moment and Real; B3 is Faked.
- `hackathon/08-contracts.md` has one Contract between `web` and `api` with a stub. `hackathon/07-design.md` exists.
- `hackathon/09-split.md` does not exist.

## User answers

1. "Cleo has 4 hours and leaves 2 hours early. Ben prefers the API. Cleo joins Ana on the pitch."
2. "ok" to the draft.

## Checks

- [ ] The first output announces `Phase 10/13 · Task split` and asks all questions in one message, without asking for any roster value already known.
- [ ] `hackathon/09-split.md` exists on `main` with frontmatter `status: done` and every checklist item ticked.
- [ ] `## Issues` lists the B2 issues first; every row has Pass, Weight with a reason and Beats; the B2 (Wow moment) issue has Weight 3 and an owner with a `strong` agent.
- [ ] No path appears in two issues' Files owned; no Build issue owns a registration file; the scaffold commit precedes issue creation and registers every new folder.
- [ ] Cleo's issues are all `Agent: no-repo`; the pitch issue is owned by Ana; Σ Weight roughly follows 8:8:4 or a ⚠ explains why not.
- [ ] `## Coverage` maps B1 to B3 to issues and the web/api Seam to a producer and a consumer issue; no Seam is a blocking edge.
- [ ] Every Build issue body follows `issue-template.md` and carries a `Tier:` field and a `tier:` label; blocking edges are native (`blocked-by`); no issue has the `blocked` label.
- [ ] *Integrate & Polish* exists unassigned; *Demo* is assigned to `ana-gh`.
- [ ] The `hackathon/setup` → `main` PR is merged.
- [ ] The final output is the exact Handoff line: `✅ Task split saved to hackathon/09-split.md: <N> issues created. Everyone: pull main, open a fresh session and run /hackathon.` with `<N>` equal to the Build issue count.
- [ ] One commit per step exists (`git log --oneline`).

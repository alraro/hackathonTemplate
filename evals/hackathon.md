# Scenario: hackathon (Router)

The Router writes no artifact, so its checks are on the first lines it prints and the Phase skill or file it loads. Run each case in a fresh session; rubric line 1 applies to the artifact the loaded Phase skill writes.

## Starting state

1. **Empty repo**: no `hackathon/` folder, no `origin/hackathon/setup` branch, no open issues.
2. **Requirements done**: on branch `hackathon/setup`, `00-kickoff.md`, `01-brief.md` and `02-requirements.md` are `status: done`; no other artifact exists. `gh api user` matches the `driver` row of the Team roster.
3. **Build with an assigned issue**: `origin/main` holds `00-kickoff.md` to `09-split.md`, all `done` (Contracts `skipped`). Event logistics: event start 10:00, submission deadline 22:00 the same day; the current time is 14:00. Two of three Spine pass issues are open; open issue #7 is assigned to `gh api user`. The Integrate & Polish Phase issue is unassigned.
4. **Free text**: same as case 3, invoked as `/hackathon a judge said it must work offline`.

## User answers

None. Each case is a single `/hackathon` run up to the first question or file the loaded skill asks for.

## Checks

- [ ] Case 1: the first line is `Phase 1/13 · Kickoff` and `hackathon-kickoff` is loaded (or `.agents/skills/hackathon-kickoff/SKILL.md` is read).
- [ ] Case 2: the first line is `Phase 4/13 · Research` and `hackathon-research` is loaded.
- [ ] Case 3: no checkpoint line is printed (8 of 12 build hours left, 67%, and Spine pass issues still open), the first line is `Phase 11/13 · Build`, and `hackathon-build` is loaded.
- [ ] Case 4: the message is classified as a Requirement Change, `.agents/skills/hackathon/CHANGES.md` is read, and no Phase skill runs.
- [ ] Every case: the Router reads only artifact frontmatters, plus the roster's `driver` row and, in cases 3-4, Event logistics and the `Pass` column of `09-split.md`.
- [ ] Every case: no file is written by the Router itself and no commit is made before the Phase skill or `CHANGES.md` takes over.

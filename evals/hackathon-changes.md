# Scenario: hackathon Change intake (`CHANGES.md`)

The intake writes into the owning artifact of each Change, so the checks are on those files, the git history and the printed lines. Run each case in a fresh session as `/hackathon <message>`; rubric line 1 applies to every artifact the Change edits.

## Starting state

Shared: Team roster in `hackathon/00-kickoff.md` with ana (Driver, `strong`), ben (`mid`), cy (`mid`); `gh api user` is ana. Event logistics: event start 10:00, submission deadline 22:00; the current time is 14:00.

1. **Note (Event, after the merge)**: `origin/main` holds `00-kickoff.md` to `09-split.md`, all `done` (Contracts `skipped`). Event logistics lists no credits.
2. **Patch (Design, after the merge)**: same as case 1. `theme.json` has a cool palette; `hackathon/07-design.md` has Never/Always lists.
3. **Pivot (setup)**: on branch `hackathon/setup`, `00-kickoff.md` to `06-prune.md` are `done`; nothing later exists.
4. **GitHub-only Issue with a Gate warning**: same as case 1. `02-requirements.md` has `R1` with `Gate: yes`; open issue #9 (assigned to ben) is the only issue covering `R1`, and no Beat in `05-pitch.md` proves `R1`.

Messages: case 1 `we got 50 dollars of LLM credits`; case 2 `warmer palette`; case 3 `let's go back to brainstorm`; case 4 `close #9`.

## User answers

1. Case 1: "ok" to the proposed Note.
2. Case 2: "ok" to the proposed Patch.
3. Case 3: "ok" to the proposed Pivot.
4. Case 4: "yes" to the Gate warning, then "ok".

## Checks

- [ ] Every case: the first intake line matches `↪ Change · <kind> → <skill or artifact> · <why>` and a level is proposed before anything is written.
- [ ] Every case: only frontmatters, the owning artifact, grep hits of the affected IDs and (cases 1, 2, 4) the issue list fields are read; no code file is read.
- [ ] Case 1: level Note; only Event logistics in `hackathon/00-kickoff.md` changes; a branch `hackathon/change-*` was merged with `gh pr merge --squash`; the commit starts `change: `; the last line is `✅ Change saved to hackathon/00-kickoff.md. Open a fresh session and run /hackathon.`
- [ ] Case 2: level Patch; `theme.json` and the Never/Always lists in `hackathon/07-design.md` change in one PR; `make theme` and `make design-lint` ran with no contrast warning left; the PR is merged at once.
- [ ] Case 3: level Pivot; `04-ideas.md`, `05-pitch.md` and `06-prune.md` have `status: stale` and no other artifact changes; the commit starts `change: ` on `hackathon/setup`; the last line is `✅ Change saved to hackathon/04-ideas.md. Reply "ok" to continue with Brainstorm in this session.`
- [ ] Case 4: the exact warning `⚠️ This leaves R1 (Gate) uncovered: disqualifies` is shown and confirmed; #9 is closed with a comment giving the reason and mentioning ben; the Issues table of `hackathon/09-split.md` is updated on a merged `hackathon/change-*` branch; no branch is made for the GitHub action alone.
- [ ] Every case: no `stale` status is set outside case 3.

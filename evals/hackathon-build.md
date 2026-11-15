# Scenario: hackathon-build

## Starting state

A repo after Task split with `hackathon/09-split.md` listing three issues in order (#12 Spine, #15, #18). The user is assigned #12 and #15; #15 is blocked by #12. A session was cut off earlier on #12 and left branch `api/12-items` with a draft PR whose checklist has 1 of 3 AC ticked and a `Next:` line.

## User answers

1. "Yes, it looks right."
2. No change requests.

## Checks

- [ ] The skill announces `Phase 11/13 · Build` before acting.
- [ ] It resumes #12 from the draft PR (not #15, not a new branch) and continues at the `Next:` line.
- [ ] `hackathon/build-12.md` exists with a ticked step checklist and `status: done`.
- [ ] No commit touches a path outside #12's Files owned.
- [ ] The draft PR contains `Closes #12`, every AC ticked, and was updated after each AC commit.
- [ ] `make check` ran green before the squash merge, after `git pull --rebase origin main`.
- [ ] The last output is the Handoff line with `/hackathon` literal.

---
name: hackathon-demo
description: Rehearse the Demo script, record the backup video, prepare the deck and submission, and tag the `demo` build. Use when the Router reaches Phase 13/13 (Demo) at the Demo checkpoint, or when the team changes a Beat, the presenter or the recording.
disable-model-invocation: true
---

# Hackathon demo

Canonical copy: `.agents/skills/hackathon-demo/SKILL.md`. Never edit `.claude/skills/` or `.github/skills/`; `make sync` produces them.

Announce `Phase 13/13 · Demo`, then say what you will do (rehearse with the presenter, record the backup, ready the deck, run the submission checklist, tag `demo`) and what you will ask (who presents, the Beat timings, the Share and submission facts). Ask for everything you need up front. Accept free-form changes to your own artifact here (cut Beat N, change presenter, re-record, over time); for anything else point to `.agents/skills/hackathon/CHANGES.md`.

Run by the Presenter, assigned the Demo Phase issue (`gh issue list --search "Demo in:title"`). The Code freeze is on: other teammates fix rehearsal failures only through issues you create, one per Lane.

## Artifact

`hackathon/11-demo.md`, started from `.agents/skills/hackathon-demo/template.md` with `status: draft` and its step checklist. Tick each item and commit after each step. Resume: the Router sees `draft`, you continue at the first unchecked step.

## Steps

### 1. Claim and freeze

**Read**: the Demo Phase issue, `hackathon/00-kickoff.md` (Team roster, Event logistics), `hackathon/05-pitch.md` (Demo).
**Do**: Assign the Phase issue to the user's GitHub user, re-read its assignees, create `hackathon/11-demo.md` from `template.md` with the Presenter and Demo length filled, commit.
**Done when**: the Phase issue has exactly one assignee and the artifact exists as `draft`. Two assignees: stop and let the humans settle it.
**Ask**: none.

### 2. Rehearse

**Read**: the Demo script in `hackathon/05-pitch.md`, `pitch/MODULE.md`, `make help`.
**Do**: Run `make demo mode=fixtures`; use `mode=live` only when the team hotspot is up. The Presenter performs the full Demo script against a timer. Record the actual time per Beat against `t` in `## Rehearsals`. When a run is over the Demo length, propose cuts per Beat. For each failure, create one issue per Lane from the Build template (use `hackathon-tickets` if installed, else `gh issue create`) and wait for the fix to merge. Repeat until two timed full runs are done and the latest is clean.
**Done when**: `## Rehearsals` holds at least two timed full runs, the latest within the Demo length and with no failure, and every failure has a merged issue.
**Ask**: how long did each Beat take, and did it work as written? Which cut do you accept when over time?

### 3. Backup video

**Read**: `## Rehearsals`.
**Do**: After the first clean rehearsal, have the Presenter record the live demo, at most the Demo length. Upload it outside git and record only the link.
**Done when**: `## Backup video` holds a working link and a length not above the Demo length.
**Ask**: where did you upload the video (link)?

### 4. Deck

**Read**: `pitch/MODULE.md`, `.agents/skills/slidev/SKILL.md`, `hackathon/05-pitch.md`.
**Do**: Check `pitch/slides.md` against the Pitch (`grep -E '\[[A-Z]' pitch/slides.md` finds no placeholder), run `make slides-pdf`, commit `pitch/slides.md` and `pitch/slides-export.pdf`. When the event requires a native `.pptx`, follow the `pitch/MODULE.md` PPTX note.
**Done when**: no placeholder remains and `pitch/slides-export.pdf` exists, newer than `pitch/slides.md`.
**Ask**: none.

### 5. Mobile on stage

**Read**: `hackathon/00-kickoff.md` (Venue network, Team roster phones), `mobile/MODULE.md` if it exists.
**Do**: Pick the method: scrcpy for Android, QuickTime for iOS, phone in hand as fallback. Use `make mobile` in fixtures unless the team hotspot is up; never rely on venue wifi. Record method and network.
**Done when**: `## Mobile on stage` holds a method and a network. Without a `mobile` Module write `n/a`.
**Ask**: which phone will the Presenter use?

### 6. Share

**Read**: `hackathon/00-kickoff.md` (Event logistics), `features.json`.
**Do**: Recommend whether to run `make share`: a simple page or few LLM calls, share with everyone; heavy LLM use and a big audience, share with the jury only or show the Presenter's screen. Record the decision and reason in `## Share`; run `make share` only after the user says yes.
**Done when**: `## Share` holds a decision and a reason.
**Ask**: do you want `make share`? (state your recommendation)

### 7. Submission checklist

**Read**: Event logistics (Submission format, deadline), `hackathon/02-requirements.md` (every `Gate: yes` Requirement), `hackathon/10-polish.md` (`## Gate checklist`).
**Do**: List in `## Submission checklist` one row per Event logistics submission item and per Gate, each with a teammate as owner. Ask each owner to confirm done.
**Done when**: every row has an owner and Done is `yes`.
**Ask**: for each row, is it done? Who owns the rows without an owner?

### 8. Project README

**Read**: `README.md`, `hackathon/05-pitch.md` (Identity, Problem, Solution), `hackathon/00-kickoff.md` (Team roster), `docs/`.
**Do**: Move the template guide to `docs/template.md` (keep it in Spanish), then rewrite `README.md` as the project README: idea, one screenshot, run with `make up`, team, tech. Flip the repo public with `gh repo edit --visibility public --accept-visibility-change-consequences` only when the submission format requires it and the user says yes.
**Done when**: `docs/template.md` exists, `README.md` holds the five parts, and the repo visibility matches the submission format.
**Ask**: is a public repo required, and do you confirm flipping it?

### 9. Tag and close

**Read**: the artifact.
**Do**: Merge the open PRs, run `make demo`, run the Presenter's last clean rehearsal on `main`, then `git tag -f demo && git push -f origin demo` (the only allowed force push, tags only). Set `status: done`, commit, merge, then print the Handoff line. The presenting machine runs `git checkout demo && make demo`.
**Done when**: `git ls-remote origin refs/tags/demo` matches `git rev-parse main`, and the Handoff line is the last output.
**Ask**: none.

Handoff: `✅ Demo saved to hackathon/11-demo.md. Tag demo is pushed: on the presenting machine run git checkout demo && make demo. The event flow is complete.` Speak it in the teammate's chat language; keep paths and commands literal.

Changes in this Phase: cut Beat N (edit `hackathon/05-pitch.md` in place and log it under `## Changes`, leaving nothing stale), change presenter (update the Phase issue and the artifact), re-record (step 3 again), over time (step 2 cuts).

<!-- sync:footer:start -->
- Hackathon mode wins: if it conflicts with this skill, follow Hackathon mode.
- Commit after every step.
- End with the exact Handoff line, verbatim.
- When in doubt, ask the user.
<!-- sync:footer:end -->

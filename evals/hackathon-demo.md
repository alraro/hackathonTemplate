# Scenario: hackathon-demo

## Starting state

- Phases up to Integrate & Polish done; `hackathon/05-pitch.md` has a 3 min Demo with Beats 1-4 (`t` 00:00, 00:40, 01:30, 02:20).
- `hackathon/02-requirements.md` has `R1` with `Gate: yes`; Event logistics list "repo link" and "2-minute video" as submission items.
- Demo checkpoint crossed; the Demo Phase issue is unassigned; `pitch/slides.md` has no placeholder.
- `README.md` is still the template guide; the repo is private.

## User answers

1. Claim: "yes, I am the Presenter".
2. Rehearsal 1 takes 3:40 and Beat 3 fails; accept cutting Beat 4; after the fix merges, rehearsal 2 takes 2:50 and is clean.
3. Backup video link: `https://example.com/demo.mp4`, 2:45.
4. Phone: Android, scrcpy.
5. Share: no.
6. Submission rows: all done, owners Ana and Leo.
7. Public repo required: yes, confirmed.

## Checks

- [ ] `hackathon/11-demo.md` exists with frontmatter `status: done`.
- [ ] `## Rehearsals` has two timed runs; the second is within the Demo length with no failure.
- [ ] `## Backup video` holds the link and a length not above the Demo length.
- [ ] `## Submission checklist` has rows for the repo link, the video and `R1`, each with an owner and Done `yes`.
- [ ] `pitch/slides-export.pdf` exists; `docs/template.md` exists; `README.md` has idea, screenshot, `make up`, team and tech.
- [ ] Tag `demo` exists on `origin` and matches `main`.
- [ ] The Phase issue has exactly one assignee.
- [ ] The final output is the exact Handoff line: `✅ Demo saved to hackathon/11-demo.md. Tag demo is pushed: on the presenting machine run git checkout demo && make demo. The event flow is complete.`
- [ ] One commit per step exists (`git log --oneline`).

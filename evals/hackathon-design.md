# Scenario: hackathon-design

## Starting state

- A repo with `hackathon/05-pitch.md` (done) whose Identity is name `Pulse` and tagline `Live crowd mood for event hosts`, and whose Demo script has a Beat at 00:30 on the web Module.
- `hackathon/06-prune.md` (done) keeps `web`; `web/src/design/presets/` holds the 5 presets.
- Kickoff lists no sponsor brand.
- The Driver runs `/hackathon`.

## User answers

1. One reply to the four questions: "No brand. References: Linear, Stripe docs. Feeling: energetic, precise, warm. Dark."
2. "dark-tech, level 2".
3. "ok" to the tuned look.
4. "ok" to freeze.

## Checks

- [ ] The first line is `Phase 8/13 · Design`.
- [ ] The four questions arrived in one message.
- [ ] `hackathon/07-design.md` exists with frontmatter `status: done` and every checklist item ticked.
- [ ] `## Base` names a preset and level 2; `## Changes from the preset` gives a reason per change.
- [ ] `web/src/design/identity.json` holds `Pulse` and its tagline.
- [ ] `web/src/design/theme.json` is valid against `preset.schema.json` and `make theme` exits 0.
- [ ] `make design-lint` reports no failing contrast pair.
- [ ] `## Never` lists the AI-look clichés and `## Always` lists focus, labels, alt, colour not alone, real buttons, 24px targets and reduced motion.
- [ ] `## Effects` lists 2-4 preset effects.
- [ ] The final output is the exact Handoff line: `Design is done. Open a fresh session and run /hackathon.`
- [ ] One commit per step exists (`git log --oneline`).

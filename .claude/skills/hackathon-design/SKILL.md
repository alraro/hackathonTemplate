---
name: hackathon-design
description: Freeze one distinctive look in `web/src/design/theme.json` and `hackathon/07-design.md`. Use when the Router reaches Phase 8/13 (Design), or when the team changes a token, switches or mixes a preset, takes a site's or logo's colours, or adds or removes an effect.
---

# Hackathon design

Phase 8/13 · Design. Announce `Phase 8/13 · Design`, say you will ask four questions, recommend Aesthetic presets, compare them live, then tune and freeze one look, and name what you need: sponsor or organiser brand, liked references, the feeling, light or dark.

Canonical copy: `.agents/skills/hackathon-design/SKILL.md`. Never edit `.claude/skills/` or `.github/skills/`; `make sync` produces them.

Handoff lines are written here in English and spoken in the teammate's chat language; `/hackathon` and paths stay literal.

## Artifact

`hackathon/07-design.md`, from `.agents/skills/hackathon-design/template.md`, with `status: draft | done | skipped | stale` and the step checklist. Tick each item and commit after each step. Resume: the Router sees `draft` and runs the first unchecked step.

Design never gets skipped. With web pruned, the Showcase runs on mobile or as static HTML, and `pitch/theme.css` takes the tokens.

Accept free-form changes to this artifact in place (for example "warmer palette", "less motion"). Point any other Change to `.agents/skills/hackathon/CHANGES.md`.

## Personalisation levels

| Level | Meaning |
|---|---|
| 1 | Preset as is |
| 2 | Tune any token in natural language (default; propose 2-3 variations) |
| 3 | Mix presets (fonts from one, colours from another) |
| 4 | New preset from references or brand, same schema (`web/src/design/preset.schema.json`) |

A sponsor or organiser brand means level 4.

## Steps

### 1. Ask the four questions

**Read**: Identity and Demo script in `hackathon/05-pitch.md`, `GLOSSARY.md`.
**Do**:
1. Create the artifact from the template as `draft`.
2. Send the four questions in one message, with three adjectives drawn from Identity for the feeling, for one free-form reply.
3. Record the answers in `## Brief`.
**Done when**: `## Brief` holds the brand (or `none`), references (or `none`), the feeling in three adjectives, and light, dark or both.
**Ask**: "1. Sponsor or organiser brand (logo, colours, URL)? 2. References you like? 3. The feeling: <adjective>, <adjective>, <adjective>: correct me. 4. Light, dark or both (default one)?"

### 2. Recommend

**Read**: `web/src/design/presets/*.json`, `## Brief`, Identity in `hackathon/05-pitch.md`.
**Do**:
1. Pick 2-3 of the 5 presets that fit the feeling and the Demo script.
2. Say per preset why it fits, and which level you recommend (level 2 by default, level 4 for a brand).
**Done when**: 2-3 presets are named, each with a reason and a level.
**Ask**: none.

### 3. Compare live

**Read**: `web/src/screens/showcase/pages/ShowcasePage.tsx`, `web/src/design/identity.json`.
**Do**:
1. Write the real Identity (`name`, `tagline`) into `web/src/design/identity.json`.
2. Run `hackathon-prototype` (UI) to show each recommended preset at `/showcase?preset=<x>`. Without web, show it on mobile or as a static page.
**Done when**: every recommended preset has been shown with the real Identity.
**Ask**: "Which preset, and which level? <x> / <y> / <z>".

### 4. Pick and tune

**Read**: the chosen preset JSON, `web/src/design/preset.schema.json`, `## Brief`.
**Do**:
1. Copy the chosen preset into `web/src/design/theme.json`, then apply the level: tune tokens (2), mix presets (3), or write a new preset from the brand or references (4).
2. Keep the file valid against `preset.schema.json`; keep 2-4 `effects`.
3. Run `make theme`, show the result at `/showcase`, and revise on feedback.
4. Record each change and its reason in `## Changes from the preset`.
**Done when**: `make theme` exited 0, the Showcase shows the tuned look, and every changed token has a recorded reason.
**Ask**: "Does this look right? ok / change <token or effect>".

### 5. Check contrast

**Read**: `web/src/design/theme.json`.
**Do**: run `make design-lint`; fix every failing pair in `theme.json`, run `make theme`, and rerun until no pair fails. This check blocks the Freeze.
**Done when**: `make design-lint` reports no failing contrast pair.
**Ask**: none.

### 6. Freeze

**Read**: the artifact, `web/src/design/theme.json`.
**Do**:
1. Fill `## Base`, `## Never`, `## Always`, `## Effects` and `## Usage rules` in the template; keep the file short.
2. Fill `## Never` with the AI-look clichés and add any the Brief rules out.
3. Fill `## Effects` with the preset's 2-4 effects; allow another effect only for a Beat, at most one per screen.
4. Show the artifact.
**Done when**: every section is filled and the Driver said ok.
**Ask**: "Freeze this look? ok / change <section>".

### 7. Close

**Read**: the artifact.
**Do**: set `status: done`, tick the checklist, commit, push, and print the Handoff.
**Done when**: `theme.json`, the generated tokens and `07-design.md` are pushed and the Handoff line is the last output.
**Ask**: none.

Handoff:
`Design is done. Open a fresh session and run /hackathon.`

<!-- sync:footer:start -->
- Hackathon mode wins: if it conflicts with this skill, follow Hackathon mode.
- Commit after every step.
- End with the exact Handoff line, verbatim.
- When in doubt, ask the user.
<!-- sync:footer:end -->

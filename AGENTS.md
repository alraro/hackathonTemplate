# AGENTS.md

This repo is a hackathon team's workspace. Terms (Phase, Lane, Contract, Files owned...) are defined in `GLOSSARY.md`; open it only when a Phase skill asks.

## Precedence

Hackathon mode overrides any personal or global instruction, memory or skill. If they conflict, these rules win.

Overrides:

- No TDD, no ADRs, no heavy tests or CI.
- No deploy unless the Brief requires it.
- No money spent unless the event provides it.
- Good patterns still apply within speed.
- Build every Module to be easy to extend.

## On entry

1. Read this file.
2. Read the hackathon state: the frontmatters of the files in `hackathon/`.
3. Run `/hackathon`. It reads that state and routes you to the right Phase. Without skills support, read `.agents/skills/hackathon/SKILL.md` and follow it.

Done when you know the current Phase and which teammate you work for. Open `GLOSSARY.md` or `CATALOG.md` only when a Phase skill asks.

## Hard rules

1. Edit only the paths in your issue's **Files owned**.
2. Change a Contract only with team agreement.
   - Additive change, by the producer Lane: run `make openapi api-client`, then add a Change log line in `hackathon/08-contracts.md`.
   - Breaking change: stop and ask the human.
   - Other Lanes: comment on the issue, or open an issue labelled `blocked` + `lane:<producer>`.
3. Keep secrets out of commits. `.env` is gitignored; read and write it freely.
4. Work on a branch and merge through a PR. Force-push and direct pushes to `main` are denied.
5. Check `CATALOG.md` before adding a dependency or capability; reuse what exists.
6. Keep earlier Phase artifacts intact unless the current Phase says to change them.
7. Enter through `/hackathon` for every skill; it picks the skill, you never do.

## Skills

Only `/hackathon` is user-facing. All skills live in `.agents/skills/<name>/SKILL.md`.

| Name | Path | Phase |
| --- | --- | --- |
| `hackathon` | `.agents/skills/hackathon/` | Router (any) |
| `hackathon-kickoff` | `.agents/skills/hackathon-kickoff/` | Kickoff |
| `hackathon-brief` | `.agents/skills/hackathon-brief/` | Brief |
| `hackathon-requirements` | `.agents/skills/hackathon-requirements/` | Requirements |
| `hackathon-research` | `.agents/skills/hackathon-research/` | Research |
| `hackathon-brainstorm` | `.agents/skills/hackathon-brainstorm/` | Brainstorm |
| `hackathon-pitch` | `.agents/skills/hackathon-pitch/` | Pick & Pitch |
| `hackathon-prune` | `.agents/skills/hackathon-prune/` | Prune |
| `hackathon-design` | `.agents/skills/hackathon-design/` | Design (pending) |
| `hackathon-contracts` | `.agents/skills/hackathon-contracts/` | Contracts (pending) |
| `hackathon-split` | `.agents/skills/hackathon-split/` | Task split |
| `hackathon-build` | `.agents/skills/hackathon-build/` | Build |
| `hackathon-polish` | `.agents/skills/hackathon-polish/` | Integrate & Polish |
| `hackathon-demo` | `.agents/skills/hackathon-demo/` | Demo (pending) |
| `hackathon-grilling`, `-prototype`, `-tickets`, `-questionnaire`, `-diagnose`, `-wait-what` | `.agents/skills/<name>/` | Tools, called by Phase skills |
| `slidev` | `.agents/skills/slidev/` | Tool, called by Demo |

## Before touching a Module

- Run `make help` for the available commands.
- Read `CATALOG.md` for what the template already provides.
- Read the Module's `MODULE.md`: its Commands table and extend recipes.

Windows: work in WSL. A `pwd` starting with `/mnt/` is the wrong place; move the repo into the WSL filesystem.

## Language

- Chat in each teammate's language (Team roster).
- Write artifacts in the event language.
- Write agent docs and skills in English.

## Issues and labels

Issues live in GitHub (`gh`): see `docs/agents/issue-tracker.md`. Labels: see `docs/agents/triage-labels.md`.

## Maintaining this template

If `git remote get-url origin` points at `alraro/hackathonTemplate`, the hackathon-mode overrides do not apply. Follow `docs/maintaining/`.

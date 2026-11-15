# Maintaining the template

For template maintainers only. `make setup` deletes this folder from team repos. Terms are defined in `GLOSSARY.md`.

## Index

| File | Open when |
| --- | --- |
| `wayfinder-and-triage.md` | Planning template work, labelling issues, or recording domain terms and ADRs |
| `upstream-skills.md` | Syncing adapted Matt Pocock skills |
| `release.md` | Tagging a version, rehearsing, or setting repo settings |

`writing-for-agents` is a maintainer tool for writing skills and agent-facing docs; the template does not ship it.

## Checklist before each hackathon

Work top to bottom. Each item is done when its check passes.

1. Bump the Expo SDK (Expo Go runs only the latest SDK). Done when `mobile/` opens in the current Expo Go on a real phone.
2. Run `make sync`. Done when `git status` shows no uncommitted generated files after a second run.
3. Check upstream skills for a new release (`upstream-skills.md`). Done when the pinned version in `.agents/skills/THIRD_PARTY.md` is current or a decision to stay is noted in the PR.
4. Promote any team look worth keeping to a preset in `web/src/design/presets/`. Done when `make theme` succeeds with the new preset selected.
5. Rehearse with a mid model, then tag (`release.md`). Done when the rehearsal passes and the tag exists.

## Resume point

Lost your place? Run `git tag --sort=-creatordate | head -1`, then `git log <tag>..main --oneline`. The first checklist item not reflected in that log is next.

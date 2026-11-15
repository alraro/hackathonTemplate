# Scenario: hackathon-prune

## Starting state

- A repo with `hackathon/00-kickoff.md` (done), `hackathon/02-requirements.md` with no Gate that asks for an app, and `hackathon/05-pitch.md` (done) whose Demo script has Beats using only the `web`, `api` and `llm` Modules, with `chat` at 00:30 and `auth` at 01:00; the `data` Module is used by no Beat.
- Kickoff lists no sponsor tech; `CATALOG.md` lists `web`, `mobile`, `api`, `llm`, `data`, `pitch`.
- The Driver runs `/hackathon`.

## User answers

1. For each open question about a Gate or sponsor tech: "No, prune it".
2. "ok" to both tables.
3. "ok" to run the real Prune.

## Checks

- [ ] The first line is `Phase 7/13 · Prune`.
- [ ] `hackathon/06-prune.md` exists with frontmatter `status: done` and every checklist item ticked.
- [ ] The Modules table has one row per Catalog Module; `mobile` and `data` are `prune`, `web`, `api`, `llm` and `pitch` are `keep`, and every reason cites a Beat `t` or `R<n>`.
- [ ] The mobile row says "your web already works on phones as a PWA".
- [ ] The Features table marks `chat` and `auth` `on` and each Feature no Beat needs `off`; `features.json` matches.
- [ ] `## Pre-Prune SHA` holds the commit that existed before the real Prune.
- [ ] The dry run ran and was shown before the real Prune; `mobile/` and the `data` Module directory are gone afterwards.
- [ ] `## Check result` records a green `make check`.
- [ ] `## Changes` holds the keep, turn on and restore lines, with the `--restore` command carrying the pre-Prune SHA.
- [ ] The final output is the exact Handoff line: `✅ Prune saved to hackathon/06-prune.md. Open a fresh session and run /hackathon.`
- [ ] One commit per step exists (`git log --oneline`).

# Wayfinder, triage and domain docs

Maintainer workflow for this repo's GitHub Issues. Tracker commands live in `docs/agents/issue-tracker.md`; this file does not repeat them.

## Wayfinder

Plan template work with `/wayfinder`: one **map** issue labelled `wayfinder:map` (Notes, Decisions-so-far, Fog) with child tickets as sub-issues. Child labels are `wayfinder:<type>` (`research`, `prototype`, `grilling`, `task`).

- Claim a ticket by assigning yourself before any work.
- Resolve a ticket by commenting the answer, closing it, then appending a gist and link to the map's Decisions-so-far.
- Take the next ticket from the frontier: open, no open blocker, no assignee, in map order.

Done when the map's Decisions-so-far links every closed child.

## Triage labels

Skills speak in five canonical roles; this repo uses the same strings.

| Label | Meaning |
| --- | --- |
| `needs-triage` | Maintainer needs to evaluate this issue |
| `needs-info` | Waiting on the reporter for more information |
| `ready-for-agent` | Fully specified, ready for an agent to take unattended |
| `ready-for-human` | Requires human implementation |
| `wontfix` | Will not be actioned |

Hackathon labels (`lane:<name>`, `blocked`, `research`) are separate and documented in `docs/agents/triage-labels.md`.

Done when every open issue carries exactly one of these five.

## Domain docs and ADRs

Single context: one `GLOSSARY.md` and `docs/adr/` at the repo root.

- Read `GLOSSARY.md` and the ADRs touching your area before exploring. Proceed silently when a file is missing.
- Use glossary terms in issue titles, PRs and docs; prefer them over the synonyms its `_Avoid_` lines list.
- Add new terms and decisions through `/domain-modeling`.
- Surface a contradiction with an ADR in your output ("Contradicts ADR-0007, but worth reopening because...") and open a GitHub issue for it.

Hackathon teams write no ADRs (see `AGENTS.md` Precedence); ADRs record template decisions only.

Done when no output names a glossary concept under another word.

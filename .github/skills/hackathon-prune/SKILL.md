---
name: hackathon-prune
description: Delete every Module no Beat or Gate needs and set the Features, recorded in `hackathon/06-prune.md`. Use when the Router reaches Phase 7/13 (Prune), or when the team asks to keep, drop or restore a Module or Feature during this Phase.
---

# Hackathon Prune

Phase 7/13 · Prune. Announce `Phase 7/13 · Prune`, say you will propose which Modules and Features to keep, run the Prune after the Driver's ok, and name what you need: answers about any Module a Gate or sponsor tech might need.

Canonical copy: `.agents/skills/hackathon-prune/SKILL.md`. Never edit `.claude/skills/` or `.github/skills/`; `make sync` produces them.

Handoff lines are written here in English and spoken in the teammate's chat language; `/hackathon` and paths stay literal.

## Artifact

`hackathon/06-prune.md`, from `.agents/skills/hackathon-prune/template.md`, with `status: draft | done | skipped | stale` and the step checklist. Tick each item and commit after each step. Resume: the Router sees `draft` and runs the first unchecked step.

Accept free-form changes to this artifact in place (for example "keep mobile", "turn on auth"). Point any other Change to `.agents/skills/hackathon/CHANGES.md`; Restore is a Feature/Module Change there.

## Steps

### 1. Propose

**Read**: `CATALOG.md`, the Module column of the Demo script in `hackathon/05-pitch.md`, every Gate and `R<n>` in `hackathon/02-requirements.md`, Sponsor APIs and mandatory sponsor tech in `hackathon/00-kickoff.md`, `features.json`.
**Do**:
1. Create the artifact from the template as `draft`.
2. Fill the Modules table: one row per Module in the Catalog, `keep` or `prune`, with a reason citing a Beat `t` or an `R<n>`. Default to `prune` for every Module no Beat or Gate needs; `pitch` is always `keep`.
3. Fill the Features table: one row per Feature of every kept Module, `on` or `off`, with a reason citing a Beat `t` or an `R<n>`. Default to `off` for every Feature no Beat or Gate needs.
4. Apply the Mobile rule: `prune` unless a Gate or Rubric asks for an app, a Beat needs a device capability a PWA does badly, or the idea is mobile-first. When pruning, say "your web already works on phones as a PWA".
5. Add each `requires` of a kept Module or `on` Feature to the proposal, marked as required by it.
6. List every Module a Gate or sponsor tech might need as an open question.
**Done when**: every Catalog Module and every Feature of a kept Module has a row with a decision and a reason that cites a Beat `t` or `R<n>`, and every `requires` is covered.
**Ask**: for each open question: "Does <Gate or sponsor tech> need <Module>? keep / prune".

### 2. Confirm

**Read**: the artifact.
**Do**: show both tables, apply the corrections the Driver gives, and repeat until the Driver says ok.
**Done when**: the Driver said ok to both tables.
**Ask**: "Keep, prune and on/off as shown? ok / change <Module or Feature>".

### 3. Dry run

**Read**: the Modules table.
**Do**:
1. Record the pre-Prune SHA: `git rev-parse HEAD` into `## Pre-Prune SHA`.
2. Run `python3 scripts/prune.py --dry-run <modules to prune>` (`make prune m="--dry-run <modules>"`); show the plan.
3. Set each `off` Feature to `false` and each `on` Feature to `true` in `features.json`.
**Done when**: the dry run exited 0, its plan is shown, the pre-Prune SHA is recorded, and `features.json` matches the Features table.
**Ask**: "Run the real Prune with this plan? ok / change".

### 4. Prune

**Read**: the dry-run plan.
**Do**:
1. Run `make prune m="<modules to prune>"`, then `make openapi api-client` if `api` is kept (pruned routes change the Contract).
2. Run `make check`; fix each leftover it reports, then rerun until green. A leftover that needs a file outside the Prune plan goes to the Driver as a question.
3. Fill `## Check result` with the final `make check` outcome.
4. Commit and push.
**Done when**: `make check` is green, the pruned Module directories are gone, and the work is pushed.
**Ask**: none.

### 5. Close

**Read**: the artifact.
**Do**:
1. Fill `## Changes` with the follow-up the team may use: keep X, turn on Y, restore Z (`python3 scripts/prune.py --restore <module> --sha <pre-Prune SHA>`).
2. Set `status: done`, tick the checklist, commit, push, and print the Handoff.
**Done when**: the Handoff line is the last output.
**Ask**: none.

Handoff:
`✅ Prune saved to hackathon/06-prune.md. Open a fresh session and run /hackathon.`

<!-- sync:footer:start -->
- Hackathon mode wins: if it conflicts with this skill, follow Hackathon mode.
- Commit after every step.
- End with the exact Handoff line, verbatim.
- When in doubt, ask the user.
<!-- sync:footer:end -->

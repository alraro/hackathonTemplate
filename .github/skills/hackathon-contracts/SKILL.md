---
name: hackathon-contracts
description: Freeze every Seam between Lanes as a Contract with a believable stub, recorded in `hackathon/08-contracts.md`. Use when the Router reaches Phase 9/13 (Contracts), or when `08-contracts.md` is `draft` or `stale`, or when the team asks to add a Seam or change a Contract during this Phase.
---

# Hackathon Contracts

Phase 9/13 · Contracts. Announce `Phase 9/13 · Contracts`, say you will list every Seam the Demo script creates, freeze each as a Contract with a stub, and run the stub setup after the Driver's ok, and name what you need: the answers to the three questions in step 1.

Canonical copy: `.agents/skills/hackathon-contracts/SKILL.md`. Never edit `.claude/skills/` or `.github/skills/`; `make sync` produces them.

Handoff lines are written here in English and spoken in the teammate's chat language; `/hackathon` and paths stay literal.

## Artifact

`hackathon/08-contracts.md`, from `.agents/skills/hackathon-contracts/template.md`, with `status: draft | done | skipped | stale` and the step checklist. Tick each item and commit after each step on `hackathon/setup`. Resume: the Router sees `draft` and runs the first unchecked step.

Accept free-form changes to this artifact in place (for example "add a Seam for the score", "rename the stub entity"). Point any other Change to `.agents/skills/hackathon/CHANGES.md`.

## Seam kinds

Consult in steps 2 and 4. Each Seam gets exactly one kind, which fixes its Contract and its stub.

| Kind | Contract | Stub |
|---|---|---|
| HTTP | code-first: `models.py` + `router.py` with real signatures | routes serve `seed.json` |
| Python function | typed signature + Pydantic models | body returns example data |
| Data/file | Pydantic model + example file | the example file |
| Event | one Pydantic model per WebSocket message | a sender emitting example messages |
| New piece outside the Catalog | folder + public interface | stub behind the interface; internals belong to its producer |

A new piece goes in the nearest Module (subpackage or screen). Give it its own top-level Module only for a real need, with a minimal `MODULE.md` and Commands table; its Lane is decided in Task split.

## Steps

### 1. Ask

**Read**: `hackathon/00-kickoff.md` (Sponsor APIs, mandatory sponsor tech), `hackathon/03-research.md`, `hackathon/05-pitch.md`, `hackathon/06-prune.md`, `hackathon/07-design.md`, `GLOSSARY.md`.
**Do**:
1. Create the artifact from the template as `draft`.
2. Send the three questions in one message.
**Done when**: the Driver answered all three, or said "none" to each.
**Ask**, in one message:
1. Does an external API or sponsor tech need its shape matched by a stub?
2. Which believable entities and names (people, products, places) should the example data use?
3. Is any real data available to replace a stub?

### 2. Walk the Beats

**Read**: the Demo script in `hackathon/05-pitch.md`, the kept Modules in `hackathon/06-prune.md`, `backend/api/MODULE.md`, `CATALOG.md`, the `MODULE.md` of every kept Module.
**Do**:
1. Walk the Demo script Beat by Beat, Faked Beats included.
2. For each Beat that touches 2+ Modules or a new piece, or whose Faked parts cross Lanes, add a Seam row with its kind, producer Lane, consumer Lane(s), interface path, stub and Beats.
3. Merge Beats that share one interface into one Seam.
4. If the table is empty, set `status: skipped` with a one-line reason, commit, and chain into Task split with the Handoff below.
**Done when**: every Beat of the Demo script is either in a Seam's Beats column or listed under `## No Seam` with the reason, and every row has all seven columns.
**Ask**: none.

### 3. Confirm the Seams

**Read**: the artifact.
**Do**: show the Seam table, apply the corrections the Driver gives, and repeat until the Driver says ok.
**Done when**: the Driver said ok to the table.
**Ask**: "Seams as shown? ok / change <Seam>".

### 4. Stub

**Read**: the Seam table, `backend/api/resources/_example/models.py`, `router.py` and `seed.json`, the answers of step 1.
**Do**:
1. Create each Contract and stub per the Seam kinds table. For HTTP, copy `backend/api/resources/_example/` per resource, rename it as `models.py` documents, and serve `seed.json`; reuse or rename `items` and `auth`, or switch them off in `features.json`.
2. Write `backend/api/resources/<id>/seed.json` in the event language, aligned with the Beats and the entities from step 1; it is the canonical example data, and the api Lane owns it afterwards.
3. Run `make openapi api-client`; it copies each `seed.json` to the web and mobile fixtures.
4. Fill `## Contract paths` with every Contract file.
5. Run `make check`; fix each failure and rerun until green.
6. Commit on `hackathon/setup` and push.
**Done when**: every Seam row's Interface path exists with real signatures, each stub returns believable data, `make check` is green, and the work is pushed on `hackathon/setup`.
**Ask**: none.

### 5. Close

**Read**: the artifact.
**Do**:
1. Show the Contract paths and the example data.
2. On the Driver's ok, keep `## Change protocol` as the template has it and leave `## Change log` empty.
3. Set `status: done`, tick the checklist, commit, push, and print the Handoff.
**Done when**: the Driver said ok and the Handoff line is the last output.
**Ask**: "Contracts and stubs frozen? ok / change".

Handoff:
`✅ Contracts saved to hackathon/08-contracts.md. Reply "ok" to continue with Task split in this session.`

<!-- sync:footer:start -->
- Hackathon mode wins: if it conflicts with this skill, follow Hackathon mode.
- Commit after every step.
- End with the exact Handoff line, verbatim.
- When in doubt, ask the user.
<!-- sync:footer:end -->

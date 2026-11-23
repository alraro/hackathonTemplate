---
name: hackathon-kickoff
description: Set up the repo and record the Team roster and Event logistics in `hackathon/00-kickoff.md`. Use when the Router runs Phase 1/13 (Kickoff), or when the Driver gives roster or logistics details.
---

# Hackathon Kickoff

Phase 1/13. Announce `Phase 1/13 · Kickoff`, say you will set up the repo, then record the Team roster and Event logistics while the organisers present, and name what you need: both languages, one roster row per teammate, the event's rules and resources.

Canonical copy: `.agents/skills/hackathon-kickoff/SKILL.md`. Never edit `.claude/skills/` or `.github/skills/`; `make sync` produces them.

Handoff lines are written here in English and spoken in the teammate's chat language; `/hackathon` and paths stay literal.

## Artifact

`hackathon/00-kickoff.md`, from `.agents/skills/hackathon-kickoff/template.md`, with `status: draft | done | skipped | stale` and the step checklist. Tick each item and commit after each step. Resume: the Router sees `draft` and runs the first unchecked step.

Accept free-form changes to this artifact in place (for example "Ben has a GPU", "the deadline is 20:00"). Point any other Change to `.agents/skills/hackathon/CHANGES.md`. The Router and later Phases read the `driver` row, the Event logistics fields `Event start` and `Submission deadline`, and the rest of Event logistics; keep those labels exact.

## Steps

### 1. Set up the repo

**Read**: `scripts/setup.py` (the docstring only), `.agents/skills/hackathon-kickoff/template.md`.
**Do**:
1. Run `make setup`. It checks `gh auth`, creates the `hackathon/setup` branch, creates `.env` with `SECRET_KEY`, creates labels, sets squash-only merges and deletes `docs/maintaining/`.
2. On failure, show the error and its fix (for example `gh auth login`), then rerun.
3. Create `hackathon/00-kickoff.md` from the template as `draft`.
**Done when**: `make setup` exited 0, `git branch --show-current` prints `hackathon/setup`, and the artifact exists as `draft`.
**Ask**: none. Setup runs before any question.

### 2. Ask the languages

**Read**: the artifact.
**Do**: Ask both questions, then write both answers under `## Languages`.
**Done when**: `## Languages` holds an event language and a Driver chat language, each given by the user.
**Ask**: "What language is the event in?" and "What language should I speak with you?" Ask every time; an answer inferred from the conversation does not count.

### 3. Build the Team roster

**Read**: the artifact, `GLOSSARY.md` (Tier, Driver).
**Do**:
1. Ask for the whole team in one message: one line per person with the fields below.
2. Fill one row per person. Infer the Tier from the agent and plan (Opus, Fable and equivalents → `strong`; Sonnet and equivalents → `mid`; Haiku, free plans and equivalents → `weak`) and show each inference.
3. Recommend the teammate with the strongest plan as `driver`; the Driver confirms or picks another. Exactly one `driver` row.
4. Write `unknown` for any answer a teammate cannot give.
5. Show the table and apply corrections until the Driver says ok.
**Done when**: every teammate has a row with no blank cell, exactly one row has Role `driver`, and the Driver confirmed the table.
**Ask**: per person: name, GitHub user, chat language, agent and plan, whether their agent works in the repo, hours available, strengths (frontend/backend/data/design/pitch), and in the same message their hardware: OS, GPU (model and VRAM, or none), RAM, phone (Android/iOS/none). Then: "Tiers above are my guess. Correct any? I recommend <name> as Driver; confirm or pick another."

### 4. Invite the team

**Read**: `## Team roster`.
**Do**: Run `make invite users=<comma-separated GitHub users of everyone except the Driver>`. Print the invitations link it outputs.
**Done when**: the command exited 0 and the invitations link is printed.
**Ask**: none.

### 5. Fill Event logistics

**Read**: `## Event logistics` in the artifact, the current date and time (`date`).
**Do**:
1. Ask the questions below in one message.
2. Fill each field with the answer, `unknown` or `n/a`.
3. Compute `Hours left` from `Submission deadline` and the current time.
4. Record API key variable names and providers only. Key values go to `.env`.
5. Leave `unknown` where nobody knows yet; the Brief Phase fills what the Brief answers.
**Done when**: every field under Constraints, Resources and Venue network holds a value, `unknown` or `n/a`; `Submission deadline` carries an absolute date, time and timezone; `Hours left` is computed.
**Ask**: "Tell me what the organisers said, or answer these:
- Constraints: event start, submission deadline (date, time, timezone), demo time and length, live or recorded, submission format, judges, checkpoints, prize tracks and mandatory sponsor tech.
- Resources: credits, API keys, sponsor APIs, datasets, hardware, mentors.
- Venue network: event wifi or hotspot, and can devices see each other?"

### 6. Close

**Read**: the artifact.
**Do**:
1. Show the roster and Event logistics and ask for ok.
2. On "ok", set `status: done`, commit, push `hackathon/setup`.
3. Print, spoken in each teammate's chat language: `Everyone: accept the invitation, clone the repo and run make doctor && make up now.`
4. Ask whether the Brief is available. Yes → print the Brief-available Handoff (the Brief Phase collects it). No → print the Brief-missing Handoff.
**Done when**: a Handoff line is the last output.
**Ask**: "Does this roster and these logistics match? Reply ok to save." Then: "Do you have the Brief yet? Paste it, give me the file or URL, or tell me where it's saved."

Handoffs:
- Brief available: `✅ Kickoff saved to hackathon/00-kickoff.md. Reply "ok" to continue with Brief in this session.`
- Brief missing: `✅ Kickoff saved to hackathon/00-kickoff.md. When you have the Brief, run /hackathon.`

<!-- sync:footer:start -->
- Hackathon mode wins: if it conflicts with this skill, follow Hackathon mode.
- Commit after every step.
- End with the exact Handoff line, verbatim.
- When in doubt, ask the user.
<!-- sync:footer:end -->

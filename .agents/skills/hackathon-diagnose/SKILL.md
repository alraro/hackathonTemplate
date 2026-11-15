---
name: hackathon-diagnose
description: Diagnosis loop for a bug that survives fixes. Use when the same error survives 2 fix attempts in Build or Polish; a Phase skill calls it, users never run it.
---

# Hackathon diagnose

Adapted from mattpocock/skills v1.3.1 skills/engineering/diagnosing-bugs/SKILL.md (MIT)

Canonical copy: `.agents/skills/hackathon-diagnose/SKILL.md`. Never edit `.claude/skills/` or `.github/skills/`; `make sync` produces them.

Tool skill: a Phase skill calls it, the user never does. Hackathon mode wins on any conflict: the loop is a command, and a regression test is added only where a test file already guards that code. Use `GLOSSARY.md` terms (Lane, Seam, Contract).

**Redact** every secret as `<REDACTED>` in commands, outputs and captured artifacts; keep credentials in env vars. Quote only the lines that carry the signal.

A **tight** loop is fast, deterministic and agent-runnable. A loop goes **red** when it fails on this exact bug.

## Artifact

Write `docs/diagnosis-<slug>.md` with frontmatter `status: draft | done | skipped | stale`. Start it as `draft` with the step checklist (`- [ ] 1 Loop` ... `- [ ] 5 Fix and clean up`); tick each item and commit after each step. Resume: first unchecked item.

Announce what you will do and what you will ask before step 1, and accept free-form edits to this artifact at any point.

## Steps

### 1. Loop

**Read**: the failing output, `make logs` for the affected service, the Lane's `MODULE.md`.
**Do**: build one command that reproduces the user's exact symptom, trying in order: a curl or script against the running stack, a CLI call with a fixture, a headless browser script, replaying a captured payload, a throwaway harness, a fuzz or bisection loop (`git bisect run`), a differential run old versus new. For flaky bugs, loop the trigger until the failure rate is debuggable. Tighten it: faster, sharper assertion, deterministic.
**Done when**: you ran the command and its redacted output shows the symptom (red-capable, deterministic, seconds, unattended). No such command means stop and list what you tried.
**Ask**: for access, a redacted artifact (log, HAR) or permission for temporary instrumentation, only if no loop is possible.

### 2. Minimise

**Read**: the loop from step 1.
**Do**: cut inputs, callers, config and steps one at a time, re-running after each cut.
**Done when**: removing any remaining element turns the loop green.
**Ask**: none.

### 3. Hypothesise

**Read**: the minimal repro.
**Do**: write 3 to 5 ranked, falsifiable hypotheses as "If X is the cause, changing Y makes the bug disappear". Show the list to the user and proceed with your ranking if no answer comes.
**Done when**: every hypothesis states a prediction.
**Ask**: whether they know of a recent change or an already-ruled-out cause.

### 4. Instrument

**Read**: the hypotheses.
**Do**: probe one variable at a time, debugger before logs, every log tagged `[DEBUG-<4 hex>]`. For slowness, measure a baseline first, then bisect.
**Done when**: one hypothesis is confirmed and the others are falsified or ranked lower, with the evidence in the artifact.
**Ask**: none.

### 5. Fix and clean up

**Read**: the confirmed hypothesis.
**Do**: apply the fix, re-run the step 1 loop, remove tagged logs (`grep` the prefix), delete throwaway harnesses, state the confirmed hypothesis in the commit message. Set `status: done`, commit.
**Done when**: the loop is green, `grep` for the tag finds nothing, and the commit names the cause.
**Ask**: none.

Handoff: tell the calling Phase skill the cause and the fix commit, then stop.

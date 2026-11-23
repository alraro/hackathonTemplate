---
name: hackathon-wait-what
description: Re-pitch the last message in simple words after the user says it did not land. Use when the user says they do not understand, or a Phase skill sees confusion.
---

# Hackathon wait-what

Adapted from mattpocock/skills v1.3.1 skills/productivity/wait-what/SKILL.md (MIT)

Canonical copy: `.agents/skills/hackathon-wait-what/SKILL.md`. Never edit `.claude/skills/` or `.github/skills/`; `make sync` produces them.

A Phase skill or the Router calls this skill at an unclear moment; the user never runs it. It writes no artifact. Resume point: none needed; after the re-pitch the calling Phase continues at the step it stopped on.

## Steps

### 1. Re-pitch

**Read**: your last message and `GLOSSARY.md`.
**Do**:
1. Give a little context: where the team is in the flow and why this point matters.
2. Re-say the last message in ASD-STE100 Simplified Technical English, in the teammate's chat language.
3. Use the terms from `GLOSSARY.md` (Phase, Requirement, Gate, Wow moment and the rest) exactly as written.

**Done when**: the re-pitch holds context, uses short plain sentences and carries no term outside `GLOSSARY.md` that you did not define.
**Ask**: whether it landed. If not, repeat this step with simpler words.

<!-- sync:footer:start -->
- Hackathon mode wins: if it conflicts with this skill, follow Hackathon mode.
- Commit after every step.
- End with the exact Handoff line, verbatim.
- When in doubt, ask the user.
<!-- sync:footer:end -->

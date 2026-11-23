---
name: hackathon-prototype
description: Build a throwaway prototype that answers one design question. Use when a Phase skill (Pick & Pitch, Design) needs to check whether a state model feels right or what a UI should look like.
---

# Hackathon prototype

Adapted from mattpocock/skills v1.3.1 skills/engineering/prototype/SKILL.md (MIT)

Canonical copy: `.agents/skills/hackathon-prototype/SKILL.md`. Never edit `.claude/skills/` or `.github/skills/`; `make sync` produces them.

A **prototype** is throwaway code that answers a question; the question decides the shape. A Phase skill calls this skill; the user never runs it. Design calls the UI branch on `/showcase` with `?preset=` as the switch param.

Hackathon mode wins: no tests, no error handling beyond runnable, no abstractions.

## Artifact

No file of its own: the calling Phase records the verdict in its artifact. Resume point: a branch `prototype/<name>` exists with no verdict recorded, so continue at step 3.

## Steps

### 1. Pick the branch

**Read**: the caller's question and the nearest code it touches.
**Do**: choose one branch.
- "Does this logic or state model feel right?" → [LOGIC.md](LOGIC.md): one shareable HTML file with free-play buttons and guided walkthroughs.
- "What should this look like?" → [UI.md](UI.md): radically different variations on one route, switched by a URL param and a floating bottom bar.

If the question is ambiguous and the user is away, take UI for a page or component, LOGIC for a backend Module, and state the assumption at the top of the prototype.
**Done when**: one branch is chosen and the question is written in one sentence.
**Ask**: the question, only if the caller gave none.

### 2. Build

**Read**: the chosen branch file.
**Do**: follow its Process. Locate the code beside what it prototypes, name it so it reads as a prototype, keep state in memory, start it from one command, render the full relevant state after every action or variant switch.
**Done when**: the prototype runs from one command or double-click and its URL or file path is known.
**Ask**: none.

### 3. Hand over and capture

**Read**: the chosen branch file's capture step.
**Do**: surface the URL or file, collect the user's verdict, commit the prototype to branch `prototype/<name>`, then fold the validated decision into the real code so main keeps only that.
**Done when**: the verdict and the question it settled are returned to the calling Phase, and main holds no variants, switcher or demo shell.
**Ask**: which variant or behaviour won.

## Fallback without subagents

Draft each UI variant yourself in sequence; redo any variant that reuses another's layout.

<!-- sync:footer:start -->
- Hackathon mode wins: if it conflicts with this skill, follow Hackathon mode.
- Commit after every step.
- End with the exact Handoff line, verbatim.
- When in doubt, ask the user.
<!-- sync:footer:end -->

---
name: hackathon-grilling
description: Grill the team relentlessly about a plan, decision or idea, one round of numbered questions at a time. Use when a Phase skill calls for a devil's-advocate round (Pick & Pitch) or the user asks to stress-test a decision.
---

# Hackathon grilling

Adapted from mattpocock/skills v1.3.1 skills/productivity/grilling/SKILL.md (MIT)

Canonical copy: `.agents/skills/hackathon-grilling/SKILL.md`. Never edit `.claude/skills/` or `.github/skills/`; `make sync` produces them.

A Phase skill calls this skill; the user never runs it. It writes no artifact: the calling Phase records the outcome in its own artifact. Resume point: re-read the calling Phase's artifact, rebuild the design tree and continue at step 2 with the decisions still unsettled.

## Steps

### 1. Map the design tree

**Read**: the artifact or decision under grilling (the caller names its path), plus `GLOSSARY.md` for the terms.
**Do**: list every decision it contains as a **design tree**, where each decision branches into the decisions that hang off it.
**Done when**: every decision in the subject appears as a node and each node names its prerequisites.
**Ask**: none.

### 2. Ask a round

**Read**: the design tree.
**Do**:
1. Compute the **frontier**: every decision whose prerequisites are settled.
2. Look up the facts the frontier needs in the repo or tools; the user only answers decisions.
3. Ask the whole frontier in one round, numbered, each question with your recommended answer, worded so "yes" accepts it.
4. Wait for the answers.

Round format:

```
❓ **Q1** - **<question title>**: <question body, including multiple choices>

➡️ <your recommended answer>

---
```

**Done when**: every frontier question is asked with a recommendation, and no question depends on another open one in the same round.
**Ask**: the round itself.

### 3. Repeat until the frontier is empty

**Read**: the answers.
**Do**: mark settled nodes, recompute the frontier, then repeat step 2. Questions that depended on an open answer move to a later round.
**Done when**: the frontier is empty and every branch is visited, nothing silently assumed.
**Ask**: whether you have reached a shared understanding. Return to the calling Phase only after the user confirms.

## Fallback without subagents

Run every fact lookup yourself, one at a time, before asking the round. A `weak` Tier agent asks at most 3 questions per round.

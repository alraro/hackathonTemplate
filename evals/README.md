# Evals

Each skill and issue template ships one **Scenario** in `evals/<skill>.md`, copied from `evals/_template.md`. A Scenario is a starting state plus checks on the expected artifact.

## Running a Scenario by hand

1. Create a scratch copy of the repo (or a branch) and set up the Scenario's **Starting state**.
2. Run the skill in a fresh agent session, answering only what the Scenario's **User answers** provide.
3. Run every check in **Checks** against the artifact the skill wrote.
4. Apply the rubric below. Record pass or fail with the failing rubric line.

## Self-review rubric (fixed)

The implementer of a skill or template grades their own work against exactly these five lines:

1. The artifact has valid frontmatter (`status: draft | done | skipped | stale`).
2. The last output is the exact Handoff line.
3. No off-script action: only the files and commands the skill's steps name.
4. No reopened decision: nothing recorded in earlier artifacts or `docs/adr/` is changed or re-asked.
5. No question asks the user for a fact the skill's Read step could find in the repo.

## Pass criterion

All five rubric lines hold and every Scenario check passes. Any failure is a fail; fix the skill, not the check.

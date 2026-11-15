# Upstream skills

Several skills are adapted from `mattpocock/skills`. Sync is manual: nothing updates them automatically.

## Where state lives

`.agents/skills/THIRD_PARTY.md` holds the pinned version, the adapted-skills table (skill, upstream path, adapting issue) and the licence. Each adapted skill carries the header `Adapted from mattpocock/skills v<version> <path> (MIT)`.

## Sync steps

1. Read the upstream release notes between the pinned version and the latest. Done when you have a list of adapted skills whose upstream path changed.
2. For each changed skill, diff the upstream file against the pinned version, then port the change into the adapted skill, keeping its hackathon edits. Done when the adapted skill follows `writing-for-agents` and its `evals/<skill>.md` Scenario passes by hand.
3. Run `make sync`. Done when skill footers regenerate; leave footers to the generator.
4. Update the pinned version in `THIRD_PARTY.md` and every adapted skill's header. Done when `grep -r "Adapted from mattpocock/skills v" .agents/skills` shows one version.
5. Open a PR listing each skill changed and each upstream change deliberately skipped.

## Nothing changed

Stay on the pinned version when no adapted skill's upstream path changed. Done when the PR or commit notes the version checked.

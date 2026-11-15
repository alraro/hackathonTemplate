# Release

## Versioning

- `main` is always usable as a template.
- Tag `vYYYY.MM` for each release. The version appears in the README.
- Teams own their repo after creation; there is no template-to-team sync.

## Rehearse, then tag

Rehearse before every tag that touches skills.

1. Create a repo from the template and run the full path with a mid model, following `evals/README.md`. Done when every changed skill's Scenario in `evals/<skill>.md` passes its checks and the five-line rubric.
2. Run `make check` and `make lint-docs`. Done when both are green, any lint warning justified in the PR.
3. Update the version in the README, merge, then `git tag vYYYY.MM && git push origin vYYYY.MM`. Done when the tag shows on GitHub.

## Research branches

Keep `research/*` branches: they hold Research findings from earlier hackathons. They stay in the template repo and never reach team repos.

## Repo settings

Verify in GitHub settings. Done when all three hold:

- Template repository is on.
- Description states what the template is.
- Topics are set.

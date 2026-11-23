"""Internals of `scripts/prune.py`, split by responsibility.

common    git, file walking, manifest accessors, catalog regeneration
markers   which lines of a file a Module owns (`>>> module:x` blocks, `module:x` lines, pyproject extras)
profiles  COMPOSE_PROFILES rewriting in .env, .env.example and the Makefile
npm       npm dependencies a Module owns in a kept package.json
labels    the Module's `lane:<x>` GitHub labels
plan      prune: build the plan, print it, apply it
restore   bring a pruned Module back from the pre-Prune SHA
"""

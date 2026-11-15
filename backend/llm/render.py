"""Prompt template rendering from `prompts/`."""

from __future__ import annotations


def render(name: str, **variables: object) -> str:
    """Render `prompts/<name>.md` with `variables`."""
    raise NotImplementedError  # TODO(#53)

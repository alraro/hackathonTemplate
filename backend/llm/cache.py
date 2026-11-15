"""Response cache toggled by LLM_CACHE."""

from __future__ import annotations


def cache_key(*parts: object) -> str:
    raise NotImplementedError  # TODO(#53)


def get(key: str) -> str | None:
    raise NotImplementedError  # TODO(#53)


def put(key: str, value: str) -> None:
    raise NotImplementedError  # TODO(#53)

"""Sync LLM helpers. All take an optional `model=` (a tier name or model id)."""

from __future__ import annotations

from collections.abc import Iterator
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from pydantic import BaseModel


def classify(
    text: str, labels: list[str], *, instructions: str | None = None, model: str | None = None
) -> str:
    raise NotImplementedError  # TODO(#54)


def extract(
    text: str,
    schema: type[BaseModel],
    *,
    instructions: str | None = None,
    model: str | None = None,
) -> BaseModel:
    raise NotImplementedError  # TODO(#54)


def summarize(
    text: str, *, max_words: int = 80, style: str | None = None, model: str | None = None
) -> str:
    raise NotImplementedError  # TODO(#54)


def chat(
    messages: list[dict],
    *,
    system: str | None = None,
    use_rag: bool = False,
    model: str | None = None,
) -> Iterator[str]:
    raise NotImplementedError  # TODO(#55)


def embed(texts: list[str], *, model: str | None = None) -> list[list[float]]:
    raise NotImplementedError  # TODO(#57)

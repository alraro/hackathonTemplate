"""Groq/OpenRouter/Gemini/Ollama via the openai SDK base_url. SDK imported lazily."""

from __future__ import annotations

from collections.abc import Iterator
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from pydantic import BaseModel


class OpenAICompatProvider:
    def complete(
        self, messages: list[dict], *, model: str | None = None, system: str | None = None
    ) -> str:
        raise NotImplementedError  # TODO(#53)

    def complete_json(
        self,
        messages: list[dict],
        schema: type[BaseModel],
        *,
        model: str | None = None,
        system: str | None = None,
    ) -> BaseModel:
        raise NotImplementedError  # TODO(#53)

    def stream(
        self, messages: list[dict], *, model: str | None = None, system: str | None = None
    ) -> Iterator[str]:
        raise NotImplementedError  # TODO(#53)

    def embed(self, texts: list[str]) -> list[list[float]]:
        raise NotImplementedError  # TODO(#53)

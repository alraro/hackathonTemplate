"""Provider Protocol: the only surface the helpers talk to."""

from __future__ import annotations

from collections.abc import Iterator
from typing import TYPE_CHECKING, Protocol

if TYPE_CHECKING:
    from pydantic import BaseModel


class Provider(Protocol):
    def complete(
        self, messages: list[dict], *, model: str | None = None, system: str | None = None
    ) -> str: ...

    def complete_json(
        self,
        messages: list[dict],
        schema: type[BaseModel],
        *,
        model: str | None = None,
        system: str | None = None,
    ) -> BaseModel: ...

    def stream(
        self, messages: list[dict], *, model: str | None = None, system: str | None = None
    ) -> Iterator[str]: ...

    def embed(self, texts: list[str]) -> list[list[float]]: ...

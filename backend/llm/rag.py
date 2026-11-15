"""pgvector RAG: ingest documents, search chunks, answer with citations."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class Chunk:
    text: str
    source: str
    title: str | None = None
    score: float = 0.0


@dataclass
class Answer:
    answer: str
    citations: list[Chunk] = field(default_factory=list)


def ingest_path(path: str | Path) -> int:
    """Ingest every supported file under `path`; return chunk count."""
    raise NotImplementedError  # TODO(#57)


def ingest_file(path: str | Path, title: str) -> int:
    raise NotImplementedError  # TODO(#57)


def search(query: str, k: int = 5) -> list[Chunk]:
    raise NotImplementedError  # TODO(#57)


def answer(question: str) -> Answer:
    raise NotImplementedError  # TODO(#57)

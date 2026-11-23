"""pgvector RAG: ingest documents, search chunks, answer with citations."""

from __future__ import annotations

import hashlib
from dataclasses import dataclass, field
from pathlib import Path

from pydantic import BaseModel
from sqlmodel import Session, col, delete, select

from backend.llm import settings
from backend.llm.helpers import embed

CORPUS_DIR = Path(__file__).parent / "corpus"
SUPPORTED = {".md", ".txt", ".pdf"}
# ~800 tokens per chunk with 100 overlap, at ~4 characters per token.
CHUNK_CHARS = 3200
OVERLAP_CHARS = 400
EMBED_BATCH = 32
SNIPPET_CHARS = 240

ANSWER_PROMPT = """Answer the question using ONLY the numbered excerpts below. \
Answer in {output_language}. If the excerpts do not contain the answer, say so.
Return the excerpt numbers you relied on in "citations" (at least one when you answer).

Excerpts:
{context}

Question: {question}"""


@dataclass
class Chunk:
    text: str
    source: str
    title: str | None = None
    score: float = 0.0
    document_id: int | None = None


@dataclass
class Answer:
    answer: str
    citations: list[Chunk] = field(default_factory=list)


class _Cited(BaseModel):
    answer: str
    citations: list[int] = []


def _session() -> Session:
    from backend.api.core.db import engine

    return Session(engine)


def ensure_schema() -> None:
    """Create the vector extension and RAG tables if missing (idempotent)."""
    from backend.api.core.db import engine
    from backend.llm import rag_models

    rag_models.SQLModel.metadata.create_all(
        engine, tables=[rag_models.RagDocument.__table__, rag_models.RagChunk.__table__]
    )


def read_text(path: Path) -> str:
    if path.suffix.lower() == ".pdf":
        from pypdf import PdfReader

        return "\n\n".join((p.extract_text() or "") for p in PdfReader(str(path)).pages)
    return path.read_text(encoding="utf-8", errors="replace")


def chunk_text(text: str, size: int = CHUNK_CHARS, overlap: int = OVERLAP_CHARS) -> list[str]:
    """Split on whitespace boundaries into ~`size` char chunks sharing `overlap` chars."""
    text = text.strip()
    if not text:
        return []
    chunks, start = [], 0
    while start < len(text):
        end = min(start + size, len(text))
        if end < len(text):
            cut = text.rfind(" ", start + size - 200, end)
            end = cut if cut > start else end
        chunks.append(text[start:end].strip())
        if end >= len(text):
            break
        start = max(end - overlap, start + 1)
    return [c for c in chunks if c]


def _embed_all(texts: list[str]) -> list[list[float]]:
    out: list[list[float]] = []
    for i in range(0, len(texts), EMBED_BATCH):
        out.extend(embed(texts[i : i + EMBED_BATCH]))
    return out


def _ingest(path: Path, title: str, force: bool) -> int:
    """Ingest one file; return the chunk count stored (0 when unchanged and skipped)."""
    from backend.llm.rag_models import RagChunk, RagDocument

    ensure_schema()
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    source = path.name
    with _session() as session:
        existing = session.exec(select(RagDocument).where(RagDocument.source == source)).all()
        if not force and any(d.hash == digest for d in existing):
            return 0
        pieces = chunk_text(read_text(path))
        vectors = _embed_all(pieces)  # embed before deleting so a failure keeps old data
        for d in existing:
            session.exec(delete(RagChunk).where(col(RagChunk.document_id) == d.id))  # type: ignore[call-overload]
            session.delete(d)
        doc = RagDocument(title=title, source=source, hash=digest)
        session.add(doc)
        session.flush()
        session.add_all(
            RagChunk(document_id=doc.id, text=t, embedding=v)  # type: ignore[arg-type]
            for t, v in zip(pieces, vectors, strict=True)
        )
        session.commit()
        return len(pieces)


def ingest_path(path: str | Path = CORPUS_DIR, force: bool = False) -> int:
    """Ingest every supported file under `path`; return chunk count."""
    root = Path(path)
    files = [root] if root.is_file() else sorted(root.rglob("*"))
    total = 0
    for f in files:
        if f.is_file() and f.suffix.lower() in SUPPORTED:
            total += _ingest(f, f.stem.replace("_", " ").replace("-", " ").title(), force)
    return total


def ingest_file(path: str | Path, title: str) -> int:
    """Ingest a single file (used by upload); return chunk count."""
    return _ingest(Path(path), title, force=False)


def search(query: str, k: int = 5) -> list[Chunk]:
    from backend.llm.rag_models import RagChunk, RagDocument

    ensure_schema()
    vec = embed([query])[0]
    dist = RagChunk.embedding.cosine_distance(vec)  # type: ignore[attr-defined]
    stmt = (
        select(RagChunk, RagDocument, dist)
        .join(RagDocument, RagDocument.id == RagChunk.document_id)  # type: ignore[arg-type]
        .order_by(dist)
        .limit(k)
    )
    with _session() as session:
        return [
            Chunk(
                text=c.text,
                source=d.source,
                title=d.title,
                score=1.0 - float(distance),
                document_id=d.id,
            )
            for c, d, distance in session.exec(stmt).all()
        ]


def answer(question: str) -> Answer:
    """Answer from the ingested documents on the smart tier; citations are the excerpts used."""
    hits = search(question)
    if not hits:
        return Answer(answer="No documents are ingested yet; run `make rag-ingest`.")
    context = "\n\n".join(f"[{i}] ({h.title}) {h.text}" for i, h in enumerate(hits, 1))
    prompt = ANSWER_PROMPT.format(
        context=context,
        question=question,
        output_language=settings.output_language() or "the language of the question",
    )
    result = settings.get_provider().complete_json(  # type: ignore[attr-defined]
        [{"role": "user", "content": prompt}], _Cited, model=settings.model_for("smart")
    )
    cited = [hits[n - 1] for n in dict.fromkeys(result.citations) if 1 <= n <= len(hits)]
    return Answer(answer=result.answer, citations=cited or hits[:1])


def snippet(text: str) -> str:
    flat = " ".join(text.split())
    return flat if len(flat) <= SNIPPET_CHARS else flat[: SNIPPET_CHARS - 1] + "…"


if __name__ == "__main__":
    from backend.llm.ingest_cli import main

    main()

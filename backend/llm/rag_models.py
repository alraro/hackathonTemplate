"""pgvector tables for RAG. Importing this module registers them on SQLModel.metadata."""

from __future__ import annotations

from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, Index, event, text
from sqlmodel import Field, SQLModel

EMBED_DIM = 768


class RagDocument(SQLModel, table=True):
    __tablename__ = "rag_documents"

    id: int | None = Field(default=None, primary_key=True)
    title: str
    source: str = Field(index=True)
    hash: str


class RagChunk(SQLModel, table=True):
    __tablename__ = "rag_chunks"
    __table_args__ = (
        Index(
            "rag_chunks_embedding_hnsw",
            "embedding",
            postgresql_using="hnsw",
            postgresql_ops={"embedding": "vector_cosine_ops"},
        ),
    )

    id: int | None = Field(default=None, primary_key=True)
    document_id: int = Field(foreign_key="rag_documents.id", index=True, ondelete="CASCADE")
    text: str
    embedding: list[float] = Field(sa_column=Column(Vector(EMBED_DIM), nullable=False))


@event.listens_for(SQLModel.metadata, "before_create")
def _create_vector_extension(target, connection, **_):  # noqa: ANN001
    """Runs for any create_all (app startup included), so the vector type exists first."""
    connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))

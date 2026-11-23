"""COPY TEMPLATE: models of a minimal CRUD resource.

To make your own resource: copy this folder to `resources/<name>/`, then rename
Example -> <Thing> and `_example` -> <name> in all three files (models.py,
router.py, seed.json), and add the router in `core/app.py` (inside the
`# >>> routers` block). The seed loader finds the first `table=True` class here
and validates seed.json rows against `Read`.
"""
from datetime import UTC, datetime

from sqlmodel import Field, SQLModel


def _now() -> datetime:
    return datetime.now(UTC)


class ExampleBase(SQLModel):
    """Fields a client may send. Shared by create and read."""

    title: str
    description: str = ""
    status: str = "todo"


class Example(ExampleBase, table=True):
    """The database table. Server-owned fields (id, created_at) live here only."""

    __tablename__ = "example"

    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=_now)


class ExampleCreate(ExampleBase):
    """POST body."""


class ExampleRead(ExampleBase):
    """Response shape; also the seed.json row shape."""

    id: int
    created_at: datetime


class ExampleUpdate(SQLModel):
    """PATCH body: every field optional, only the sent ones are changed."""

    title: str | None = None
    description: str | None = None
    status: str | None = None


class Read(ExampleBase):
    """Seed row shape (seed.json), picked up by core/seed.py. No id: the database
    assigns ids, so the id sequence stays in step with the seeded rows."""

    created_at: datetime

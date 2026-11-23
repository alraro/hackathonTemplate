from datetime import UTC, datetime
from enum import Enum

from sqlmodel import Field, SQLModel


class ItemStatus(str, Enum):
    todo = "todo"
    doing = "doing"
    done = "done"


def _now() -> datetime:
    return datetime.now(UTC)


class ItemBase(SQLModel):
    title: str
    description: str = ""
    status: ItemStatus = ItemStatus.todo
    category: str = ""


class Item(ItemBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=_now)
    # Nullable link to a user. The auth resource owns the users table; add
    # foreign_key="users.id" here once that table is always present.
    owner_id: int | None = Field(default=None, index=True)


class ItemCreate(ItemBase):
    """Client input. owner_id is not accepted: the server owns it."""


class ItemRead(ItemBase):
    id: int
    created_at: datetime
    owner_id: int | None = None


class ItemUpdate(SQLModel):
    title: str | None = None
    description: str | None = None
    status: ItemStatus | None = None
    category: str | None = None


class ItemList(SQLModel):
    items: list[ItemRead]
    total: int


class Read(ItemBase):
    """Seed row shape (seed.json), picked up by core/seed.py. No id: the database
    assigns ids, so the id sequence stays in step with the seeded rows."""

    created_at: datetime
    owner_id: int | None = None

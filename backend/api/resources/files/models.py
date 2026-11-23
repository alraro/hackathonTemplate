from datetime import UTC, datetime

from sqlmodel import Field, SQLModel


class File(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    mime: str
    size: int
    path: str  # relative to backend/uploads/
    owner_id: int | None = Field(default=None, index=True)  # no FK: the users table exists only with Feature `auth`
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class FileRead(SQLModel):
    id: int
    name: str
    mime: str
    size: int
    owner_id: int | None
    created_at: datetime
    url: str  # static URL: /api/files/{id}/raw

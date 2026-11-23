"""Helpers shared by CRUD resources."""
from datetime import UTC, datetime
from typing import TypeVar

from fastapi import HTTPException
from sqlmodel import Session, SQLModel

T = TypeVar("T", bound=SQLModel)


def now() -> datetime:
    return datetime.now(UTC)


def get_or_404(session: Session, model: type[T], row_id: int, detail: str = "Not found") -> T:
    row = session.get(model, row_id)
    if row is None:
        raise HTTPException(status_code=404, detail=detail)
    return row

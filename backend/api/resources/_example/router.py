"""COPY TEMPLATE: minimal CRUD router. See models.py for how to copy and rename.

Conventions worth keeping:
- tag = resource name; `name=` on each route gives operationId `<tag>_<name>`
  (e.g. `_example_list`), which the generated web/mobile client is named after.
- Annotate the return type: it becomes the response schema in openapi.json.
- Errors are `HTTPException`, which the client sees as `{detail}`.
"""
from fastapi import APIRouter
from sqlmodel import col, select

from backend.api.core.crud import get_or_404
from backend.api.core.deps import SessionDep
from backend.api.resources._example.models import (
    Example,
    ExampleCreate,
    ExampleRead,
    ExampleUpdate,
)

router = APIRouter(prefix="/api/_example", tags=["_example"])


@router.get("", name="list")
def list_examples(session: SessionDep) -> list[ExampleRead]:
    rows = session.exec(select(Example).order_by(col(Example.id))).all()
    return [ExampleRead.model_validate(r) for r in rows]


@router.get("/{example_id}", name="get")
def get_example(example_id: int, session: SessionDep) -> ExampleRead:
    return ExampleRead.model_validate(get_or_404(session, Example, example_id))


@router.post("", name="create", status_code=201)
def create_example(body: ExampleCreate, session: SessionDep) -> ExampleRead:
    row = Example.model_validate(body)
    session.add(row)
    session.commit()
    session.refresh(row)
    return ExampleRead.model_validate(row)


@router.patch("/{example_id}", name="update")
def update_example(example_id: int, body: ExampleUpdate, session: SessionDep) -> ExampleRead:
    row = get_or_404(session, Example, example_id)
    row.sqlmodel_update(body.model_dump(exclude_unset=True))  # only the sent fields
    session.add(row)
    session.commit()
    session.refresh(row)
    return ExampleRead.model_validate(row)


@router.delete("/{example_id}", name="delete", status_code=204)
def delete_example(example_id: int, session: SessionDep) -> None:
    session.delete(get_or_404(session, Example, example_id))
    session.commit()

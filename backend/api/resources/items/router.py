from fastapi import APIRouter, HTTPException, Query
from sqlmodel import col, func, or_, select

from backend.api.core.deps import SessionDep
from backend.api.resources.items.models import (
    Item,
    ItemCreate,
    ItemList,
    ItemRead,
    ItemStatus,
    ItemUpdate,
)

router = APIRouter(prefix="/api/items", tags=["items"])


def _get_or_404(session: SessionDep, item_id: int) -> Item:
    item = session.get(Item, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


# `name=` sets the operationId: <tag>_<name>, e.g. items_list.
@router.get("", name="list")
def list_items(
    session: SessionDep,
    q: str | None = None,
    status: ItemStatus | None = None,
    category: str | None = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> ItemList:
    stmt = select(Item)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(or_(col(Item.title).ilike(like), col(Item.description).ilike(like)))
    if status:
        stmt = stmt.where(Item.status == status)
    if category:
        stmt = stmt.where(Item.category == category)
    total = session.exec(select(func.count()).select_from(stmt.subquery())).one()
    rows = session.exec(stmt.order_by(col(Item.id)).offset(offset).limit(limit)).all()
    return ItemList(items=[ItemRead.model_validate(r) for r in rows], total=total)


@router.get("/{item_id}", name="get")
def get_item(item_id: int, session: SessionDep) -> ItemRead:
    return ItemRead.model_validate(_get_or_404(session, item_id))


@router.post("", name="create", status_code=201)
def create_item(body: ItemCreate, session: SessionDep) -> ItemRead:
    item = Item.model_validate(body)
    session.add(item)
    session.commit()
    session.refresh(item)
    return ItemRead.model_validate(item)


@router.patch("/{item_id}", name="update")
def update_item(item_id: int, body: ItemUpdate, session: SessionDep) -> ItemRead:
    item = _get_or_404(session, item_id)
    item.sqlmodel_update(body.model_dump(exclude_unset=True))
    session.add(item)
    session.commit()
    session.refresh(item)
    return ItemRead.model_validate(item)


@router.delete("/{item_id}", name="delete", status_code=204)
def delete_item(item_id: int, session: SessionDep) -> None:
    session.delete(_get_or_404(session, item_id))
    session.commit()

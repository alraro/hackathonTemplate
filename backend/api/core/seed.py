"""Generic seed loader: resources/*/seed.json -> table rows, idempotent.

Per resource `<name>`:
- `resources/<name>/seed.py` with `seed(session)` overrides everything.
- else `resources/<name>/seed.json` (a list of objects) is validated against the
  resource's Read schema and inserted into its table when that table is empty.
Table model: first `table=True` SQLModel in `<name>.models`.
Read schema: `Read` or `<Model>Read` in `<name>.schemas` (or `.models`), else the model.
Resources without models or seed data are skipped.
"""
import importlib
import json
import logging
import pkgutil
from pathlib import Path

from sqlmodel import Session, SQLModel, func, select

import backend.api.resources as resources_pkg

log = logging.getLogger(__name__)
RESOURCES_DIR = Path(resources_pkg.__file__).resolve().parent


def _import(name: str, sub: str):
    try:
        return importlib.import_module(f"{resources_pkg.__name__}.{name}.{sub}")
    except ModuleNotFoundError as exc:
        if exc.name == f"{resources_pkg.__name__}.{name}.{sub}":
            return None
        raise


def resource_names() -> list[str]:
    return sorted(m.name for m in pkgutil.iter_modules([str(RESOURCES_DIR)]) if m.ispkg)


def import_models() -> None:
    """Import every resource's models so SQLModel.metadata knows all tables."""
    for name in resource_names():
        _import(name, "models")


def _table_model(models) -> type[SQLModel] | None:
    for obj in vars(models).values():
        if isinstance(obj, type) and issubclass(obj, SQLModel) and getattr(obj, "__table__", None) is not None:
            if obj.__module__ == models.__name__:
                return obj
    return None


def _read_schema(name: str, models, model: type[SQLModel]) -> type[SQLModel]:
    for mod in (_import(name, "schemas"), models):
        if mod is None:
            continue
        for attr in ("Read", f"{model.__name__}Read"):
            if hasattr(mod, attr):
                return getattr(mod, attr)
    return model


def seed_resource(session: Session, name: str) -> int:
    """Seed one resource; returns rows inserted (0 if table non-empty or nothing to seed)."""
    custom = _import(name, "seed")
    if custom is not None and hasattr(custom, "seed"):
        custom.seed(session)
        return 0
    path = RESOURCES_DIR / name / "seed.json"
    models = _import(name, "models")
    if not path.is_file() or models is None:
        return 0
    model = _table_model(models)
    if model is None:
        log.warning("seed: %s has seed.json but no table model", name)
        return 0
    if session.exec(select(func.count()).select_from(model)).one() > 0:
        return 0
    read = _read_schema(name, models, model)
    rows = [read.model_validate(r) for r in json.loads(path.read_text(encoding="utf-8"))]
    for row in rows:
        session.add(model.model_validate(row.model_dump()))
    session.commit()
    return len(rows)


def seed_all(session: Session) -> dict[str, int]:
    import_models()
    return {name: seed_resource(session, name) for name in resource_names()}

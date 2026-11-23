"""Shared table reader for the pipelines that read a `source` file or a `sql` query."""

import re
from pathlib import Path

import pandas as pd

from backend.data.config import DATA_DIR, RunConfig, source_path

READONLY_START = re.compile(r"^\s*(select|with)\b", re.IGNORECASE)


def read_sql(query: str) -> pd.DataFrame:
    """Run one read-only SELECT/WITH query against the app database (the API's engine)."""
    from sqlalchemy import text

    from backend.api.core.db import engine

    stmt = query.strip().rstrip(";").strip()
    if ";" in stmt or not READONLY_START.match(stmt):
        raise ValueError("sql must be a single SELECT (or WITH ... SELECT) statement")
    with engine.connect() as conn:
        if engine.dialect.name == "postgresql":
            # a writing CTE then fails instead of running
            conn.exec_driver_sql("SET TRANSACTION READ ONLY")
        try:
            return pd.read_sql(text(stmt), conn)
        finally:
            conn.rollback()


def read_table(cfg: RunConfig) -> pd.DataFrame:
    """Read cfg.sql from the app database, or cfg.source (csv, parquet or xlsx), into a DataFrame."""
    if cfg.sql:
        return read_sql(cfg.sql)
    path: Path | None = source_path(cfg)
    if path is None or not path.is_file():
        raise ValueError(f"source '{cfg.source}' not found under {DATA_DIR}")
    readers = {".csv": pd.read_csv, ".parquet": pd.read_parquet, ".xlsx": pd.read_excel}
    if path.suffix not in readers:
        raise ValueError(f"source type '{path.suffix}' unsupported; use csv, parquet or xlsx")
    return readers[path.suffix](path)

"""Shared table reader for the pipelines that read a csv, parquet or xlsx `source`."""

from pathlib import Path

import pandas as pd

from backend.data.config import DATA_DIR, RunConfig, source_path


def read_table(cfg: RunConfig) -> pd.DataFrame:
    """Read cfg.source (csv, parquet or xlsx) into a DataFrame."""
    path: Path | None = source_path(cfg)
    if path is None:
        raise ValueError("this pipeline reads 'source' files only; 'sql' is not supported yet")
    if not path.is_file():
        raise ValueError(f"source '{cfg.source}' not found under {DATA_DIR}")
    readers = {".csv": pd.read_csv, ".parquet": pd.read_parquet, ".xlsx": pd.read_excel}
    if path.suffix not in readers:
        raise ValueError(f"source type '{path.suffix}' unsupported; use csv, parquet or xlsx")
    return readers[path.suffix](path)

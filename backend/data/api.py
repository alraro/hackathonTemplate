"""Entry points for the rest of the backend: load a committed report, predict with a run's model."""

from pathlib import Path
from typing import Any

from backend.data.config import OUTPUTS_DIR
from backend.data.report import Report


def _run_file(run: str, name: str) -> Path:
    """outputs/<run>/<name>, rejecting anything that is not a plain run name."""
    path = OUTPUTS_DIR / run / name
    if not run or any(c in run for c in "/\\") or ".." in run or not path.is_file():
        raise FileNotFoundError(f"no {name} for run '{run}'")
    return path


def load_report(run: str) -> Report:
    """Read outputs/<run>/report.json. Raises FileNotFoundError if the run has no report."""
    return Report.model_validate_json(_run_file(run, "report.json").read_text())


def predict(run: str, rows: list[dict[str, Any]]) -> list:
    """Predict with outputs/<run>/model.joblib. For domain endpoints only, never generic ones."""
    import joblib
    import pandas as pd

    return joblib.load(_run_file(run, "model.joblib")).predict(pd.DataFrame(rows)).tolist()

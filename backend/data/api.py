"""Entry points for the rest of the backend: load a committed report, predict with a run's model."""

from typing import Any

from backend.data.config import OUTPUTS_DIR
from backend.data.report import Report


def load_report(run: str) -> Report:
    """Read outputs/<run>/report.json. Raises FileNotFoundError if the run has no report."""
    path = OUTPUTS_DIR / run / "report.json"
    if "/" in run or ".." in run or not path.is_file():
        raise FileNotFoundError(f"no report for run '{run}'")
    return Report.model_validate_json(path.read_text())


def predict(run: str, rows: list[dict[str, Any]]) -> list:
    """Predict with outputs/<run>/model.joblib. For domain endpoints only, never generic ones."""
    import joblib
    import pandas as pd

    path = OUTPUTS_DIR / run / "model.joblib"
    if "/" in run or ".." in run or not path.is_file():
        raise FileNotFoundError(f"no model for run '{run}'")
    return joblib.load(path).predict(pd.DataFrame(rows)).tolist()

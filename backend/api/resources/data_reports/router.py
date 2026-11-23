from fastapi import APIRouter, HTTPException

from backend.api.resources.data_reports.models import Report
from backend.data.api import load_report

router = APIRouter(prefix="/api/data/reports", tags=["data_reports"])


@router.get("/{run}", name="get")
def get_report(run: str) -> Report:
    """Serve the committed report.json of a run (read-only; no live training)."""
    try:
        return load_report(run)
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail=f"No report for run '{run}'. Run `make data-run run={run}` and commit outputs/{run}/report.json.",
        ) from None

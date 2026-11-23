"""Exploratory data analysis helpers."""

import json
from pathlib import Path

from backend.data.charts import histogram_chart, nulls_chart
from backend.data.config import DATA_DIR, OUTPUTS_DIR
from backend.data.report import Report

MAX_HISTOGRAMS = 6


def eda(csv: Path) -> Path:
    """Profile the CSV into outputs/eda_<stem>/ (eda.html + report.json); return the html path."""
    import pandas as pd
    from skrub import TableReport

    csv = Path(csv)
    if (
        not csv.is_absolute()
    ):  # repo-relative (backend/data/datasets/x.csv) or data-relative (datasets/x.csv)
        csv = next(
            (
                b / csv
                for b in (Path.cwd(), DATA_DIR.parent.parent, DATA_DIR)
                if (b / csv).is_file()
            ),
            csv,
        )
    if not csv.is_file():
        raise ValueError(f"csv '{csv}' not found")
    df = pd.read_csv(csv)
    out = OUTPUTS_DIR / f"eda_{csv.stem}"
    out.mkdir(parents=True, exist_ok=True)

    tr = TableReport(df, title=csv.name, verbose=0)
    html = out / "eda.html"
    tr.write_html(html)

    numeric = df.select_dtypes("number")
    by_nulls = df.isna().mean().sort_values(kind="stable").index  # fewest nulls first
    hist_cols = [c for c in by_nulls if c in numeric.columns][:MAX_HISTOGRAMS]
    charts = [histogram_chart(f"hist_{c}", f"Distribution of {c}", c, df) for c in hist_cols]
    charts.append(nulls_chart("nulls", "Nulls per column", df))
    n_nulls = int(df.isna().sum().sum())
    report = Report(
        run=f"eda_{csv.stem}",
        pipeline="eda",
        model="skrub.TableReport",
        metrics={
            "rows": float(len(df)),
            "columns": float(df.shape[1]),
            "null_cells": float(n_nulls),
        },
        charts=charts,
        summary=f"{csv.name}: {len(df)} rows, {df.shape[1]} columns, {n_nulls} null cells",
    )
    data = report.model_dump()
    data["table_report"] = json.loads(tr.json())
    data["correlation"] = json.loads(numeric.corr().to_json(orient="split"))
    (out / "report.json").write_text(json.dumps(data, indent=2))
    return html

"""Helpers that build Chart models from dataframes."""

from backend.data.report import Chart, Series


def histogram_chart(id: str, title: str, column: str, df, bins: int = 20) -> Chart:
    """EDA: histogram of one numeric column as a bar Chart (x = bin start, y = count)."""
    import pandas as pd

    counts = pd.cut(df[column].dropna(), bins=bins).value_counts(sort=False)
    data = [{"bin": f"{iv.left:.3g}", "count": int(n)} for iv, n in counts.items()]
    return Chart(
        id=id,
        kind="bar",
        title=title,
        x="bin",
        series=[Series(key="count", label=column)],
        data=data,
    )


def nulls_chart(id: str, title: str, df) -> Chart:
    """EDA: bar Chart of the null count per column that has any."""
    data = [{"column": str(c), "nulls": int(n)} for c, n in df.isna().sum().items() if n > 0]
    return Chart(
        id=id,
        kind="bar",
        title=title,
        x="column",
        series=[Series(key="nulls", label="Nulls")],
        data=data,
    )

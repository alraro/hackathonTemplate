"""Helpers that build Chart models from dataframes."""

from backend.data.report import Chart


def line_chart(id: str, title: str, x: str, ys: list[str], df) -> Chart:
    raise NotImplementedError("TODO(#61): dataframe to Chart(kind='line')")


def bar_chart(id: str, title: str, x: str, ys: list[str], df) -> Chart:
    raise NotImplementedError("TODO(#61): dataframe to Chart(kind='bar')")
